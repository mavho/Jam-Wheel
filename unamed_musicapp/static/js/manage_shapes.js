hex_color_wheel = ["#E50018","#E1008E","#BA00DD","#4400D9","#002CD5","#009AD2","#00CE98","#00CA2A","#3EC600","#A3C200"]

hex_color_blue = ["#0016E5","#0229DB","#053AD2","#0749C9","#0956BF","#0B61B6","#0C6AAD","#0E71A3","#0F779A","#107A91"]

C_MAJ_SCALE =["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"]

//save the state of each key.
let keys = [];

var synth = new Tone.MembraneSynth().toMaster()
function setup(){
    // Set up canvas
    var can_width = 600;
    var can_height=600;
    var canvas = createCanvas(can_width,can_height);

    canvas.parent('sketch')
    canvas.style('display','block')
    background(255,69,0);

    //Vars for the circle
    points = 10;
    pointAngle = 360/points;

    radius = can_width/2.5;

    cir_centerX= can_width/2;
    cir_centerY = can_height/2;

    let counter = 0 
    //draw the triangle circle
    for (let angle=270;angle<630;angle=angle+pointAngle){
        x = cos(radians(angle)) * radius; //convert angle to radians for x and y coordinates
        y = sin(radians(angle)) * radius;

        let temp = angle + pointAngle;
        var tri = new KeyNote(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY, hex_color_blue[counter],C_MAJ_SCALE[counter]);
        counter++;
        keys.push(tri);
    }
    document.querySelector('button').addEventListener('click', async () => {
        await Tone.start()
        console.log('audio is ready')
        Tone.Transport.toggle();
    });
    //create a loop
    var loop = new Tone.Loop(function(time){
        synth.triggerAttackRelease("C1", "8t", time)
    }, "4n")
    
    //play the loop between 0-2m on the transport
    loop.start(0).stop('1m')
    Tone.Transport.loopEnd = '1m'
    Tone.Transport.loop = true
    //Start the loop
    Tone.Transport.toggle();
}

//Draw the shapes continuously
function draw(){
    background("#003680");
    var r = 150;
    noFill();
    stroke(197,185,166);
    strokeWeight(5);
    //let b = pressed_key.noiseSynth.voice0.envelope.value;
    let b = synth.envelope.value;
    for (var i = 0; i < 3; i++){
        x2 = (r + b*200)*tan(2*PI/b);
        y2 = (r + b*200)*tan(2*PI/b);
        ellipse(height/2,width/2, x2, y2);
    }

    stroke(94, 131, 181);
    strokeWeight(2);
    for(let i = 0; i < keys.length; i++){
        keys[i].show();
    }
}

var pressed_key = new KeyNote();
function mousePressed(){
    for(let key of keys){
        if(key.inTriangle(mouseX,mouseY)){
            key.clicked();
            pressed_key = key;
        }
    }
    return false;
}

function mouseDragged(event){
    for(let key of keys){
        if(key.inTriangle(mouseX,mouseY)){
            if(key !== pressed_key){
                pressed_key.released();
            }
            //Key has moved from the original
            pressed_key = key;
            pressed_key.dragged(mouseX);
        }
    }
    return false;
}

function mouseReleased(){
    pressed_key.released();
    return false;
}
//Code that deals with window resize should be here. 
// CSS styling with bulma will usually handle most of this
function windowResized(){
}