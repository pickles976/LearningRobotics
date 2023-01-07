import { CheckCollision, Shape } from 'SAT'
import { mathToTHREE } from './Geometry.js'

/**
 * 
 * @param {Array[Shape]} colliders 
 * @param {Array[matrix]} matrices 
 * @returns 
 */
export function findSelfIntersections(colliders, matrices){

    let isColliding = new Array(colliders.length)

    for (let i = 0; i < colliders.length; i++) {

        // set arm transform equal to matrix
        let tempMat = mathToTHREE(matrices[i])

        colliders[i].SetPosition(0, 0, 0)
        colliders[i].SetRotation(0, 0, 0)
        colliders[i].ApplyMatrix4(tempMat)
    }

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
 * 
 * @param {Array[Shape]} colliders 
 * @param {Array[matrix]} matrices 
 * @returns 
 */
export function isSelfIntersecting(colliders, matrices){

    let intersections = findSelfIntersections(colliders, matrices).filter((isColliding) => isColliding == true)

    return intersections.length > 0
    
}

/**
 * 
 * @param {Array[Shape]} colliders 
 * @param {Array[Shape]} obstacles 
 * @param {Array[matrix]} matrices 
 * @returns 
 */
export function isIntersectingObjects(colliders, obstacles, matrices){

}
