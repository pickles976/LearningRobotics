import * as THREE from 'three'
import { MapControls } from 'https://unpkg.com/three@0.146.0/examples/jsm/controls/OrbitControls.js'
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


const RADII = [100, 75, 75, 50]
const AXES = ['z', 'x', 'y', 'x']
const THETAS = [Math.PI / 8, -Math.PI / 4, Math.PI / 6, Math.PI / 6]

const ikSolver3D = new IKSolver3D(AXES, RADII, THETAS, ORIGIN)
ikSolver3D.generateMats()

console.log(ikSolver3D.matrices)
console.log(ikSolver3D.forwardMats)
console.log(ikSolver3D.backwardMats)


let canvas, renderer, camera, scene, controls

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

    // map controls
    controls = new MapControls(camera, canvas)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 16384;
    controls.maxPolarAngle = (Math.PI / 2) - (Math.PI / 360)


    // lighting
    const color = 0xFFFFFF;
    const intensity = 0.6;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const ambient = new THREE.AmbientLight(color, 0.3);
    scene.add(ambient);

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

    // controls.update(0.1)
    controls.update()

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

requestAnimationFrame(render)