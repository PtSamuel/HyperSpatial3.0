import { registerGLTFLoader } from '../../util/loaders/gltf-loader';
import { createScopedThreejs } from '../../util/threejs/three';
import { Beacon, registerLocations } from '../../util/beacon/beacon';

const clippingDistance = 50;
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

    accelX: "",
    accelY: "",
    accelZ: "",

    gyroX: "",
    gyroY: "",
    gyroZ: "",

    proj_x: "",
    proj_y: "",

    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') 
  },
  
  ratio: 100,
  beacon: null,
  scene: null,
  canvas2d: null,
  locations: null,
  camera: null,

  THREE: null,
  time: 0,
  width: null,
  height: null,

  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },

  loop() {
    console.log("loop");
  },

  onLoad() {

    this.locations = registerLocations()

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    let that = this;
    var query = wx.createSelectorQuery();

    query.select('#board').fields({ node: true, size: true })
    query.select('#webgl').fields({ node: true, size: true })

    query.exec((res) => {
      const board = res[0].node
      const ctx = board.getContext('2d')

      const dpr = wx.getSystemInfoSync().pixelRatio
      board.width = res[0].width * dpr
      board.height = res[0].height * dpr
      ctx.scale(dpr, dpr)
      this.canvas2d = ctx
      this.width = res[0].width
      this.height = res[0].height

      var canvas = res[1].node;
      console.log("Canvas: ", canvas)

      if (canvas != undefined) {
        console.log("Canvas width", canvas.width)
        console.log("Canvas height", canvas.height)
        that.init(canvas);
      }
    });
  },

  init: function(canvas){
    let that = this;
    const THREE = createScopedThreejs(canvas)
    this.THREE = THREE
    registerGLTFLoader(THREE)

    var camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.25, 1e9);
    camera.position.set(- 5, 3, 10);
    camera.lookAt(new THREE.Vector3(0, 2, 0));
    this.camera = camera
    
    var scene = new THREE.Scene();
    this.scene = scene

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

    var sample = new THREE.Mesh(
      new THREE.SphereGeometry(1), 
      new THREE.MeshBasicMaterial({color: 0x999999})
    );
    sample.position.set(5,5,5)
    scene.add(sample)

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
    
    console.log("Pixel ratio: ", windowInfo.pixelRatio)
    console.log("Screen width:", windowInfo.screenWidth)
    console.log("Screen height: ", windowInfo.screenHeight)
    console.log("Window width: ", windowInfo.windowWidth)
    console.log("Window height: ", windowInfo.windowHeight)
    console.log("Status Bar Height:", windowInfo.statusBarHeight)
    console.log("Safe area: ", windowInfo.safeArea)
    console.log("Screen top: ", windowInfo.screenTop)
    renderer.setPixelRatio(windowInfo.pixelRatio);

    camera.lookAt(0,0,0)
    renderer.render(scene, camera);

    wx.startAccelerometer({
      "interval": "normal"
    })

    wx.startGyroscope({
      "interval": "normal"
    })

    wx.onGyroscopeChange((result) => {
      this.setData({
        gyroX: result["x"].toFixed(6),
        gyroY: result["y"].toFixed(6),
        gyroZ: result["z"].toFixed(6)
      })
    })

    wx.onAccelerometerChange((result) => {
      this.setData({
        accelX: result["x"].toFixed(6),
        accelY: result["y"].toFixed(6),
        accelZ: result["z"].toFixed(6)
      })
    })

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
      
      // var proj = new THREE.Vector3(5,5,5);
      // proj.project(camera)

      // var Xabs = Math.abs(proj.x)
      // var Yabs = Math.abs(proj.y)
      // if(Xabs <= 1 && Yabs <= 1)
      // {
      //   var x = (proj.x + 1) / 2 * this.width
      //   var y = (-proj.y + 1) / 2 * this.height
      //   this.canvas2d.clearRect(0, 0, this.width, this.height);
      //   this.canvas2d.fillStyle = "#FFFFFF"
      //   this.canvas2d.fillRect(x-5, y-5, 10, 10)
      //   this.canvas2d.fillStyle = "#123456"
      //   this.canvas2d.fillText("test", x, y, 50)

      //   this.canvas2d.beginPath();
      //   this.canvas2d.arc(x, y, 5, 0, Math.PI * 2, true);
      //   this.canvas2d.fill();
      // } else {
      //   var x, y;
      //   if(Xabs < Yabs) {
      //     x = proj.x / Yabs
      //     y = Math.sign(proj.y)
      //   } else {
      //     y = proj.y / Xabs
      //     x = Math.sign(proj.x)
      //   }

      //   x = (x + 1) / 2 * this.width
      //   y = (-y + 1) / 2 * this.height
      //   this.canvas2d.clearRect(0, 0, this.width, this.height);
      //   this.canvas2d.fillStyle = "#FF0000"
      //   this.canvas2d.fillRect(x-5, y-5, 10, 10)
      //   this.canvas2d.fillStyle = "#123456"
      //   this.canvas2d.fillText("offscreen", x, y, 50)
      // }

      // camera.lookAt(0,0,0)
      // camera.rotation.z += theta
      // this.setData({
      //   rotation: (theta / Math.PI * 180).toFixed(2),
      //   proj_x: proj.x.toFixed(5),
      //   proj_y: proj.y.toFixed(5)
      // })
      
      camera.lookAt(0,0,0)
      camera.rotation.z += theta
      renderer.render(scene, camera);
      
      this.time += 1
      // for(const entry of Object.entries(this.locations))
      // {
      //   if(this.time % 100 == 0)
      //   {
      //     var name = entry[0]
      //     var pos = entry[1].position.clone()
      //     var proj = pos.project(camera)
      //   }
      // }
    })
  },

  setDistance(event) {
    var offset = event.detail.value / 100 * (cameraMaxDistance - cameraMininDistance);
    this.setData({
      cameraDistance: cameraMaxDistance - offset
    })
  },

  computeRelativePosition(longitude, latitude) {
    var conv = Math.PI / 180;
    console.log("Longitude: ", longitude)
    console.log("Latitude: ", latitude)

    var sintheta = Math.sin(longitude*conv), costheta = Math.cos(longitude*conv)
    var sinphi = Math.sin(latitude*conv), cosphi = Math.cos(latitude*conv)

    var p = costheta * cosphi;
    var q = sintheta * cosphi;
    var r = sinphi;
    console.log("Spherical coordinates:", p, q, r)
    var x_local = [-sintheta, costheta, 0]
    var y_local = [
      -costheta*sinphi,
      -sintheta*sinphi,
      cosphi
    ]
    var z_local = [
      costheta*cosphi,
      sintheta*cosphi,
      sinphi
    ]
    console.log(
      "theta:", longitude,
      "phi:", latitude,
      "x_local:", x_local,
      "y_local:", y_local,
      "z_local:", z_local 
    )

    var inv = [x_local, y_local, z_local]
    
    for(let i = 0; i < this.locations.length; i++)
    {
      var location = this.locations[i]
      var name = location.name, lo = location.longitude, la = location.latitude
      var pp = Math.cos(lo*conv) * Math.cos(la*conv)
      var qq = Math.sin(lo*conv) * Math.cos(la*conv)
      var rr = Math.sin(la*conv)
      console.log("target " + name + ": ", pp, qq, rr)
      var trans = [pp - p, qq - q, rr - r]
      var target_pos = [
        inv[0][0] * trans[0] + inv[0][1] * trans[1] + inv[0][2] * trans[2],
        inv[1][0] * trans[0] + inv[1][1] * trans[1] + inv[1][2] * trans[2],
        inv[2][0] * trans[0] + inv[2][1] * trans[1] + inv[2][2] * trans[2]
      ]

      // target_pos[0] *= 6371000
      // target_pos[1] *= 6371000
      // target_pos[2] *= 6371000
      var normalizedDistance = Math.sqrt(target_pos[0]**2 + target_pos[1]**2 + target_pos[2]**2);
      location.position = target_pos;
      console.log(location.name, location.position)
      location.distance = normalizedDistance;
    }

    this.setData({
      longitude: longitude.toFixed(5),
      latitude: latitude.toFixed(5),
      x: p.toFixed(5),
      y: q.toFixed(5),
      z: r.toFixed(5)
    })
  },

  getLocation() {
    var that = this;
    console.log("Getting Location...")

    wx.getLocation({
      type: "wgs84",
      success: function(res){
        that.computeRelativePosition(res.longitude, res.latitude)
        that.draw2D()
      }
    })
  },

  draw2D() {
    for(let i = 0; i < this.locations.length; i++)
    {
      var location = this.locations[i]
      var proj = new this.THREE.Vector3(
        location.position[0] * 6371,
        location.position[1] * 6371,
        location.position[2] * 6371
      );
      proj.project(this.camera)

      var Xabs = Math.abs(proj.x)
      var Yabs = Math.abs(proj.y)
      if(Xabs <= 1 && Yabs <= 1)
      {
        var x = (proj.x + 1) / 2 * this.width
        var y = (-proj.y + 1) / 2 * this.height
        this.canvas2d.clearRect(0, 0, this.width, this.height);
        this.canvas2d.fillStyle = "#FFFFFF"
        this.canvas2d.fillRect(x-5, y-5, 10, 10)
        this.canvas2d.fillStyle = "#123456"
        this.canvas2d.fillText("test", x, y, 50)

        this.canvas2d.beginPath();
        this.canvas2d.arc(x, y, 5, 0, Math.PI * 2, true);
        this.canvas2d.fill();
      } else {
        var x, y;
        if(Xabs < Yabs) {
          x = proj.x / Yabs
          y = Math.sign(proj.y)
        } else {
          y = proj.y / Xabs
          x = Math.sign(proj.x)
        }

        x = (x + 1) / 2 * this.width
        y = (-y + 1) / 2 * this.height
        this.canvas2d.clearRect(0, 0, this.width, this.height);
        this.canvas2d.fillStyle = "#FF0000"
        this.canvas2d.fillRect(x-5, y-5, 10, 10)
        this.canvas2d.fillStyle = "#123456"
        this.canvas2d.fillText("offscreen", x, y, 50)
      }
    }
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
