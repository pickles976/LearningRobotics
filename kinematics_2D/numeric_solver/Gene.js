class Gene {

    constructor(mutationRate, parent1, parent2) {

        this.mutationRate = mutationRate
        this.thetas = []

        if (parent1 && parent2) {

            let tempThetas = []

            for(let i = 0; i < parent1.length; i++){
                if (Math.random() > 0.5){
                    tempThetas.push(parent1.thetas[i])
                }else{
                    tempThetas.push(parent2.thetas[i])
                }
            }

            this.thetas = tempThetas
            this.mutate()

        }

    }

    setThetas(thetas) {
        this.thetas = thetas
    }

    mutate() {
        for (let i = 0; i < this.thetas.length; i++) {
            if (Math.random() < this.mutationRate) {
                this.thetas[i] += Math.PI * (Math.random() - 0.5)
            }
        }
    }

}