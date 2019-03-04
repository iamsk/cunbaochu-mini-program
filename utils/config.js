// key等的配置文件
// 引入SDK核心类
let QQMapWX = require('../libs/qqmap-wx-jssdk.js');
// 实例化API核心类
let qqmapsdk = new QQMapWX({
  key: 'TRUBZ-YKCRJ-CIYFU-KT6UH-MA7NK-OHBHU' // 必填
});

module.exports = {
  qqmapsdk: qqmapsdk
};
