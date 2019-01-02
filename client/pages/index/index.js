const EventEmitter = require('../../utils/EventEmitter');
const {checkUserInfo, checkResult, onError, showLoading, hideLoading} = require('../../utils/common');

const PREFERENCE_EVT = 'onPreferenceUpdated';

const Booking = require('../../entities/booking');
const Profile = require('../../entities/profile');

Page({
    data: {
        deadline: '14:00',
        hasUserInfo: false,
        profile: null,
        booking: null,
        loading: true
    },

    updatePreference(preference) {
        showLoading('正在更新');
        return Profile.sync(null, preference).then(profile => {
            this.setData({
                profile
            });

            hideLoading();
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

        checkResult(detail)
            .then(info => info.userInfo)
            .then(this.updateProfile)
            .then(this.getMyBooking)
            .catch(onError);
    },

    onCreateBooking() {
        const {profile={}, id} = this.data;
        if(!profile.preference) {
            this.onChangePreference();
            return;
        }

        showLoading();
        return Booking.create({
            deadline: this.data.deadline,
            choiceInfo: profile.preference,
            profile: profile.user
        }).then(_id => {
            hideLoading();
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
        return Profile.sync(userInfo).then(profile => {
            this.setData({
                hasUserInfo: true,
                profile
            });
        });
    },

    getMyBooking() {
        // 获取我发起的
        return Booking.query({
            status: 'created'
        }).then(records => {
            if(records.length) {
                this.setData({
                    booking: records[0]
                });
            } else {
                this.setData({
                    booking: null
                });
            }

            return records;
        });
    },

    onPullDownRefresh() {
        this.getMyBooking()
            .catch(onError)
            .then(() => {
                wx.stopPullDownRefresh();
            });
    },

    onShow() {
        if(!this.notFirstShow) {
            this.notFirstShow = true;
        } else {
            this.onPullDownRefresh();
        }
    },

    // onReady() {
    //     console.log('ready');
    // },

    onLoad() {
        checkUserInfo()
            .then(this.updateProfile)
            .then(this.getMyBooking)
            .catch(onError)
            .then(this.onComplete);

        // 监听选择口味回调
        EventEmitter.addListener(PREFERENCE_EVT, this.updatePreference);
    },

    onComplete() {
        this.setData({
            loading: false
        });
        wx.hideLoading();
    }
})
