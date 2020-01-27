var canvas;
var circles = []

function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0,0);
    canvas.style('z-index', '-1')
}

function draw(){
    background(0);
    fill(frameCount%255, frameCount/2%255, frameCount%255);
    circle(frameCount%windowWidth,frameCount%windowHeight, 10);
}
