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

const END_EFFECTOR = math.matrix([
    [1, 0, 425],
    [0, 1, 0],
    [0, 0, 1]
])

const RADII = [100, 75, 75, 50, 50, 25, 25, 25]
const THETAS = [0, 0, 0, 0, 0, 0, 0, 0]

const angles = [-Math.PI, Math.PI] // full rotation
const CONSTRAINTS = [angles, angles, angles, angles, angles, angles, angles, angles]

// TODO: convert this to jest testing
function testMatrices() {

    const ikSolver = new IKSolver(RADII, THETAS, CONSTRAINTS, ORIGIN)
    ikSolver.target = END_EFFECTOR

    console.log(ikSolver.thetas == THETAS)
    console.log(ikSolver.radii == RADII)
    console.log(ikSolver.constraints == CONSTRAINTS)
    console.log(ikSolver.origin == ORIGIN)
    console.log(ikSolver.target == END_EFFECTOR)

    ikSolver.generateMats()

    console.log(ikSolver.matrices.length == THETAS.length + 1)
    console.log(ikSolver.matrices[0] == ORIGIN)
    
    console.log(ikSolver.forwardMats)
    console.log(ikSolver.forwardMats[0] == ORIGIN)

    console.log(ikSolver.backwardMats)
    console.log(ikSolver.forwardMats[ikSolver.forwardMats.length - 1].get([0, 2]) == ikSolver.backwardMats[0].get([0, 2]))

    console.log(ikSolver.loss == 0.0)

}

// Make sure that the gradients are actually descending
function testDescent() {

    const ikSolver = new IKSolver(RADII, THETAS, CONSTRAINTS, ORIGIN)
    ikSolver.target = TARGET

    ikSolver.initializeMomentums()

    ikSolver.generateMats()
    const loss1 = ikSolver.loss
    ikSolver.updateThetas()

    ikSolver.generateMats()
    const loss2 = ikSolver.loss
    ikSolver.updateThetas()

    ikSolver.generateMats()
    const loss3 = ikSolver.loss
    ikSolver.updateThetas()

    ikSolver.generateMats()
    const loss4 = ikSolver.loss

    console.log(loss1, loss2, loss3, loss4)

}

// function testSolve() {
//     const ikSolver = new IKSolver(RADII, THETAS, CONSTRAINTS, ORIGIN)
//     ikSolver.solve(TARGET, 0.0001)
// }

testMatrices()
testDescent()
// testSolve()