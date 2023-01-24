import { transformLoss } from "../util/Geometry.js";
import { Solver } from "./Solver.js";
import { InverseKinematics } from "../pkg/krust.js";

export class WasmSolver extends Solver {

    constructor(axes, radii, thetas, origin, minAngles, maxAngles, collisionProvider) {

        super(axes, radii, thetas, origin)
        super.generateMats()

        let obj = collisionProvider.dump()
        let arm_colliders = obj.arm_half_extents;
        let arm_offsets = obj.arm_offsets;
        let world_colliders = obj.world_half_extents;
        let world_offsets = obj.world_offsets;

        this.wasm_solver = InverseKinematics.new(
            matrixToWasm(this._origin), 
            JSON.stringify(this._thetas), 
            axesToWasm(this._axes), 
            JSON.stringify(this._radii), 
            JSON.stringify(arm_colliders), 
            JSON.stringify(arm_offsets), 
            JSON.stringify(world_colliders), 
            JSON.stringify(world_offsets)
        )
        console.log("Created solver")
    
    }

    solve(target, thresh) {
        this.target = target
        this._thetas = JSON.parse(this.wasm_solver.solve(matrixToWasm(target),  thresh))
        super.generateMats()
        super._calculateLoss(this._endEffector)
    }

    getJoints() {
        return super.getJoints()
    }

}

// TODO: move this to a WASM util class!
function axesToWasm(axes) {

    let new_axes = []

    axes.forEach(ax => {
        switch(ax) {
            case "x" :
                new_axes.push([1,0,0])
                break;
            case "y" :
                new_axes.push([0,1,0])
                break;
            case "z" :
                new_axes.push([0,0,1])
                break;
            default:
                new_axes.push([1,0,0])
                break;
        }
    });

    return JSON.stringify(new_axes)
}

/**
 * Converts a math.matrix object to a WASM-readable array
 * @param {} in_matrix 
 * @returns 
 */
function matrixToWasm(in_matrix) {
    let dim = in_matrix.size()

    let arr = []

    for (let i = 0; i < dim[0]; i++) {
        for (let j = 0; j < dim[1]; j++) {
            arr.push(in_matrix.get([j, i]))
        }
    }

    return JSON.stringify(arr)
}