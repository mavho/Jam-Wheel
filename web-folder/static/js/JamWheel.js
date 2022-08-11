export default class JamWheel {
    playNote = false; // Is a note being played?
    canvas = null; // The canvas this code creates
    canvas_color = "black";
    ctx = null; // Canvas context
    wsUri = null; // Web socket server URI sans port
    element = null; // Inst from options.element
    websocket = null; // websocket instance
    userId = null; // User id given by server (identifies uri)
    username =null; //username
    room = null; //roomname
    instruments = [];//holds all instrument sounds
    serverState = []; // State from server
    noteStack = []; // Notes currently being played
    pulseNumber = 0; // keep a beat
    pulseTimer = null; // setTimeout
    p5 = null;
    curr_type = "KALIMBA";
    circenterX = null;
    circenterY = null;
    pressed_key = new KeyNote();
    
    hex_color_wheel = ["#E50018","#E1008E","#BA00DD","#4400D9","#002CD5","#009AD2","#00CE98","#00CA2A","#3EC600","#A3C200"]

    hex_color_blue = ["#0016E5","#0229DB","#053AD2","#0749C9","#0956BF","#0B61B6","#0C6AAD","#0E71A3","#0F779A","#107A91"]

    hex_color_red = ["#E50022","#DB041F","#D1091C","#C70E1A","#BD1317","#A91D12","#9F220F","#95220F","#95270D","#823108"]

    hex_color_peach = ["#DD5336","#DD503B","#DE4D41","#DE4A47","#DF474D","#DF4453","#E04159","#E03E5F","#E13B65","#E23671"]

    hex_color_yellow = ["#E7D947","#DBD944","#CFDA42","#C3DB41","#B8DC3F","#ACDD3E","#A0DE3C","#95DF3A","#89E039","#7DE137"]

    hex_color_green = ["#0B5403","#105C04","#166405","#1B6C06","#217407","#277C08","#2C8409","#328C0A","#37940B","#3D9C0C"]
    C_MAJ_SCALE =["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"]

    OCTAVE_LOWER=["C2","D2","E2","F2","G2","A2","B2","C3","D3","E3"]

    blue = "#003680";
    green = "#6CDA70";
    red = "#710A0D";
    peach ="#E08A8C";
    yellow = "#D9B33A";


    inline_color = this.blue;

    // Background base
    membrane_synth = new Tone.MembraneSynth(
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



    options = {
        pulseMS: 1000 / 8, // Sending to server, and rendering sound and cursors

    };

    constructor(p5,options,wsUri,id,name,room) {
        this.p5 = p5;
        this.options = { ...this.options, ...options };
        this.wsUri = wsUri;
        this.userId = id;
        this.username = name;
        this.room = room;

    }

    /**
     * Establishes websocket connection.
     * Draws canvas and all notes.
     * inits for need beats and functions for initial runs.
     */
    _init() {
        this.connectWebSockets();
        this.createSwitcher();

        this.initEvents();
    }


    connectWebSockets(){
        if(!window.WebSocket){
            throw new Error('Unfortunately your browser is not supported');
        }

        this.websocket = new WebSocket(this.wsUri);

        this.websocket.onopen = this.wsOpen.bind(this);
        this.websocket.onclose= this.wsClose.bind(this);
        this.websocket.onmessage= this.wsReceive.bind(this);
        this.websocket.onerror = this.error.bind(this);
    }

    //Receives notes coming from everyone within the room
    wsReceive(e){
        const serverState = JSON.parse(e.data);
        this.serverState = serverState;
    }

    //establish ws connection
    wsOpen(){
        console.log("Connection established");
        //remove glow
        $('#title').removeClass("glow").addClass("muted-glow");

        this.initEvents();
    }

    //clean up ws and page happens here
    wsClose(e){
        if (e.wasClean){
            console.log(`Connection closed cleanly, code=${e.code}, reason = ${e.reason}`);
        }else{
            console.log('Connection died');
        }

    }

    //triggers upon ws error. Triggers close callback
    error(e){
        if (this.websocket) {
            this.websocket.close();
        }
        this.destroy();
        throw e;
    }

    destroy(){
        clearInterval(this.pulseTimer);
    }


    send(){
        let payload= {
            note: this.pressed_key.note,
            instrument: this.pressed_key.type,
            playnote: this.playNote,
            channel: this.room,
            username: this.username
        }

        //console.log(payload);

        this.websocket.send(JSON.stringify(payload));
    }


    mousedown = function(){
        for(let key of this.instruments){
            if(key.inTriangle(this.p5.mouseX,this.p5.mouseY)){
                this.playNote = true;
                this.pressed_key = key;
                this.pressed_key.clicked();
                break;
            }
        }

    }

    mouseDragged = function(){
        for(let key of this.instruments){
            if(key.inTriangle(this.p5.mouseX,this.p5.mouseY)){
                this.playNote = true;

                if(key !== this.pressed_key){
                    this.pressed_key.released();
                    this.pressed_key = key;
                }

                this.pressed_key.clicked();
                break;
            }
        }
    }

    mouseReleased = function(){
        this.playNote = false;
        this.pressed_key.released();
    }

    /**
     * init onclick events
     */
    initEvents(){
        var jw_f = this;


        this.p5.mousePressed = function(){
            jw_f.mousedown();
        }

        this.p5.mouseDragged = function(){
            jw_f.mouseDragged();
        }
        this.p5.mouseReleased = function(){
            jw_f.mouseReleased();
        }


        window.requestAnimationFrame(this.draw.bind(this));

        // Periodically send the cursor position and redraw
        this.pulseTimer = setInterval(this.draw.bind(this), this.options.pulseMS);

    }

    //draws initial GUI
    //then tries to init
    run(){
        this.p5.noLoop();
        //document,getElementById("landing_page").hide();
        const border = document.getElementById("sketch");
        // Set up canvas
        let can_width = border.offsetWidth;
        let can_height = this.p5.windowHeight;
        console.log(can_width,can_height);
        this.canvas = this.p5.createCanvas(can_width,can_height);
        this.canvas.parent('sketch')
        //this.createSwitcher();
        this.updateKeys(this.curr_type);

        this.canvas.style('display','block');

        //init game logic.
        this._init();
    }

    /**
     * Play incoming notes
     */

    playIncomingNotes(){
        if(!this.serverState)return;
        // Add a frame to the notes stack to represent this pulse
        this.noteStack.unshift(this.serverState);

        // Play each sound distributed by the server
        this.serverState
        .forEach((n) => {
            this.p5.noFill();

            switch(n.instrument){
                case FatOscillator.type:
                    FatOscillator.trigger_sound(n.note);
                    this.p5.stroke("#FFFFFF");
                    break;
                case SimpleSynth.type:
                    SimpleSynth.trigger_sound(n.note);
                    this.p5.stroke("#FFFFFF");
                    break;
                case Kalimba.type:
                    Kalimba.trigger_sound(n.note);
                    this.p5.stroke("#FFFFFF");
                    break;
                case Pianoetta.type:
                    Pianoetta.trigger_sound(n.note);
                    this.p5.stroke("#FFFFFF");
                    break;
                case Synth1.type:
                    Synth1.trigger_sound(n.note);
                    this.p5.stroke("#FFFFFF");
                    break;
            }

            var PI = this.p5.PI;
            var r= 150;
            var env = this.membrane_synth.envelope.value;
            this.p5.strokeWeight(7);
            //draws an ellipse
            for (let i = 0; i < 3; i++){
                let x2 = (r + env*200)*this.p5.tan(2*PI/env);
                let y2 = (r + env*200)*this.p5.tan(2*PI/env);
                this.p5.ellipse(this.p5.cir_centerX,this.p5.cir_centerY, x2, y2);
            }

        });

    }


    /**
     * DRAWING FUNCTIONS
     */

    draw(){
        this.send();

        this.p5.background(this.canvas_color);
        var r = 150;
        this.p5.noFill();
        this.p5.stroke(197,185,166);
        this.p5.strokeWeight(5);
        let envelope = this.membrane_synth.envelope.value;
        for (var i = 0; i < 3; i++){
            let x2 = (r + envelope*200)*this.p5.tan(2*this.p5.PI/envelope);
            let y2 = (r + envelope*200)*this.p5.tan(2*this.p5.PI/envelope);
            this.p5.ellipse(this.circenterX,this.circenterY, x2, y2);
        }
        //TODO: make this more efficient.
        this.playIncomingNotes();

        this.p5.stroke(this.inline_color);
        this.p5.strokeWeight(2);
        for(let i = 0; i < this.instruments.length; i++){
            this.instruments[i].show();
        }

    }

    //creates DOM for selecting different Instruments
    createSwitcher(){

        let top_div = this.p5.createDiv();
        top_div.addClass('column is-centered');
        top_div.position(0,this.canvas.height/2);
        top_div.parent('sketch')

        let box = this.p5.createDiv();
        box.addClass("box");
        box.parent(top_div)

        let ancestor_tile = this.p5.createDiv();
        ancestor_tile.addClass("tile is-vertical is-ancestor");
        ancestor_tile.parent(box)

        let ids= ["FAT","PIANOETTA","SYNTH","KALIMBA","SYNTH1"]
        let colors = ["red","peach","yellow","green","blue"]

        for(let i=0; i < 5; i++){
            let parent_tile = this.p5.createDiv();
            parent_tile.addClass("tile is parent")
            parent_tile.parent(ancestor_tile)

            let child_tile = this.p5.createA('','','_blank');
            child_tile.removeAttribute('href')
            child_tile.addClass("tile is-child has-text-centered")
            child_tile.id(ids[i]);
            
            child_tile.parent(parent_tile);

            let span = this.p5.createSpan();
            span.addClass("icon is-large " + colors[i]);
            span.parent(child_tile);

            let icon = this.p5.createElement('i');
            icon.addClass("fas fa-3x fa-square")
            icon.parent(span);
        }

        document.querySelector('#FAT').addEventListener('click', async() =>{
            this.updateKeys(FatOscillator.type);
        });
        document.querySelector('#SYNTH').addEventListener('click', async() =>{
            this.updateKeys(SimpleSynth.type);
        });
        document.querySelector('#KALIMBA').addEventListener('click', async() =>{
            this.updateKeys(Kalimba.type);
        });
        document.querySelector('#PIANOETTA').addEventListener('click', async() =>{
            this.updateKeys(Pianoetta.type);
        });
        document.querySelector('#SYNTH1').addEventListener('click', async() =>{
            this.updateKeys(Synth1.type);
        });


    }


    // Used for drawing and setting up different keys
    updateKeys(type){
        this.curr_type = type;
        let points = 10;
        let pointAngle = 360/points;
        let radius = this.canvas.width/6;
        this.circenterX= this.canvas.width/2;
        this.circenterY = this.canvas.height/2;

        this.instruments = [];
        let counter = 0 
        //draw the triangle circle
        for (let angle=270;angle<630;angle=angle+pointAngle){
            var x = this.p5.cos(this.p5.radians(angle)) * radius; //convert angle to radians for x and y coordinates
            var y = this.p5.sin(this.p5.radians(angle)) * radius;

            let temp = angle + pointAngle;
            switch(type){
                case FatOscillator.type:
                    var tri = new FatOscillator(this.p5,this.circenterX,this.circenterY,x+this.circenterX,y+this.circenterY,
                        ((this.p5.cos(this.p5.radians(temp)) * radius) + this.circenterX),(this.p5.sin(this.p5.radians(temp)) * radius) + this.circenterY,
                        this.hex_color_red[counter],this.OCTAVE_LOWER[counter]);
                    this.instruments.push(tri);
                    this.canvas_color = this.red;
                    this.inline_color = this.blue;
                    break;
                case SimpleSynth.type:
                    var tri = new SimpleSynth(this.p5,this.circenterX,this.circenterY,x+this.circenterX,y+this.circenterY,
                        ((this.p5.cos(this.p5.radians(temp)) * radius) + this.circenterX),(this.p5.sin(this.p5.radians(temp)) * radius) + this.circenterY,
                        this.hex_color_yellow[counter],this.OCTAVE_LOWER[counter]);
                    this.instruments.push(tri);
                    this.canvas_color = this.yellow;
                    this.inline_color = this.peach;
                    break;
                case Kalimba.type:
                    var tri = new Kalimba(this.p5,this.circenterX,this.circenterY,x+this.circenterX,y+this.circenterY,
                        ((this.p5.cos(this.p5.radians(temp)) * radius) + this.circenterX),(this.p5.sin(this.p5.radians(temp)) * radius) + this.circenterY,
                        this.hex_color_green[counter],this.C_MAJ_SCALE[counter]);
                    this.instruments.push(tri);
                    this.canvas_color = this.green;
                    this.inline_color = this.blue;
                    break;
                case Pianoetta.type:
                    var tri = new Pianoetta(this.p5,this.circenterX,this.circenterY,x+this.circenterX,y+this.circenterY,
                        ((this.p5.cos(this.p5.radians(temp)) * radius) + this.circenterX),(this.p5.sin(this.p5.radians(temp)) * radius) + this.circenterY,
                        this.hex_color_peach[counter],this.OCTAVE_LOWER[counter]);
                    this.instruments.push(tri);
                    this.canvas_color = this.peach;
                    this.inline_color = this.red;
                    break;
                case Synth1.type:
                    var tri = new Synth1(this.p5,this.circenterX,this.circenterY,x+this.circenterX,y+this.circenterY,
                        ((this.p5.cos(this.p5.radians(temp)) * radius) + this.circenterX),(this.p5.sin(this.p5.radians(temp)) * radius) + this.circenterY,
                        this.hex_color_blue[counter],this.C_MAJ_SCALE[counter]);
                    this.instruments.push(tri);
                    this.canvas_color = this.blue;
                    this.inline_color = this.green;
                    break;
            }
            counter++;
        }
    }


}