let canvas = document.getElementById("canvas")
context = canvas.getContext("2d")
width = canvas.width = window.innerWidth
height = canvas.height = window.innerHeight

const ORIGIN = math.matrix([
    [1, 0, width / 2],
    [0, 1, height / 2],
    [0, 0, 1]
])

const tX = 300 + Math.random() * 400
const tY = 300 + Math.random() * 400

const TARGET = math.matrix([
    [1, 0, tX],
    [0, 1, tY],
    [0, 0, 1]
])

const ERROR_MARGIN = 0.5
const RADII = [100, 75, 75, 50, 50, 25, 25, 50]
const THETAS = [0, 0, 0, 0, 0, 0, 0, 0]

// min 15 deg, max 180 deg
const angles = [Math.PI / 12, Math.PI]
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

        // theta is within constraints
        totalErr += (thetas[i] > CONSTRAINTS[i][0] && thetas[i] < CONSTRAINTS[i][1]) ? 0 : PENALTY

    }

    // check that links do not intersect
    let matrices = getMatrices(RADII, thetas)
    matrices = [ORIGIN].concat(matrices)

    let lines = getLines(matrices)

    // if (linesIntersect(lines)) {
    //     renderMatrices(matrices, context)
    // }
    totalErr += linesIntersect(lines) ? PENALTY : 0
    
    // make sure arm doesn't wrap around on itself
    totalErr += ((sumThetas < Math.PI * 2) && (sumThetas > -Math.PI * 2)) ? 0 : PENALTY

    // get distance-based error
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

    // while(population.minErr > ERROR_MARGIN) {
    //     population.newGeneration()
    //     console.log(`Generation: ${population.generation}, Minimum Error: ${population.minErr}`)
    // }

    const fittest = population.alpha
    // console.log(getError(TARGET, ORIGIN, RADII, fittest.thetas))

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

    // setTimeout(update, 50)

    requestAnimationFrame(update)

}


update()