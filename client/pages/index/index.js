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

    // 发起一次拼单
    startBooking(choice) {
        wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'create',
                userInfo: this.data.userInfo,
                bookingInfo: {
                    deadline: '14:00'
                },
                choiceInfo: choice
            }
        }).then(result => {
            console.log(result);
        })
    },

    getActiveBooking(callback) {
        wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'list'
            }
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

    joinActiveBooking(_id, choiceInfo, callback) {
        wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'join',
                bookingInfo: {
                    id: _id
                },
                choiceInfo
            }
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

    leaveActiveBooking(_id, callback) {
        wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'leave',
                bookingInfo: {
                    id: _id
                }
            }
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
    },

    onStartBooking() {
        this.getCoffeeOptions(results => {
            const first = results[0];

            this.startBooking({
                BaseType: first.BaseType,
                ExtendChoice: first.ExtendOptions.map(option => option.ExtendDefaultOption).join(','),
                PriceType: first.PriceType
            });
        });
    },
    onEndBooking() {
        this.getActiveBooking((bk) => {
            wx.cloud.callFunction({
                name: 'update-booking',
                data: {
                    action: 'end',
                    bookingInfo: {
                        id: bk[0]._id
                    }
                }
            }).then(({result}) => {
                const {code, errMsg, data} = result;
                if(code) {
                    wx.showToast({
                        title: errMsg,
                        icon: 'none'
                    });
                    return;
                }

                console.log(data);
            });
        });
    },
    onJoinBooking() {
        this.getCoffeeOptions(list => {
            const first = list[0];

            this.getActiveBooking(active => {
                if(!active.length) {
                    wx.showToast({
                        title: '当前没有正在发起的拼单'
                    });
                    return;
                }
                this.joinActiveBooking(active[0]._id, {
                    BaseType: first.BaseType,
                    ExtendChoice: first.ExtendOptions.map(option => option.ExtendDefaultOption).join(','),
                    PriceType: first.PriceType
                }, (result) => {
                    console.log(result);
                });
            });
        })
    },
    onLeaveBooking() {
        this.getActiveBooking(active => {
            this.leaveActiveBooking(active[0]._id, result => {
                console.log(result);
            });
        })
    },
    onSavePerference() {
    },
    onGetBooking() {
        this.getActiveBooking((bk) => {
            console.log(bk);
        });
    },
    onGetCoffeeList() {
        this.getCoffeeOptions(list => {
            console.log(list)
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

    onShow() {
        wx.getSetting({
            success: (res={}) => {
                const {authSetting} = res;
                if(authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: uinfo => {
                            console.log(uinfo);
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
