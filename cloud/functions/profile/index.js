const cloud = require('wx-server-sdk');

exports.main = async (event={}, context) => {
    const {
        user,
        preference
    } = event;

    cloud.init({
        env: 'prod-1-5d009e'
    });

    const {OPENID} = cloud.getWXContext();
    // 数据库引用
    const db = cloud.database();

    // 集合引用
    const collection = db.collection('Profile');

    let ret = null;
    let record = null;

    try {
        const {data: records} = await collection.where({
            openId: OPENID
        }).get();

        if(!records.length) {
            // create
            record = {
                openId: OPENID,
                user,
                preference
            };
            ret = await collection.add({
                data: record
            });
        } else {
            record = {
                user: records[0].user,
                preference: records[0].preference
            }
            // update
            user && (record.user = user);
            preference && (record.preference = preference);
            ret = await collection.update({
                data: record
            });
        }

        results = {
            user: record.user,
            preference: record.preference,
            openId: OPENID
        }

    } catch(e) {
        results = {
            code: 1,
            errMsg: e.message
        }
    }

    return results;

};