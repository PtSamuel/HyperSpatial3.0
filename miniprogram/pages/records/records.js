// pages/records/records.js

const DB = wx.cloud.database().collection("beacons")
Page({
  data: {
    beacons: []
  },

  display() {
    console.log("display")
    DB.add({
      data: {
        name: "name",
        lo: "1",
        la: "2"
      },
      success(res) {
        console.log(res)
      },
      fail(res) {
        console.log(res)
      }
    })
  },

  get() {
    var that = this
    DB.get({
      success(res) {
        that.setData({
          beacons: res.data
        })
        console.log(that.data.beacons)
      }
    })
  },

  input(event) {
    console.log(event)
  },

  onLoad: function (options) {
  },
  onReady: function () {
  },
  onShow: function () {
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onPullDownRefresh: function () {
  },
  onReachBottom: function () {
  },
  onShareAppMessage: function () {
  }
})