import { IKSolver3D } from "./solver/Solver3D.js"
import { ArmJson } from "./util/ArmJson.js"
import { CollisionProvider } from "./util/CollisionProvider.js"

const THETAS = [0, 0, 0]
const AXES = ['x', 'x', 'x']
const RADII = [2, 2, 2]

const ORIGIN = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
])

const TARGET = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 3],
    [0, 0, 1, 3],
    [0, 0, 0, 1]
])

let arm = ArmJson["arm"]

let HEIGHTS = arm.map((element) => element.link.length) //z 
let WIDTHS = arm.map((element) => element.link.width) // y
let LENGTHS = arm.map((element) => element.link.height) // x


let collisionProvider = new CollisionProvider(LENGTHS, WIDTHS, HEIGHTS)

