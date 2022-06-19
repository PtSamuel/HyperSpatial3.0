import { registerGLTFLoader } from '../../util/loaders/gltf-loader';
import { createScopedThreejs } from '../../util/threejs/three';

const cameraMaxDistance = 50;
const cameraMininDistance = 2;

Page({
  data: {
    alpha: "",
    beta: "",
    gamma: "",
    rotation: "",
    longitude: "",
    latitude: "",

    cameraDistance: cameraMaxDistance,

    x: "",
    y: "",
    z: "",

    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') 
  },

  beacon: null,
  locations: {
    "Shenzhen": [
      22.5521136,
      113.9254101
    ],
    "Hamerschlag": [
      40.4437027,
      -79.9459357
    ]
  },

  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  
  onLoad() {

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    let that = this;
    var query = wx.createSelectorQuery();
    query.select('#webgl').node().exec((res) => {
      var canvas = res[0].node;
      console.log(canvas)
      console.log(typeof canvas)

      if (canvas != undefined) {
        console.log("width", canvas.width)
        console.log("height", canvas.height)
    
        that.init(canvas);
      }
    });
  },
  init: function(canvas){

    let that = this;
    const THREE = createScopedThreejs(canvas)
    registerGLTFLoader(THREE)

    var camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.25, 100);
    camera.position.set(- 5, 3, 10);
    camera.lookAt(new THREE.Vector3(0, 2, 0));
    var scene = new THREE.Scene();

    var light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 20, 0);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 20, 10);
    scene.add(light);

    var axes = new THREE.AxisHelper(1000);
    scene.add(axes);
    
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.05), 
      new THREE.MeshBasicMaterial({color: 0x999999})
    );
    scene.add(sphere)

    this.beacon = new THREE.Mesh(
      new THREE.SphereGeometry(1), 
      new THREE.MeshBasicMaterial({color: 0x123456})
    )
    scene.add(this.beacon)

    var loader = new THREE.GLTFLoader();
    loader.load('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb', function (gltf) {
      var model = gltf.scene;
      scene.add(model);
    }, undefined, function (e) {
      console.error(e);
    });
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvas.width, canvas.height);
    const windowInfo = wx.getWindowInfo()
    
    console.log(windowInfo.pixelRatio)
    console.log(windowInfo.screenWidth)
    console.log(windowInfo.screenHeight)
    console.log(windowInfo.windowWidth)
    console.log(windowInfo.windowHeight)
    console.log(windowInfo.statusBarHeight)
    console.log(windowInfo.safeArea)
    console.log(windowInfo.screenTop)
    renderer.setPixelRatio(windowInfo.pixelRatio);

    camera.lookAt(0,0,0)
    renderer.render(scene, camera);

    wx.startDeviceMotionListening({
      "interval": "normal"
    })

    wx.onDeviceMotionChange((event) => {
      this.setData({
        alpha: event.alpha.toFixed(2),
        beta: event.beta.toFixed(2),
        gamma: event.gamma.toFixed(2)
      })
      var alpha = event.alpha / 180 * Math.PI
      var beta = event.beta / 180 * Math.PI
      var gamma = event.gamma / 180 * Math.PI
      
  
      var sinalpha = Math.sin(alpha)
      var cosalpha = Math.cos(alpha)
      var sinbeta = Math.sin(beta)
      var cosbeta = Math.cos(beta)
      var singamma = Math.sin(gamma)
      var cosgamma = Math.cos(gamma)
  
  
      var ua = new THREE.Vector3(cosalpha, sinalpha, 0);
      var va = new THREE.Vector3(-sinalpha, cosalpha, 0);
      var wa = new THREE.Vector3(0, 0, 1);
  
      var ub = new THREE.Vector3(
          ua.x * cosbeta + wa.x * sinbeta,
          ua.y * cosbeta + wa.y * sinbeta,
          ua.z * cosbeta + wa.z * sinbeta
      )
      var vb = va.clone()
      var wb = new THREE.Vector3(
          wa.x * cosbeta - ua.x * sinbeta,
          wa.y * cosbeta - ua.y * sinbeta,
          wa.z * cosbeta - ua.z * sinbeta
      )
      
      var ug = ub.clone()
      var vg = new THREE.Vector3(
          vb.x * cosgamma - wb.x * singamma,
          vb.y * cosgamma - wb.y * singamma,
          vb.z * cosgamma - wb.z * singamma
      )
      var wg = new THREE.Vector3(
          wb.x * cosgamma + vb.x * singamma,
          wb.y * cosgamma + vb.y * singamma,
          wb.z * cosgamma + vb.z * singamma
      )
  
      var u = new THREE.Vector3(ug.x, -ug.z, ug.y)
      var v = new THREE.Vector3(vg.x, -vg.z, vg.y)
      var w_negate = new THREE.Vector3(wg.x, -wg.z, wg.y)
      w_negate.negate()
      
      var radical = Math.sqrt(w_negate.x*w_negate.x + w_negate.z*w_negate.z)
      var p = new THREE.Vector3(
          -w_negate.x/radical * w_negate.y,
          radical,
          -w_negate.z/radical * w_negate.y
      )
  
      camera.position.x = w_negate.x * this.data.cameraDistance;
      camera.position.y = w_negate.y * this.data.cameraDistance;
      camera.position.z = w_negate.z * this.data.cameraDistance;
  
      var cos = u.dot(p)
      var sin = v.dot(p)
      var theta = Math.acos(cos)
      if(sin < 0)
          theta *= -1
      
      camera.lookAt(0,0,0)
      camera.rotation.z += theta
      this.setData({
        rotation: (theta / Math.PI * 180).toFixed(2)
      })
      renderer.render(scene, camera);
    })
  },

  setDistance(event) {
    var offset = event.detail.value / 100 * (cameraMaxDistance - cameraMininDistance);
    this.setData({
      cameraDistance: cameraMaxDistance - offset
    })
  },

  getLocation() {
    var that = this;
    console.log("Get Location")

    wx.getLocation({
      type: "gcj02",
      success: function(res){
        console.log(res)
        var p = Math.cos(res.longitude) * Math.cos(res.latitude);
        var q = Math.sin(res.longitude) * Math.cos(res.latitude);
        var r = Math.sin(res.latitude);

        var coords = that.locations["Hamerschlag"];
        var pp = Math.cos(coords[0]) * Math.cos(coords[1]);
        var qq = Math.sin(coords[0]) * Math.cos(coords[1]);
        var rr = Math.sin(coords[1]);

        var multiplier = 1 - p*pp - q*qq - r*rr;
        var x = pp + p * multiplier;
        var y = qq + r * multiplier;
        var z = rr + q * multiplier;

        console.log("x:", x, "y:", y, "z:", z);

        that.setData({
          longitude: res.longitude.toFixed(5),
          latitude: res.latitude.toFixed(5),
          x: p.toFixed(5),
          y: q.toFixed(5),
          z: r.toFixed(5)
        })
      }
    })
  },

  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
