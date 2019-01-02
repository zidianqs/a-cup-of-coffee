/**
 * 拼咖啡相关操作
 */
const regeneratorRuntime = require('../utils/runtime');

const {checkResult} = require('../utils/common');

const padLeft = num => ('' + num).padStart(2, '0');

const today = () => {
    const dt = new Date();
    return `${dt.getFullYear()}-${padLeft(dt.getMonth() + 1)}-${padLeft(dt.getDay())}`;
}

const db = wx.cloud.database();
const collection = db.collection('BookingInfo');

/**
 * 查询当前用户拼咖啡
 * 本地执行，任何人都可以查询自己创建的
 */
exports.query = async function(filter={}) {
    try {
        const result = await collection.where(filter).get();
        const {data} = await checkResult(result);
        return data;
    } catch(e) {
        return Promise.reject(e);
    }
};

/**
 * 获取拼咖啡详情
 * 远程执行，允许获取任意ID的拼咖啡详情
 */
exports.get = async function(id) {
    try {
        const ret = await wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'detail',
                bookingId: id
            }
        });

        const {result} = await checkResult(ret);
        const {booking, openId} = await checkResult(result);

        return {booking, openId};
    } catch(e) {
        return Promise.reject(e);
    }
};

/**
 * 创建拼咖啡
 * 本地执行，任何人都可以调用
 */
exports.create = async function(option) {
    const {deadline, choiceInfo, profile} = option;
    try {
        const result = await collection.add({
            data: {
                status: 'created',
                date: today(),
                deadline: deadline,
                participants: [{
                    choice: choiceInfo,
                    profile
                }]
            }
        });
        const {_id} = await checkResult(result);
        console.log(`Booking info ${_id} created`);
        return _id;
    } catch(e) {
        return Promise.reject(e);
    }
};

/**
 * 加入拼咖啡
 * 远程执行
 */
exports.join = async function(id, choiceInfo, profile) {
    try {
        const ret = await wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'join',
                bookingId: id,
                choiceInfo: choiceInfo,
                profile: profile
            }
        });

        // {
        //     "errMsg": "cloud.callFunction:ok",
        //     "result": {
        //         "stats": {
        //             "updated": 1
        //         },
        //         "errMsg": "document.update:ok"
        //     },
        //     "requestID": ""
        // }
        const {result} = await checkResult(ret);
        const {stats} = await checkResult(result);
        return stats;
    } catch(e) {
        return Promise.reject(e);
    }
};

exports.leave = async function(id) {
    try {
        const ret = await wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'leave',
                bookingId: id
            }
        });

        // {
        //     "errMsg": "cloud.callFunction:ok",
        //     "result": {
        //         "stats": {
        //             "updated": 1
        //         },
        //         "errMsg": "document.update:ok"
        //     },
        //     "requestID": ""
        // }
        const {result} = await checkResult(ret);
        const {stats} = await checkResult(result);
        return stats;
    } catch(e) {
        return Promise.reject(e);
    }
};

/**
 * 离开拼咖啡
 * 远程执行
 */
exports.cancel = async function(_id) {
    try {
        const result = await collection.where({
            _id
        }).update({
            data: {
                status: 'canceled'
            }
        });

        return await checkResult(result);
    } catch(e) {
        return Promise.reject(e);
    }
};

/**
 * 结束拼咖啡
 * 本地执行，只有发起人可以调用
 */
exports.end = async function(_id) {
    try {
        const ret = await wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'end',
                bookingId: _id
            }
        });

        // [
        //     {
        //         "stats": {
        //             "updated": 1
        //         },
        //         "errMsg": "collection.update:ok"
        //     },
        //     {
        //         "stats": {
        //             "updated": 1
        //         },
        //         "errMsg": "collection.update:ok"
        //     },
        //     {
        //         "stats": {
        //             "updated": 1
        //         },
        //         "errMsg": "collection.update:ok"
        //     }
        // ]
        // 先检查callFunction执行状况
        const {result} = await checkResult(ret);
        // 再检查
        const stats = await Promise.all(result.map(checkResult));

        console.log(`Booking & Profile updateed: ${JSON.stringify(stats)}`);
        return stats;
    } catch(e) {
        return Promise.reject(e);
    }
};
