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

const RADII = [100, 75, 75, 50, 50, 25, 25, 50]
const THETAS = [0, 0, 0, 0, 0, 0, 0, 0]

let population = new Population(100, 0.02, THETAS, evaluate)


function evaluate(thetas) {

    return 1 / getSquaredError(TARGET, ORIGIN, RADII, thetas)

}

// population.newGeneration()

function update() {

    context.clearRect(0,0,width,height)

    population.newGeneration()

    const fittest = population.alpha
    console.log(getError(TARGET, ORIGIN, RADII, fittest.thetas))

    // update matrices
    matrices = getMatrices(RADII, fittest.thetas)
    fullChain = [ORIGIN].concat(matrices)
    renderMatrices(fullChain, context)

    // render end-effector
    const hand = applyMatrices(ORIGIN, matrices)
    context.fillStyle = "#000000"
    context.beginPath();
    context.arc(hand.get([0, 2]), hand.get([1, 2]), 10, 0, 2 * Math.PI);
    context.fill();

    // render target
    context.beginPath();
    context.fillStyle = "#FF0000"
    context.arc(tX, tY, 10, 0, 2 * Math.PI);
    context.fill();

    requestAnimationFrame(update)
}


update()