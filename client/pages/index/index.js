const EventEmitter = require('../../utils/EventEmitter');
const {syncProfile, checkUserInfo} = require('../../utils/common');

const PREFERENCE_EVT = 'onPreferenceUpdated';

Page({
    data: {
        deadline: '14:00',
        hasUserInfo: false,
        profile: null,
        booking: null,
        loading: true
    },

    updatePreference(preference) {
        wx.showToast({
            title: '正在更新您的口味...',
            icon: 'loading'
        });
        return syncProfile(null, preference).then(profile => {
            this.setData({
                profile
            });
        });
    },

    onDeadlineChange(evt) {
        const {detail} = evt;

        this.setData({
            deadline: detail.vaue
        });
    },

    onAuthed(authInfo) {
        const {detail} = authInfo;

        if(detail.errMsg !== 'getUserInfo:ok') {
            wx.showToast({
                title: '小样不给授权就不能用！',
                icon: 'none'
            });
            return;
        }

        this.updateProfile(detail.userInfo).then(this.getMyBooking).catch(this.onError);
    },

    onCreateBooking() {
        const {profile={}, id} = this.data;
        if(!profile.preference) {
            this.onChangePreference();
            return;
        }

        return wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'create',
                bookingInfo: {
                    deadline: this.data.deadline
                },
                choiceInfo: profile.preference,
                profile: profile.user
            }
        }).then(({result}) => {
            const {code, errMsg, _id} = result;
            if(code) {
                wx.showToast({
                    title: errMsg,
                    icon: 'none'
                });
                return;
            }

            wx.showToast({
                title: '发起成功',
                icon: 'success'
            });

            wx.navigateTo({
                url: `/pages/booking/index?id=${_id}`
            });
        });
    },

    onChangePreference() {
        wx.navigateTo({
            url: `/pages/choose/index?eventType=${PREFERENCE_EVT}`
        });
    },

    updateProfile(userInfo) {
        return syncProfile(userInfo).then(profile => {
            this.setData({
                hasUserInfo: true,
                profile
            });
        });
    },

    getMyBooking() {
        // 获取我发起的
        return wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'my'
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

            if(data.length) {
                this.setData({
                    booking: data[0]
                });
            } else {
                this.setData({
                    booking: null
                });
            }
        });
    },

    onPullDownRefresh() {
        this.getMyBooking().catch(this.onError).then(() => {
            wx.stopPullDownRefresh();
        });
    },

    onReady() {
        wx.showLoading({
            title: '正在加载'
        });
        checkUserInfo().then(this.updateProfile).then(this.getMyBooking).catch(this.onError).then(this.onComplete);

        // 监听选择口味回调
        EventEmitter.addListener(PREFERENCE_EVT, this.updatePreference);
    },

    onComplete() {
        this.setData({
            loading: false
        });
        wx.hideLoading();
    },

    onError(e) {
        wx.showToast({
            title: e.message
        });
        console.log(e);
    }
})
