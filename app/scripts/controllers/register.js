'use strict';

angular.module('lotteryApp')
  .controller('RegisterCtrl', function ($scope, User) {
    $scope.open = function($event) {
    	$event.preventDefault();
    	$event.stopPropagation();

    	$scope.opened = true;
    }

    $scope.user = {
    	"username": "",
    	"password": "",
    	"firstName": "",
    	"lastName": "",
    	"birthDate": "",
    	"gender": ""
    };

    $scope.register = function() {
    	User.register($scope.user);
    }
  });
