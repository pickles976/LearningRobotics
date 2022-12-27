import * as THREE from 'three'
import { Vector3 } from 'three'
import { mathToTHREE } from './Geometry.js'

export class ArmViz {

    X = new THREE.Vector3(1, 0, 0)
    Y = new THREE.Vector3(0, 1, 0)
    Z = new THREE.Vector3(0, 0, 1)

    constructor(linkLengths, axes, thetas, scene) {

        this.scene = scene
        this.linkLengths = linkLengths
        this.axes = axes
        this.thetas = thetas

        this.arm = this.createArm(this.linkLengths)

    }

    createLink(length) {

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
        geometry.translate(0, 0, length / 2) // change transform point to the bottom of the link
        const link = new THREE.Mesh(geometry, armMat)
        // link.position.z = length / 2
        return link

    }

    createBase(length) {

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
        // link.position.z = length / 2
        return link

    }


    createArm(radii) {

        let arm = []
        let axesHelper = new THREE.AxesHelper(3) 
        this.scene.add(axesHelper)
        axesHelper.add(this.createBase(radii[0]))
        arm.push(axesHelper)
    
        for(let i = 1; i < radii.length; i++) {
            const axesHelper = new THREE.AxesHelper( 3 );
            // axesHelper.add(this.createLink(radii[i]))
            // this.scene.add(axesHelper)
            arm[i-1].add(this.createLink(radii[i]))
            arm[i-1].add(axesHelper)
            arm.push(axesHelper)
        } 
    
        return arm
    }

    updateMatrices(matrices) {

        for (let i = 0; i < this.arm.length; i++) {
            // set arm transform equal to matrix
            let tempMat = mathToTHREE(matrices[i])

            this.arm[i].setRotationFromMatrix(tempMat)

            this.arm[i].updateMatrix()
            
            let x = tempMat.elements[3]
            let y = tempMat.elements[7]
            let z = tempMat.elements[11]

            this.arm[i].position.set(x, y, z)
             
            this.arm[i].updateMatrix()

        }
    }
    

}