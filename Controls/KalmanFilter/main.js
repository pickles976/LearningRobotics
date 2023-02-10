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
let mouseX, mouseY = [0,0]

ctx.strokeStyle = "black"

function handleMouseMove(e){
    console.log(mouseX, mouseY)
    ctx.beginPath()
    ctx.moveTo(mouseX, mouseY)
    mouseX=parseInt(e.clientX-offsetX)
    mouseY=parseInt(e.clientY-offsetY)
    ctx.lineTo(mouseX, mouseY)
    ctx.stroke()
}

// Controls stuff
const dt = 0.1

const F = math.matrix([
    [1, dt, 0], 
    [0, 1, dt], 
    [0, 0, 1]
])

const H = math.matrix([[1, 0, 0]])

const Q = math.matrix([
    [0.05, 0.05, 0.05], 
    [0.05, 0.05, 0.05], 
    [0.0, 0.0, 0.0]
])

const R = math.matrix([[0.5]])

// Create x and y data
let x = linspace(-10, 10, 100)
let measurements = x.map((val) => {
    return val**2 + val*2 - 2 + gaussianRandom(0, 1)
})

const kf = new KalmanFilter(F, H, Q, R)
let predictions = []

// smooth measurements
measurements.forEach((z) => {
    predictions.push(math.multiply(H, kf.predict())._data[0][0])
    kf.update(z)
})
