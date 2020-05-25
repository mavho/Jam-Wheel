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
        this.type="KALIMBA";
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
        this.type="KALIMBA";
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
        this.type="KALIMBA";
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
        this.type="KALIMBA";
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