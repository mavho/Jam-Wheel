p5.disableFriendlyErrors=true;
/**
 * This is the main file that handles the canvas UI as well as
 * the P5 logic interacting with Tone.js
 */
const hex_color_wheel = ["#E50018","#E1008E","#BA00DD","#4400D9","#002CD5","#009AD2","#00CE98","#00CA2A","#3EC600","#A3C200"]

const hex_color_blue = ["#0016E5","#0229DB","#053AD2","#0749C9","#0956BF","#0B61B6","#0C6AAD","#0E71A3","#0F779A","#107A91"]

const hex_color_red = ["#E50022","#DB041F","#D1091C","#C70E1A","#BD1317","#A91D12","#9F220F","#95220F","#95270D","#823108"]

const hex_color_peach = ["#DD5336","#DD503B","#DE4D41","#DE4A47","#DF474D","#DF4453","#E04159","#E03E5F","#E13B65","#E23671"]

const hex_color_yellow = ["#E7D947","#DBD944","#CFDA42","#C3DB41","#B8DC3F","#ACDD3E","#A0DE3C","#95DF3A","#89E039","#7DE137"]

const hex_color_green = ["#0B5403","#105C04","#166405","#1B6C06","#217407","#277C08","#2C8409","#328C0A","#37940B","#3D9C0C"]
const C_MAJ_SCALE =["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"]

const OCTAVE_LOWER=["C2","D2","E2","F2","G2","A2","B2","C3","D3","E3"]

const blue = "#003680";
const green = "#6CDA70";
const red = "#710A0D";
const peach ="#E08A8C";
const yellow = "#D9B33A";


//save the state of each key.
/*These vars are very important
These vars refer to this USER's sounds
 */
var keys = [];
var curr_type = "KALIMBA";
var curr_note = "";
var canvas_background = blue;
//color between the keys
var inline_color = blue;


//Handles the user loops in this server
var userloops = {};
socket.onmessage = function(event){
    console.log(event);
    var msg = JSON.parse(event.data);
    console.log(msg);
    switch(msg['event']){
        case "key":
            if(msg['username'] in userloops && userloops[msg['username']].type == msg['instrument']){
                userloops[msg['username']].updateNote(msg['note']);
            }else{
                userloops[msg['username']] = new UserLoop(msg['instrument'],msg['note'],msg['username']); 
            }
            if(userloops[msg['username']] !== undefined){
                userloops[msg['username']].startLoop();
            }
            drawIncomingNotes(150,40);
            break;
        case "release": 
            if(userloops[msg['username']] !== undefined){
                userloops[msg['username']].endLoop();
            }
            break;
        case "disconnect":
            if (msg['username'] in userloops){
                delete userloops[msg['username']];
            }
            break;
    }
}
// Background base
var membrane_synth = new Tone.MembraneSynth(
    {
        "pitchDecay"  : 0.01 ,
        "octaves"  : 5 ,
        "oscillator"  : {
            "type"  : "sine"
    }  ,
        "envelope"  : {
            "attack"  : 0.001 ,
            "decay"  : 0.1 ,
            "sustain"  : 0.05 ,
            "release"  : 0.01 ,
            "attackCurve"  : "linear"
        }
    }
).toMaster();
//effect1.connect(Tone.Master);

