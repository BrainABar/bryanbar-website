
let canvas;
let amount = 50;
var screenobjs = []; // screen objects

function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0,0);
    canvas.style('z-index','-1');
    var edge = 30; // last position of a planet
    for(let i=0;i<4;i++){
        edge = edge + random(30,60);
        let planetColor = color(255);
        let planetObj = new Dot(random(2,30), edge, abs((i+1)-4)/200, planetColor);
        screenobjs.push(planetObj);
    }
}

function draw(){
    background(0);
    fill(255);
    translate(width/2, height/2)
    ellipse(0,0,30,30);
    for(let i=0;i<screenobjs.length;i++){
        screenobjs[i].show();
        screenobjs[i].orbit();
    }

}
