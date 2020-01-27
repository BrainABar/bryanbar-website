// node
function Node(x, y, weight){
  this.x = x;
  this.y = y;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.weight = weight; // weight/cost of node
  this.parentNode = null;
  this.relatives = [];
  this.blocked = false;
  this.xyStr = x + ',' + y; // reference name 'x,y'

  this.drawRect = function (fillCol, strokeCol) {
      tempCol = strokeCol || fillCol; // if strokeCol is left unused, defaults to fill color
      stroke(tempCol);
      fill(fillCol);
      rect(this.x* boxwidth, this.y * boxheight, boxwidth, boxheight);
  };

  // returns the color of the object based on weight/cost
  this.nodeWeightColor = function () {
      if(this.blocked){
          return color(183,182,179); //grey color
      }
      else if (this.weight === 0) { // fast road color
          return color(0); // color black
      }
      else if (this.weight === 1) { // regular road
          return color(195,178, 111); // yellow/brown color
      }
      else if (this.weight === 2){ // dirt road
          return color(151,108,23) // brown color
      }
      else {
          return color(230);
      }
  };

  this.generateRelatives = function(grid, start){
      var x = this.x;
      var y = this.y;

      // grid goes from top left to bottom right
      if(x < gridsize-1) { // right
          this.relatives.push(grid[x + 1][y]);
      }
      if(x > gridsize -1  && y > 0){ //bottom-right
          this.relatives.push(grid[x + 1][y + 1]);
      }
      if(y < gridsize-1) { // down
          this.relatives.push(grid[x][y + 1]);
      }
      if(x > 0 && y < gridsize -1){ // bottom-left
          this.relatives.push(grid[x - 1][y + 1]);
      }
      if(x > 0){ // left
          this.relatives.push(grid[x - 1][y]);
      }
      if(x > 0 && y > 0){ // top-left
          this.relatives.push(grid[x - 1][y - 1]);
      }
      if(y > 0){ // up
          this.relatives.push(grid[x][y - 1]);
      }
      if(x < gridsize-1 && y < gridsize-1){ // top-right
          this.relatives.push(grid[x + 1][y + 1]);
      }
  };
}
// functions to modify selection
function changeToStart(){
    currentSelection = "start";
}

function changeToEnd(){
    currentSelection = "end";
}

function changeToObstacle(){
    currentSelection = "obstacle";
}

function changeToLow(){
    currentSelection = "low";
}
function changeToMid(){
    currentSelection = "mid";
}
function changeToHigh(){
    currentSelection = "high";
}

function changeGridSize(){
    let userInput = prompt("Enter number of nodes to create in the canvas:\n Ex. '10' entered\n" +
        "will create 100(10*10) nodes");

    if (userInput){
        grid = null; // point old grid to no null;
        grid = [];
        gridsize = userInput;

        // recreate nodes
        for(var i=0;i<gridsize;i++){
            grid.push([]);
        }
        for(var x=0;x<gridsize;x++){
            for(var y=0;y<gridsize;y++){
                grid[x].push(new Node(x, y, 0));
            }
        }
        windowResized();
    }
}

// reset every node and variables besides board dimensions
function resetBoard(){
    blockedDict = {};
    opensetDict = {};
    opensetSize = 0;
    closedsetDict = {};
    openset = [];
    path = [];
    goal = null;
    start = null;
    end = null;
    currentSelection = null;
    generation = null;

    for(var x=0;x<gridsize;x++){
        for(var y=0;y<gridsize;y++){
            var tempNode = grid[x][y];
            tempNode.weight = 0; // reset weight
            tempNode.blocked = false; // reset blocked status
            tempNode.parentNode = null; // remove parents
            tempNode.relatives = []; // remove relatives
            tempNode.drawRect(tempNode.nodeWeightColor()); // draws color of blocked node, otherwise based on weight
        }
    }
    loop();
}

function generateDirt() {
    for(let x=0;x<gridsize;x++){
        for(let y=0;y<gridsize;y++){
            let tempNode = grid[x][y];
            tempNode.weight = 2;
            tempNode.drawRect(tempNode.nodeWeightColor());
        }
    }
    generation = true;
}

function generateBlocked(){
    for(var x=0;x<gridsize;x++){
        for(var y=0;y<gridsize;y++){
            var tempNode = grid[x][y];
            if(random(1) < 0.05) {
                tempNode.blocked = true;
                tempNode.drawRect(tempNode.nodeWeightColor());
            }
        }
    }
    generation = true;
}

