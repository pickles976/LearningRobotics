import { transformLoss } from "../util/Geometry.js";
import { Solver } from "./Solver.js";
import { InverseKinematics } from "../pkg/krust.js";

export class WasmSolver extends Solver {

    constructor(axes, radii, thetas, origin, minAngles, maxAngles, collisionProvider) {

        super(axes, radii, thetas, origin)
        super.generateMats()

        // TODO: do something with collision provider
        this.wasm_solver = InverseKinematics.new(matrixToWasmArray(this._origin), this._thetas, this._axes, this._radii)
    }

    solve(target, thresh) {
        this.target = target
        this._thetas = this.wasm_solver.solve(matrixToWasmArray(target),  thresh)
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