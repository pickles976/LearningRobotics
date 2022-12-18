class Gene {

    constructor(mutationRate, parent1, parent2) {

        this.mutationRate = mutationRate
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
                this.thetas[i] += Math.PI * (Math.random() - 0.5)
            }
        }
    }

}

class Population {

    constructor(pop, mutationRate, thetas, fitness) {

        this.pop = pop
        this.mutationRate = mutationRate
        this.fitness = fitness

        this.alpha = null

        // initialize population
        this.members = []
        this.initialize(thetas)

    }

    initialize(thetas) {
        for (let i = 0; i < this.pop; i++){
            const tempGene = new Gene(this.mutationRate)
            tempGene.setThetas(thetas)
            tempGene.mutate()
            this.members.push(tempGene)
        }
    }

    // generate a new generation based off of these optimization params
    newGeneration() {

        const scores = this.getScores()

        // get member with highest score
        this.alpha = this.members[this.argMax(scores)]

        let newPop = []

        // crossover mutation
        for (let i = 0; i < this.pop; i ++) {

            const p1 = this.pickParent(scores)
            const p2 = this.pickParent(scores)

            const tempGene = new Gene(this.mutationRate, p1, p2)
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

        // softmax scores
        const sum = scores.reduce((acc, curr) => acc + curr, 0)

        // console.log(sum)

        const softMax = scores.map(score => score / sum)

        // console.log(softMax)

        return softMax
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