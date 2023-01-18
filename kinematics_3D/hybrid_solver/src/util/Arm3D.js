import * as THREE from 'three'
import { mathToTHREE } from './Geometry.js'
import { ShapeFromGeometry } from 'SAT'
import { findSelfIntersections } from './CollisionProvider.js'

const COLORS = {
    'x' : 0xFFAAAA,
    'y' : 0xAAFFAA,
    'z' : 0xAAAAFF,
    true: 0xFF0000,
    false: 0xFFFF00,
}

export class Arm3D {

    constructor(linkLengths, axes, scene, collisionProvider) {

        this._scene = scene
        this._linkLengths = linkLengths
        this._axes = axes

        this.arm = this._createArm(this._linkLengths, this._axes)

        // for drawing bounding boxes around arms
        this._boxHelpers = this._createBoxes()

        // used for detecting and drawing self-intersections
        this._collisionProvider = collisionProvider
        this._isColliding = []

        this.drawColliders = true

    }

    // Turn a bounding box into a drawable mesh
    _bbox2Mesh(box) {
        // make a BoxBufferGeometry of the same size as Box3
        const dimensions = new THREE.Vector3().subVectors(box.max, box.min )
        const boxGeo = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z)

        // move new mesh center so it's aligned with the original object
        const matrix = new THREE.Matrix4().setPosition(dimensions.addVectors(box.min, box.max).multiplyScalar( 0.5 ))
        boxGeo.applyMatrix4(matrix)

        // make a mesh
        return new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial( { color: 0xFFFF00, wireframe: true } ))
    }

    // Create bounding boxes and convert them into meshes
    _createBoxes() {
        let boxes = this.arm.filter((link) => link.children[0])
        boxes = boxes.map((obj) => new THREE.Box3().setFromObject(obj.children[obj.children.length - 1]))
        boxes  = boxes.map((box) => this._bbox2Mesh(box))
        boxes.forEach((bh) => this._scene.add(bh))
        return boxes
    }

    // Create a mesh for a robotic arm Link
    _createLink(length, axis) {

        const armMat = new THREE.MeshPhongMaterial({
            color: COLORS[axis],
            flatShading: true,
        });
    
        // TODO: load the width values from json
        const geometry = new THREE.CylinderGeometry(0.4, 0.6, length, 12)
        geometry.rotateX(Math.PI / 2)
        geometry.translate(0, 0, length / 2) // change transform point to the bottom of the link
        return new THREE.Mesh(geometry, armMat)
    }

    // Create a mesh for a robotic arm Base
    _createBase(length, axis) {

        const armMat = new THREE.MeshPhongMaterial({
            color: 0xDDDDDD,
            flatShading: true,
        });
    
        const geometry = new THREE.CylinderGeometry(0.5, 0.75, length, 12)
        geometry.rotateX(Math.PI / 2)
        geometry.translate(0, 0, -length / 2) // change transform point to the bottom of the link
        return new THREE.Mesh(geometry, armMat)
    }


    _createArm(radii, axes) {

        let arm = []

        // create base
        let axesHelper = new THREE.AxesHelper(3)
        axesHelper.add(this._createBase(radii[0], axes[0]))
        arm.push(axesHelper)
        this._scene.add(axesHelper)
    
        // create arm links/joints
        for(let i = 1; i < radii.length; i++) {
            arm[i-1].add(this._createLink(radii[i], axes[i - 1]))

            const axesHelper = new THREE.AxesHelper( 3 );
            this._scene.add(axesHelper)
            arm.push(axesHelper)
        } 
    
        return arm
    }

    // update arm from transform matrices
    updateMatrices(matrices) {

        for (let i = 0; i < this.arm.length; i++) {

            // set arm transform equal to matrix
            let tempMat = mathToTHREE(matrices[i])

            this.arm[i].setRotationFromMatrix(tempMat)

            this.arm[i].updateMatrix()

            let x = tempMat.elements[12]
            let y = tempMat.elements[13]
            let z = tempMat.elements[14]

            this.arm[i].position.set(x, y, z)
            this.arm[i].updateMatrix()
        }
    }

    // Update bounding boxes for visualizing collision detection/intersection
    updateBoundingBoxes(matrices) {

        // determine whether or not to draw boxes
        this._boxHelpers.forEach((bh) => bh.visible = this.drawColliders)

        for (let i = 0; i < this._boxHelpers.length; i++) {

            // set arm transform equal to matrix
            let tempMat = mathToTHREE(matrices[i])

            this._boxHelpers[i].setRotationFromMatrix(tempMat)

            this._boxHelpers[i].updateMatrix()

            let x = tempMat.elements[12]
            let y = tempMat.elements[13]
            let z = tempMat.elements[14]

            this._boxHelpers[i].position.set(x, y, z)
            this._boxHelpers[i].updateMatrix()

            this._boxHelpers[i].material.color.setHex(COLORS[this._isColliding[i]])
        }

    }

    // update the position of the colliders and the collision status
    updateColliders(matrices) {

        this._isColliding = findSelfIntersections(this.collisionProvider.getColliders(), matrices)

    }

    /**
     * Clean up the Three.js objects belonging to this arm from the _scene.
     */
    cleanup() {
        this.arm.forEach((element) => this._scene.remove(element))
        this._boxHelpers.forEach((element) => this._scene.remove(element))
    }

    showColliders(bool) {

        this.drawColliders = bool

    }
    

}