// pages/records/records.js

const appInstance = getApp()
const DB = appInstance.globalData['DB']

Page({
  data: {
    beacons: [],
    showIndex: 0
  },

  nameInput: null,

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
        var beacons = res.data
        for(let i = 0; i < beacons.length; i++)
          beacons[i]['showDetail'] = false;
        that.setData({
          beacons: beacons
        })
        console.log(that.data.beacons)
      }
    })
  },

  input(event) {
    this.nameInput = event.detail.value
    console.log(this.nameInput)  
  },

  add(event) {
    var that = this
    if(this.nameInput == undefined || this.nameInput == '')
    {
      wx.showToast({
        title: '请输入名称',
        icon: 'error',
        duration: 2000
      })
      return
    }
    wx.getLocation({
      type: "wgs84",
      success: function(res){
        DB.add({
          data: {
            name: that.nameInput,
            coords: [
              res.longitude, res.latitude,
            ]
          }, 
          success(res) {
            console.log("Added " + that.nameInput + " successfully.")
            wx.showToast({
              title: '添加成功',
              icon: 'success',
              duration: 2000
            })
            that.get()
          }
        })
      },
      fail(res) {
        console.log("getLocation call failure.")
      }
    })
  },

  modify(event) {
    var id = event.currentTarget.dataset['id']
    console.log("modify:", id)
    var beacons = this.data.beacons
    for(let i = 0; i < beacons.length; i++)
      if(beacons[i]['_id'] == id)
        beacons[i]['showDetail'] = !beacons[i]['showDetail'];
    this.setData({
      beacons: beacons
    })
  },

  deleteHelper(id, name) {
    var that = this
    console.log("Deleting: " + id, name)
    wx.showModal({
      title: "删除",
      content: "确认删除" + name + "吗？",
      confirmColor: "#2A57B0",
      success(res) {
        if(res.confirm) {
          DB.doc(id).remove( {
            success(event) {
              console.log("Successfully deleted.")
              that.get()
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
            },
            fail(event) {
              console.log("Deletion failed.")
            }
          })
        }
      },
      failure(res) {
        console.log("User cancalled deletion.")
      }
    })
  },

  delete(event) {
    var id = event.currentTarget.dataset['id']
    var that = this
    DB.where({
      _id: id
    }).get({
      success(res) {
        that.deleteHelper(id, res.data[0].name)
      },
      fail(res) {
        console.log(id + " does not exist in database")
      }
    })
  },

  panel: function (e) {
    if (e.currentTarget.dataset.index != this.data.showIndex) {
      this.setData({
        showIndex: e.currentTarget.dataset.index
      })
    } else {
      this.setData({
        showIndex: 0
      })
    }
  },

  onLoad: function (options) {
    this.get()
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