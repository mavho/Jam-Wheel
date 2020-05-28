var socket = io.connect('https://'+document.domain + ':' + location.port +'/test_room');
var room_name = "";
var user_name = "";
var user_count = 0;

var users = {}



socket.on('join room', function(msg){
    if(msg['success'] == false){
        alert('Duplicate username');
    }else if (msg['success'] != undefined){
        console.log('You joined ' + msg['room']);
        $.ajax(msg['url']).done(function(reply){
            $('#title').removeClass("glow").addClass("muted-glow");
            $('#container').html(reply);
        });
    }else{
        console.log(msg['users'] + ' joined ' + msg['room']);
        users = msg['users'];
    }
});


document.querySelector("#room_join").addEventListener("click", async() =>{
    room_name = document.getElementById("room_input").value;
    user_name = document.getElementById("username_input").value;
    if(!checkInput(room_name) || !checkInput(user_name)){
        alert("Inputs must not be empty and at least 8 characters")
    }else{
        socket.emit('join room', {'room': room_name, 'user_name': user_name});
    }
});


function checkInput(input){
    //check if in is empty, blank, null, ud, or greater than 8 chars
    if(!input || /^\s*$/.test(input) || input.length > 8){
        return false;
    }
    return true;
}
