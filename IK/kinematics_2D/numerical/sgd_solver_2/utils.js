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
function ccw(A, B, C){
    return (C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0])
}

// Return true if line segments AB and CD intersect
function intersect(A,B,C,D){
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D)
}

// Get a list of lines from a list of matrices
function getLines(matrices) {

    let prevMat = matrices[0]

    let lineArr = []

    for (let i = 1; i < matrices.length; i++) {

        // apply matrices
        let currMat = math.multiply(prevMat, matrices[i])

        // [ [x1, y1] , [x2, y2] ]
        const line = [
            getXYfromMatrix(prevMat), 
            getXYfromMatrix(currMat)
        ]

        lineArr.push(line)

        prevMat = currMat
    }

    return lineArr

}

// check if any lines in a list intersect
function linesIntersect(lines) {

    for (let i = 0; i < lines.length; i++ ){
        for (let j = 0; j < lines.length; j++) {

            // ensure we dont check neighbors or self
            if (Math.abs(i - j) > 1) {

                const line1 = lines[i]
                const line2 = lines[j]

                if (intersect(line1[0], line1[1], line2[0], line2[1])){
                    return true
                }

            }
        }
    }

    return false

}

// get the X and Y coords from a homogeneous transformation matrix
function getXYfromMatrix(matrix) {
    return [matrix.get([0, 2]), matrix.get([1, 2])]
}

function generateMatrix2D(theta, radius) {

    const cos = Math.cos(theta)
    const sin = Math.sin(theta)

    return math.matrix([
        [cos, -sin, radius * cos],
        [sin,cos, radius * sin],
        [0, 0, 1]
    ])

}

function transformLoss(actual, expected, DIST_CORRECTION, ROT_CORRECTION) { 

    const errX = Math.pow((expected.get([0, 2]) - actual.get([0, 2])) / DIST_CORRECTION, 2)
    const errY = Math.pow((expected.get([1, 2]) - actual.get([1, 2])) / DIST_CORRECTION, 2)

    let errRot = 0
    errRot += Math.pow((expected.get([0, 0]) - actual.get([0, 0])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([0, 1]) - actual.get([0, 1])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([1, 0]) - actual.get([1, 0])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([1, 1]) - actual.get([1, 1])) / ROT_CORRECTION, 2)
    errRot /= ROT_CORRECTION

    return (errX + errY + errRot)
}