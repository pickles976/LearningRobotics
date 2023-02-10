import { KalmanFilter, gaussianRandom, linspace } from "./kalman.js"

const dt = 0.1

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

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

// draw on canvas
ctx.moveTo(0, 0);
for (let i = 1; i < x.length; i++) {
    ctx.beginPath();
    ctx.moveTo((i - 1) * 7.2, measurements[i - 1] + 250);
    ctx.lineTo((i) * 7.2, measurements[i] + 250);
    ctx.stroke();
}

ctx.moveTo(0, 0);
ctx.strokeStyle = "red"
for (let i = 1; i < predictions.length; i++) {
    ctx.beginPath();
    ctx.moveTo((i - 1) * 7.2, predictions[i - 1] + 250);
    ctx.lineTo((i) * 7.2, predictions[i] + 250);
    ctx.stroke();
}