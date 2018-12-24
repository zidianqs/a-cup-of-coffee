//app.js
App({
    onLaunch: function () {
        wx.cloud.init({
            env: 'prod-1-5d009e',
            traceUser: true
        });

        wx.getSystemInfo({
            success: res => {
                this.globalData.deviceInfo = res;
            }
        });
    },
    globalData: {
    }
});
