const cloud = require('wx-server-sdk');

exports.main = async (event, context) => {
    let results = null;

    cloud.init({
        env: 'prod-1-5d009e'
    });
    // 数据库引用
    const db = cloud.database();

    // 集合引用
    const collection = db.collection('CoffeeOption');

    try {
        results = await collection.get();
    } catch(e) {
        return {
            code: 1,
            errMsg: e.message
        }
    }

    return results;
};