    var noiseSynth = new Tone.NoiseSynth().toMaster();
    document.getElementById('button').addEventListener('click', () => {
        console.log("fuck")


        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        noiseSynth.triggerAttackRelease("8n");
    });