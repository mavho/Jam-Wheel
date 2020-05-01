class KeyNote{
    /*Class to hold the keyNotes in the circle
    inTriangle checks if a given point is within this triangle
    clicked should be called onMouseCLicked()
    same for released.

    show is continusously called
    */
    constructor (x1,y1,x2,y2,x3,y3, in_color="#E1008E",note){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.orig_color = in_color;
        this.curr_color = this.orig_color;
        this.note = note;
        this.noiseSynth = new Tone.DuoSynth().toMaster();
        this.vibratoAmount = 12;
    }   

    trigger_sound(){
        this.noiseSynth.triggerAttack(this.note);
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
        this.trigger_sound();
    }

    dragged(vibrato){
        this.vibratoAmount = vibrato*10;
        let color_shade = lerpColor(color(this.orig_color), color(72,61,139), 0.35);
        this.curr_color = color_shade;
        this.trigger_sound();
    }
    released(){
        this.curr_color = this.orig_color;
        this.noiseSynth.triggerRelease();
    }

    show(){
        fill(color(this.curr_color));
        triangle(this.x1,this.y1,this.x2,this.y2,this.x3,this.y3)
    }
}