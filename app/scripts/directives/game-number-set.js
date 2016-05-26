'use strict';

angular.module('lotteryApp')
  .directive('gameNumberSet', gameNumberSet);

function gameNumberSet(LotteryGame) {

  var directive = {
    restrict: 'E',
    templateUrl: 'views/partials/game-number-set.html',
    controller: gameNumberSetController,
    controllerAs: 'numberSet',
    link: gameNumberSetLink,
    scope: {},
    bindToController: {
      numbers: '@',
      system: '=',
      game: '='
    }
  };

  return directive;

  function gameNumberSetController() {
    var vm = this;
    vm.numberSets = [];
    vm.currentNumberSet = [];
    vm.currentIsLucky = false;

    vm.isSelected = function(number) {
      return vm.currentNumberSet.indexOf(number)>-1;
    }

    vm.init = function () {
      vm.numberSets = _generateSplitNumbers(vm.numbers);
      LotteryGame.initNumberSets(vm.game.id)
    }
  }

  function gameNumberSetLink(scope, elem, attrs, ctrl) {

    // watch for change in game system
    // this affects the number of elements of selected numbers
    scope.$watch(function(){
      return ctrl.system;
    }, function(newVal){
      // check if new system has less cardinality as the current number set length
      var numSetLength = LotteryGame.getCurrentNumberSet(ctrl.game.id).length;
      if (!!newVal && newVal.numbers < numSetLength/*ctrl.currentNumberSet.length*/) {
        // remove last n selected numbers from selected number set
        for (var i=numSetLength; i>newVal.numbers; i--) {
          var lastNum = LotteryGame.getCurrentNumberSet(ctrl.game.id)[i-1];
          LotteryGame.removeNumberFromCurrSet(ctrl.game.id, lastNum);
          _toggleNumberSelect(lastNum, elem);
        }
      }
    });

    scope.$watch(function(){
      return LotteryGame.getCurrentNumberSet(ctrl.game.id);
    }, function(nV){
      ctrl.currentNumberSet = nV;
      ctrl.currentIsLucky = LotteryGame.currentIsLucky(ctrl.game.id);
    });

    ctrl.init();

    ctrl.selectNumber = function (number) {
      // check if clicked game number is already selected
      if (ctrl.currentNumberSet.indexOf(number+'')>-1) {
        var numSet = angular.copy(ctrl.currentNumberSet);
        // remove number from selected set
        LotteryGame.removeNumberFromCurrSet(ctrl.game.id, number);
      } else {
        // check if there is still available slots for selected number set
        if (LotteryGame.getCurrentNumberSet(ctrl.game.id).length < ctrl.system.numbers) {
          // add to selected number set
          LotteryGame.addNumberToCurrSet(ctrl.game.id, number);
        } else {
          // remove first element and add selected number
          var firstNumber = LotteryGame.getCurrentNumberSet(ctrl.game.id)[0];
          LotteryGame.removeNumberFromCurrSet(ctrl.game.id, firstNumber);
          LotteryGame.addNumberToCurrSet(ctrl.game.id, number);
        }
      }
    };

  }
}

/**
 * toggle game number as selected or not
 * @param number
 * @param elem
 * @private
 */
function _toggleNumberSelect(number, elem) {
  var className = 'selected-in-table';
  var gameNumber = elem.find('td.game_number[number="' + number + '"]');
  if (gameNumber.hasClass(className)) {
    gameNumber.removeClass(className);
  } else {
    gameNumber.addClass(className);
  }
}

/**
 * generate numberSet grouped by 10 from a range
 * @param numbers
 * @returns {Array}
 * @private
 */
function _generateSplitNumbers(numbers) {
  var splitNumbers = [];
  var numberSets = [];
  for (var i = 1; i <= numbers; i++) {
    splitNumbers.push(i);
    if (i % 10 == 0) {
      numberSets.push(splitNumbers);
      splitNumbers = [];
    }
    if (i == numbers && splitNumbers.length > 0) {
      numberSets.push(splitNumbers);
    }
  }
  return numberSets;
}
