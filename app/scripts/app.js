'use strict';

var app = angular.module('blabby', ['ui.router', 'firebase', 'ui.bootstrap']);

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

app.controller('HomeCtrl', ['Room', '$modal', function(Room, $modal) {
  var vm = this;

  vm.title = "Blabby".toUpperCase();

  //Array of rooms from Firebase
  vm.rooms = Room.all;

  //Modal to add new room
  vm.roomModal = function() {
    var modalInstance = $modal.open({
      templateUrl: '/templates/room-modal.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: 'modal'
    });

    //Add room to firebase on modal.ok
    modalInstance.result.then(function(roomName) {
      Room.add(roomName);
    });

  };

}])

app.controller('ModalInstanceCtrl', ['$modalInstance', 'Room', function($modalInstance, Room) {
  var vm = this;

  vm.roomName = '';

  // Add method to submit modal input for new room
  vm.ok = function() {
    $modalInstance.close(vm.roomName);
  };

  vm.cancel = function() {
    $modalInstance.dismiss('cancel');
  };


}])



/*Factories*/

app.factory('Room', ['$firebase', function($firebase){
  
  var firebaseAPI = 'https://blabby.firebaseio.com/';
  var firebaseRef = new Firebase(firebaseAPI);

  var rooms = $firebase(firebaseRef.child('rooms')).$asArray();

  var addRoom = function(roomName) {
    rooms.$add({room: roomName})
      .then(function() {
        console.log('The room as been added!');
    });
  };
  
  return {
    all: rooms,
    add: addRoom
  }
  
}])