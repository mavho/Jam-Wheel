hex_colors = ["#E50018","#E1008E","#BA00DD","#4400D9","#002CD5","#009AD2","#00CE98","#00CA2A","#3EC600","#A3C200"]

//save the state of each key.
let keys = [];

function setup(){
    // Set up canvas
    var canvas = createCanvas(500,500);
    canvas.parent('sketch')
    canvas.style('display','block')

    //Vars for the circle
    points = 10;
    pointAngle = 360/points;
    radius = width/2;
    x = height/2;
    y = width/2;

    counter = 0 
    //draw the triangle circle
    for (let angle=270;angle<630;angle=angle+pointAngle){
        x = cos(radians(angle)) * radius; //convert angle to radians for x and y coordinates
        y = sin(radians(angle)) * radius;
        let temp = angle + pointAngle;
        var tri = new KeyNote(radius,radius,x+radius,y+radius,((cos(radians(temp)) * radius) + radius),(sin(radians(temp)) * radius) + radius, hex_colors[counter++]);
        keys.push(tri);
    }
    noStroke();

}


// this function is called repeatedly
function draw(){
    stroke('black')
    for(let i = 0; i < keys.length; i++){
        keys[i].show();
    }
}

var pressed_key = new KeyNote();
function mousePressed(){
    for(let key of keys){
        if(key.clicked(mouseX,mouseY)){
            pressed_key = key;
        }
    }
}
function mouseReleased(){
    pressed_key.released();
}

//Code that deals with window resize should be here. 
// CSS styling with bulma will usually handle most of this
function windowResized(){
}