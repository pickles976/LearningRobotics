import * as THREE from 'three'
import { CheckCollision, Shape, ShapeFromGeometry } from 'SAT'
import { distanceBetweeen, mathToTHREE, tMat3D } from './Geometry.js'

export class CollisionProvider {

    // x, y, z
    constructor(arm, world) {

        let lengths = arm.map((element) => element.link.length) // x
        let widths = arm.map((element) => element.link.width) // y
        let heights = arm.map((element) => element.link.height) //z 

        this.geometries = []
        this.colliders = this.generateColliders(lengths, widths, heights)

        console.log(this.colliders)
    }

    // z, aka, height is the length of the link, kind of confusing, no?
    generateColliders(lengths, widths, heights) {

        console.assert(lengths.length == widths.length && lengths.length == heights.length)

        let colliders = []

        for (let i = 0; i < lengths.length; i++){
            let boxGeo = new THREE.BoxGeometry(heights[i], widths[i], lengths[i]);
            boxGeo.translate(0, 0, lengths[i] / 2)
            this.geometries.push(boxGeo)
            let centroid = tMat3D(0,0, heights[i] / 2)
            colliders.push(new Collider(ShapeFromGeometry(boxGeo), centroid, lengths[i], widths[i], heights[i]))
        }

        return colliders

    }

    /**
     * Get the actual collider shape to be used by SAT.js
     * @returns {Shape}
     */
    getColliders() {
        return this.colliders.map((col) => col.shape);
    }

    /**
     * Returns true if colliders intersect for a given configuration
     * @param {matrix} matrices 
     * @returns {boolean}
     */
    isSelfIntersecting(matrices){

        console.assert(matrices.length == this.colliders.length, "Array lengths do not match!")

        // Transform the centroids of the arm colliders
        let centroids = this.colliders.map((col, i) => {
            return col.transformCentroid(matrices[i])
        })

        // ((n - 2) ^ 2) / 2
        // TODO: speedup by sorting centroids in KD or something idk
        for (let i = 0; i < centroids.length; i++) {
            for (let j = i; j < centroids.length; j++) {
                if (j - i > 1) {
                    if (distanceBetweeen(centroids[i], centroids[j]) < (this.colliders[i].max + this.colliders[j].max)) {
                        if (CheckCollision(transformCollider(this.colliders[i].shape, matrices[i]), transformCollider(this.colliders[j].shape, matrices[j]))) {
                            return true
                        }
                    }
                }   
            }
        }
        
    }

    /**
     * Finds the indices of the arm which are self-intersecting
     * @param {Array[matrix]} matrices 
     * @returns 
     */
    findSelfIntersections(matrices){

        // console.assert(matrices.length == this.colliders.length, "Array lengths do not match!")

        // Transform the centroids of the arm colliders
        let centroids = this.colliders.map((col, i) => {
            return col.transformCentroid(matrices[i])
        })

        let isColliding = new Array(this.colliders.length)

        for (let i = 0; i < this.colliders.length; i++){
            isColliding[i] = false
        }

        for (let i = 0; i < centroids.length; i++) {
            for (let j = i; j < centroids.length; j++) {
                if (j - i > 1) {
                    if (distanceBetweeen(centroids[i], centroids[j]) < (this.colliders[i].max + this.colliders[j].max)) {
                        if (CheckCollision(transformCollider(this.colliders[i].shape, matrices[i]), transformCollider(this.colliders[j].shape, matrices[j]))) {
                            isColliding[i] = true
                            isColliding[j] = true
                        }
                    }
                }   
            }
        }   

        return isColliding

    }

}

class Collider {
    
    constructor(shape, centroid, length, width, height) {
        this.shape = shape
        this.centroid = centroid
        this.length = length
        this.width = width
        this.height = height
        this.max = Math.max(length, width, height)
    }

    transformCentroid(matrix) {
        return math.multiply(this.centroid, matrix)
    }

    transformCollider(matrix) {
        return this.centroid.ApplyMatrix4(mathToTHREE(matrix))
    }

}

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
 * Transform colliders with a given matrix
 * @param {Shape} colliders 
 * @param {matrix} matrices 
 * @returns 
 */
function transformCollider(collider, matrix) {

    // set arm transform equal to matrix
    let tempMat = mathToTHREE(matrix)

    collider.SetPosition(0, 0, 0)
    collider.SetRotation(0, 0, 0)
    collider.ApplyMatrix4(tempMat)

    return collider
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

    // console.log(colliders)

    colliders.forEach((collider) => {
        obstacles.forEach((obstacle) => {
            if (collider.GetCenter().distanceTo(obstacle.GetCenter() < 4.0)) {
                if (CheckCollision(collider, obstacle)) {
                    return true
                }
            }
        })
    })

    return false

}
