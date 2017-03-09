module.exports = function SignInCtrl($scope, $http, $location) {
  $scope.error = null

  //根据 url 传参获取用户信息
  var urlData = $location.search()
  var name = urlData.name ? urlData.name : 'DEFAULT'
  var email = urlData.email ? urlData.email : 'default@yunzhihui.com'

  var data = {
    name: name,
    email: email
    // name: $scope.signin.username.$modelValue
    // , email: $scope.signin.email.$modelValue
  }
  console.info('data', data, 'urlData', urlData)

  //页面加载完执行登录
  $scope.$on = function() {
    $scope.invalid = false
    $http.post('/auth/api/v1/mock', data)
      .success(function(response) {
        $scope.error = null,
        location.replace(response.redirect)
      })
      .error(function(response) {
        switch (response.error) {
          case 'ValidationError':
            $scope.error = {
              $invalid: true
            }
            break
          case 'InvalidCredentialsError':
            $scope.error = {
              $incorrect: true
            }
            break
          default:
            $scope.error = {
              $server: true
            }
            break
        }
      })
    return false
  }
}
