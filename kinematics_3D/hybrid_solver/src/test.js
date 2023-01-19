/**
 * This file is for testing individual items in isolation like the
 * CollisionSolver or Matrix methods.
 */
import { WasmSolver } from "./solver/WasmSolver.js"
import { IDENTITY } from "./util/Geometry.js"
import init from "./pkg/krust.js";

await init()

const THETAS = [0, 0, 0, 0, 0, 0]
const AXES = ["x", "x", "x", "x", "x", "x"]
const RADII = [2, 2, 2, 2, 2, 2]

const TARGET = math.matrix([
    [1, 0, 0, 0],
    [0, 1, 0, 4],
    [0, 0, 1, 5],
    [0, 0, 0, 1]
])

let start = Date.now();
let wasmSolver = new WasmSolver(AXES, RADII, THETAS, IDENTITY)
wasmSolver.solve(TARGET)
console.log(`Elapsed time: ${Date.now() - start}`)