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

const ERROR_MARGIN = 0.5
const RADII = [100, 75, 75, 50, 50, 25, 25, 25]
const THETAS = [0, 0, 0, 0, 0, 0, 0, 0]

// const angles = [Math.PI / 12, Math.PI] // min 15 deg, max 180 deg
const angles = [-Math.PI, Math.PI] // full rotation
const CONSTRAINTS = [[-Math.PI * 2, Math.PI * 2], angles, angles, angles, angles, angles, angles, angles]

const PENALTY = 1000000 // penalty is so high because these configurations are NOT VALID, so the penalty needs to be huge

let ikSystem = new IKSystem(RADII, THETAS, CONSTRAINTS, errFn)

for (let i = 0; i < 2; i++) {
    context.clearRect(0,0,width,height)
    ikSystem.update(ORIGIN)
    ikSystem.render(context, ORIGIN)
    drawTransform(context, ikSystem.endEffector, "#000000")
    drawTransform(context, TARGET, "#0000FF")
}

function update() {

    context.clearRect(0,0,width,height)

    ikSystem.update(ORIGIN)
    ikSystem.render(context, ORIGIN)

    // render end-effector
    drawTransform(context, ikSystem.endEffector, "#000000")

    // render target
    drawTransform(context, TARGET, "#0000FF")

    // setTimeout(update, 150)

    requestAnimationFrame(update)

}

// TODO: move these to utils.js
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

// Calculate MSE between target and end effector distance
function getSquaredError(expected, actual) {

    const errX = Math.pow(expected.get([0, 2]) / width - actual.get([0, 2]) / width, 2)
    const errY = Math.pow(expected.get([1, 2]) / height - actual.get([1, 2]) / height, 2)

    return errX + errY

}

// Error function we pass into the solver
function errFn(output) {

    let totalErr = 0

    totalErr += getSquaredError(TARGET, output)

    return totalErr

}

// get the X and Y coords from a homogeneous transformation matrix
function getXYfromMatrix(matrix) {
    return [matrix.get([0, 2]), matrix.get([1, 2])]
}

update()