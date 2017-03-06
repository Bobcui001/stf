module.exports = function SignInCtrl($scope, $http, $location) {
  console.info('TEST');
  $scope.error = null

  //页面加载完执行登录
  $scope.$on = function() {
    //根据 url 传参获取用户信息
    var urlData = $location.search()

    var data = {
      name: urlData.name,
      email: urlData.email
      // name: $scope.signin.username.$modelValue
      // , email: $scope.signin.email.$modelValue
    }
    console.info('data', data, 'urlData', urlData)

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