// User button selection held as a string with command
var currentSelection = null;
var generation = null;

// declarations
var gridsize = 30; // default 10 by 10 nodes (100 nodes)
var cwidth = null; // modified canvas width
var cheight = null; // modified canvas height
var boxwidth = null; // width of the node representation
var boxheight = null; // height of the node representation
var blockedDict = {}; // record of blocked node locations dict['x' + ',' + 'y'] = [x: int(x), y: int(y)];
var opensetDict = {}; // record of openset nodes locations
var opensetSize = 0; // record of amount of items in opensetDict
var closedsetDict = {}; // record of closedset nodes locations
var openset = [];
var grid = []; // holding all node objects within canvas
var goal = null; // whether end node was reached
var path = []; // path taken from start to end, array of nodes
var start = null; // user selected starting node
var end = null; // user selected ending node
var bounceColors = 0; // will bounce back and forth between frames
var colorDir = 1;
var canvasT;

// removes wanted node from the list
function removeNode(removeNode, fromArray) {
    for(var i=fromArray.length;i>=0;i--){
        if(removeNode == fromArray[i]){
            fromArray.splice(i, 1);
        }
    }
}

// Disables scrolling on the canvas but still passes input so drawing can occur
function touchMoved(){

    if(0 <= mouseX && mouseX < cwidth && 0 <= mouseY && mouseY < cheight) {
        mouseDragged();
        return false;
    }
}

function mouseDragged() {
    mousePressed();
}

function mousePressed(){

    var selectedx = 0; // user selected x position
    var selectedy = 0; // user selected y position


    if(0 <= mouseX && mouseX < cwidth && 0 <= mouseY && mouseY < cheight) {
        selectedx = floor(mouseX / boxwidth);
        selectedy = floor(mouseY / boxheight);

        var loneNode = grid[selectedx][selectedy];

        // selection of start/end/obstacle tiles
        console.log(currentSelection);
        switch (currentSelection) {
            case "start":
                if (start !== null) { //remove previous start node from set
                    start.drawRect(start.nodeWeightColor());
                }
                start = loneNode;
                start.blocked = false;
                start.drawRect(color(37, 229, 82), start.nodeWeightColor()); // green color rect
                noLoop();
                break;

            case "end":
                if (end !== null) {
                    end.drawRect(end.nodeWeightColor());
                }
                end = loneNode;
                end.blocked = false;
                end.drawRect(color(255, 18, 55), end.nodeWeightColor()); // red color rect
                break;

            case "obstacle":
                loneNode.blocked = true;
                loneNode.drawRect(loneNode.nodeWeightColor());
                blockedDict[loneNode.xyStr] = {x: loneNode.x, y: loneNode.y};
                break;

            case "low":
                loneNode.weight = 0;
                loneNode.blocked = false;
                loneNode.drawRect(loneNode.nodeWeightColor());
                console.log(currentSelection);
                break;

            case "mid":
                loneNode.weight = 1;
                loneNode.blocked = false;
                loneNode.drawRect(loneNode.nodeWeightColor());
                break;

            case "high":
                loneNode.weight = 2;
                loneNode.blocked = false;
                loneNode.drawRect(loneNode.nodeWeightColor());
                break;
        }
    }
}

function setup() {

    // calculate canvas dimensions
    let canvasID = document.getElementById('canvasid');

    cwidth = floor(canvasID.offsetWidth*.8);
    cheight = floor(windowHeight*.8);
    boxheight = cheight/gridsize;
    boxwidth = cwidth/gridsize;

    // draw canvas
    canvasT = createCanvas(cwidth,cheight);
    canvasT.parent(canvasID);

    // create default 2d array of x by x size
    // input parseInt(window.prompt(": "), 10);
    for(var i=0;i<gridsize;i++){
        grid.push([]);
    }
    for(var x=0;x<gridsize;x++){
        for(var y=0;y<gridsize;y++){
            grid[x].push(new Node(x, y, 0));
            if(random(1)<0.15){
                grid[x][y].blocked = true;
            }
            grid[x][y].drawRect(grid[x][y].nodeWeightColor());
        }
    }

    frameRate(60);
}

