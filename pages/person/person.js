//person.js
const app = getApp();

Page({
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    let username = wx.getStorageSync('username');
    let avatar = wx.getStorageSync('avatar');
    console.log('username&avatar: ', username, avatar)
    this.setData({
      username: username,
      avatar: avatar
    })
  },

  /**
   * 退出登录
   */
  logout: function() {
    app.globalData.loginStatus = 0;
    wx.removeStorage({
      key: 'username',
      key: 'avatar',
    })
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }

})
