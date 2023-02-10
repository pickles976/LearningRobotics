import { KalmanFilter} from "./kalman.js"
import { gaussianRandom, linspace } from "./util.js"

// canvas stuff
const canvas = document.getElementById("canvas")
canvas.height = window.innerHeight
canvas.width = window.innerWidth
const ctx = canvas.getContext("2d")

canvas.addEventListener('mousemove', (e) => {handleMouseMove(e)})
var offsetX=canvas.offsetLeft;
var offsetY=canvas.offsetTop;
let mouseX, mouseY, mouseNoisyX, mouseNoisyY, kalmanX, kalmanY = [0,0,0,0]

// Controls stuff
const dt = 0.1
const stdX = 3.0
const stdY = 3.0

const F = math.matrix([
    [1, 0, dt, 0], 
    [0, 1, 0, dt], 
    [0, 0, 1, 0],
    [0, 0, 0, 0]
])

const H = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0]
])

const t4 = dt ** 4
const t3 = dt ** 3
const t2 = dt ** 2

const Q = math.matrix([
    [t4/4, 0.0, t3/2, 0.0], 
    [0.0, t4/4, 0.0, t3/2], 
    [t3/2, 0.0, t2, 0.0],
    [0.0, t3/2, 0.0, t2]
])

const R = math.matrix([
    [stdX, 0.0],
    [0.0, stdY]
])

const kf = new KalmanFilter(F, H, Q, R, math.matrix([0,0,0,0]))


function handleMouseMove(e){

    // Draw noisy line
    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.moveTo(mouseNoisyX, mouseNoisyY)

    mouseX=parseInt(e.clientX-offsetX)
    mouseY=parseInt(e.clientY-offsetY)
    mouseNoisyX = mouseX + gaussianRandom(0,stdX)
    mouseNoisyY = mouseY + gaussianRandom(0, stdY)

    ctx.lineTo(mouseNoisyX, mouseNoisyY)
    ctx.stroke()

    // Draw filtered line
    ctx.strokeStyle = "green"
    ctx.beginPath()
    ctx.moveTo(kalmanX, kalmanY)
    let pred = math.multiply(H, kf.predict())
    kf.update(math.matrix([mouseNoisyX, mouseNoisyY]))
    kalmanX = pred._data[0]
    kalmanY = pred._data[1]
    ctx.lineTo(kalmanX, kalmanY)
    ctx.stroke()

}