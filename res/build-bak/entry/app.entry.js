webpackJsonp([0,6],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__.e/* nsure */(1, function(require) {
	  __webpack_require__(1)
	  __webpack_require__(2)
	  __webpack_require__(3)

	  angular.module('app', [
	    'ngRoute',
	    'ngTouch',
	    __webpack_require__(4).name,
	    __webpack_require__(6).name,
	    __webpack_require__(12).name,
	    __webpack_require__(205).name,
	    __webpack_require__(298).name,
	    __webpack_require__(562).name,
	    __webpack_require__(578).name,
	    __webpack_require__(625).name,
	    __webpack_require__(629).name,
	    __webpack_require__(632).name,
	    __webpack_require__(261).name
	  ])
	    .config(function($routeProvider, $locationProvider) {
	      $locationProvider.hashPrefix('!')
	      $routeProvider
	        .otherwise({
	          redirectTo: '/devices'
	        })
	    })

	    .config(function(hotkeysProvider) {
	      hotkeysProvider.templateTitle = 'Keyboard Shortcuts:'
	    })
	})


/***/ }
]);