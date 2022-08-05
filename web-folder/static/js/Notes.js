/**
 * Deals with rendering the keynote.
 */
class KeyNote{
    constructor (p5,x1,y1,x2,y2,x3,y3, in_color="#E1008E"){
        /**
         * p5 -> p5 instance
         * 
         * xy's -> describe the area of the keynote
         * in_color -> default color
         */
        this.p5 = p5;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.orig_color = in_color; //Original color of the keynote
        this.curr_color = this.orig_color; //current color of keynote
        this.click = false; // clicked?
    }   

    /**
     * Checks if coordinate is within this keynote.
     * 
     * @param {*} mouX 
     * @param {*} mouY 
     * @returns boolean
     */
    inTriangle(mouX,mouY){
        var A = 1/2 * (-this.y2 * this.x3 + this.y1 * (-this.x2+ this.x3) + this.x1 * (this.y2 - this.y3) + this.x2 * this.y3);
        var sign = A < 0 ? -1 : 1;

        var s = (this.y1 * this.x3 - this.x1 * this.y3 + (this.y3 - this.y1) * mouX + (this.x1 - this.x3) * mouY) * sign;
        var t = (this.x1 * this.y2 - this.y1 * this.x2 + (this.y1 - this.y2) * mouX + (this.x2 - this.x1) * mouY) * sign;
        
        return s > 0 && t > 0 && (s + t) < 2 * A * sign;
    }

    /**
     * Callback dealing with a clicked keynote.
     */
    clicked(){
        //change to color to a darker shade
        let color_shade = this.p5.lerpColor(this.p5.color(this.orig_color), this.p5.color(72,61,139), 0.35);
        this.curr_color = color_shade;
        //set click as true
        this.click = true;
    }

    /**
     * Callback for dealing with a dragged Keynote.
     * Dragged is handled differently than clicked
     */
    dragged(){
        //change to color to a darker shade
        let color_shade = this.p5.lerpColor(this.p5.color(this.orig_color), this.p5.color(72,61,139), 0.35);
        this.curr_color = color_shade;
    }
    /**
     * Callback for a released key
     */
    released(){
        this.click=false;
        this.curr_color = this.orig_color;
    }

    /**
     * Render the key.
     */
    show(){
        this.p5.fill(this.p5.color(this.curr_color));
        this.p5.triangle(this.x1,this.y1,this.x2,this.y2,this.x3,this.y3);
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
    constructor (p5,x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(p5,x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="SYNTH1";
        this.loop = new Tone.Loop(function(time){
            synth1.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");

    }
    static trigger_sound(note){
        synth1.triggerAttackRelease(note,"8n");
    }
    clicked(){
        //this.trigger_sound();
        //this.loop.start(0);
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
    constructor (p5,x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(p5,x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="PIANOETTA";
        this.loop = new Tone.Loop(function(time){
            pianoetta.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");

    }
    static trigger_sound(note){
        pianoetta.triggerAttackRelease(note,"8n");
    }
    clicked(){
        //this.trigger_sound();
        //this.loop.start(0);
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
    constructor (p5,x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(p5,x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="FAT";
        this.loop = new Tone.Loop(function(time){
            sawtooth.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");

    }
    static trigger_sound(note){
        sawtooth.triggerAttackRelease(note,"8n");
    }
    clicked(){
        //this.trigger_sound();
        //this.loop.start(0);
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
    constructor (p5,x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(p5,x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="SYNTH";
        this.loop = new Tone.Loop(function(time){
            simpleSynth.triggerAttackRelease(curr_note, "8n", time)
        }, "8t");
    }
    static trigger_sound(note){
        simpleSynth.triggerAttackRelease(note,"8n");
    }
    clicked(){
        //this.trigger_sound();
        //this.loop.start(0);
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
    constructor (p5,x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(p5,x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.type="KALIMBA";
        this.loop = new Tone.Loop(function(time){
            kalimba.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");
    }
    static trigger_sound(note){
        kalimba.triggerAttackRelease(note,"8n");
    }
    clicked(){
        //this.trigger_sound();
        //this.loop.start(0);
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
