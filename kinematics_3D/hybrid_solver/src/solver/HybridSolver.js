import { mat4 } from "../util/Geometry.js"
import { Solver } from "./Solver.js"
import { IKSolver3D } from "./Solver3D.js"
import { IKSolverGA } from "./SolverGA.js"

export class IKSolverHybrid extends Solver {

    SGD_THRESH = 0.00001
    GA_THRESH = 0.1

    constructor(axes, radii, thetas, origin, minAngles, maxAngles, colliders) {

        super(axes, radii, thetas, origin, minAngles, maxAngles, colliders)

        // solvers
        this._ikSolverSGD = new IKSolver3D(this._axes, this._radii, this._thetas, this._origin, this._minAngles, this._maxAngles, this._colliders)
        this._ikSolverGA = new IKSolverGA(this._axes, this._radii, this._thetas, this._origin, this._minAngles, this._maxAngles, this._colliders)

    }

    generateMats() {
        super.generateMats()
    }

    solve(target) {

        const startTime = Date.now()

        console.log(`Running hybrid solver...`)

        // rough solution via GA
         this._ikSolverGA.solve(target, this.GA_THRESH)

        // Fine-tune with SGD
        this._ikSolverSGD._thetas = this._ikSolverGA._thetas 
        this._ikSolverSGD.solve(target, this.SGD_THRESH)
        this._thetas = this._ikSolverSGD._thetas

        // generate matrices
        this.generateMats()

        console.log(`Hybrid solver finished in: ${Date.now() - startTime}ms`)

    }

    getJoints() {
        return super.getJoints()
    }

}