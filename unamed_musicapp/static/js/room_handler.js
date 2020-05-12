var socket = io.connect('http://'+document.domain + ':' + location.port +'/test_room');
var room = "";


socket.on('join room', function(msg){
    console.log(msg);
    room = msg['room']
    var room = io.sockets.adapter.rooms[room];
    console.log(room.length);
});

socket.on('connection', function(socket){
    socket.on('disconnect',() =>{
        socket.emit('exit', {"room": room});
    })
})
var testsynth =  new Tone.Synth({
    "oscillator":{
        "type": "sine",
        "partialCount": 5, 
    },
    "envelope":{
        "attack":0.01,
        "decay": 1.2,
        "release": 1.2,
        "attackCurve": "exponential"
    }
    }).toMaster();

socket.on('press key', function(msg){
    console.log('Key pressed');
    console.log(msg);
    testsynth.triggerAttackRelease("C5",0.5);
})


document.querySelector("#room1").addEventListener("click", async() =>{
    console.log("Joining room1")
    room = "room1"
    socket.emit('join room', {'room': 'room1'});
});

document.querySelector("#room2").addEventListener("click", async() =>{
    console.log("Joining room2")
    socket.emit('join room', {'room': 'room2'});
});