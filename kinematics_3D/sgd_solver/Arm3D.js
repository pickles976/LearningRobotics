import * as THREE from 'three'

export class Arm3D {

    X = new THREE.Vector3(1, 0, 0)
    Y = new THREE.Vector3(0, 1, 0)
    Z = new THREE.Vector3(0, 0, 1)

    constructor(linkLengths, axes, thetas, scene) {

        this.scene = scene
        this.linkLengths = linkLengths
        this.axes = axes
        this.thetas = thetas
        this.arm = this.createArm(linkLengths)
        this.updateThetas(thetas)

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
        geometry.translate(0, length / 2, 0) // change transform point to the bottom of the link
        const link = new THREE.Mesh(geometry, armMat)
        return link
        
    }

    createArm(radii) {

        let arm = [] 
        arm.push(this.createLink(radii[0]))
        this.scene.add(arm[0])
    
        for(let i = 1; i < radii.length; i++) {
            let tempLink = this.createLink(radii[i])
            tempLink.translateY(radii[i - 1]) // put the bottom of the next link at the top of the previous link
            arm[i - 1].add(tempLink)
            arm.push(tempLink)
        } 

        const axesHelper = new THREE.AxesHelper( 3 );
        axesHelper.translateY(radii[radii.length - 1])
        arm[arm.length - 1 ].add( axesHelper );
    
        return arm
    }

    updateThetas(thetas) {
        this.thetas = thetas

        for (let i = 0; i < this.arm.length; i++) {
            this.rotateOnAxis(this.arm[i], this.axes[i], this.thetas[i])
        }
    }

    rotateOnAxis(object, axis, theta) {

        let rotAx = null

        switch (axis) {
            case 'x':
                rotAx = this.X
                break
            case 'y':
                rotAx = this.Y
                break
            case 'z':
                rotAx = this.Z
                break
            default:
                break
        }

        object.setRotationFromAxisAngle(rotAx, theta)
    }
    

}