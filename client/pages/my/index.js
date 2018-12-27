//获取应用实例
const app = getApp()

const regeneratorRuntime = require('../../utils/runtime');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  async doFunction() {
    const db = wx.cloud.database();
    const collection = db.collection('CoffeeOption');

    try {
        const p = await collection.get();
        console.log(p);
    } catch(e) {
        console.log(e);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onReady() {
    this.doFunction();
  }
})