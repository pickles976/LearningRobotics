/**
 * This file is for testing individual items in isolation like the
 * CollisionSolver or Matrix methods.
 */
import { Arm3D } from './util/Arm3D.js'
import { ArmJson } from './util/ArmJson.js'
// import { IKSolverHybrid } from './Solver/HybridSolver.js'
import { WasmSolver } from './Solver/WasmSolver.js'
import { CollisionProvider } from './util/CollisionProvider.js'
import * as THREE from 'three'
import init from "./pkg/krust.js";

const ORIGIN = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

const TARGET = math.matrix([
    [1, 0, 0, 5],
    [0, 1, 0, 5],
    [0, 0, 1, 5],
    [0, 0, 0, 1]
])

let armjson = ArmJson
let obstacles = []
let scene = new THREE.Scene()

function generateObstacles() {

    obstacles = []

    function makeWall() {
        const mat = new THREE.MeshPhongMaterial({
            color: "#999999",
            flatShading: true,
        });

        const length = 10
        const width = 1
        const height = 4

        const geometry = new THREE.BoxGeometry(length, width, height)
        geometry.translate(0, 0, height / 2) // change transform point to the bottom of the link
        return new THREE.Mesh(geometry, mat)
    }

    let wall1 = makeWall()
    wall1.geometry.translate(0, 5, 0)
    obstacles.push(wall1)
    scene.add(wall1)

    let wall2 = makeWall()
    wall2.geometry.translate(0, 5, 8)
    obstacles.push(wall2)
    scene.add(wall2)

}

generateObstacles()

let THETAS = armjson.arm.map((element) => (element.joint.minAngle + element.joint.maxAngle) * Math.PI / 360)
let LENGTHS = armjson.arm.map((element) => element.link.length) // x
let AXES = armjson.arm.map((element) => element.joint.axis)
let MIN_ANGLES = armjson.arm.map((element) => element.joint.minAngle * Math.PI / 180)
let MAX_ANGLES = armjson.arm.map((element) => element.joint.maxAngle * Math.PI / 180)

let collisionProvider = new CollisionProvider(armjson, obstacles)
let arm = new Arm3D(armjson, scene, collisionProvider)

await init() // initialize WASM package

let solver = new WasmSolver(AXES, LENGTHS, THETAS, ORIGIN, MIN_ANGLES, MAX_ANGLES, collisionProvider)

solver.solve(TARGET, 0.00001)

