class KeyNote{
    /*Class to hold the keyNotes in the circle
    inTriangle checks if a given point is within this triangle
    clicked should be called onMouseCLicked()
    same for released.
    show is continusously called
    */
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E"){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.orig_color = in_color;
        this.curr_color = this.orig_color;
        this.click = false;
    }   

    inTriangle(mouX,mouY){
        var A = 1/2 * (-this.y2 * this.x3 + this.y1 * (-this.x2+ this.x3) + this.x1 * (this.y2 - this.y3) + this.x2 * this.y3);
        var sign = A < 0 ? -1 : 1;

        var s = (this.y1 * this.x3 - this.x1 * this.y3 + (this.y3 - this.y1) * mouX + (this.x1 - this.x3) * mouY) * sign;
        var t = (this.x1 * this.y2 - this.y1 * this.x2 + (this.y1 - this.y2) * mouX + (this.x2 - this.x1) * mouY) * sign;
        
        return s > 0 && t > 0 && (s + t) < 2 * A * sign;
    }

    clicked(){
        let color_shade = lerpColor(color(this.orig_color), color(72,61,139), 0.35);
        this.curr_color = color_shade;
        this.click =true;
    }

    dragged(vibrato){
        this.vibratoAmount = vibrato*10;
        let color_shade = lerpColor(color(this.orig_color), color(72,61,139), 0.35);
        this.curr_color = color_shade;
    }
    released(){
        this.click=false;
        this.curr_color = this.orig_color;
    }

    show(){
        fill(color(this.curr_color));
        triangle(this.x1,this.y1,this.x2,this.y2,this.x3,this.y3)
    }
}
/**
 * These are the instruments. Some of the classes hook up to the transport
 * because I utilize loops. Different instruments are handled differently.
 */
var autoWah = new Tone.AutoWah(50, 6, -30).toMaster();

var simpleSynth = new Tone.Synth({
    "oscillator": {
        "type": "sine",
        "partialCount": 5,
    },
    "envelope": {
        "attack": 0.01,
        "decay": 1.2,
        "release": 1.2,
        "attackCurve": "exponential"
    }
}).toMaster();

var synth1 = new Tone.Synth({
    "oscillator":{
        "type":"fatcustom",
        "spread":40,
        "count":3,
        "partials": [0.2,1,0,0.5,0.1]
    },
    "envelope": {
        "attack": 0.01,
        "attackCurve": "linear",
        "decay": 1.6,
        "decayCurve":"exponential",
        "release": 1.6,
        "releaseCurve":"exponential"
    }
}).toMaster();

var sawtooth = new Tone.Synth({
    "oscillator":{
        "type": "fatsawtooth",
        "count": 3,
        "spread": 30
    },
    "envelope":{
        "attack":0.01,
        "decay": 0.1,
        "sustain": 0.5,
        "release": 0.4,
        "attackCurve": "exponential"
    }
}).toMaster();

//Wtf is a pianoetta lol
var pianoetta = new Tone.Synth({
    "oscillator": {
        "type": "square"
    },
    "filter": {
        "Q": 2,
        "type": "lowpass",
        "rolloff": -24
    },
    "envelope": {
        "attack": 0.005,
        "decay": 3,
        "sustain": 0,
        "release": 0.45
    },
    "filterEnvelope": {
        "attack": 0.001,
        "decay": 0.64,
        "sustain": 0.9,
        "release": 3,
        "baseFrequency": 700,
        "octaves": 2.3
    }
}).toMaster();


var kalimba = new Tone.Synth({
    "harmonicity":8,
    "modulationIndex": 2,
    "oscillator" : {
        "type": "sine"
    },
    "envelope": {
        "attack": 0.01,
        "decay": 2,
        "sustain": 0.1,
        "release": 2
    },
    "modulation" : {
        "type" : "square"
    },
    "modulationEnvelope" : {
        "attack": 0.002,
        "decay": 0.2,
        "sustain": 0,
        "release": 0.2
    }
}).toMaster();

var effect1;
// create effects
var reverb = new Tone.Freeverb({
    "roomSize": 0.3,
    "dampening": 800,
       "wet": 0.2
});
// make connections
kalimba.connect(reverb);

