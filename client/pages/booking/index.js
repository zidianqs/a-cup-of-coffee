const EventEmitter = require('../../utils/EventEmitter');
const {syncProfile, checkUserInfo} = require('../../utils/common');

const app = getApp();

const PREFERENCE_EVT = 'onPreferenceUpdated';

Page({
    data: {
        id: null,
        hasUserInfo: false,
        profile: null,
        isMine: false,
        loading: true
    },

    getBookingDetail(_id) {
        return wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'detail',
                bookingInfo: {
                    id: _id
                }
            }
        }).then(({result}) => {
            const {code, errMsg, data} = result;
            if(code) {
                return Promise.reject({
                    title: errMsg,
                    icon: 'none'
                });
            }

            return data;
        });
    },

    onJoinBooking() {
        const {profile={}, id} = this.data;
        if(!profile.preference) {
            this.onChangePreference();
            return;
        }
        return wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'join',
                bookingInfo: {
                    id: id
                },
                choiceInfo: profile.preference,
                profile: profile.user
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

            wx.showToast({
                title: '加入成功',
                icon: 'success'
            });

            const participants = this.data.booking.participants;
            participants.push({
                choice: profile.preference,
                profile: profile.user
            });

            this.setData({
                booking: {...this.data.booking}
            });
        });
    },

    onEndBooking() {
        const {profile={}, id} = this.data;
        if(!profile.preference) {
            this.onChangePreference();
            return;
        }

        return wx.cloud.callFunction({
            name: 'update-booking',
            data: {
                action: 'end',
                bookingInfo: {
                    id: id
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

            wx.showToast({
                title: '收工啦',
                icon: 'success'
            });
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

    updateBookingDetail() {
        return this.getBookingDetail(this.data.id).then(booking => {
            this.setData({
                booking,
                isMine: this.data.profile.openId === booking.owner,
                loading: false
            });
        });
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

    onChangePreference() {
        wx.navigateTo({
            url: `/pages/choose/index?eventType=${PREFERENCE_EVT}`
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

        this.updateProfile(detail.userInfo).then(this.updateBookingDetail).catch(this.onError);
    },

    onError(e) {
        wx.showToast({
            title: '获取用户信息失败'
        });
        console.log(e);
    },

    onComplete() {
        this.setData({
            loading: false
        });
    },

    onShareAppMessage() {
        return {
            title: `${this.data.profile.user.nickName}请你拼一杯`,
            path: `/pages/booking/index?id=${this.data.id}`
        }
    },

    onPullDownRefresh() {
        this.updateBookingDetail().catch(this.onError).then(() => {
            wx.stopPullDownRefresh();
        });
    },

    onLoad(params) {
        const {id} = params;
        if(!id) {
            wx.reLaunch({
                url: '/pages/index/index'
            });
            return;
        }

        this.setData({id});

        checkUserInfo().then(this.updateProfile).then(this.updateBookingDetail).catch(this.onError).then(this.onComplete);

        // 监听选择口味回调
        EventEmitter.addListener(PREFERENCE_EVT, this.updatePreference);
    }
})