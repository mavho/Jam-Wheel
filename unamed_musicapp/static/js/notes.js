/**
 * These are the instruments. Some of the classes hook up to the transport
 * because I utilize loops. Different instruments are handled differently.
 */
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
        this.noiseSynth.triggerAttack(this.note);
    }
    clicked(){
        this.loop.start(0);
        //this.trigger_sound();
        super.clicked();
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
            simpleSynth.triggerAttackRelease(curr_note, "8n.", time)
        }, "8t");
    }
    trigger_sound(){
        this.noiseSynth.triggerAttack(this.note);
    }
    clicked(){
        this.loop.start(0);
        //this.trigger_sound();
        super.clicked();
    }
    released(){
        this.loop.stop();
        //this.noiseSynth.triggerRelease();
        super.released();
    }
}