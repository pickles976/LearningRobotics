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

const tX = width / 3 + Math.random() * width / 3
const tY = height / 3 + Math.random() * height / 3
const tθ = (Math.random() - 0.5) * Math.PI * 4

const TARGET = math.matrix([
    [Math.cos(tθ), -Math.sin(tθ), tX],
    [Math.sin(tθ), Math.cos(tθ), tY],
    [0, 0, 1]
])

const angles = [Math.PI / 12, Math.PI] // min 15 deg, max 180 deg
// const angles = [-Math.PI, Math.PI] // full rotation
const CONSTRAINTS = [[-Math.PI * 2, Math.PI * 2], angles, angles, angles, angles, angles, angles, angles]

const ERROR_MARGIN = 0.5
const RADII = [100, 75, 75, 50, 50, 25, 25, 25]
// const THETAS = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
const THETAS = CONSTRAINTS.map((con) => (con[1] - con[0]) / 4)

const PENALTY = 1000000 // penalty is so high because these configurations are NOT VALID, so the penalty needs to be huge

let ikSolver = new IKSolver(RADII, THETAS, CONSTRAINTS, ORIGIN)
ikSolver.target = TARGET
ikSolver.initializeMomentums()

// UNCOMMENT FOR PERFORMANCE TEST
// let start = Date.now()
// ikSolver.solve(TARGET, 0.00001)
// console.log(`Elapsed time: ${(Date.now() - start)}ms`)

function update() {

    context.clearRect(0,0,width,height)

    if (ikSolver.loss > 0.00001) {
        ikSolver.update()
        console.log(ikSolver.loss)
    }

    ikSolver.render(context)

    // render end-effector
    drawTransform(context, ikSolver.endEffector, "#000000")

    // render target
    drawTransform(context, TARGET, "#0000FF")

    // setTimeout(update, 150)

    requestAnimationFrame(update)

}

update()