'use strict';

var app = angular.module('blabby', ['ui.router', 'firebase', 'ui.bootstrap', 'ngCookies']);

// Cookie setup
app.run(['$cookies', '$modal', function($cookies, $modal) {
  
  if ( !$cookies.blabbyCurrentUser || $cookies.blabbyCurrentUser === '' ) {
    $modal.open({
      templateUrl: '/templates/user-modal.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: 'modalVm',
      windowClass: 'center-modal',
      size: 'sm'
    }).result.then(function(userInput) {
      $cookies.blabbyCurrentUser = userInput;
    });
  }
}])


app.config(['$stateProvider', function($stateProvider) {

  $stateProvider
    .state('home', {
      url:'',
      templateUrl: '/templates/home.html',
      controller: 'HomeCtrl as homeVm'
    })

    // .state('home.chat', {

    // })

}])


/*Controllers*/

app.controller('HomeCtrl', ['Room', '$modal', function(Room, $modal) {
  var vm = this;

  vm.title = 'Blabby';

  //Array of rooms from Firebase
  vm.rooms = Room.all;

  //Modal to add new room
  vm.roomModal = function() {
    var modalInstance = $modal.open({
      templateUrl: '/templates/room-modal.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: 'modalVm',
      windowClass: 'center-modal',
      size: 'sm'
    });

    //Add room to firebase on modal.ok
    modalInstance.result.then(function(roomName) {
      Room.add(roomName);
    });
  };


  // Chatroom content
  vm.currentRoom = null;

  vm.setActiveRoom = function(roomId, roomName) {
    vm.currentRoom = {};
    vm.currentRoom.id = roomId;
    vm.currentRoom.name = roomName;
    vm.currentRoom.messages = Room.messages(roomId);

    return vm.currentRoom;
  };

}])

app.controller('ModalInstanceCtrl', ['$modalInstance', 'Room', function($modalInstance, Room) {
  var vm = this;

  vm.roomName;
  vm.username;

  // Create new room on modal OK
  vm.ok = function() {
    $modalInstance.close(vm.roomName);
  };

  // Dismiss modal
  vm.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  // For username setup
  vm.setUsername = function() {
    $modalInstance.close(vm.username);
  }


}])



/*Factories*/

app.factory('Room', ['$firebaseArray', function($firebaseArray){
  
  var firebaseAPI = 'https://blabby.firebaseio.com/';
  var firebaseRef = new Firebase(firebaseAPI);

  var rooms = $firebaseArray(firebaseRef.child('rooms'));

  var addRoom = function(roomName) {
    rooms.$add({name: roomName})
      .then(function() {
        console.log('The room as been added!');
    });
  };

  var getMessages = function(roomId) {
    return $firebaseArray(firebaseRef.child('messages').orderByChild('roomId').equalTo(roomId));
  };
  
  return {
    all: rooms,
    add: addRoom,
    messages: getMessages
  }
  
}])