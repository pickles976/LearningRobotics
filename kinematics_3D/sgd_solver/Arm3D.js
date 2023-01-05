import * as THREE from 'three'
import { mathToTHREE, toVertices } from './Geometry.js'
import { Polygon, CheckCollision, Shape } from './modules/SATES6.js'

const COLORS = {
    'x' : 0xFFAAAA,
    'y' : 0xAAFFAA,
    'z' : 0xAAAAFF
}

export class Arm3D {

    constructor(linkLengths, axes, scene) {

        this.scene = scene
        this.linkLengths = linkLengths
        this.axes = axes

        this.arm = this.createArm(this.linkLengths, this.axes)

        this.boxHelpers = this.createBoxes()

        this.colliders = this.createColliders()
        console.log(this.colliders)

    }

    createColliders() {

        return this.boxHelpers.map((box) => {
            let verts = toVertices(box.geometry.attributes.position)
            
            let indices = box.geometry.index

            let edges = []
            for(let i = 0; i < indices.length; i + 2) {
                edges.push([indices[i], indices[i+1]])
            }

            let faces = []
            for(let i = 0; i < indices.length; i + 3) {
                faces.push([indices[i], indices[i+1], indices[i + 2]])
            }

            return new Shape(verts, edges, faces)
        })

    }

    box2Mesh(box) {
        // make a BoxBufferGeometry of the same size as Box3
        const dimensions = new THREE.Vector3().subVectors(box.max, box.min )
        const boxGeo = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z)

        // move new mesh center so it's aligned with the original object
        const matrix = new THREE.Matrix4().setPosition(dimensions.addVectors(box.min, box.max).multiplyScalar( 0.5 ))
        boxGeo.applyMatrix4(matrix)

        // make a mesh
        return new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial( { color: 0xFFFF00, wireframe: true } ))
    }

    createBoxes() {
        let boxes = this.arm.filter((link) => link.children[0])
        boxes = boxes.map((obj) => new THREE.Box3().setFromObject(obj.children[obj.children.length - 1]))
        boxes  = boxes.map((box) => this.box2Mesh(box))
        boxes.forEach((bh) => this.scene.add(bh))
        return boxes
    }

    // Create a mesh for a robotic arm Link
    createLink(length, axis) {

        const armMat = new THREE.MeshPhongMaterial({
            color: COLORS[axis],
            flatShading: true,
        });
    
        const radiusTop = 0.4;  // ui: radiusTop
        const radiusBottom = 0.6;  // ui: radiusBottom
        const height = length;  // ui: height
        const radialSegments = 12;  // ui: radialSegments
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        geometry.rotateX(Math.PI / 2)
        geometry.translate(0, 0, length / 2) // change transform point to the bottom of the link
        const link = new THREE.Mesh(geometry, armMat)
        return link

    }

    // Create a mesh for a robotic arm Base
    createBase(length, axis) {

        const armMat = new THREE.MeshPhongMaterial({
            color: 0xDDDDDD,
            flatShading: true,
        });
    
        const radiusTop = 0.5;  // ui: radiusTop
        const radiusBottom = 0.75;  // ui: radiusBottom
        const height = length;  // ui: height
        const radialSegments = 12;  // ui: radialSegments
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        geometry.rotateX(Math.PI / 2)
        geometry.translate(0, 0, -length / 2) // change transform point to the bottom of the link
        const link = new THREE.Mesh(geometry, armMat)
        return link

    }


    createArm(radii, axes) {

        let arm = []

        // create base
        let axesHelper = new THREE.AxesHelper(3)
        axesHelper.add(this.createBase(radii[0], axes[0]))
        arm.push(axesHelper)
        this.scene.add(axesHelper)
    
        // create arm links/joints
        for(let i = 1; i < radii.length; i++) {
            arm[i-1].add(this.createLink(radii[i], axes[i - 1]))

            const axesHelper = new THREE.AxesHelper( 3 );
            this.scene.add(axesHelper)
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

    // Update bounding boxes for collision detection/intersection
    updateBoundingBoxes(matrices) {

        for (let i = 0; i < this.boxHelpers.length; i++) {

            // set arm transform equal to matrix
            let tempMat = mathToTHREE(matrices[i])

            this.boxHelpers[i].setRotationFromMatrix(tempMat)

            this.boxHelpers[i].updateMatrix()

            let x = tempMat.elements[12]
            let y = tempMat.elements[13]
            let z = tempMat.elements[14]

            this.boxHelpers[i].position.set(x, y, z)
            this.boxHelpers[i].updateMatrix()
        }

    }
    

}