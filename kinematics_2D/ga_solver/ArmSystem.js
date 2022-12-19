// get a list of matrics from radii and offsets
function getMatrices(radii, thetas) {

    if (radii.length != thetas.length) {
        console.log("Lengths of input arrays do not match!!!")
    }

    let matrices = []

    for (let i = 0; i < radii.length; i++) {

        const θ = thetas[i]
        const r = radii[i]

        matrices.push(math.matrix([
            [Math.cos(θ), -Math.sin(θ), r * Math.cos(θ)],
            [Math.sin(θ), Math.cos(θ), r * Math.sin(θ)],
            [0, 0, 1]
        ]))
    }

    return matrices

}

// apply an array of matrices to an origin matrix
function applyMatrices(origin, matrices) {
    
    let curr = origin

    for(let i = 0; i < matrices.length; i++){
        curr = math.multiply(curr, matrices[i])
    }

    return curr

}

// Calculate MSE between target and end effector distance
function getSquaredErrorDist(target, origin, radii, thetas) {

    const matrices = getMatrices(radii, thetas)

    // matrix representing the end effector transform 
    const endMatrix = applyMatrices(origin, matrices)

    const errX = Math.pow(target.get([0, 2]) - endMatrix.get([0, 2]), 2)
    const errY= Math.pow(target.get([1, 2]) - endMatrix.get([1, 2]), 2)

    return (errX + errY) / 2

}

// Calculate MSE between target and end effector transforms
// TODO: normalize distance to end effector space radius
// This way distance and rotation can be related by the same linear relationship
function getSquaredError(target, origin, radii, thetas) {

    const ERROR_CORRECTION = 10

    const matrices = getMatrices(radii, thetas)

    // matrix representing the end effector transform 
    const endMatrix = applyMatrices(origin, matrices)

    const errX = Math.abs(target.get([0, 2]) - endMatrix.get([0, 2]))
    const errY = Math.abs(target.get([1, 2]) - endMatrix.get([1, 2]))

    // calculate rotation error
    let errRot = 0
    errRot += Math.abs(target.get([0, 0]) - endMatrix.get([0, 0]))
    errRot += Math.abs(target.get([0, 1]) - endMatrix.get([0, 1]))
    errRot += Math.abs(target.get([1, 0]) - endMatrix.get([1, 0]))
    errRot += Math.abs(target.get([1, 1]) - endMatrix.get([1, 1]))
    errRot *= ERROR_CORRECTION

    return (errX + errY + errRot) / 2

}

// Calculate MSE between target and end effector
function getErrorDist(target, origin, radii, thetas) {

    const matrices = getMatrices(radii, thetas)

    // matrix representing the end effector transform 
    const endMatrix = applyMatrices(origin, matrices)

    const errX = Math.abs(target.get([0, 2]) - endMatrix.get([0, 2]))
    const errY= Math.abs(target.get([1, 2]) - endMatrix.get([1, 2]))

    return (errX + errY) / 2

}

function renderArm(matrices, ctx) {

    let prevMat = matrices[0]

    for (let i = 1; i < matrices.length; i++){

        let currentMat = math.multiply(prevMat, matrices[i])

        let startX = prevMat.get([0, 2])
        let startY = prevMat.get([1, 2])

        let endX = currentMat.get([0, 2])
        let endY = currentMat.get([1, 2])

        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        prevMat = currentMat

    }
}