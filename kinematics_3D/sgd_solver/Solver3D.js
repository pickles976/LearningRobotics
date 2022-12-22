class IKSolver3D {

    constructor(axes, radii, thetas, origin) {

        this.axes = axes
        this.radii = radii
        this.thetas = thetas
        this.origin = origin

        this.matrices = []
        this.forwardMats = []
        this.backwardMats = []

        this.endEffector = null

    }

    generateMats() {

        this.matrices = []
        this.matrices.push(this.origin)

        for (let i = 0; i < this.axes.length; i++){
            this.matrices.push(mat4(this.thetas[i], this.axes[i], this.radii[i]))
        }

        this.forwardMats = []
        this.forwardMats.push(this.origin)

        // generate all the forward partial matrix products
        // [ O, O x A, O x A x B, O x A x B x C]
        for (let i = 1; i < this.matrices.length; i++){
            this.forwardMats.push(math.multiply(this.forwardMats[i - 1], this.matrices[i]))
        }

        this.backwardMats = []
        this.backwardMats.push(this.matrices[this.matrices.length - 1])

        // generate all the backwards partial matrix products
        // [E, D x E, C x D x E] -> [C x D x E, D x E, E] + [ I ]
        for (let i = 1; i < this.matrices.length; i++){
            this.backwardMats.push(math.multiply(this.matrices[this.matrices.length - i - 1], this.backwardMats[i - 1]))
        }

        this.backwardMats = this.backwardMats.reverse()
        this.backwardMats.push(IDENTITY)

        // this is really the forward pass error calculation
        this.endEffector = this.forwardMats[this.forwardMats.length - 1]
        // this.loss = this.calculateLoss(this.endEffector)

    }


}