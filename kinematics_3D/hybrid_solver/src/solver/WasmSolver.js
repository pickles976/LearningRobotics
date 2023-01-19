import { solve_gd } from "../pkg/krust.js";
import { transformLoss } from "../util/Geometry.js";
import { Solver } from "./Solver.js";

export class WasmSolver extends Solver {

    constructor(axes, radii, thetas, origin) {
        super(axes, radii, thetas, origin)
        super.generateMats()
    }

    solve(target) {
        this.target = target
        this._thetas = solve_gd(matrixToWasmArray(this.target), matrixToWasmArray(this._origin), this._thetas, this._axes, this._radii)
        super.generateMats()
        super._calculateLoss(this._endEffector)
    }

    getJoints() {
        return super.getJoints()
    }

}

// TODO: move this to a WASM util class!
/**
 * Converts a math.matrix object to a WASM-readable array
 * @param {} in_matrix 
 * @returns 
 */
function matrixToWasmArray(in_matrix) {
    let dim = in_matrix.size()

    let arr = []

    for (let i = 0; i < dim[0]; i++) {
        for (let j = 0; j < dim[1]; j++) {
            arr.push(in_matrix.get([j, i]))
        }
    }

    return arr
}