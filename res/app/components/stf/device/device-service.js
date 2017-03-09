//引入 Json转流组件
var oboe = require('oboe')
//引入 JS数组操作组件
var _ = require('lodash')
var EventEmitter = require('eventemitter3')

/**
 * 设备信息服务
 * @param $http
 * @param socket
 * @param EnhanceDeviceService
 * @returns {{}}
 */
module.exports = function DeviceServiceFactory($http, socket, EnhanceDeviceService) {
  var deviceService = {}

  /**
   * 设备信息构造函数
   * @param $scope
   * @param options
   * @constructor
   */
  function Tracker($scope, options) {
    var devices = []
    var devicesBySerial = Object.create(null)
    var scopedSocket = socket.scoped($scope)
    var digestTimer, lastDigest

    //接受事件
    $scope.$on('$destroy', function() {
      clearTimeout(digestTimer)
    })

    /**
     * 循环, 用于数据双向绑定
     */
    function digest() {
      // Not great. Consider something else
      if (!$scope.$$phase) {
        $scope.$digest()
      }

      lastDigest = Date.now()
      digestTimer = null
    }

    /**
     * 通知修改设备信息
     * @param event
     */
    function notify(event) {
      if (!options.digest) {
        return
      }

      if (event.important) {
        // Handle important updates immediately.
        //digest()
        window.requestAnimationFrame(digest)
      }
      else {
        if (!digestTimer) {
          var delta = Date.now() - lastDigest
          if (delta > 1000) {
            // It's been a while since the last update, so let's just update
            // right now even though it's low priority.
            digest()
          }
          else {
            // It hasn't been long since the last update. Let's wait for a
            // while so that the UI doesn't get stressed out.
            digestTimer = setTimeout(digest, delta)
          }
        }
      }
    }

    /**
     * 设置 device 属性
     * @param data
     */
    function sync(data) {
      // usable IF device is physically present AND device is online AND
      // preparations are ready AND the device has no owner or we are the
      // owner
      data.usable = data.present && data.status === 3 && data.ready && (!data.owner || data.using)

      // Make sure we don't mistakenly think we still have the device
      if (!data.usable || !data.owner) {
        data.using = false
      }

      EnhanceDeviceService.enhance(data)
    }

    //根据 serial 获取设备信息
    function get(data) {
      return devices[devicesBySerial[data.serial]]
    }

    //写入设备信息
    var insert = function insert(data) {
      devicesBySerial[data.serial] = devices.push(data) - 1
      sync(data)
      this.emit('add', data)
    }.bind(this)

    //变更设备信息
    var modify = function modify(data, newData) {
      _.merge(data, newData, function(a, b) {
        // New Arrays overwrite old Arrays
        if (_.isArray(b)) {
          return b
        }
      })
      sync(data)
      this.emit('change', data)
    }.bind(this)

    //删除设备信息
    var remove = function remove(data) {
      var index = devicesBySerial[data.serial]
      if (index >= 0) {
        devices.splice(index, 1)
        delete devicesBySerial[data.serial]
        this.emit('remove', data)
      }
    }.bind(this)

    /**
     * 拉取并更新设备信息
     * @param data
     */
    function fetch(data) {
      deviceService.load(data.serial)
        .then(function(device) {
          return changeListener({
            important: true
            , data: device
          })
        })
        .catch(function() {})
    }

    /**
     * 监听事件: 增加
     * @param event
     */
    function addListener(event) {
      var device = get(event.data)
      if (device) {
        modify(device, event.data)
        notify(event)
      }
      else {
        if (options.filter(event.data)) {
          insert(event.data)
          notify(event)
        }
      }
    }

    /**
     * 监听事件: 更新
     * @param event
     */
    function changeListener(event) {
      var device = get(event.data)
      if (device) {
        modify(device, event.data)
        if (!options.filter(device)) {
          remove(device)
        }
        notify(event)
      }
      else {
        if (options.filter(event.data)) {
          insert(event.data)
          // We've only got partial data
          fetch(event.data)
          notify(event)
        }
      }
    }

    /**
     * socket 绑定监听事件
     */
    scopedSocket.on('device.add', addListener)
    scopedSocket.on('device.remove', changeListener)
    scopedSocket.on('device.change', changeListener)

    /**
     * 本服务函数，增加设备
     * @param device
     */
    this.add = function(device) {
      addListener({
        important: true
        , data: device
      })
    }

    this.devices = devices
  }

  // 实例化注入事件类
  Tracker.prototype = new EventEmitter()

  /**
   * 获取所有设备信息
   * @param $scope
   * @returns {Tracker}
   */
  deviceService.trackAll = function($scope) {
    var tracker = new Tracker($scope, {
      filter: function() {
        return true
      }
      , digest: false
    })

    /**
     * 将 json 转换为流
     * http://oboejs.com
     */
    oboe('/api/v1/devices')
      .node('devices[*]', function(device) {
        tracker.add(device)
      })

    return tracker
  }

  /**
   * 获取当前用户组
   * @param $scope
   * @returns {Tracker}
   */
  deviceService.trackGroup = function($scope) {
    var tracker = new Tracker($scope, {
      filter: function(device) {
        return device.using
      }
      , digest: true
    })

    oboe('/api/v1/user/devices')
      .node('devices[*]', function(device) {
        tracker.add(device)
      })

    return tracker
  }

  /**
   * 根据 serial 获取设备信息
   * @param serial
   */
  deviceService.load = function(serial) {
    return $http.get('/api/v1/devices/' + serial)
      .then(function(response) {
        return response.data.device
      })
  }

  /**
   * 获取同一设备信息
   * @param serial
   * @param $scope
   */
  deviceService.get = function(serial, $scope) {
    var tracker = new Tracker($scope, {
      filter: function(device) {
        return device.serial === serial
      }
      , digest: true
    })

    return deviceService.load(serial)
      .then(function(device) {
        tracker.add(device)
        return device
      })
  }

  /**
   * 根据 serial 更新设备备注
   * @param serial
   * @param note
   */
  deviceService.updateNote = function(serial, note) {
    socket.emit('device.note', {
      serial: serial,
      note: note
    })
  }

  return deviceService
}
