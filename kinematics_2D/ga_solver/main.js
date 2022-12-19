let canvas = document.getElementById("canvas")
context = canvas.getContext("2d")
width = canvas.width = window.innerWidth
height = canvas.height = window.innerHeight

const AXES_LENGTH = 50

const X_AXIS = math.matrix([
    [1, 0, AXES_LENGTH],
    [0, 1, 0],
    [0, 0, 1]
])

const Y_AXIS = math.matrix([
    [1, 0, 0],
    [0, 1, AXES_LENGTH],
    [0, 0, 1]
])

const ORIGIN = math.matrix([
    [1, 0, width / 2],
    [0, 1, height / 2],
    [0, 0, 1]
])

const tX = 300 + Math.random() * 400
const tY = 300 + Math.random() * 400
const tθ = (Math.random() - 0.5) * Math.PI * 4

const TARGET = math.matrix([
    [Math.cos(tθ), -Math.sin(tθ), tX],
    [Math.sin(tθ), Math.cos(tθ), tY],
    [0, 0, 1]
])

const ERROR_MARGIN = 0.5
const RADII = [100, 75, 75, 50, 50, 25, 25, 25]
const THETAS = [0, 0, 0, 0, 0, 0, 0, 0]

const angles = [Math.PI / 12, Math.PI] // min 15 deg, max 180 deg
// const angles = [-Math.PI, Math.PI] // full rotation
const CONSTRAINTS = [[-Math.PI * 2, Math.PI * 2], angles, angles, angles, angles, angles, angles, angles]

const PENALTY = 1000000 // penalty is so high because these configurations are NOT VALID, so the penalty needs to be huge

let population = new Population(100, 0.2, THETAS, evaluate)

// Fitness function we pass into our genetic algorithm
function evaluate(thetas) {

    let totalErr = 0
    let sumThetas = 0

    // check that all joints are within theta constraints
    for (let i = 0; i < thetas.length; i++ ){
        sumThetas += thetas[i]
        totalErr += (thetas[i] > CONSTRAINTS[i][0] && thetas[i] < CONSTRAINTS[i][1]) ? 0 : PENALTY
    }

    // check that links do not intersect
    let matrices = getMatrices(RADII, thetas)
    let lines = getLines([ORIGIN].concat(matrices))
    totalErr += linesIntersect(lines) ? PENALTY : 0
    
    //
    totalErr += getSquaredError(TARGET, ORIGIN, RADII, thetas)

    return 1 / totalErr

}

// population.newGeneration()

function update() {

    context.clearRect(0,0,width,height)

    if (population.minErr > ERROR_MARGIN) { 
        population.newGeneration() 
        console.log(`Generation: ${population.generation}, Minimum Error: ${population.minErr}`)
    }

    // population.newGeneration()

    // while(population.minErr > ERROR_MARGIN) {
    //     population.newGeneration()
    //     console.log(`Generation: ${population.generation}, Minimum Error: ${population.minErr}`)
    // }

    const fittest = population.alpha

    // Get and render matrices
    matrices = getMatrices(RADII, fittest.thetas)
    fullChain = [ORIGIN].concat(matrices)
    renderArm(fullChain, context)

    // render end-effector
    drawTransform(context, applyMatrices(ORIGIN, matrices), "#000000")

    // render target
    drawTransform(context, TARGET, "#0000FF")

    // setTimeout(update, 50)

    // TARGET.set([0,2], TARGET.get([0,2]) + 1)

    requestAnimationFrame(update)

}

function drawTransform(ctx, matrix, color) {

    ctx.fillStyle = color

    // Get axes relative to transform matrix
    const startPoint = getXYfromMatrix(matrix)
    const xAxis = getXYfromMatrix(math.multiply(matrix, X_AXIS))
    const yAxis = getXYfromMatrix(math.multiply(matrix, Y_AXIS))

    // circle
    ctx.beginPath();
    ctx.arc(startPoint[0], startPoint[1], 10, 0, 2 * Math.PI);
    ctx.fill();

    // draw x Axis 
    ctx.strokeStyle = "#FF0000"
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(startPoint[0], startPoint[1])
    ctx.lineTo(xAxis[0] , xAxis[1])
    ctx.stroke()

    // draw y Axis
    ctx.strokeStyle = "#FFFF00"
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(startPoint[0], startPoint[1])
    ctx.lineTo(yAxis[0] , yAxis[1])
    ctx.stroke()

}


update()