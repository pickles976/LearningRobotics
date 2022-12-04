let seg
let time = 0 

function setup() {
    createCanvas(1280, 720);
    background(55)
    seg = new Segment(100,100,200,20)
}
  
function draw() {
    // if (mouseIsPressed) {
    //   fill(0);
    // } else {
    //   fill(255);
    // }
    // ellipse(mouseX, mouseY, 80, 80);
    time += 0.01
    // seg = new Segment(100,100,200,20 * time)
    seg.show()
}