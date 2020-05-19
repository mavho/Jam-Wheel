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

var tomSynth= new Tone.Synth({
    "oscillator":{
        "type":"sine",
        "partialCount":0,
        "spread":80,
        "count":3
    },
    "envelope": {
        "attack": 0.01,
        "attackCurve": "sine",
        "decay": 0.22,
        "decayCurve":"exponential",
        "release": 1.4,
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

var basicoscillator = new Tone.Synth({
    "oscillator":{
        "partialCount":2,
        "spread":20,
        "count":3
    },
    "envelope":{
        "attack":0.01,
        "decay": 1.60,
        "sustain": 0.00,
        "release": 1.2,
        "releaseCurve":"exponential",
        "attackCurve": "linear"
    }
}).toMaster();

class Synth1 extends KeyNote{
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.type = "Synth1";
        this.note = note;
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
    dragged(){
        super.dragged();
    }

    released(){
        this.loop.stop();
        //this.noiseSynth.triggerRelease();
        super.released();
    }
}
class BasicOscillator extends KeyNote{
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.type = "b_oscillator";
        this.note = note;
        this.loop = new Tone.Loop(function(time){
            basicoscillator.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");

    }
    trigger_sound(){
        basicoscillator.triggerAttackRelease(this.note,"8n");
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
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.type = "fatsawtooth";
        this.note = note;
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
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.type = "simplesynth";
        this.note = note;
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

class TomSynth extends KeyNote{
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.type = "tomSynth";
        this.note = note;
        this.loop = new Tone.Loop(function(time){
            tomSynth.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");
    }
    trigger_sound(){
        tomSynth.triggerAttackRelease(this.note,"8n");
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