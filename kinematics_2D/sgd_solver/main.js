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

let ikSystem = new IKSystem(RADII, THETAS, CONSTRAINTS, ORIGIN)
ikSystem.setTarget(TARGET)
ikSystem.update()

function update() {

    context.clearRect(0,0,width,height)

    if (ikSystem.loss > 0.00001) {
        ikSystem.update()
    }

    ikSystem.render(context)

    // render end-effector
    drawTransform(context, ikSystem.endEffector, "#000000")

    // render target
    drawTransform(context, TARGET, "#0000FF")

    // setTimeout(update, 150)

    requestAnimationFrame(update)

}

update()