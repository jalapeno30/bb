'use strict';

angular.module('lotteryApp')
  .directive('selectedNumberSet', selectedNumberSet);

function selectedNumberSet(LotteryGame, $rootScope) {

  var directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/partials/selected-number-set.html',
    controller: selectedNumberSetController,
    controllerAs: 'selectedSet',
    link: selectedNumberSetLink,
    scope: {},
    bindToController: {
      system: '=',
      game: '='
    }
  };

  return directive;

  function selectedNumberSetController($scope) {
    var vm = this;
    vm.numberRange = [];
    vm.numberSets = LotteryGame.getNumberSets(vm.game.id);
    vm.currentSet = 0;
    vm.luckyPicks = LotteryGame.getLuckyNumberSets(vm.game.id);

    $rootScope.$on('changeNumberSet-' + vm.game.id, function(e, numSets){
      $scope.$evalAsync(function(){
        vm.numberSets = numSets;
        vm.luckyPicks = LotteryGame.getLuckyNumberSets(vm.game.id);
      })
    });

    vm.chooseCurrent = function(idx) {
      vm.currentSet = idx;
      LotteryGame.setCurrentNumberSet(vm.game.id, idx);
    }

    vm.isLucky = function(idx) {
      return vm.luckyPicks.indexOf(idx)>-1;
    }

    vm.notLucky = function(idx) {
      LotteryGame.assignNumberSetToCurrentSet(vm.game.id, []);
      LotteryGame.toggleLuckyNumberSet(vm.game.id, idx);
    }
  }

  function selectedNumberSetLink(scope, elem, attrs, ctrl) {

    scope.$watch(function(){
      return ctrl.system;
    }, function(newVal){
      if (newVal) {
        ctrl.numberRange = [];
        for (var i=0; i<newVal.numbers; i++) {
          ctrl.numberRange.push(i);
        }
      }
    });
  }
}
