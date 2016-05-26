'use strict';

angular.module('lotteryApp')
  .directive('gameNumber', gameNumber);

function gameNumber() {

  var directive = {
    scope: {},
    bindToController: {
      number: '@'
    },
    controller: gameNumberController,
    controllerAs: 'gameNumnber',
    link: gameNumberLink,
    require: ['^gameNumberSet', 'gameNumber']
  };

  return directive;

  function gameNumberController() {
    var vm = this;
    vm.isSelected;
  }

  function gameNumberLink(scope, elem, attrs, ctrl) {
    elem.bind('click', function(){
      ctrl[0].selectNumber(ctrl[1].number);
    });
  }
}
