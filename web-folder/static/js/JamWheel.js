
export default class JamWheel {
    playNote = false; // Is a note being played?
    canvas = null; // The canvas this code creates
    ctx = null; // Canvas context
    wsUri = null; // Web socket server URI sans port
    element = null; // Inst from options.element
    websocket = null; // websocket instance
    userId = null; // User id given by server (identifies uri)
    username =null; //username
    room = null; //roomname
    serverState = null; // State from server
    instruments = []; //instruments
    noteStack = []; // Notes currently being played
    pulseNumber = 0; // keep a beat
    pulseTimer = null; // setTimeout
    scrollTimer = null; // setTimeout
    scaleCursor = null; // Controls circle size/growth
    patchIndex = 1; // Initial patch= 0 must be percission
    gain = 1; // volume
    pan = 0; // pan
    patches = []; // Loaded on instantiation

    options = {
        pulseMS: 1000 / 8, // Sending to server, and rendering sound and cursors

    };

    constructor(options) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Establishes websocket connection.
     * Draws canvas and all notes.
     * inits for need beats and functions for initial runs.
     */
    _init() {
        this.connect();
    }


    connectWebSockets(){
        if(!window.WebSocket){
            throw new Error('Unfortunately your browser is not supported');
        }

        this.websocket = new WebSocket(`wss://${document.domain}:${location.port}/ws/${payload['url']}`);

        this.websocket.onopen = this.wsOpen.bind(this);
        this.websocket.onclose= this.wsClose.bind(this);
        this.websocket.onmessage= this.wsReceive.bind(this);
        this.websocket.onerror = this.wsSend.bind(this);
    }

    //Receives
    wsReceive(e){
        const serverState = JSON.parse(e.data);
        this.serverState = serverState.notes;
    }

    //establish ws connection
    wsOpen(){
        console.log("Connection established");

        //hide the HTML
        //show the jam wheel

        /*$.ajax(`https://${document.domain}:${location.port}/templates/_includes/jamwheel.html`).done(function(reply){
            $('#title').removeClass("glow").addClass("muted-glow");
            $('#container').html(reply);
        });
        */

        this.initEvents();
        this.createSwitcher();

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


    initEvents(){
        window.requestAnimationFrame(this.draw.bind(this));

        // Periodically send the cursor position and redraw
        //this.pulseTimer = setInterval(this.pulse.bind(this), this.options.pulseMS);

    }

    //draws initial GUI
    //then tries to init
    run(){
        document,getElementById("landing_page").hide();
        canvasDiv = document.getElementById("sketch");
        // Set up canvas
        can_width = canvasDiv.offsetWidth;
        can_height = windowHeight;
        var canvas = createCanvas(can_width,can_height);
        canvas.parent('sketch')
        createSwitcher();
        updateKeys(curr_type);

        canvas.style('display','block');

        //init game logic.
        this._init();
    }


    /**
     * DRAWING FUNCTIONS
     */

    draw(){
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
        //drawIncomingNotes(r,40);

        stroke(inline_color);
        strokeWeight(2);
        for(let i = 0; i < this.instruments.length; i++){
            this.instruments[i].show();
        }

    }

    //creates DOM for selecting different Instruments
    createSwitcher(){

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


    }


    // Used for drawing and setting up different keys
    updateKeys(type){
        curr_type = type;
        let points = 10;
        let pointAngle = 360/points;
        let radius = can_width/6;
        cir_centerX= can_width/2;
        cir_centerY = can_height/2;

        this.instruments = [];
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
                    this.instruments.push(tri);
                    canvas_background = red;
                    inline_color = blue;
                    break;
                case SimpleSynth.type:
                    var tri = new SimpleSynth(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                        ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                        hex_color_yellow[counter],OCTAVE_LOWER[counter]);
                    this.instruments.push(tri);
                    canvas_background = yellow;
                    inline_color = peach;
                    break;
                case Kalimba.type:
                    var tri = new Kalimba(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                        ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                        hex_color_green[counter],C_MAJ_SCALE[counter]);
                    this.instruments.push(tri);
                    canvas_background = green;
                    inline_color = blue;
                    break;
                case Pianoetta.type:
                    var tri = new Pianoetta(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                        ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                        hex_color_peach[counter],OCTAVE_LOWER[counter]);
                    this.instruments.push(tri);
                    canvas_background = peach;
                    inline_color = red;
                    break;
                case Synth1.type:
                    var tri = new Synth1(cir_centerX,cir_centerY,x+cir_centerX,y+cir_centerY,
                        ((cos(radians(temp)) * radius) + cir_centerX),(sin(radians(temp)) * radius) + cir_centerY,
                        hex_color_blue[counter],C_MAJ_SCALE[counter]);
                    this.instruments.push(tri);
                    canvas_background = blue;
                    inline_color = green;
                    break;
            }
            counter++;
        }
    }


}