import JamWheel from "./JamWheel.js";

var room_name = "";
var user_name = "";

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
        room: room_name,
    });
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.send(json);

    xhr.onload = () => {

        $("#landing_page").hide();
        let payload = JSON.parse(xhr.response);

        
        let e = new p5(function(tp5){

            tp5.setup = function(){
                let jamwheel = new JamWheel(
                    tp5,
                    {},
                    `wss://${document.domain}:${location.port}/ws/${payload['url']}`,
                    payload['url'],
                    user_name,
                    room_name,
                    )

                jamwheel.run();
            }

        });


    }
});


$("#room_input").on('keydown keyup',{limit:8,counter:"#room_counter"},textCounter);
$("#username_input").on('keydown keyup',{limit:16,counter:"#user_counter"},textCounter);

function textCounter(event){
    var e = $(this);
    let limit = event.data.limit;

    var counter_field = $(event.data.counter);

    if (e.val().length > limit){
        //retains max limit
        e.val(e.val().substring(0,limit));
        e.addClass('is-danger');
    }else{
        e.removeClass('is-danger');
        counter_field.text(limit-e.val().length);
    }
}
function checkInput(input,max_len){
    //check if in is empty, blank, null, ud, or greater than 8 chars
    if(input.length == 0 || /^\s*$/.test(input) || input.length > max_len){
        return false;
    }
    return true;
}
