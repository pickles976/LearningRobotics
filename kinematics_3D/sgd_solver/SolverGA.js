import { findSelfIntersections, isSelfIntersecting } from "./CollisionProvider.js"
import { IDENTITY, mat4, transformLoss } from "./Geometry.js"

export class IKSolverGA {

    ROT_CORRECTION = Math.PI

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
        this._population = null

        // _matrices
        this._matrices = []
        this._forwardMats = []
        this._backwardMats = []

        // output
        this._endEffector = null
        this.target = null

        // optimization vars
        this.loss = 100.0
        this._iterations = 0

        // constraints
        this._angleConstraints = true
        this._collisionConstraints = false

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

        this._backwardMats = []
        this._backwardMats.push(this._matrices[this._matrices.length - 1])

        // generate all the backwards partial matrix products
        // [E, D x E, C x D x E] -> [C x D x E, D x E, E] + [ I ]
        for (let i = 1; i < this._matrices.length; i++){
            this._backwardMats.push(math.multiply(this._matrices[this._matrices.length - i - 1], this._backwardMats[i - 1]))
        }

        this._backwardMats = this._backwardMats.reverse()
        this._backwardMats.push(IDENTITY)

        // this is really the forward pass error calculation
        this._endEffector = this._forwardMats[this._forwardMats.length - 1]
        this.loss = this._calculateLoss(this._endEffector)

    }

    updateThetas() {
        this._population.newGeneration()
        this._thetas = this._population.alpha.thetas
    }

    update() {
        this.generateMats()
        this.updateThetas()
        this._iterations += 1
        // console.log(this.loss)
    }

    resetParams() {
        this.loss = 100.0
        this._iterations = 0
        this.initialize()
    }

    solve(target, thresh) {

        const startTime = Date.now()
        const timeout = 100

        this.resetParams()
        this.target = target

        console.log(`Running Genetic Algorithm...`)

        while (this._iterations < timeout){
            if (this.loss > thresh){
                this.update()
            }else{
                console.log(`Optimal solution found after ${this._iterations} iterations!`)
                console.log(`Elapsed Time: ${Date.now() - startTime}ms`)
                return
            }
        }

        console.log(`Could not converge in ${timeout} iterations`)

    }

    // Function passed to population
    fitness(thetas){

        // turn thetas into matrices
        let matrices = []
        matrices.push(origin)

        for (let i = 0; i < thetas.length; i++){
            matrices.push(mat4(thetas[i], this._axes[i], this._radii[i]))
        }
        
        // forward multiply
        let forwardMats = []
        forwardMats.push(this._origin)

        // generate all the forward partial matrix products
        // [ O, O x A, O x A x B, O x A x B x C]
        for (let i = 1; i < matrices.length; i++){
            forwardMats.push(math.multiply(forwardMats[i - 1], matrices[i]))
        }

        // calculate error between end effector
        let endEffector = forwardMats[forwardMats.length - 1]

        return 1 / transformLoss(endEffector, this.target, this._armLength, this.ROT_CORRECTION)
        
    }

    // calculate loss for actual arm
    _calculateLoss(actual) {

        let totalLoss = 0

        totalLoss += transformLoss(actual, this.target, this._armLength, this.ROT_CORRECTION)

        return totalLoss

    } 

    createPopulation(){
        
        let controls = {
            "minAngles": this._minAngles,
            "maxAngles": this._maxAngles,
            "mutationRate": 0.2,
            "learnRate": 1.0,
        }

        this._population = new Population(this, controls, 100, this._thetas)
    }

    getJoints() {
        return this._forwardMats.filter((mat, i) => i > 0)
    }

    initialize() {
        this.createPopulation()
    }
}

class Gene {

    constructor(controls, learnRate, parent1, parent2) {

        this.controls = controls
        this.learnRate = learnRate
        this.thetas = []

        if (parent1 !== undefined && parent2 !== undefined) {

            for(let i = 0; i < parent1.thetas.length; i++){
                this.thetas.push(Math.random() > 0.5 ? parent1.thetas[i] : parent2.thetas[i])
            }

            this.mutate()

        }

    }

    setThetas(thetas) {
        this.thetas = []
        thetas.forEach(theta => {
            this.thetas.push(theta)
        });
    }

    mutate() {
        for (let i = 0; i < this.thetas.length; i++) {
            if (Math.random() < this.controls.mutationRate) {
                // this.thetas[i] += Math.min(1.0, Math.pow(this.learnRate / 5, 2)) * Math.PI * (Math.random() - 0.5) // account for threshold
                this.thetas[i] += Math.PI * (Math.random() - 0.5) // account for threshold
                this.thetas[i] = Math.min(this.controls.maxAngles[i], Math.max(this.controls.minAngles[i], this.thetas[i])) // clamp to constraints
            }
        }
    }

}

class Population {

    constructor(solver, controls, pop, thetas, fitness) {

        this.solver = solver
        this.controls = controls

        this.pop = pop
        this.fitness = fitness

        this.generation = 0 

        this.alpha = null
        this.minErr = Infinity

        // initialize population
        this.members = []
        this.initialize(controls, thetas)

    }

    // Initialize the population
    initialize(controls, thetas) {
        for (let i = 0; i < this.pop; i++){
            const tempGene = new Gene(controls, 1.0)
            tempGene.setThetas(thetas)
            tempGene.mutate()
            this.members.push(tempGene)
        }
    }

    // generate a new generation based off of these optimization params
    newGeneration() {

        this.generation += 1

        const scores = this.getScores()
        const softMax = this.softMax(scores)

        // get member with highest score
        const index = this.argMax(scores)
        this.alpha = this.members[index]
        this.minErr = 1 / scores[index]

        let newPop = []

        // crossover mutation
        for (let i = 0; i < this.pop; i ++) {

            const p1 = this.pickParent(softMax)
            const p2 = this.pickParent(softMax)

            const tempGene = new Gene(this.controls, this.minErr, p1, p2)
            newPop.push(tempGene)

        }

        this.members = newPop

    }

    getScores() {
        // fitness function
        let scores = []

        for (let i = 0; i < this.members.length; i++ ){
            // scores.push(this.fitness(this.members[i].thetas))
            scores.push(this.solver.fitness(this.members[i].thetas))
        }

        return scores

    }

    softMax(scores) {
        const sum = scores.reduce((acc, curr) => acc + curr, 0)
        return scores.map(score => score / sum)
    }

    argMax(array) {
        return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
    }

    pickParent(scores) {

        let thresh = 0
        let rand = Math.random()

        for (let j = 0; j < this.pop; j++) {
            thresh += scores[j]
            if (thresh > rand) {
                return this.members[j]
            }
        }
    }



}