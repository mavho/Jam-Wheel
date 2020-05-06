class FatOscillator extends KeyNote{
    /*
    Laggy?
    */
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.noiseSynth = new Tone.Synth({
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
            },
        }).toMaster();
    }
    trigger_sound(){
        this.noiseSynth.triggerAttack(this.note);
    }
    clicked(){
        this.trigger_sound();
        super.clicked();
    }

    released(){
        this.noiseSynth.triggerRelease();
        //this.noiseSynth.releaseAll();
        super.released();
    }
}
 
class SimpleSynth extends KeyNote{
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        super(x1,y1,x2,y2,x3,y3, in_color);
        this.note = note;
        this.noiseSynth = new Tone.Synth({
            "oscillator":{
                "type": "sine",
                "partialCount": 5, 
            },
            "envelope":{
                "attack":0.01,
                "decay": 1.2,
                "release": 1.2,
                "attackCurve": "exponential"
            }
        }).toMaster();
    }
    trigger_sound(){
        this.noiseSynth.triggerAttack(this.note);
    }
    clicked(){
        this.trigger_sound();
        super.clicked();
    }
    released(){
        this.noiseSynth.triggerRelease();
        super.released();
    }
}