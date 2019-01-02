const regeneratorRuntime = require('../utils/runtime');

const {checkResult} = require('../utils/common');

// 同步用户Profile信息
exports.sync = async function(user, preference) {
    const db = wx.cloud.database();
    const collection = db.collection('Profile');

    let ret = null;
    let record = null;
    let hit = null;
    try {
        const result = await collection.get();
        const {data} = await checkResult(result);

        if(!data.length) {
            record = {
                user,
                preference
            };
            // create
            ret = await collection.add({
                data: record
            });

            ret = await checkResult(ret);
            record._id = ret._id;
            console.log(`Profile created: ${ret._id}`);
        } else {
            // update
            hit = data[0];
            record = {
                user: hit.user,
                preference: hit.preference
            }
            user && (record.user = user);
            preference && (record.preference = preference);

            ret = await collection.doc(hit._id).update({
                data: record
            });

            ret = await checkResult(ret);
            record._id = hit._id;
            console.log(`Profile updated: ${hit._id}`);
        }

        return record;
    } catch(e) {
        return Promise.reject(e);
    }


    return wx.cloud.callFunction({
        name: 'profile',
        data: {
            user,
            preference
        }
    }).then(({result}) => {
        const {code, errMsg} = result;
        if(code) {
            return Promise.reject({
                title: errMsg,
                icon: 'none'
            });
        }

        return result;
    });
};


// 同步用户Profile信息
exports.syncProfile = function(user, preference) {
    return wx.cloud.callFunction({
        name: 'profile',
        data: {
            user,
            preference
        }
    }).then(({result}) => {
        const {code, errMsg} = result;
        if(code) {
            return Promise.reject({
                title: errMsg,
                icon: 'none'
            });
        }

        return result;
    });
};