function setup(){
    canvasDiv = document.getElementById("sketch");
    // Set up canvas
    can_width = canvasDiv.offsetWidth;
    can_height = windowHeight;
    var canvas = createCanvas(can_width,can_height);
    canvas.parent('sketch')
    createSwitcher();
    //updateUserIcons();
    //Vars for the circle
    updateKeys(curr_type);

    canvas.style('display','block');

    frameRate(45);
    document.querySelector('#FAT').addEventListener('click', async() =>{
        updateKeys(FatOscillator.type);
    });
    document.querySelector('#SYNTH').addEventListener('click', async() =>{
        updateKeys(SimpleSynth.type);
    });
    document.querySelector('#KALIMBA').addEventListener('click', async() =>{
        updateKeys(Kalimba.type);
    });
    document.querySelector('#PIANOETTA').addEventListener('click', async() =>{
        updateKeys(Pianoetta.type);
    });
    document.querySelector('#SYNTH1').addEventListener('click', async() =>{
        updateKeys(Synth1.type);
    });
    //create a loop
    var background_tempo = new Tone.Loop(function(time){
        membrane_synth.triggerAttackRelease("F2", "4t", time)
        membrane_synth.triggerAttackRelease("C2", "4t", time)
    }, "4n");
    
    //play the loop between 0-2m on the transport
    background_tempo.start(0).stop('1m');
    Tone.Transport.loopEnd = '1:0:0'
    Tone.Transport.loop = true
    //Start the loop
    Tone.Transport.toggle();
}
//DOM's to switch between instruments
function createSwitcher(){
    let top_div = createDiv();
    top_div.addClass('column is-centered');
    top_div.position(0,can_height/2);
    top_div.parent('sketch')

    let box = createDiv();
    box.addClass("box");
    box.parent(top_div)

    let ancestor_tile = createDiv();
    ancestor_tile.addClass("tile is-vertical is-ancestor");
    ancestor_tile.parent(box)

    let ids= ["FAT","PIANOETTA","SYNTH","KALIMBA","SYNTH1"]
    let colors = ["red","peach","yellow","green","blue"]
    for(let i=0; i < 5; i++){
        let parent_tile = createDiv();
        parent_tile.addClass("tile is parent")
        parent_tile.parent(ancestor_tile)

        let child_tile = createA('','','_blank');
        child_tile.removeAttribute('href')
        child_tile.addClass("tile is-child has-text-centered")
        child_tile.id(ids[i]);
        
        child_tile.parent(parent_tile);

        let span = createSpan();
        span.addClass("icon is-large " + colors[i]);
        span.parent(child_tile);

        let icon = createElement('i');
        icon.addClass("fas fa-3x fa-square")
        icon.parent(span);
    }
}
// Used for drawing and setting up different keys
function updateKeys(type){
    curr_type = type;
    let points = 10;
    let pointAngle = 360/points;
    let radius = can_width/6;
    cir_centerX= can_width/2;
    cir_centerY = can_height/2;

    keys = [];
    let counter = 0 
    //draw the triangle circle
    for (let angle=270;angle<630;angle=angle+pointAngle){
        x = cos(radians(angle)) * radius; //convert angle to radians for x and y coordinates
        y = sin(radians(angle)) * radius;

        let temp = angle + pointAngle;
        switch(type){
            case FatOscillator.type:
                var tri = new FatOscillator(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_red[counter],OCTAVE_LOWER[counter]);
                keys.push(tri);
                canvas_background = red;
                inline_color = blue;
                break;
            case SimpleSynth.type:
                var tri = new SimpleSynth(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_yellow[counter],OCTAVE_LOWER[counter]);
                keys.push(tri);
                canvas_background = yellow;
                inline_color = peach;
                break;
            case Kalimba.type:
                var tri = new Kalimba(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_green[counter],C_MAJ_SCALE[counter]);
                keys.push(tri);
                canvas_background = green;
                inline_color = blue;
                break;
            case Pianoetta.type:
                var tri = new Pianoetta(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_peach[counter],OCTAVE_LOWER[counter]);
                keys.push(tri);
                canvas_background = peach;
                inline_color = red;
                break;
            case Synth1.type:
                var tri = new Synth1(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_blue[counter],C_MAJ_SCALE[counter]);
                keys.push(tri);
                canvas_background = blue;
                inline_color = green;
                break;
        }
        counter++;
    }
}
// improve this run time.
function drawIncomingNotes(r,val){
    if(Object.keys(userloops).length == 0){
        return;
    }
    for(let loop of Object.keys(userloops)){
        if(userloops[loop].isPlaying()){
            let env = userloops[loop].getEnvValue();
            noFill();
            stroke(userloops[loop].color);
            strokeWeight(7);
            //draws an ellipse
            for (let i = 0; i < 3; i++){
                let x2 = (r + env*200)*tan(2*PI/env);
                let y2 = (r + env*200)*tan(2*PI/env);
                ellipse(cir_centerX,cir_centerY, x2, y2);
            }
        }
    }
}
r = 150;
//Draw the shapes continuously
function draw(){
    background(canvas_background);
    r = 150;
    noFill();
    stroke(197,185,166);
    strokeWeight(5);
    envelope = membrane_synth.envelope.value;
    for (var i = 0; i < 3; i++){
        x2 = (r + envelope*200)*tan(2*PI/envelope);
        y2 = (r + envelope*200)*tan(2*PI/envelope);
        ellipse(cir_centerX,cir_centerY, x2, y2);
    }
    //TODO: make this more efficient.
    drawIncomingNotes(r,40);

    stroke(inline_color);
    strokeWeight(2);
    for(let i = 0; i < keys.length; i++){
        keys[i].show();
    }
}

// keeps track of the current key the user is pressing.
var pressed_key = new KeyNote();
function mousePressed(){
    for(let key of keys){
        if(key.inTriangle(mouseX,mouseY)){
            key.clicked();
            
            curr_note = key.note;
            pressed_key = key;
            let payload = {
                event: "key",
                note: pressed_key.note,
                instrument: pressed_key.type,
                toggle: true,
                channel: room_name,
                username: user_name
            }
            socket.send(JSON.stringify(payload));
        }
    }
    return false;
}

//This function is called whenever mouse is dragged.
// might be a performance hinderance?
function mouseDragged(){
    for(let key of keys){
        if(key.inTriangle(mouseX,mouseY)){
            //Only triggers if the key is different
            if(key !== pressed_key){
                pressed_key.released();
                let release_key = {
                    event:"release",
                    channel:room_name,
                    username: user_name
                }
                socket.send(JSON.stringify(release_key));
                pressed_key = key;
                pressed_key.playDragged();
                
                let payload = {
                    event:"key",
                    note: pressed_key.note,
                    instrument: pressed_key.type,
                    toggle: true,
                    channel: room_name,
                    username: user_name
                }
                socket.send(JSON.stringify(payload));

                curr_note = pressed_key.note;
            }
            pressed_key.dragged();
        }
    }
    return false;
}

function mouseReleased(){
    pressed_key.released();
    let release_key = {
        event:"release",
        channel:room_name,
        username: user_name
    }
    socket.send(JSON.stringify(release_key));
    return false;
}
//Code that deals with window resize should be here. 
// CSS styling with bulma will usually handle most of this
function windowResized(){
    // Set up canvas
    can_width = canvasDiv.offsetWidth;
    resizeCanvas(can_width,can_height);
    updateKeys(curr_type);
}