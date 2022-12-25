import * as THREE from 'three'
import { MapControls } from 'https://unpkg.com/three@0.146.0/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'https://unpkg.com/three@0.146.0/examples/jsm/controls/TransformControls.js'
import { GUI } from 'https://unpkg.com/three@0.146.0/examples/jsm/libs/lil-gui.module.min.js'
import { IKSolver3D } from './Solver3D.js'
import { Arm3D } from './Arm3D.js'
import { mathToTHREE, rMat3D, tMat3D } from './Geometry.js'

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
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

const tRot = 0
const c = Math.cos(tRot)
const s = Math.sin(tRot)
const x = 5
const y = 5
const z = 5

const TARGET = math.matrix([
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
])


const RADII = [10, 7.5, 7.5, 7.5, 5, 5]
const AXES = ['z', 'y', 'x', 'z', 'y', 'x']
const THETAS = [0, 0, 0, 0, 0, 0]

let canvas, renderer, camera, scene, orbit

function drawMat4(matrix) {
    const root = new THREE.Object3D();
    root.translateX(x)
    root.translateY(y)
    root.translateZ(z)

    const axesHelper = new THREE.AxesHelper( 5 );
    axesHelper.applyMatrix4(mathToTHREE(matrix))
    axesHelper.updateMatrix()

    root.add(axesHelper)
    scene.add( root )
}

function createGround() {
    
    const groundMat = new THREE.MeshPhongMaterial({
        color: 0x00FF11,    // red (can also use a CSS color string here)
        flatShading: true,
    });
    const groundGeo = new THREE.PlaneGeometry(64, 64, 4, 4)
    const groundMesh = new THREE.Mesh(groundGeo, groundMat)
    scene.add(groundMesh)
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
    camera.position.set(30, 30, 30);
    camera.up.set(0, 0, 1);
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
    solver.update()
    arm.updateThetas(solver.thetas)
    console.log(solver.endEffector)
    console.log(solver.target)

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
drawMat4(TARGET)

let arm = new Arm3D(RADII, AXES, THETAS, scene)
let solver = new IKSolver3D(AXES, RADII, THETAS, ORIGIN)
solver.target = TARGET
solver.initializeMomentums()

requestAnimationFrame(render)