/**
 * This is the main file that handles the canvas UI as well as
 * the P5 logic interacting with Tone.js
 */
hex_color_wheel = ["#E50018","#E1008E","#BA00DD","#4400D9","#002CD5","#009AD2","#00CE98","#00CA2A","#3EC600","#A3C200"]

hex_color_blue = ["#0016E5","#0229DB","#053AD2","#0749C9","#0956BF","#0B61B6","#0C6AAD","#0E71A3","#0F779A","#107A91"]

C_MAJ_SCALE =["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"]

OCTAVE_LOWER=["C2","D2","E2","F2","G2","A2","B2","C3","D3","E3"]


//save the state of each key.
/*These vars are very important
These vars refer to this USER's sounds
 */
var keys = [];
var curr_type = "SYNTH";
var curr_note = "";

//represents the users in this server
var users = {};

// The idea is to spawn a loop for each of the users.
// We track whether or not the loop has started or ended.
socket.on('press key', function(msg){
    switch(msg['type']){
        case FatOscillator.type:
            users[msg['user']] = new Tone.Loop(function(time){
                sawtooth.triggerAttackRelease(msg['note'], "8n.", time);
            }, "8t");
            break;
        case SimpleSynth.type:
            users[msg['user']] = new Tone.Loop(function(time){
                simpleSynth.triggerAttackRelease(msg['note'], "8n.", time);
            }, "8t");
            break;
        case TomSynth.type:
            users[msg['user']] = new Tone.Loop(function(time){
                tomSynth.triggerAttackRelease(msg['note'], "8n.", time);
            }, "8t");
            break;
        case BasicOscillator.type:
            users[msg['user']] = new Tone.Loop(function(time){
                basicoscillator.triggerAttackRelease(msg['note'], "8n.", time);
            }, "8t");
            break;
        case Synth1.type:
            users[msg['user']] = new Tone.Loop(function(time){
                Synth1.triggerAttackRelease(msg['note'], "8n.", time);
            }, "8t");
            break;
    }
    if(users[msg['user']] !== undefined){
        users[msg['user']].start(0);
    }
});

socket.on('release key', function(msg){
    if(users[msg['user']] !== undefined){
        users[msg['user']].stop();
    }
});

// Background base
var membrane_synth = new Tone.MembraneSynth().toMaster()

function setup(){

    canvasDiv = document.getElementById("sketch");
    // Set up canvas
    can_width = canvasDiv.offsetWidth;
    can_height = windowHeight;
    var canvas = createCanvas(can_width,can_height);
    canvas.parent('sketch')

    canvas.style('display','block')
    background(255,69,0);

    //Vars for the circle
    updateKeys(curr_type);

    document.querySelector('#toggle').addEventListener('click', async () => {
        await Tone.start()
        console.log('audio is ready')
        Tone.Transport.toggle();
    });
    document.querySelector('#FAT').addEventListener('click', async() =>{
        updateKeys('FAT');
    });
    document.querySelector('#SYNTH').addEventListener('click', async() =>{
        updateKeys('SYNTH');
    });
    document.querySelector('#TOM').addEventListener('click', async() =>{
        updateKeys('TOM');
    });
    document.querySelector('#OSCILLATOR').addEventListener('click', async() =>{
        updateKeys('OSCILLATOR');
    });
    document.querySelector('#SYNTH1').addEventListener('click', async() =>{
        updateKeys('SYNTH1');
    });
    //create a loop
    var background_tempo = new Tone.Loop(function(time){
        membrane_synth.triggerAttackRelease("C1", "8t", time)
    }, "4n");
    
    //play the loop between 0-2m on the transport
    background_tempo.start(0).stop('1m')
    Tone.Transport.loopEnd = '1m'
    Tone.Transport.loop = true
    //Start the loop
    //Tone.Transport.toggle();
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
            case 'FAT':
                var tri = new FatOscillator(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_blue[counter],OCTAVE_LOWER[counter]);
                keys.push(tri);
                break;
            case 'SYNTH':
                var tri = new SimpleSynth(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_blue[counter],OCTAVE_LOWER[counter]);
                keys.push(tri);
                break;
            case 'TOM':
                var tri = new TomSynth(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_blue[counter],C_MAJ_SCALE[counter]);
                keys.push(tri);
                break;
            case 'OSCILLATOR':
                var tri = new BasicOscillator(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_blue[counter],C_MAJ_SCALE[counter]);
                keys.push(tri);
                break;
            case 'SYNTH1':
                var tri = new Synth1(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                    ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                    hex_color_blue[counter],C_MAJ_SCALE[counter]);
                keys.push(tri);
                break;
        }
        counter++;
    }
}

//Draw the shapes continuously
function draw(){
    background("#003680");
    let r = 150;
    noFill();
    stroke(197,185,166);
    strokeWeight(5);
    let envelope = membrane_synth.envelope.value;
    for (var i = 0; i < 3; i++){
        x2 = (r + envelope*200)*tan(2*PI/envelope);
        y2 = (r + envelope*200)*tan(2*PI/envelope);
        ellipse(cir_centerX,cir_centerY, x2, y2);
    }

    
    stroke(94, 131, 181);
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
            socket.emit('press key', {'note': pressed_key.note,'type': pressed_key.type,'toggle':true,'channel':room_name, 'user_name':user_name});
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
                socket.emit('release key', {'channel':room_name, 'user_name':user_name});
                pressed_key = key;
                pressed_key.clicked();
                socket.emit('press key', {'note': pressed_key.note,'type': pressed_key.type,'toggle':true,'channel':room_name, 'user_name':user_name});
                curr_note = pressed_key.note;
            }
            pressed_key.dragged(mouseX);
        }
    }
    return false;
}

function mouseReleased(){
    pressed_key.released();
    socket.emit('release key',{'channel':room_name, 'user_name':user_name});
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