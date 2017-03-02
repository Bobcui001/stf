module.exports = function SignInCtrl($scope, $http) {
  console.info('TEST');
  return false;
  $scope.error = null

  $scope.submit = function() {
    console.info('TEST2');
    return false;
    var data = {
      name: $scope.signin.username.$modelValue
      , email: $scope.signin.email.$modelValue
    }
    $scope.invalid = false
    $http.post('/auth/api/v1/mock', data)
      .success(function(response) {
        $scope.error = null,
        console.info('TEST');
        // location.replace(response.redirect)
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
  }
}
