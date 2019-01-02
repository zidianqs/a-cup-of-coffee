const EventEmitter = require('../../utils/EventEmitter');
const {checkUserInfo, onError, checkResult} = require('../../utils/common');

const Booking = require('../../entities/booking');
const Profile = require('../../entities/profile');

const app = getApp();

const PREFERENCE_EVT = 'onPreferenceUpdated';

Page({
    data: {
        id: null,
        booking: null,
        hasUserInfo: false,
        profile: null,
        isMine: false,
        isMeIn: false, // 我是否在拼团内
        loading: true
    },

    onJoinBooking() {
        const {profile={}, id} = this.data;
        if(!profile.preference) {
            this.onChangePreference();
            return;
        }

        wx.showLoading({
            title: '正在操作'
        });
        return Booking.join(id, profile.preference, profile.user)
            .then(result => {
                const participants = this.data.booking.participants;
                participants.push({
                    choice: profile.preference,
                    profile: profile.user,
                    user: this.data.profile.openId
                });

                this.setData({
                    booking: {...this.data.booking},
                    isMeIn: true
                });

                wx.hideLoading();
            });
    },

    onLeaveBooking() {
        wx.showLoading({
            title: '正在操作'
        });
        return Booking.leave(this.data.id)
            .then(() => {
                const booking = this.data.booking;
                const profile = this.data.profile;
                const participants = booking.participants;
                const me = profile.openId;

                booking.participants = participants.filter(p => p.user !== me);
                this.setData({
                    booking,
                    isMeIn: false
                });

                wx.hideLoading();
            })
            .catch(onError);
    },

    onEndBooking() {
        const {profile={}, id} = this.data;
        if(!profile.preference) {
            this.onChangePreference();
            return;
        }

        return Booking.end(id).then(() => {
            wx.showToast({
                title: '收工啦',
                icon: 'success'
            });

            this.setData({
                booking: {
                    ...this.data.booking,
                    status: 'done'
                }
            })
        });
    },

    updateProfile(userInfo) {
        return Profile.sync(userInfo)
            .then(profile => {
                this.setData({
                    hasUserInfo: true,
                    profile
                });
            });
    },

    updateBookingDetail() {
        return Booking.get(this.data.id)
            .then(({booking, openId}) => {
                if(!booking) {
                    return Promise.reject('没有找到');
                }

                const isMine = (openId === booking._openid);
                const isMeIn = isMine || booking.participants.findIndex(p => p.user === openId) > -1;

                if(this.data.profile) {
                    this.data.profile.openId = openId;
                }

                this.setData({
                    booking,
                    isMine,
                    isMeIn,
                    loading: false
                });
            });
    },

    updatePreference(preference) {
        wx.showToast({
            title: '正在更新您的口味...',
            icon: 'loading'
        });
        return Profile.sync(null, preference).then(profile => {
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

        checkResult(detail)
            .then(detail => detail.userInfo)
            .then(this.updateProfile)
            .then(this.updateBookingDetail)
            .catch(onError);
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
        this.updateBookingDetail().catch(onError).then(() => {
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

        checkUserInfo()
            .then(this.updateProfile)
            .then(this.updateBookingDetail)
            .catch(onError)
            .then(this.onComplete);

        // 监听选择口味回调
        EventEmitter.addListener(PREFERENCE_EVT, this.updatePreference);
    }
})