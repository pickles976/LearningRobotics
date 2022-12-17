let canvas = document.getElementById("canvas")
context = canvas.getContext("2d")
width = canvas.width = window.innerWidth
height = canvas.height = window.innerHeight


const ORIGIN = math.matrix([
    [1, 0, width / 2],
    [0, 1, height / 2],
    [0, 0, 1]
])

const tX = 100
const tY = 100

const TARGET = math.matrix([
    [1, 0, tX],
    [0, 1, tY],
    [0, 0, 1]
])

const radii = [100, 50, 75]
let thetas = [0, 14, 25]

// list of transform matrices
let matrices = getMatrices(radii, thetas)

// full chain with ORIGIN included
let fullChain = [ORIGIN].concat(matrices)

// matrix representing the end effector transform 
let endMatrix = applyMatrices(ORIGIN, matrices)

function update() {

    context.clearRect(0,0,width,height)
    
    for (let i = 0; i < thetas.length; i++){
        thetas[i] += 0.01
    }

    // update matrices
    matrices = getMatrices(radii, thetas)
    fullChain = [ORIGIN].concat(matrices)

    renderMatrices(fullChain, context)

    // render end-effector
    const hand = applyMatrices(ORIGIN, matrices)
    context.fillStyle = "#000000"
    context.beginPath();
    context.arc(hand.get([0, 2]), hand.get([1, 2]), 10, 0, 2 * Math.PI);
    context.fill();

    context.beginPath();
    context.fillStyle = "#FF0000"
    context.arc(tX, tY, 10, 0, 2 * Math.PI);
    context.fill();

    console.log(getError(TARGET, ORIGIN, radii, thetas))
    // getError(TARGET, ORIGIN, radii, thetas)
 
    requestAnimationFrame(update)
}

update()