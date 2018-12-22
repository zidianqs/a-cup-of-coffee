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
    } = event;

    cloud.init({
        env: 'prod-1-5d009e'
    });
    // 数据库引用
    const db = cloud.database();

    // 集合引用
    const collection = db.collection('BookingInfo');

    try {
        switch(action) {
            case 'create':
                results = await collection.add({
                    status: 'created',
                    date: today(), // current date
                    deadline: bookingInfo.deadline,
                    participants: [{
                        user: userInfo.openId,
                        choice: choiceInfo,
                        isOwner: true
                    }]
                });
                break;
            case 'end':
                const {data: binfo} = await collection.doc(bookingInfo.id).get();

                if(!binfo.participants.filter(u => u.user === userInfo.openId && u.isOwner).length) {
                    results = {
                        code: 3,
                        errMsg: '你不能修改别人发起的'
                    }
                    break;
                }

                results = await collection.doc(bookingInfo.id).update(binfo);
                break;
            case 'join':
            case 'left':
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