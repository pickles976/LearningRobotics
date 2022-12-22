let canvas = document.getElementById("canvas")
context = canvas.getContext("2d")
width = canvas.width = window.innerWidth
height = canvas.height = window.innerHeight

const L = 50

const X_AXIS = math.matrix([
    [1, 0, 0, L],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

const Y_AXIS = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, L],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

const Z_AXIS = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, L],
    [0, 0, 0, 1]
])

const ORIGIN = math.matrix([
    [1, 0, 0, 50],
    [0, 1, 0, 50],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])


const RADII = [100, 75, 75, 50]
const AXES = ['z', 'x', 'y', 'x']
const THETAS = [Math.PI / 8, -Math.PI / 4, Math.PI / 6, Math.PI / 6]

const ikSolver3D = new IKSolver3D(AXES, RADII, THETAS, ORIGIN)
ikSolver3D.generateMats()

console.log(ikSolver3D.matrices)
console.log(ikSolver3D.forwardMats)
console.log(ikSolver3D.backwardMats)

