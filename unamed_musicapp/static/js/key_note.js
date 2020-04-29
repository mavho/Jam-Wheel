class KeyNote{
    /*Class to hold the keyNotes in the circle
    inTriangle checks if a given point is within this triangle
    clicked should be called onMouseCLicked()
    same for released.

    show is continusously called
    */


    constructor (x1,y1,x2,y2,x3,y3, color){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.color = color;
        this.temp_color = color;
        this.brightness = 0;
        this.noiseSynth = new Tone.NoiseSynth().toMaster();
    }   

    inTriangle(mouX,mouY){
        var A = 1/2 * (-this.y2 * this.x3 + this.y1 * (-this.x2+ this.x3) + this.x1 * (this.y2 - this.y3) + this.x2 * this.y3);
        var sign = A < 0 ? -1 : 1;

        var s = (this.y1 * this.x3 - this.x1 * this.y3 + (this.y3 - this.y1) * mouX + (this.x1 - this.x3) * mouY) * sign;
        var t = (this.x1 * this.y2 - this.y1 * this.x2 + (this.y1 - this.y2) * mouX + (this.x2 - this.x1) * mouY) * sign;
        
        return s > 0 && t > 0 && (s + t) < 2 * A * sign;
    }

    clicked(mouX,mouY){
        if(this.inTriangle(mouX,mouY)){
            let to = color(72,61,139)
            this.temp_color = this.color;
            this.color = lerpColor(color(this.color), to, 0.35);
            this.noiseSynth.triggerAttackRelease("8n");
            return true;
        }else{
            return false;
        }
    }
    released(mouX,mouY){
        //if(this.inTriangle(mouX,mouY)){
        this.color = this.temp_color;
        //}
    }
    show(){
        fill(color(this.color));
        triangle(this.x1,this.y1,this.x2,this.y2,this.x3,this.y3)
    }
}