function draw() {

    if(opensetSize === 0 && start !== null && end !== null) {
        opensetDict[start.xyStr] = {x: start.x, y: start.y};
        opensetSize += 1;
    }
    else if(goal === null && opensetSize !== 0 && start !== null && end !== null) {
        var currentNode = null;
        // find lowest f node within openset dictionary
        for(const nodeXY in opensetDict){ // key saved as 'x,y'
            var openX = opensetDict[nodeXY].x;
            var openY = opensetDict[nodeXY].y;

            if(currentNode == null){
                currentNode = grid[openX][openY];
            }
            if(grid[openX][openY].f < currentNode.f){
                currentNode = grid[openX][openY];
            }
        }

        currentNode.drawRect(color(floor(frameCount/3%255),floor(frameCount/2%255), floor(frameCount/4%255)));
        delete opensetDict[currentNode.xyStr]; // delete from openset record
        opensetSize -= 1;
        closedsetDict[currentNode.xyStr] = {x: currentNode.x, y: currentNode.y}; // add to closedset record

        // generate relatives
        currentNode.generateRelatives(grid, start);

        for(let i=0;i<currentNode.relatives.length;i++){
            let relative = currentNode.relatives[i];
            let validNode = true;

            // need to mark relatives blocked by diagols
            distEq = dist(currentNode.x, currentNode.y, relative.x, relative.y);
            if(distEq > 1.0){ // distance of corner relatives is sqrt(2)
                let diffx = currentNode.x - relative.x; // -/+ 1 which indicates direction of x from original x
                let diffy = currentNode.y - relative.y; // -/+ 1 which indicates direction of y from original y
                let checkX = relative.x + diffx; // should move x left/right one spot based on direction
                let checkY = relative.y + diffy; // should move y up/down one spot based on direction
                let checkNodeOne = null;
                let checkNodeTwo = null;


                if(0 <= checkX && checkX < gridsize){
                    checkNodeOne = grid[checkX][relative.y];
                }
                if(0 <= checkY && checkY < gridsize){
                    checkNodeTwo = grid[relative.x][checkY];
                }

                if(checkNodeOne !== null && checkNodeTwo !== null){
                    if(checkNodeOne.blocked && checkNodeTwo.blocked){
                        validNode = false;
                    }
                }
            }

            // generate g/h/f
            if(!closedsetDict[relative.xyStr] && !relative.blocked && validNode) {
                var tempG = currentNode.g + dist(currentNode.x, currentNode.y, relative.x, relative.y) + relative.weight;
                var newPath = false;

                if (opensetDict[relative.xyStr]) {                } else {

                    if (tempG < relative.g) {
                        relative.g = tempG;
                        newPath = true;
                    }
                    newPath = true;
                    relative.g = tempG;
                    relative.drawRect(color(54,176,189)); // draw itself since part of open set
                    opensetDict[relative.xyStr] = {x: relative.x, y: relative.y};
                    opensetSize += 1;
                }
                if (newPath) {
                    relative.h = dist(relative.x, relative.y, end.x, end.y);
                    relative.f = relative.g + relative.h;
                    relative.parentNode = currentNode;
                    console.log(relative.f);
                }
            }
        }


        // hightlight set nodes with different colors
/*        for(var openXY in opensetDict){
            var openX = opensetDict[openXY].x;
            var openY = opensetDict[openXY].y;
            if(grid[openX][openY] === start || grid[openX][openY] === end){
                continue;
            }
            grid[openX][openY].drawRect(color(54,176,189));
        }*/
/*        // changes closed nodes colors
        for(var closedXY in closedsetDict){
            var closedX = closedsetDict[closedXY].x;
            var closedY = closedsetDict[closedXY].y;
            if(grid[closedX][closedY] === start || grid[closedX][closedY] === end){
                continue;
            }
            grid[closedX][closedY].drawRect(color(255));
        }*/
        // current path being evaluated
        /*var tempNode = currentNode;
        tempNode.drawRect(color(109,50,115));
        while(tempNode.parentNode){
            tempNode = tempNode.parentNode;
            if(tempNode === start){
                break;
            }
            tempNode.drawRect(color(floor(frameCount/3%255),floor(frameCount/2%255), floor(frameCount/4%255)));
        }*/

        if (currentNode == end) {
            console.log("Goal");
            goal = end; // reached the end
            path = []; // record path taken
            var tempNode = currentNode;
            path.push(tempNode);
            while(tempNode.parentNode){
                tempNode = tempNode.parentNode;
                path.push(tempNode);
            }
            // changes closed nodes colors
            for(let closedXY in closedsetDict){
                let closedX = closedsetDict[closedXY].x;
                let closedY = closedsetDict[closedXY].y;
                if(grid[closedX][closedY] === start || grid[closedX][closedY] === end){
                    continue;
                }
                grid[closedX][closedY].drawRect(grid[closedX][closedY].nodeWeightColor());
            }
        }
    }
    else if(goal){
        // bounce colors back and forth
        bounceColors += colorDir;
        if(bounceColors >= 255){
            colorDir = -1;
            bounceColors = 255;
        }
        else if(0 >= bounceColors){
            colorDir = 1;
            bounceColors = 0;
        }

        /*// changes closed nodes colors
        for(var closedXY in closedsetDict){
            var closedX = closedsetDict[closedXY].x;
            var closedY = closedsetDict[closedXY].y;
            if(grid[closedX][closedY] === start || grid[closedX][closedY] === end){
                continue;
            }s
            grid[closedX][closedY].drawRect(color(bounceColors, -bounceColors, 125));
        }*/

        // forward node with trailing path
        var forwardPace = path.length - frameCount%path.length - 1;
        path[forwardPace].drawRect(color(frameCount/2%255, frameCount/4%255, frameCount/8%255));

        for(var i=0;i<forwardPace;i++){
            path[i].drawRect(path[i].nodeWeightColor(), color(255));
        }
        start.drawRect(color(10, 204, 102));
        end.drawRect(color(204, 10, 10));
    }
    else if(goal === null && start ){
        console.log("Not found");
        noLoop();
    }
    else{
        noLoop();
    }
}