class Synth1 extends KeyNote{
    static type = "SYNTH1";
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="SYNTH1";
        this.loop = new Tone.Loop(function(time){
            synth1.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");

    }
    trigger_sound(){
        synth1.triggerAttackRelease(this.note,"8n");
    }
    clicked(){
        this.trigger_sound();
        this.loop.start(0);
        super.clicked();
    }
    playDragged(){
        this.loop.start(0);
    }
    dragged(){
        super.dragged();
    }

    released(){
        this.loop.stop();
        //this.noiseSynth.triggerRelease();
        super.released();
    }
}
class Pianoetta extends KeyNote{
    static type = "PIANOETTA";
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="PIANOETTA";
        this.loop = new Tone.Loop(function(time){
            pianoetta.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");

    }
    trigger_sound(){
        pianoetta.triggerAttackRelease(this.note,"8n");
    }
    clicked(){
        this.trigger_sound();
        this.loop.start(0);
        super.clicked();
    }
    playDragged(){
        this.loop.start(0);
    }

    released(){
        this.loop.stop();
        //this.noiseSynth.triggerRelease();
        super.released();
    }
}

class FatOscillator extends KeyNote{
    static type = "FAT";
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="FAT";
        this.loop = new Tone.Loop(function(time){
            sawtooth.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");

    }
    trigger_sound(){
        sawtooth.triggerAttackRelease(this.note,"8n");
    }
    clicked(){
        this.trigger_sound();
        this.loop.start(0);
        super.clicked();
    }
    dragged(){
        super.dragged();
    }
    playDragged(){
        this.loop.start(0);
    }

    released(){
        this.loop.stop();
        //this.noiseSynth.triggerRelease();
        super.released();
    }
}
 
class SimpleSynth extends KeyNote{
    static type = "SYNTH";
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="SYNTH";
        this.loop = new Tone.Loop(function(time){
            simpleSynth.triggerAttackRelease(curr_note, "8n", time)
        }, "8t");
    }
    trigger_sound(){
        simpleSynth.triggerAttackRelease(this.note,"8n");
    }
    clicked(){
        this.trigger_sound();
        this.loop.start(0);
        super.clicked();
    }
    dragged(){
        super.dragged();
    }
    playDragged(){
        this.loop.start(0);
    }
    released(){
        this.loop.stop();
        //this.noiseSynth.triggerRelease();
        super.released();
    }
}

class Kalimba extends KeyNote{
    static type = "KALIMBA";
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="KALIMBA";
        this.loop = new Tone.Loop(function(time){
            kalimba.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");
    }
    trigger_sound(){
        kalimba.triggerAttackRelease(this.note,"8n");
    }
    clicked(){
        this.trigger_sound();
        this.loop.start(0);
        super.clicked();
    }
    dragged(){
        super.dragged();
    }
    playDragged(){
        this.loop.start(0);
    }
    released(){
        this.loop.stop();
        //this.noiseSynth.triggerRelease();
        super.released();
    }

}

class UserLoop {
    constructor(type,note) {
        //this value is used in drawIncomingNotes
        //todo set this up
        this.env_val= 0.00;
        this.color = blue;
        this.loop = this._determineLoopType(type);
        this.type = type;
        this.note = note;
        this.instrument = membrane_synth;
    }
    _determineLoopType(type) {
        /**
         * We use bind because we want to use the loop again in the future.
         * Not too much overhead...
         */
        switch (type) {
            case FatOscillator.type:
                this.color=blue;
                this.instrument = sawtooth;
                return new Tone.Loop(function (time) {
                    sawtooth.triggerAttackRelease(this.note,"8n.", time);
                }.bind(this), "8t");
            case SimpleSynth.type:
                this.color=peach;
                this.instrument = simpleSynth;
                return new Tone.Loop(function (time) {
                    simpleSynth.triggerAttackRelease(this.note, "8n.", time);
                }.bind(this), "8t");
            case Kalimba.type:
                this.color=blue;
                this.instrument = kalimba;
                return new Tone.Loop(function (time) {
                    kalimba.triggerAttackRelease(this.note, "8n.", time);
                }.bind(this), "8t");
            case Pianoetta.type:
                this.color=red;
                this.instrument = pianoetta;
                return new Tone.Loop(function (time) {
                    pianoetta.triggerAttackRelease(this.note, "8n.", time);
                }.bind(this), "8t");
            case Synth1.type:
                this.color=green;
                this.instrument = synth1;
                return new Tone.Loop(function (time) {
                    synth1.triggerAttackRelease(this.note, "8n.", time);
                }.bind(this), "8t");
        }
    } 

    isPlaying(){
        return this.loop.state == "started";
    }
    updateNote(note){
        this.note = note;
    }
    getEnvValue(){
        return this.instrument.envelope.value;
    }
    hasStoped(){
        return this.loop.state == "stopped";
    }
    startLoop(){
        this.loop.start(0);
    }
    endLoop(){
        this.loop.stop();
    }
}