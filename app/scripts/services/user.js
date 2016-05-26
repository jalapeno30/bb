'use strict';

angular.module('lotteryApp')
  .service('User', function User($http, ENV, localStorageService, growl) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var self = this;
    self.logged = localStorageService.get('logged') == null ? false : localStorageService.get('logged');
    self.name = localStorageService.get('username') == null ? "" : localStorageService.get('username');
    self.isAdmin = function() {
      return localStorageService.get('role') == "Administrator";
    };

    // console.log(localStorageService.get('username'));

    self.logIn = function(username, password) {
    	$http.get(ENV.apiEndpoint + '/authentication/userLogin', {
    		params: {
    			username: username,
    			password: password
    		}
    	})
  		.success(function(data){
  			self.logged =  true;
  			self.name = username;
        localStorageService.remove('logged');
        localStorageService.set('logged', true);
        localStorageService.remove('sessionToken');
        localStorageService.set('sessionToken',data.token);
        localStorageService.remove('username');
        localStorageService.set('username', data.userName);
        localStorageService.remove('role');
        localStorageService.set('role', data.role);
        growl.addSuccessMessage('You have successfully logged in.');
  			// console.log(data);
  		})
  		.error(function(data){
  			self.logged = false;
        growl.addErrorMessage('Wrong username or password');
  			// console.log(data);
  		});
    }

    self.logout = function() {
      localStorageService.remove('logged');
      localStorageService.remove('sessionToken');
      localStorageService.remove('username');
      localStorageService.remove('role');
      self.logged = false;
      growl.addSuccessMessage('You have successfully logged out.');
    }

    self.getToken = function() {
      return localStorageService.get('sessionToken') == null ? false : localStorageService.get('sessionToken');
    }

    self.register = function(data) {
      var formattedData = data;
      $http.post(ENV.apiEndpoint + '/authentication/register', formattedData)
      .success(function(data){
        if (data.status == "success") {
          window.location = "#";
        }
      });
    }

  });
