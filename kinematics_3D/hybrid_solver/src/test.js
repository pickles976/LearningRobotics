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
let THETAS = [0.2886566990628971, -0.7049275159440052, 1.00318577714416, -0.25468406207327215, 2.179700577307322, 0.9332915810151338, -0.27952073760436214, -1.4061270559735584, -2.006117831803292, -0.3146089084602238]
// let AXES = ["z", "y", "y", "z", "y", "y", "z", "y", "y", "z"]
// let LENGTHS = [1, 4, 4, 4, 2, 4, 4, 1, 2, 2]
// let MIN_ANGLES = [-180,-180,-180,-180,-180,-180,-180,-180,-180,-180]
// let MAX_ANGLES = [180,180,180,180,180,180,180,180,180,180]
let obstacles = []
let scene = new THREE.Scene()

let LENGTHS = armjson.arm.map((element) => element.link.length) // x
let WIDTHS = armjson.arm.map((element) => element.link.width) // y
let HEIGHTS = armjson.arm.map((element) => element.link.height) //z 
let AXES = armjson.arm.map((element) => element.joint.axis)
let MIN_ANGLES = armjson.arm.map((element) => element.joint.minAngle * Math.PI / 180)
let MAX_ANGLES = armjson.arm.map((element) => element.joint.maxAngle * Math.PI / 180)

let collisionProvider = new CollisionProvider(armjson, obstacles)
let arm = new Arm3D(armjson, scene, collisionProvider)
let solver = new IKSolverHybrid(AXES, LENGTHS, THETAS, ORIGIN, MIN_ANGLES, MAX_ANGLES, collisionProvider)

solver.generateMats()
console.log(solver)
console.log(collisionProvider.findSelfIntersections(solver._forwardMats))

let collisions = [false, true, true, false, false, false, false, true, true, false]