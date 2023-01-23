/**
 * This file is for testing individual items in isolation like the
 * CollisionSolver or Matrix methods.
 */
import { Arm3D } from './util/Arm3D.js'
import { ArmJson } from './util/ArmJson.js'
import { IKSolverHybrid } from './Solver/HybridSolver.js'
import { CollisionProvider } from './util/CollisionProvider.js'
import * as THREE from 'three'

const ORIGIN = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

let armjson = ArmJson

// copied from an actual test run
let THETAS = [1.6165608842843704, -0.46143427543400467, 0.809012100772468, -0.019469167636494276, 1.7568695682192097, 0.9759448225973109, 0.10845480123758768, -1.3190962704639775, -1.7608831199691244, -1.4900014494665197]

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

let LENGTHS = armjson.arm.map((element) => element.link.length) // x
let AXES = armjson.arm.map((element) => element.joint.axis)
let MIN_ANGLES = armjson.arm.map((element) => element.joint.minAngle * Math.PI / 180)
let MAX_ANGLES = armjson.arm.map((element) => element.joint.maxAngle * Math.PI / 180)

let collisionProvider = new CollisionProvider(armjson, obstacles)
let arm = new Arm3D(armjson, scene, collisionProvider)
let solver = new IKSolverHybrid(AXES, LENGTHS, THETAS, ORIGIN, MIN_ANGLES, MAX_ANGLES, collisionProvider)

solver.generateMats()
// console.log(solver)
// console.log(collisionProvider.findObstacleIntersections(solver._forwardMats))
console.log(collisionProvider.dump())

let collisions = [false, false, false, false, false, false, true, true, false, true]