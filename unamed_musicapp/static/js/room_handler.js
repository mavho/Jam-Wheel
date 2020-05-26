var socket = io.connect('http://'+document.domain + ':' + location.port +'/test_room');
var room_name = "";
var user_name = "";
var user_count;


socket.on('join room', function(msg){
    console.log('Joined ' + msg['room']);
    console.log(msg['url']);
    $.ajax(msg['url']).done(function(reply){
        $('#container').html(reply);
    });

});


//TODO: name validation etc
document.querySelector("#room_join").addEventListener("click", async() =>{
    room_name = document.getElementById("room_input").value;
    user_name = document.getElementById("username_input").value;
    socket.emit('join room', {'room': room_name, 'user_name': user_name});
});
