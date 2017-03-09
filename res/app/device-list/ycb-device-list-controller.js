//引入 JS数组操作组件
var _ = require('lodash')
var QueryParser = require('./util/query-parser')

module.exports = function DeviceListCtrl (
  $scope
  , DeviceService
  , $location
) {
  //获取所有设备列表
  $scope.tracker = DeviceService.trackAll($scope)
  // $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  var deviceInfo = $scope.tracker.devices
  var deviceInfoSerial = ''

  //获取设备 serial
  $scope.$watchCollection('tracker.devices',function () {
    angular.forEach(deviceInfo, function (data, index) {
      deviceInfoSerial = data.serial
      console.info('deviceInfoSerial', deviceInfoSerial)
    })
  })

  //无可用设备提示
  if (typeof deviceInfoSerial == 'undefined') {
    console.info('当前无可用设备')
  } else {
    $scope.$on = function () {
      location.replace('#!/control/' + deviceInfoSerial)
    }
  }
}