// needs to recalculate overall canvas so that it stays within window size
function windowResized() {
    // recalculate canvas size
    let canvasID = document.getElementById('canvasid');
    cwidth = floor(canvasID.offsetWidth*.8);
    cheight = floor(windowHeight*0.8);
    boxheight = cheight/gridsize;
    boxwidth = cwidth/gridsize;

    // draw canvas

    // redraw canvas/grid
    resizeCanvas(cwidth, cheight);
    for(var x=0;x<gridsize;x++){
        for(var y=0;y<gridsize;y++){
            var tempNode = grid[x][y];
            tempNode.drawRect(tempNode.nodeWeightColor()); // draws color of blocked node, otherwise based on weight
        }
    }
    noLoop();
}

/*
// node object
class Node{
    constructor(x, y, weight) {
        this.x = x;
        this.y = y;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.weight = weight; // weight/cost of node
        this.parentNode = null;
        this.relatives = [];
        this.blocked = false;
        this.xyStr = x + ',' + y; // reference name 'x,y'
    }

    drawRect = function (col) {
        fill(col);
        rect(this.x* boxwidth, this.y * boxheight, boxwidth, boxheight);
    };

    // returns the color of the object based on weight/cost
    nodeWeightColor = function () {
        if(this.blocked){
            return color(183,182,179); //grey color
        }
        else if (this.weight === 0) { // fast road color
            return color(0); // color black
        }
        else if (this.weight === 1) { // regular road
            return color(195,178, 111); // yellow/brown color
        }
        else if (this.weight === 2){ // dirt road
            return color(151,108,23) // brown color
        }
        else {
            return color(230);
        }
    };

    generateRelatives = function(grid, start, gridSize){
        var x = this.x;
        var y = this.y;

        // grid goes from top left to bottom right
        if(x < gridSize-1) { // right
            this.relatives.push(grid[x + 1][y]);
        }
        if(x > gridSize -1  && y > 0){ //bottom-right
            this.relatives.push(grid[x + 1][y + 1]);
        }
        if(y < gridSize-1) { // down
            this.relatives.push(grid[x][y + 1]);
        }
        if(x > 0 && y < gridSize -1){ // bottom-left
            this.relatives.push(grid[x - 1][y + 1]);
        }
        if(x > 0){ // left
            this.relatives.push(grid[x - 1][y]);
        }
        if(x > 0 && y > 0){ // top-left
            this.relatives.push(grid[x - 1][y - 1]);
        }
        if(y > 0){ // up
            this.relatives.push(grid[x][y - 1]);
        }
        if(x < gridSize -1 && y < gridSize -1){ // top-right
            this.relatives.push(grid[x + 1][y + 1]);
        }
    };
}
*/
