require.ensure([], function(require) {
  require('angular')
  require('angular-route')
  require('angular-touch')

  angular.module('app', [
    'ngRoute',
    'ngTouch',
    require('gettext').name,
    require('angular-hotkeys').name,
    require('./layout').name,
    require('./device-list').name,
    require('./control-panes').name,
    require('./menu').name,
    require('./settings').name,
    require('./docs').name,
    require('./user').name,
    require('./../common/lang').name,
    require('stf/standalone').name
  ])
    .config(function($routeProvider, $locationProvider) {
      $locationProvider.hashPrefix('!')
      $routeProvider
        .otherwise({
          redirectTo: '/devices'
        })
    })

    //对 hotkeysProvider 服务进行配置，hotkeysProvider服务 创建方式为 provider
    .config(function(hotkeysProvider) {
      hotkeysProvider.templateTitle = 'Keyboard Shortcuts:'
    })
})
