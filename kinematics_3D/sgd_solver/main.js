import * as THREE from 'three'
import { MapControls } from 'https://unpkg.com/three@0.146.0/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'https://unpkg.com/three@0.146.0/examples/jsm/controls/TransformControls.js'
import { GUI } from 'https://unpkg.com/three@0.146.0/examples/jsm/libs/lil-gui.module.min.js'
import { IKSolver3D } from './Solver3D.js'

const L = 50

const X_AXIS = math.matrix([
    [1, 0, 0, L],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

const Y_AXIS = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, L],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

const Z_AXIS = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, L],
    [0, 0, 0, 1]
])

const ORIGIN = math.matrix([
    [1, 0, 0, 50],
    [0, 1, 0, 50],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])


const RADII = [10, 7.5, 7.5, 5]
const AXES = ['y', 'x', 'z', 'x']
const THETAS = [Math.PI / 8, -Math.PI / 4, Math.PI / 6, Math.PI / 6]

const ikSolver3D = new IKSolver3D(AXES, RADII, THETAS, ORIGIN)
ikSolver3D.generateMats()

console.log(ikSolver3D.matrices)
console.log(ikSolver3D.forwardMats)
console.log(ikSolver3D.backwardMats)


let canvas, renderer, camera, scene, orbit

function createGround() {
    
    const groundMat = new THREE.MeshPhongMaterial({
        color: 0x00FF11,    // red (can also use a CSS color string here)
        flatShading: true,
    });
    const groundGeo = new THREE.PlaneGeometry(64, 64, 4, 4)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMesh = new THREE.Mesh(groundGeo, groundMat)
    scene.add(groundMesh)
}

function createLink(length) {

    const armMat = new THREE.MeshPhongMaterial({
        color: 0xDDDDDD,    // red (can also use a CSS color string here)
        flatShading: true,
    });

    const radiusTop = 0.5;  // ui: radiusTop
    const radiusBottom = 0.75;  // ui: radiusBottom
    const height = length;  // ui: height
    const radialSegments = 12;  // ui: radialSegments
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    geometry.translate(0, length / 2, 0) // change transform point
    const link = new THREE.Mesh(geometry, armMat)
    return link
    
}

function createArm() {

    let arm = []
    arm.push(createLink(RADII[0]))

    arm[0].rotateX(Math.PI / 4)
    scene.add(arm[0])

    for(let i = 1; i < RADII.length; i++) {
        let tempLink = createLink(RADII[i])
        tempLink.translateY(RADII[i - 1])
        arm[i - 1].add(tempLink)
        arm.push(tempLink)
    }   


    return arm

}

function init() {

    // grab canvas
    canvas = document.querySelector('#canvas');

    // renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        logarithmicDepthBuffer: true,
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xEBE2DB, 0.00003);


    // camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 5, 2000000 );
    camera.position.set(10, 10, 10);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    // map orbit
    // orbit = new MapControls(camera, canvas)
    orbit = new MapControls(camera, canvas)
    orbit.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbit.dampingFactor = 0.05;
    orbit.screenSpacePanning = false;
    orbit.minDistance = 10;
    orbit.maxDistance = 16384;
    orbit.maxPolarAngle = (Math.PI / 2) - (Math.PI / 360)

    // lighting
    const color = 0xFFFFFF;
    const intensity = 0.6;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const ambient = new THREE.AmbientLight(color, 0.3);
    scene.add(ambient);

    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

async function render() {

    // orbit.update(0.1)
    orbit.update()

    // fix buffer size
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // fix aspect ratio
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
   

    renderer.render(scene, camera);
    requestAnimationFrame(render)
}

init()
createGround()

// let link = createLink(5)
// scene.add(link)

let arm = createArm()



requestAnimationFrame(render)