const regeneratorRuntime = require('./runtime');

exports.checkUserInfo = function() {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (res={}) => {
                const {authSetting={}} = res;
                if(authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: uinfo => {
                            const {userInfo} = uinfo;
                            resolve(userInfo);
                        },
                        fail: reject
                    })
                } else {
                    reject();
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

/**
 * 统一判断错误
 */
exports.checkResult = function(result={errCode: -2}) {
    if(result && result.errCode || result.code) {
        return Promise.reject(result);
    } else {
        return Promise.resolve(result);
    }
}

exports.onError = async function(e) {
    if(!e) {
        return;
    }
    let msg = '';
    if(typeof e === 'string') {
        msg = e;
    } else {
        msg = e.message || e.errMsg || '未知错误';
    }
    wx.showToast({
        icon: 'error',
        title: msg
    });
    console.log(e);
}

exports.showLoading = (msg='正在操作') => {
    wx.showLoading({
        title: msg
    });
}

exports.hideLoading = () => {
    wx.hideLoading();
};
