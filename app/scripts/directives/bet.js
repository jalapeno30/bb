'use strict';

angular
	.module('lotteryApp')
	.directive('bet', bet)
	.directive('betGame', betGame);

function bet(LotteryGames) {
	var directive = {
		restrict: 'E',
		scope: {},
		bindToController: {},
		replace: true,
		controller: betController,
		controllerAs: 'bet',
		link: betLink,
		templateUrl: 'views/directives/bet.html'
	};

	return directive;

	function betController() {
		var vm = this;

    vm.games = [];

    vm.init = function() {
      // fetch games
      LotteryGames
        .fetchGames()
        .then(function(){
          // attach games to vm
          vm.games = LotteryGames.getGames();
        });
    }
	}

	function betLink(scope, elem, attr, ctrl) {
    ctrl.init();
	}
}

function betGame(LotteryGame, Order, Orders, growl) {
	var directive = {
		restrict: 'E',
		scope: {},
		bindToController: {
			game: '='
		},
		replace: true,
		controller: betGameController,
		controllerAs: 'betGame',
		link: betGameLink,
		templateUrl: 'views/directives/bet-game.html'
	};

	return directive;

	function betGameController($scope) {
		var vm = this;

		vm.draws = [];
    vm.systems = [];
    vm.selectedDraws;

		vm.init = function() {
      LotteryGame
        .fetchDraws(vm.game.id)
        .then(function(){
          vm.draws = LotteryGame.getDraws();
        });
      // fetch systems
      LotteryGame
        .fetchSystems()
        .then(function(){
          vm.systems = LotteryGame.getSystems();
          vm.activeSystem = vm.systems[1];
          vm.system = vm.activeSystem.name;
        });
      LotteryGame.initNumberSets(vm.game.id);
		};

    vm.autoPlay = function(){
      var randomSet = randomNumberSet(vm.game.numbers, vm.activeSystem.numbers);
      LotteryGame.assignNumberSetToCurrentSet(vm.game.id, randomSet);
    };

    vm.luckyPick = function(){
      var randomSet = randomNumberSet(vm.game.numbers, vm.activeSystem.numbers);
      LotteryGame.assignNumberSetToCurrentSet(vm.game.id, randomSet);
      LotteryGame.toggleLuckyNumberSet(vm.game.id);
    };

    vm.addOrder = function(){
      if (vm.selectedDraws && Object.keys(vm.selectedDraws).length > 0) {
        for (var key in vm.selectedDraws) {
          if (vm.selectedDraws[key]) {
            var order = new Order();
            order.setGameID(vm.game.id);
            order.setDrawID(key);
            order.setNumbers(LotteryGame.getNumberSets(vm.game.id).filter(function(numSet){
              return numSet.length > 0;
            }));
            order.setSystem(vm.activeSystem);
            console.log(order);
            Orders.addPendingOrder(order);
          }
        }
        Orders.sendPendingOrders();
        Orders.refreshOrders();
        LotteryGame.initNumberSets(vm.game.id);
      } else if (LotteryGame.getNumberSets(vm.game.id).filter(function(numSet){
          return numSet.length > 0;
        }).length === 0) {
        growl.addErrorMessage('Please select at least one number set.');
      } else {
        growl.addErrorMessage('Please select at least one draw.');
      }

    };
	}

	function betGameLink(scope, elem, attr, ctrl) {
    ctrl.init(ctrl.game);

    scope.$watch(function(){
      return ctrl.system;
    }, function(newVal){
      ctrl.activeSystem = ctrl.systems.filter(function(system){
        return system.name === newVal;
      })[0];
    });

	}
}

function randomNumberSet(max, numbers) {
  var i, arr = [];
  for (i = 0; i < max; i++) {
    arr[i] = i + 1;
  }

  var shuffled = shuffle(arr);
  return shuffled.slice(0, numbers).sort(function(a,b){return a - b}).map(function(n){
    return n + '';
  });
}

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
