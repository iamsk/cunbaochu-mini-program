//app.js
App({
  onLaunch: function () {
    console.log('onLaunch')
  },

  onShow : function(){
    console.log('onShow')
  },

  onHide : function(){
    console.log("app.onHide");
  },

  globalData: {
    userInfo: null,
    res: 'ok',
    loginStatus: 0
  }
})