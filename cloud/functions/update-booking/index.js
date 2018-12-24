const cloud = require('wx-server-sdk');

const today = () => {
    const dt = new Date();
    return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDay()}`;
}

exports.main = async (event={}, context) => {
    console.log(event);
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

    // 集合引用
    const collection = db.collection('BookingInfo');

    let binfo = null;
    let ret = null;
    let results = null;
    let hit = null;

    try {
        switch(action) {
            case 'list':
                results = await collection.where({
                    status: 'created'
                }).get();

                break;
            case 'my':
                results = await collection.where({
                    status: 'created',
                    owner: OPENID
                }).get()
                break;
            case 'detail':
                return await collection.doc(bookingInfo.id).get();
            case 'create':
                results = await collection.add({
                    data: {
                        status: 'created',
                        date: today(), // current date
                        deadline: bookingInfo.deadline,
                        owner: OPENID,
                        participants: [{
                            user: OPENID,
                            choice: choiceInfo,
                            profile
                        }]
                    }
                });
                break;
            case 'end':
                ret = await collection.doc(bookingInfo.id).get();
                binfo = ret.data;

                if(binfo.owner !== OPENID) {
                    results = {
                        code: 3,
                        errMsg: '你不能修改别人发起的'
                    }
                    break;
                }
                results = await collection.doc(bookingInfo.id).update({
                    data: {
                        status: 'done'
                    }
                });
                break;
            case 'join':
                ret = await collection.doc(bookingInfo.id).get();
                binfo = ret.data;

                hit = binfo.participants.find(p => p.user === OPENID);

                if(hit) {
                    return {
                        code: 4,
                        errMsg: '你已经点过啦'
                    }
                }

                binfo.participants.push({
                    user: OPENID,
                    choice: choiceInfo,
                    profile
                });

                results = await collection.doc(bookingInfo.id).update({
                    data: {
                        participants: binfo.participants
                    }
                });
                break;
            case 'leave':
                ret = await collection.doc(bookingInfo.id).get();
                binfo = ret.data;

                hit = binfo.participants.findIndex(u => {
                    return u.user === OPENID;
                });

                if(hit !== -1) {
                    binfo.participants.splice(hit, 1);

                    results = await collection.doc(bookingInfo.id).update({
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