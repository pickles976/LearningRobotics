import { mat4 } from "./Geometry.js"
import { IKSolver3D } from "./Solver3D.js"
import { IKSolverGA } from "./SolverGA.js"

export class IKSolverHybrid {

    SGD_THRESH = 0.000001
    GA_THRESH = 0.01

    constructor(axes, radii, thetas, origin, minAngles, maxAngles, colliders) {

        // physical traits
        this._axes = axes
        this._radii = radii
        this._thetas = thetas
        this._origin = origin

        // constraints
        this._minAngles = minAngles
        this._maxAngles = maxAngles
        this._armLength = this._radii.reduce((acc, curr) => acc + curr, 0)
        this._colliders = colliders

        // _matrices
        this._matrices = []
        this._forwardMats = []

        // output
        this._endEffector = null
        this.target = null

        // solvers
        this._ikSolverSGD = new IKSolver3D(this._axes, this._radii, this._thetas, this._origin, this._minAngles, this._maxAngles, this._colliders)
        this._ikSolverGA = new IKSolverGA(this._axes, this._radii, this._thetas, this._origin, this._minAngles, this._maxAngles, this._colliders)

    }

    solve(target) {

        const startTime = Date.now()

        console.log(`Running hybrid solver...`)

        // rough solution via GA
        this._ikSolverGA.solve(target, this.GA_THRESH)

        // fine tune with SGD
        this._ikSolverSGD._thetas = this._ikSolverGA._thetas 
        this._ikSolverSGD.solve(target, this.SGD_THRESH)
        this._thetas = this._ikSolverSGD._thetas

        // generate matrices
        this.generateMats()

        console.log(`Hybrid solver finished in: ${Date.now() - startTime}ms`)

    }

    generateMats() {

        this._matrices = []
        this._matrices.push(this._origin)

        for (let i = 0; i < this._axes.length; i++){
            this._matrices.push(mat4(this._thetas[i], this._axes[i], this._radii[i]))
        }

        this._forwardMats = []
        this._forwardMats.push(this._origin)

        // generate all the forward partial matrix products
        // [ O, O x A, O x A x B, O x A x B x C]
        for (let i = 1; i < this._matrices.length; i++){
            this._forwardMats.push(math.multiply(this._forwardMats[i - 1], this._matrices[i]))
        }

        // this is really the forward pass error calculation
        this._endEffector = this._forwardMats[this._forwardMats.length - 1]

    }

    getJoints() {
        return this._forwardMats.filter((mat, i) => i > 0)
    }

}