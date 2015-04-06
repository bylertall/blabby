'use strict';

var app = angular.module('blabby', ['ui.router', 'firebase', 'ui.bootstrap', 'ngCookies']);

// Cookie setup
app.run(['$cookies', '$modal', function($cookies, $modal) {
  
  if ( !$cookies.blabbyCurrentUser || $cookies.blabbyCurrentUser === '' ) {
    $modal.open({
      templateUrl: '/templates/user-modal.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: 'modalVm',
      windowClass: 'center-modal user-modal',
      size: 'sm'
    }).result.then(function(userInput) {
      $cookies.blabbyCurrentUser = userInput;
    });
  }
}])

app.constant('FIREBASE_API', 'https://blabby.firebaseio.com/')


app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url:'/',
      templateUrl: '/templates/home.html',
      controller: 'HomeCtrl as homeVm'
    })


}])


/*Controllers*/

app.controller('HomeCtrl', ['Room', 'Message', '$modal', '$cookies', '$state', function(Room, Message, $modal, $cookies, $state) {
  var vm = this;

  vm.title = 'Blabby';
  vm.stateReload = function() {
    $state.reload();
  };

  //Array of rooms from Firebase
  vm.rooms = Room.all;

  //Modal to add new room
  vm.roomModal = function() {
    var modalInstance = $modal.open({
      templateUrl: '/templates/room-modal.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: 'modalVm',
      windowClass: 'center-modal room-modal',
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

  // Send new message
  vm.newMessage = '';

  vm.submitNewMessage = function() {
    var messageObj = {};

    if(vm.newMessage !== '') {
      messageObj.content = vm.newMessage;
      messageObj.roomId = vm.currentRoom.id;
      messageObj.sentAt = (new Date()).toISOString();
      messageObj.username = $cookies.blabbyCurrentUser;

      // clear user input
      vm.newMessage = '';

      return Message.send(messageObj);
    } else {
      alert('Your message is empty!');
    }
  };

  // Send message on 'Enter' keypress
  vm.sendOnEnter = function(event) {
    if (event.keyCode === 13) {
      vm.submitNewMessage();
    }
  };

}])

app.controller('ModalInstanceCtrl', ['$modalInstance', 'Room', function($modalInstance, Room) {
  var vm = this;

  vm.userInput;

  // Submit user input
  vm.submit = function() {
    if (vm.userInput !== undefined) {
      $modalInstance.close(vm.userInput);
    } else {
      alert('You didn\'t enter a room name! How about entering at least one character?');
    }
  };

  // Dismiss modal
  vm.cancel = function() {
    $modalInstance.dismiss('cancel');
  };


  // Send message on 'Enter' keypress
  vm.sendOnEnter = function(event) {
    if (event.keyCode === 13) {
      vm.submit();
    }
  };


}])



/*Factories*/

app.factory('Room', ['$firebaseArray', 'FIREBASE_API', function($firebaseArray, FIREBASE_API){
  
  
  var firebaseRef = new Firebase(FIREBASE_API);

  var rooms = $firebaseArray(firebaseRef.child('rooms'));

  var addRoom = function(roomName) {
    rooms.$add({name: roomName})
      .then(function() {
        console.log('A new room has been added!');
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

app.factory('Message', ['$firebaseArray', 'FIREBASE_API', '$timeout', function($firebaseArray, FIREBASE_API, $timeout) {
  var firebaseRef = new Firebase(FIREBASE_API);

  var messages = $firebaseArray(firebaseRef.child('messages'));

  var addMessage = function(messageObj) {
    messages.$add({
      content: messageObj.content,
      roomId: messageObj.roomId,
      sentAt: messageObj.sentAt,
      username: messageObj.username
    }).then(function() {
      console.log('A new message was submitted');
      $timeout (function() {
        var divMessageList = document.getElementById('message-list');
        divMessageList.scrollTop = divMessageList.scrollHeight;
      }, 0);
    });
  };

  return {
    send: addMessage
  }
}])