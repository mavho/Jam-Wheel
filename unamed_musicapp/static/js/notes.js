class FatOscillator extends KeyNote{

    constructor(note){
        super(note);
        this.noiseSynth = new Tone.PolySynth(3, Tone.Synth, {
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
    }

    released(){
        this.noiseSynth.triggerRelease();
        this.noiseSynth.releaseAll();
        super.released();
    }


}