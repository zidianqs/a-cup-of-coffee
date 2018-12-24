Page({
    createCenterAnimation() {
        let repeat = 0;

        const centerAni = wx.createAnimation({
            duration: INTERVAL
        });

        setInterval(() => {
            this.setData({
                centerAni: centerAni.rotate(-360 * repeat++).step().export()
            });
        }, INTERVAL);
    },

    createSideAnimation(N = 1) {
        const deviceWidth = this.data.deviceWidth;
        const anis = [];
        let step = 0;

        for (let i = 0; i < N; i++) {
            anis[i] = wx.createAnimation({
                duration: INTERVAL,
                transformOrigin: `0 ${deviceWidth / 2}px`
            });

            // 先转一波
            anis[i].rotate(360 / N * i).step();
        }

        this.setData({
            sideAni: anis
        });

        setInterval(() => {
            const nextStep = ++step;
            this.setData({
                sideAni: anis.map(ani => {
                    return ani.rotate(360 * nextStep).step().export()
                })
            });
        }, INTERVAL);
    }
});

// .box {
//     width: 100%;
//     padding: 0;
//     justify-content: center;
// }

// .ball-wrapper {
//     position: absolute;
//     width: 100%;
//     height: 100%;
//     top: 0;
//     left: 0;
// }

// .ball {
//     width: 100rpx;
//     height: 100rpx;
//     border-radius: 50rpx;
//     background: green;
//     position: absolute;
//     overflow: hidden;
//     left: calc(50% - 50rpx);
//     top: 0;
// }

// .center {
//     width: 150rpx;
//     height: 150rpx;
//     border-radius: 75rpx;
//     overflow: hidden;
//     border: none;
// }

// .center image{
//     width: 100%;
//     height: 100%;
// }

// .ball image{
//     width: 100%;
//     height: 100%;
// }