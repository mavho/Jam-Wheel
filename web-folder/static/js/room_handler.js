var socket;
var room_name = "";
var user_name = "";
var user_count = 0;

var users = {}

document.querySelector("#room_join").addEventListener("click", async() =>{
    room_name = document.getElementById("room_input").value;
    user_name = document.getElementById("username_input").value;

    if(!checkInput(room_name,8)){
        alert("Room name must not be empty and at least 8 characters");
        return;
    }
    if(!checkInput(user_name,16)){
        alert("Username most not be empty and at least 16 characters");
        return;
    }

    let xhr = new XMLHttpRequest();
    let url = `https://${document.domain}:${location.port}/register`

    xhr.open('POST',url);

    let json = JSON.stringify({
        username: user_name,
        //room: room_name
    });
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.send(json);

    xhr.onload = () => {
        let payload = JSON.parse(xhr.response);

        socket = new WebSocket(`wss://${document.domain}:${location.port}/ws/${payload['url']}`);

        socket.onopen = function(e){
            console.log("Connection established");

            socket.send(JSON.stringify({'topics':room_name}));

            $.ajax(`https://${document.domain}:${location.port}/templates/_includes/jamwheel.html`).done(function(reply){
                $('#title').removeClass("glow").addClass("muted-glow");
                $('#container').html(reply);
            });
        }

        socket.onclose = function(e){
            if (e.wasClean){
                console.log(`Connection closed cleanly, code=${e.code}, reason = ${e.reason}`);
            }else{
                console.log('Connection died');
            }
        }

        socket.onerror = function(error){
            console.log(`error ${error.message}`);
        }
    }
});

function textCounter(field, count_field_id, limit){
    var count_field = $(count_field_id);
    if (field.value.length > limit){
        //retains max limit
        field.value = field.value.substring(0,limit);
        $(field).addClass('is-danger');
    }else{
        $(field).removeClass('is-danger');
        count_field.text(limit-field.value.length);
    }
}
function checkInput(input,max_len){
    //check if in is empty, blank, null, ud, or greater than 8 chars
    if(input.length == 0 || /^\s*$/.test(input) || input.length > max_len){
        return false;
    }
    return true;
}
