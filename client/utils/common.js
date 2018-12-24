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

exports.checkUserInfo = function() {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (res={}) => {
                const {authSetting} = res;
                if(authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: uinfo => {
                            const {userInfo} = uinfo;
                            resolve(userInfo);
                        },
                        fail: reject
                    })
                }
            },
            fail: reject
        });
    });
};

exports.getUserInfo = function() {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            success: uinfo => {
                const {userInfo} = uinfo;
                resolve(userInfo);
            },
            fail: reject
        })
    });
};