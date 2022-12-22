const IDENTITY = math.matrix( [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

// get the X,Y,Z coords from a 3D homogeneous transformation matrix
function getXYZfromMatrix(matrix) {
    return [matrix.get([0, 3]), matrix.get([1, 3]), matrix.get([2, 3])]
}

/**
 * Constraints: only handles one-axis rotation at a time. Radius is locked to z-axis
 * @param {number} theta amount to rotate by
 * @param {string} axis axis to rotate around. Must be x, y or z 
 * @param {number} radius length in z-axis
 */
function mat4(theta, axis, radius) {

    const tMat = tMat3D(0, 0, radius)
    const rMat = rMat3D(theta, axis)

    return math.multiply(tMat, rMat)

}

function rMat3D(theta, axis) {

    switch(axis) {
        case 'x':
            return rotationMatrixX(theta)
        case 'y':
            return rotationMatrixY(theta)
        case 'z':
            return rotationMatrixZ(theta)
        default:
            break
    }

    return IDENTITY

}

function tMat3D(x, y, z) {
    return math.matrix([
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1],
    ])
}

function rotationMatrixX(theta) {

    const cos = Math.cos(theta)
    const sin = Math.sin(theta)

    return math.matrix([
        [1, 0, 0, 0],
        [0, cos, -sin, 0],
        [0, sin, cos, 0],
        [0, 0, 0, 1]
    ])
}

function rotationMatrixY(theta) {

    const cos = Math.cos(theta)
    const sin = Math.sin(theta)

    return math.matrix([
        [cos, 0, sin, 0],
        [0, 1, 0, 0],
        [-sin, 0, cos, 0],
        [0, 0, 0, 1]
    ])
}

function rotationMatrixZ(theta) {

    const cos = Math.cos(theta)
    const sin = Math.sin(theta)

    return math.matrix([
        [cos, -sin, 0, 0],
        [sin, cos, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ])
}