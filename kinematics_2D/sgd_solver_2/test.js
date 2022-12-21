const ORIGIN = math.matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
])

const tX = 200
const tY = 200
const tθ = -Math.PI * 4

const TARGET = math.matrix([
    [Math.cos(tθ), -Math.sin(tθ), tX],
    [Math.sin(tθ), Math.cos(tθ), tY],
    [0, 0, 1]
])

const RADII = [100, 75, 75, 50, 50, 25, 25, 25]
const THETAS = [0, 0, 0, 0, 0, 0, 0, 0]

const angles = [-Math.PI, Math.PI] // full rotation
const CONSTRAINTS = [angles, angles, angles, angles, angles, angles, angles, angles]

function testMatrices() {

    const ikSolver = new IKSolver(RADII, THETAS, CONSTRAINTS, ORIGIN)



    console.log(ikSolver.thetas == THETAS)
    console.log(ikSolver.radii == RADII)
    console.log(ikSolver.constraints == CONSTRAINTS)
    console.log(ikSolver.origin == ORIGIN)

    ikSolver.generateMats()

    console.log(ikSolver.matrices)
    console.log(ikSolver.matrices[0] == ORIGIN)
    
    console.log(ikSolver.forwardMats)
    console.log(ikSolver.backwardMats)

}

testMatrices()
