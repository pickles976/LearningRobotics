class Gene {

    constructor(mutationRate, learnRate, parent1, parent2) {

        this.mutationRate = mutationRate
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
            if (Math.random() < this.mutationRate) {
                // TODO: learn rate decay mechanism?
                // this.thetas[i] += Math.min(1.0, Math.pow(this.learnRate, 2)) * Math.PI * (Math.random() - 0.5)
                // this.thetas[i] += Math.min(1.0, this.learnRate) * Math.PI * (Math.random() - 0.5)
                // this.thetas[i] += Math.PI * (Math.random() - 0.5)
                this.thetas[i] += Math.min(1.0, Math.pow(this.learnRate / 5, 2)) * Math.PI * (Math.random() - 0.5) // account for threshold
            }
        }
    }

}

class Population {

    constructor(pop, mutationRate, thetas, fitness) {

        this.pop = pop
        this.mutationRate = mutationRate
        this.fitness = fitness

        this.generation = 0 

        this.alpha = null
        this.minErr = Infinity

        // initialize population
        this.members = []
        this.initialize(thetas)

    }

    initialize(thetas) {
        for (let i = 0; i < this.pop; i++){
            const tempGene = new Gene(this.mutationRate, 1.0)
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

            const tempGene = new Gene(this.mutationRate, this.minErr, p1, p2)
            newPop.push(tempGene)

        }

        this.members = newPop

    }

    getScores() {
        // fitness function
        let scores = []

        for (let i = 0; i < this.members.length; i++ ){
            scores.push(this.fitness(this.members[i].thetas))
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