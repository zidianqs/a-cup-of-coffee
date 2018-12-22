//获取应用实例
const app = getApp()

Page({
    data: {
        hasUserInfo: false,
        userInfo: null
    },

    getCoffeeOptions(callback) {
        wx.cloud.callFunction({
            name: 'list-coffee-options'
        }).then(({result}) => {
            const {code, errMsg, data} = result;
            if(code) {
                wx.showToast({
                    title: errMsg,
                    icon: 'none'
                });
                return;
            }

            callback(data);
        });
    },

    // 更新页面展示用户信息
    updateUserInfo(userInfo) {
        this.setData({
            userInfo,
            hasUserInfo: true
        });

        this.getCoffeeOptions(result => {
            console.log(result);
        });
    },

    onAuthed(authInfo) {
        const {detail} = authInfo;
        if(detail.errMsg) {
            wx.showToast({
                title: '小样不给授权就不能用！',
                icon: 'none'
            });
            return;
        }
        this.updateUserInfo(detail);
    },

    onReady() {
        wx.getSetting({
            success: (res={}) => {
                const {authSetting} = res;
                if(authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: uinfo => {
                            const {userInfo} = uinfo;

                            this.updateUserInfo(userInfo);
                        }
                    })
                }
            },
            fail: err => {
                console.log(err);
            }
        });
    }
})
