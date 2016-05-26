'use strict';

angular
  .module('lotteryApp')
  .service('LotteryGames', LotteryGames);

function LotteryGames($http, ENV) {

  var games = [];

  function fetchGames() {
    return $http({
      url: ENV.apiEndpoint + '/games',
      method: 'GET'
    }).then(function(result){
      games = result.data;
    });
  }

  function getGames() {
    return games;
  }

  return {
    fetchGames: fetchGames,
    getGames: getGames,
  }

}

angular
  .module('lotteryApp')
  .service('LotteryGame', LotteryGame);

function LotteryGame($http, ENV, $rootScope) {

  var draws = [];
  var systems = [];
  var numberSets = [];

  function fetchDraws(gameId) {
    return $http({
      url: ENV.apiEndpoint + '/games/' + gameId + '/draws/available',
      method: 'GET'
    }).then(function(result){
      draws = result.data;
    });
  }

  function getDraws() {
    return draws;
  }

  function fetchSystems() {
    return $http({
      url: ENV.apiEndpoint + '/games/systems',
      method: 'GET'
    }).then(function(result){
      systems = result.data;
    });
  }

  function getSystems() {
    return systems;
  }

  function getNumberSets(gameId) {
    var numberSet = numberSets.filter(function(numSet){
      return numSet.game === gameId;
    });
    return numberSet.length === 0 ? [] : numberSet[0].sets.map(function(numSet){
      return numSet.numbers;
    });
  }

  function initNumberSets(gameId) {
    var emptyNumberSet = {
      game: gameId,
      sets: [
        {id: 1, current: true, numbers: [], lucky: false},
        {id: 2, current: false, numbers: [], lucky: false},
        {id: 3, current: false, numbers: [], lucky: false},
        {id: 4, current: false, numbers: [], lucky: false},
        {id: 5, current: false, numbers: [], lucky: false},
        {id: 6, current: false, numbers: [], lucky: false},
      ]
    };
    // check if game number set exists
    var numberSet = numberSets.filter(function(numSet){
      return numSet.game === gameId;
    });
    if (numberSet.length > 0) {
      numberSets[numberSets.indexOf(numberSet[0])] = emptyNumberSet;
    } else {
      numberSets.push(emptyNumberSet);
    }
    emitEvent(gameId, getNumberSets(gameId));
  }

  function getCurrentNumberSet(gameId) {
    var numberSet = numberSets.filter(function(numSet){
      return numSet.game === gameId;
    });
    return numberSet.length === 0 ? [] : numberSet[0].sets.filter(function(numSet){
      return numSet.current;
    })[0].numbers;
  }

  function addNumberToCurrSet(gameId, number) {
    if (getNumberSets(gameId) === []) {
      initNumberSets(gameId);
    }
    // get current game
    var gameIdx = numberSets.indexOf(numberSets.filter(function(numSet){
      return numSet.game === gameId;
    })[0]);
    // get current number set
    var currNumSet = getCurrentNumberSet(gameId);
    // get current number set object and index
    var currNumSetObj = numberSets[gameIdx].sets.filter(function(set){
      return set.current;
    })[0];
    var currNumSetIdx = numberSets[gameIdx].sets.indexOf(currNumSetObj);
    // replace game
    currNumSet.push(number);
    numberSets[gameIdx].sets[currNumSetIdx].numbers = currNumSet;
    emitEvent(gameId, getNumberSets(gameId));
  }

  function removeNumberFromCurrSet(gameId, number) {
    if (getNumberSets(gameId) !== [])  {
      // get current game
      var gameIdx = numberSets.indexOf(numberSets.filter(function(numSet){
        return numSet.game === gameId;
      })[0]);
      // get current number set
      var currNumSet = getCurrentNumberSet(gameId);
      // get current number set object and index
      var currNumSetObj = numberSets[gameIdx].sets.filter(function(set){
        return set.current;
      })[0];
      var currNumSetIdx = numberSets[gameIdx].sets.indexOf(currNumSetObj);
      // replace game
      numberSets[gameIdx].sets[currNumSetIdx].numbers = currNumSet.filter(function(num){
        return num !== number;
      });
      emitEvent(gameId, getNumberSets(gameId));
    }
  }

  function assignNumberSetToCurrentSet(gameId, numbers) {
    var gameIdx = numberSets.indexOf(numberSets.filter(function(numSet){
      return numSet.game === gameId;
    })[0]);
    // get current number set object
    var currNumSetObj = numberSets[gameIdx].sets.filter(function(set){
      return set.current;
    })[0];
    numberSets[gameIdx].sets[numberSets[gameIdx].sets.indexOf(currNumSetObj)].numbers = numbers;
    emitEvent(gameId, getNumberSets(gameId));
  }

  function emitEvent(gameId, args) {
    $rootScope.$emit('changeNumberSet-' + gameId, args);
  }

  function setCurrentNumberSet(gameId, setId) {
    var idx = 0;
    var gameNumberSetIdx = numberSets.indexOf(numberSets.filter(function(numSet){
      return numSet.game === gameId
    })[0]);
    numberSets[gameNumberSetIdx].sets = numberSets[gameNumberSetIdx].sets.map(function(numSet){
      numSet.current = (idx === setId);
      idx++;
      return numSet;
    });
  }

  function toggleLuckyNumberSet(gameId, index) {
    var gameNumberSetIdx = numberSets.indexOf(numberSets.filter(function(numSet){
      return numSet.game === gameId
    })[0]);
    if (angular.isDefined(index)) {
      numberSets[gameNumberSetIdx].sets[index].lucky = !numberSets[gameNumberSetIdx].sets[index].lucky;
    } else {
      var gameIdx = numberSets.indexOf(numberSets.filter(function(numSet){
        return numSet.game === gameId;
      })[0]);
      // get current number set object
      var currNumSetObj = numberSets[gameIdx].sets.filter(function(set){
        return set.current;
      })[0];
      numberSets[gameIdx].sets[numberSets[gameIdx].sets.indexOf(currNumSetObj)].lucky = !numberSets[gameIdx].sets[numberSets[gameIdx].sets.indexOf(currNumSetObj)].lucky;
    }
    emitEvent(gameId, getNumberSets(gameId));
  }

  function getLuckyNumberSets(gameId) {
    var idx = 0;
    var gameNumberSetIdx = numberSets.indexOf(numberSets.filter(function(numSet){
      return numSet.game === gameId
    })[0]);
    var luckies = [];
    numberSets[gameNumberSetIdx].sets.forEach(function(numSet){
      if (numSet.lucky) luckies.push(idx);
      idx++;
    });
    return luckies;
  }

  function currentIsLucky(gameId) {
    var numberSet = numberSets.filter(function(numSet){
      return numSet.game === gameId;
    });
    return numberSet.length === 0 ? [] : numberSet[0].sets.filter(function(numSet){
      return numSet.current;
    })[0].lucky;
  }

  return {
    fetchDraws: fetchDraws,
    getDraws: getDraws,
    fetchSystems: fetchSystems,
    getSystems: getSystems,
    getNumberSets: getNumberSets,
    initNumberSets: initNumberSets,
    getCurrentNumberSet: getCurrentNumberSet,
    addNumberToCurrSet: addNumberToCurrSet,
    removeNumberFromCurrSet: removeNumberFromCurrSet,
    setCurrentNumberSet: setCurrentNumberSet,
    assignNumberSetToCurrentSet: assignNumberSetToCurrentSet,
    toggleLuckyNumberSet: toggleLuckyNumberSet,
    getLuckyNumberSets: getLuckyNumberSets,
    currentIsLucky: currentIsLucky
  }

}
