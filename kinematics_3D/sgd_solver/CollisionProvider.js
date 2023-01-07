import { CheckCollision, Shape } from 'SAT'
import { mathToTHREE } from './Geometry.js'

/**
 * Finds the indices of the arm which are self-intersecting
 * @param {Array[Shape]} newColliders 
 * @param {Array[matrix]} matrices 
 * @returns 
 */
export function findSelfIntersections(newColliders, matrices){

    let isColliding = new Array(newColliders.length)

    let colliders = transformColliders(newColliders, matrices)

    for (let i = 0; i < colliders.length; i++){
        isColliding[i] = false
    }

    // Get an array of all colliding links
    for (let i = 0; i < colliders.length; i++){
        for (let j = i; j < colliders.length; j++) {

            // ensure we dont check neighbors or self
            if (j - i > 1) {

                if (CheckCollision(colliders[i], colliders[j])) {
                    isColliding[i] = true
                    isColliding[j] = true
                }

            }
        }
    }

    return isColliding
}

/**
 * Checks if an array of arm colliders is self-intersecting
 * @param {Array[Shape]} newColliders 
 * @param {Array[matrix]} matrices 
 * @returns 
 */
export function isSelfIntersecting(newColliders, matrices){

    let colliders = transformColliders(newColliders, matrices)

    // return true if there is any intersection
    for (let i = 0; i < colliders.length; i++){
        for (let j = i; j < colliders.length; j++) {

            // ensure we dont check neighbors or self
            if (j - i > 1) {

                if (CheckCollision(colliders[i], colliders[j])) {
                    return true
                }

            }
        }
    }

    return false
    
}

/**
 * Transform colliders with a given matrix
 * @param {Shape} colliders 
 * @param {matrix} matrices 
 * @returns 
 */
function transformColliders(colliders, matrices) {

    for (let i = 0; i < colliders.length; i++) {

        // set arm transform equal to matrix
        let tempMat = mathToTHREE(matrices[i])

        colliders[i].SetPosition(0, 0, 0)
        colliders[i].SetRotation(0, 0, 0)
        colliders[i].ApplyMatrix4(tempMat)
    }

    return colliders
}

/**
 * Check if any section of the arm is intersecting an obstacle
 * @param {Array[Shape]} colliders 
 * @param {Array[Shape]} obstacles 
 * @param {Array[matrix]} matrices 
 * @returns 
 */
export function isIntersectingObjects(armColliders, matrices, obstacles){

    let colliders = transformColliders(armColliders, matrices)

    colliders.forEach((collider) => {
        obstacles.forEach((obstacle) => {
            if (CheckCollision(collider, obstacle)) {
                return true
            }
        })
    })

    return false

}
