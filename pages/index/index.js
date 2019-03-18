// map.js
import request from '../../utils/request';
import config from '../../utils/config';
let qqmapsdk = config.qqmapsdk;
const app = getApp();

Page({
  // 页面的初始数据
  data: {
    longitude: 0, //经度 
    latitude: 0,  //纬度 
    scale: 17, //缩放级别，取值范围为5-18
    markers: [], //标记
    searchValue: '',
    markersData: [], //后台返回的标记点数组 
    map: 0,
    hasUserInfo: false,
    app: app,
  },

  // 生命周期函数--监听页面加载
  onLoad: function() {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('map')
    let that = this;
    // 调用微信内部获取位置 默认为wsg84 精确为gcj02
    // map 组件使用的经纬度是火星坐标系，调用 wx.getLocation 接口需要指定 type 为 gcj02
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        let lng = res.longitude;
        let lat = res.latitude;
        that.setData({
          longitude: lng,
          latitude: lat
        })
        that.getPoiList(lng, lat);
        that.markersRequest(lng, lat);
      },
      fail: function(res) {
        wx.showModal({
          title: '定位服务已关闭',
          content: '请在"设置"中打开定位服务，以获取准确的地址',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#4D8AD7',
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定');
            }
          }
        })
      },
      complete: function(res) {
          console.log(res);
      }
    });
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: app.globalData.hasUserInfo
    });
  },
  onShow: function(){
    // this.requestMarkers();
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function() {
    // console.log(this.getMarkersArr());
  },
  //获取中心点经纬度
  getCenterLngLat: function() {
    let that = this;
    that.mapCtx = wx.createMapContext('map');
    that.mapCtx.getCenterLocation({
      success: function(res){
        that.getPoiList(res.longitude, res.latitude)
        that.markersRequest(res.longitude, res.latitude)
      }
    })
  },
  //逆地址解析（坐标转地址）展示目标地详细地址
  getPoiList: function(lng, lat) {
    // console.log('经度：', lng, '纬度', latitude);
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lng
      },
      get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认)
      poi_options: 'radius=3000;page_size=1;page_index=1;policy=1',
      success: function(res) {
        let result = res.result;
        that.setData({
          title: result.formatted_addresses.recommend,
          address: result.address,
          movedlat: result.location.lat,
          movedlng: result.location.lng
        })
      },
      fail: function(res) {
          console.log(res);
      }
    })
  },
  //地址解析（地址转坐标）
  getAddress: function(lat, lng) {
    // let address = e.currentTarget.dataset.address;
    let that = this;
    that.setData({
      latitude: lat,
      longitude: lng
    })
    that.getPoiList(lng, lat)
  },
  // 视野发生变化时触发 获取中心点（即用户选择的位置）
  regionchange(e) {
    if(e.type == 'end') {
      this.getCenterLngLat();
    }
  },
  // 获取标记数组
  getMarkersArr: function() {
    let that = this;
    let markers = [];
    
    for (let item of that.data.markersData) {
      markers.push(this.createMarker(item))
    }
    return markers;
  },
  //创造标记点
  createMarker(point) {
    let id = point.index;
    let latitude = point.latitude;
    let longitude = point.longitude;
    let placeName = point.name;
    let address = point.address;
    //标记点及其属性
    let marker = {
      id: id || 0,  //Number
      latitude: latitude || 0,
      longitude: longitude || 0,
      title: placeName || '', //标注点名
      iconPath: '../../images/marker0.png',
      rotate: 0, //旋转角度 Number
      alpha: 1, //标注透明度 0~1 Number
      width: 25, //标注图标宽度 Number
      height: 25, //标注图标高度 Number
      callout: {}, //自定义标记点上方的气泡窗口 Object
      label: {  //为标记点旁边增加标签
        content: placeName || '',
        color: '#fff',
        fontSize: 12,
        bgColor: '#ccc',
        padding: 3,
        textAlign: 'center'
      }, 
    }
    return marker;
  },
  // 定位函数，将地图中心移动到当前定位点
  toPosition: function() {
    this.mapCtx.moveToLocation();
  },
  //点击标记时触发
  markertap: function(e) {
    //标记id
    let that = this;
    let markerId = e.markerId;
    console.log('标记', markerId, e)
    console.log(that.data.markersData[e.markerId])
    wx.showModal({
      title: that.data.markersData[e.markerId].name,
      content: that.data.markersData[e.markerId].address,
      confirmText: '导航',
      confirmColor: '#4D8AD7',
      success: function(res) {
        if (res.confirm) {
          let dataset = {
            title: that.data.markersData[e.markerId].name,
            longitude: that.data.markersData[e.markerId].longitude,
            latitude: that.data.markersData[e.markerId].latitude,
          }
          that.clickNavigation(dataset);
        }
      }
    })
  },
  //点击搜索框跳转搜索页
  toSearch: function() {
    let url = '/pages/search/search';
    wx.navigateTo({ url });
  },
  /**
   * 数据请求-获取标记点数组
   */
  markersRequest: function(lng, lat) {
    let that = this;
    let url = '/search/';
    let opt = {
      longitude: lng,
      latitude: lat
    };
    request.getRequest(url, opt)
      .then(res => {
        that.setData({
          markersData: res.data
        });
        let markers = that.getMarkersArr();
        that.setData({
          markers: markers,
          map: 1
        });
      })
      .catch(res => {
        wx.showToast({
          title: '出错啦~~',
          icon: 'none'
        })
      })
  },
  /**
   * 数据请求-提交存包处
   */
  clockRequest: function(opt) {
    console.log('传递的参数', opt)
    let url = '/points/';
    request.postRequest(url, opt)
      .then(res => {
        let data = res.data;
        console.log('接口请求的数据', data)
        wx.showToast({
          title: '提交成功~',
          icon: 'success',
          duration: 1000
        })
      })
      .catch(res => {
        wx.showToast({
          title: '出错啦~~',
          icon: 'none'
        })
      })
  },
  /**
   * 点击贡献
   */
  clockInOut: function(e) {
      console.log('提交请求', e)
      let that = this;
      let dataset = e.currentTarget.dataset;
      let title = dataset.title;
      let address = dataset.address;
      let lat = dataset.clocklat;
      let lng = dataset.clocklng;
      let curtimeStamp = + new Date();
      //需要传递给后台的请求参数
      let opt = {
        userId: '',  //微信用户id String openid 用户的唯一标识
        name: title, //地名 String
        address: address, //具体地址 String
        latitude: lat, //纬度 Number
        longitude: lng, //经度 Number
        service_time: '',
        linkman: '',
        telephone: '',
      }
      wx.showModal({
        title: '提交存包处',
        content: `地址：${title}`,
        confirmText: '提交',
        confirmColor: '#4D8AD7',
        cancelColor: '#999',
        success (res) {
          if (res.confirm) {
            that.clockRequest(opt);
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
  },
  /**
   * 点击导航(当前位置)
   */
  clickDaohang: function(e) {
    let that = this;
    let dataset = e.currentTarget.dataset;
    let title = dataset.title;
    let lat = dataset.latitude;
    let lng = dataset.longitude;
    console.log('经度',lng, '纬度', lat, '地址', title);
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        wx.openLocation({
          latitude: lat,
          longitude: lng,
          name: title,
          scale: that.data.scale
        })
      },
      fail: function(res) {
        console.log('导航失败');
      }
    })
  },
  /**
   * 点击导航(marker))
   */
  clickNavigation: function (dataset) {
    let that = this;
    let title = dataset.title;
    let lat = dataset.latitude;
    let lng = dataset.longitude;
    console.log('经度', lng, '纬度', lat, '地址', title);
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        wx.openLocation({
          latitude: lat,
          longitude: lng,
          name: title,
          scale: that.data.scale
        })
      },
      fail: function (res) {
        console.log('导航失败');
      }
    })
  },
  /**
   * 点击个人图标，跳转个人中心
   */
  toPerson: function() {
    wx.navigateTo({
      url: '/pages/person/person'
    })
  }
})
