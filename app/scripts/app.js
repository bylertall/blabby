'use strict';

var app = angular.module('blabby', ['ui.router', 'firebase']);

app.config(['$stateProvider', function($stateProvider) {

  $stateProvider
    .state('home', {
      url:'',
      templateUrl: '/templates/home.html',
      controller: 'HomeCtrl',
      controllerAs: 'home'
    })

}])


/*Controllers*/

app.controller('HomeCtrl', ['Room', function(Room) {
  var vm = this;

  vm.title = "Blabby".toUpperCase();
  vm.roomArray = Room.all;
  console.log(vm.roomArray);

}])



/*Factories*/

app.factory('Room', ['$firebase', function($firebase){
  
  var firebaseAPI = 'https://blabby.firebaseio.com/';
  var firebaseRef = new Firebase(firebaseAPI);

  var rooms = $firebase(firebaseRef.child('rooms')).$asArray();
  
  return {
    all: rooms
  }
  
}])