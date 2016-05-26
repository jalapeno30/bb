'use strict';

angular.module('lotteryApp')
  .controller('UserCtrl', function ($scope, $modal, User) {
  	$scope.logged = User.logged;
    $scope.username = "";
    $scope.isAdmin = User.isAdmin;

    $scope.$watchCollection(function(){
        return [User.logged, User.name, User.isAdmin()];
      }, function(newvals){
          if (newvals[0] != undefined) {
            $scope.logged = newvals[0];
          }
          if (newvals[1] != undefined) {
            $scope.username = newvals[1];
          }
          if (newvals[2] != undefined) {
            $scope.isAdmin = newvals[2];
          }
      }, true);

    $scope.login = function() {
        // $scope.logged = true;
        // $scope.username = 'Nicolai';
        var modalInstance = $modal.open({
            templateUrl: 'views/partials/loginModal.html',
            controller: 'ModalInstanceCtrl'
        });

        modalInstance.result.then(function(user){
            // $scope.username = user.name;
            // $scope.logged = true;
            User.logIn(user.name, user.password);
        });
    }

    $scope.logout = function() {
        // $scope.logged = false;
        // $scope.username = '';
        User.logout();
    }

  });

angular.module('lotteryApp')
  .controller('ModalInstanceCtrl', function ($scope, $modalInstance) {

  $scope.user = {
    name: '',
    password: ''
  };

  $scope.loginOk = function() {
    if ($scope.user.name.length > 0) {
        $modalInstance.close($scope.user);
    }

}

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.submitLoginForm = function() {
    $scope.loginOk();
  }
});
