// get the X and Y coords from a homogeneous transformation matrix
function getXYfromMatrix(matrix) {
    return [matrix.get([0, 2]), matrix.get([1, 2])]
}

// Draw a transform object
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

// Calculate error between target and end effector distance
function getTransformError(expected, actual, ROT_CORRECTION, DIST_CORRECTION) {

    const errX = Math.pow((expected.get([0, 2]) - actual.get([0, 2])) / DIST_CORRECTION, 2)
    const errY = Math.pow((expected.get([1, 2]) - actual.get([1, 2])) / DIST_CORRECTION, 2)

    let errRot = 0
    errRot += Math.pow(expected.get([0, 0]) / ROT_CORRECTION - actual.get([0, 0]) / ROT_CORRECTION, 2)
    errRot += Math.pow(expected.get([0, 1]) / ROT_CORRECTION - actual.get([0, 1]) / ROT_CORRECTION, 2)
    errRot += Math.pow(expected.get([1, 0]) / ROT_CORRECTION - actual.get([1, 0]) / ROT_CORRECTION, 2)
    errRot += Math.pow(expected.get([1, 1]) / ROT_CORRECTION - actual.get([1, 1]) / ROT_CORRECTION, 2)
    errRot /= ROT_CORRECTION

    return (errX + errY + errRot)

}