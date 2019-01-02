const cloud = require('wx-server-sdk');

const today = () => {
    const dt = new Date();
    return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDay()}`;
}

exports.main = async (event={}, context) => {
    const {
        action, // 操作
        userInfo, // 个人用户信息
        bookingId, // 要加入的拼团ID
        bookingInfo, // 新建/更新拼团的详细信息
        choiceInfo, // 选择的咖啡种类
        profile
    } = event;

    cloud.init({
        env: 'prod-1-5d009e'
    });

    const {OPENID} = cloud.getWXContext();
    // 数据库引用
    const db = cloud.database();
    const _ = db.command;

    // 集合引用
    const collection = db.collection('BookingInfo');
    const profilesCollection = db.collection('Profile');

    let binfo = null;
    let ret = null;
    let results = null;
    let hit = null;

    try {
        switch(action) {
            case 'detail':
                results = await collection.where({
                    _id: bookingId
                }).get();

                if(results.data.length) {
                    hit = results.data[0];

                    return {
                        booking: hit,
                        openId: OPENID
                    };
                }
            case 'end':
                ret = await collection.where({
                    _id: bookingId
                }).get();
                hit = ret.data[0];

                if(hit._openid !== OPENID) {
                    results = {
                        code: 3,
                        errMsg: '你不能修改别人发起的'
                    }
                    break;
                }
                results = [];
                results.push(await collection.where({
                    _id: bookingId
                }).update({
                    data: {
                        status: 'done'
                    }
                }));

                results.push(await profilesCollection.where({
                    openId: _.in(hit.participants.map(participant => participant.user || OPENID))
                }).update({
                    data: {
                        HistoryDrink: _.inc(1)
                    }
                }));
                results.push(await profilesCollection.where({
                    openId: OPENID
                }).update({
                    data: {
                        HistoryBaught: _.inc(hit.participants.length)
                    }
                }));
                break;
            case 'join':
                ret = await collection.where({
                    _id: bookingId
                }).get();
                binfo = ret.data[0];

                if(binfo._openid === OPENID) {
                    return {
                        code: 4,
                        errMsg: '你自己创建的，别闹'
                    }
                }

                hit = binfo.participants.find(p => p.user === OPENID);

                if(hit) {
                    return {
                        code: 4,
                        errMsg: '你已经点过啦'
                    }
                }

                results = await collection.where({
                    _id: bookingId
                }).update({
                    data: {
                        participants: _.push({
                            user: OPENID,
                            choice: choiceInfo,
                            profile
                        })
                    }
                });
                break;
            case 'leave':
                ret = await collection.where({
                    _id: bookingId
                }).get();
                binfo = ret.data[0];

                hit = binfo.participants.findIndex(u => {
                    return u.user === OPENID;
                });

                if(hit !== -1) {
                    binfo.participants.splice(hit, 1);

                    results = await collection.where({
                        _id: bookingId
                    }).update({
                        data: {
                            participants: binfo.participants
                        }
                    });
                }
                break;
            default:
                results = {
                    code: 2,
                    errMsg: '未指定action'
                };
        }
    } catch(e) {
        results = {
            code: 1,
            errMsg: e.message
        }
    }

    return results;
};