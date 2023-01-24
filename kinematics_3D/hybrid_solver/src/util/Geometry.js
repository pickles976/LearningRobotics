import * as THREE from 'three'

export const IDENTITY = math.matrix( [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

// get the X,Y,Z coords from a 3D homogeneous transformation matrix
export function getXYZfromMatrix(matrix) {
    return [matrix.get([0, 3]), matrix.get([1, 3]), matrix.get([2, 3])]
}

/**
 * Constraints: only handles one-axis rotation at a time. Radius is locked to z-axis
 * @param {number} theta amount to rotate by
 * @param {string} axis axis to rotate around. Must be x, y or z 
 * @param {number} radius length in z-axis
 */
export function mat4(theta, axis, radius) {

    const tMat = tMat3D(0, 0, radius)
    const rMat = rMat3D(theta, axis)

    return math.multiply(tMat, rMat)

}

export function rMat3D(theta, axis) {

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

export function tMat3D(x, y, z) {
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

export function transformLoss(actual, expected, DIST_CORRECTION, ROT_CORRECTION) { 

    const errX = Math.pow((expected.get([0, 3]) - actual.get([0, 3])) / DIST_CORRECTION, 2)
    const errY = Math.pow((expected.get([1, 3]) - actual.get([1, 3])) / DIST_CORRECTION, 2)
    const errZ = Math.pow((expected.get([2, 3]) - actual.get([2, 3])) / DIST_CORRECTION, 2)

    let errRot = 0
    errRot += Math.pow((expected.get([0, 0]) - actual.get([0, 0])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([0, 1]) - actual.get([0, 1])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([0, 2]) - actual.get([0, 2])) / ROT_CORRECTION, 2)

    errRot += Math.pow((expected.get([1, 0]) - actual.get([1, 0])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([1, 1]) - actual.get([1, 1])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([1, 2]) - actual.get([1, 2])) / ROT_CORRECTION, 2)

    errRot += Math.pow((expected.get([2, 0]) - actual.get([2, 0])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([2, 1]) - actual.get([2, 1])) / ROT_CORRECTION, 2)
    errRot += Math.pow((expected.get([2, 2]) - actual.get([2, 2])) / ROT_CORRECTION, 2)

    errRot /= ROT_CORRECTION

    return (errX + errY + errZ + errRot)
}

export function distanceBetweeen(mat1, mat2) {

    let dist = 0
    
    dist += Math.abs(mat1.get([0, 3]) - mat2.get([0, 3]))
    dist += Math.abs(mat1.get([1, 3]) - mat2.get([1, 3]))
    dist += Math.abs(mat1.get([2, 3]) - mat2.get([2, 3]))

    return dist
}

/**
 * Converts math.js Matrix4 to THREE.js Matrix4
 * @param {math.matrix} in_matrix 
 * @returns {THREE.Matrix4}
 */
export function mathToTHREE(in_matrix) {
    let dim = in_matrix.size()

    let arr = []

    for (let i = 0; i < dim[0]; i++) {
        for (let j = 0; j < dim[1]; j++) {
            arr.push(in_matrix.get([i, j]))
        }
    }

    let m = new THREE.Matrix4()
    return m.set(...arr)

}

/**
 * 
 * @param {*} origin 
 * @param {*} thetas 
 * @param {*} axes 
 * @param {*} radii 
 * @returns 
 */
export function generateMats(origin, thetas, axes, radii) { 

    let matrices = []
    matrices.push(origin)

    for (let i = 0; i < thetas.length; i++){
        matrices.push(mat4(thetas[i], axes[i], radii[i]))
    }

    return matrices

}

/**
 * generate all the forward partial matrix products
 * [ O, O x A, O x A x B, O x A x B x C]
 * @param {*} matrices 
 * @returns 
 */
export function generateForwardMats(matrices) {
    let forwardMats = []
    forwardMats.push(matrices[0])

    for (let i = 1; i < matrices.length; i++){
        forwardMats.push(math.multiply(forwardMats[i - 1], matrices[i]))
    }

    return forwardMats
}

/**
 * generate all the backwards partial matrix products
 * [E, D x E, C x D x E] -> [C x D x E, D x E, E] + [ I ]
 * @param {*} matrices 
 * @returns 
 */
export function generateBackwardMats(matrices) {
    let backwardMats = []
    backwardMats.push(matrices[matrices.length - 1])

    for (let i = 1; i < matrices.length; i++){
        backwardMats.push(math.multiply(matrices[matrices.length - i - 1], backwardMats[i - 1]))
    }

    backwardMats = backwardMats.reverse()
    backwardMats.push(IDENTITY)

    return backwardMats
}

/**
 * Get a column of the jacobian
 * @param {*} matrixStart 
 * @param {*} matrixEnd 
 * @param {*} d 
 * @returns 
 */
export function getJacobianColumn(matrixStart, matrixEnd, d) {
    let delta = math.subtract(matrixEnd, matrixStart)   
    let row = math.multiply(getTwistFromMatrix(delta), 1.0 / d)
    return row
}

export function getTargetVector(desired, current) {

    let desiredTwist = math.matrix(getTwistFromMatrix(desired))
    let currentTwist = math.matrix(getTwistFromMatrix(current))
    let vec = math.subtract(desiredTwist, currentTwist)

    return vec
}

/**
 * Get a shitty twist coordinate from a matrix
 * @param {} matrix 
 * @returns 
 */
function getTwistFromMatrix(matrix) {

    let x = matrix.get([0, 3])
    let y = matrix.get([1, 3])
    let z = matrix.get([2, 3])

    let rotations = [
        matrix.get([0, 0]) * 10.0,
        matrix.get([0, 1]) * 10.0,
        matrix.get([0, 2]) * 10.0,

        matrix.get([1, 0]) * 10.0,
        matrix.get([1, 1]) * 10.0,
        matrix.get([1, 2]) * 10.0,

        matrix.get([2, 0]) * 10.0,
        matrix.get([2, 1]) * 10.0,
        matrix.get([2, 2]) * 10.0
    ]

    return [x,y,z].concat(rotations)
}