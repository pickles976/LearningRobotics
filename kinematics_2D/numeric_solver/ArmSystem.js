// get a list of matrics from radii and offsets
function getMatrices(radii, thetas) {

    if (radii.length != thetas.length) {
        console.log("Lengths of input arrays do not match!!!")
    }

    let matrices = []

    for (let i = 0; i < radii.length; i++) {

        const θ = thetas[i]
        const r = radii[i]

        matrices.append(math.matrix([
            [Math.cos(θ), -Math.sin(θ), r * Math.cos(θ)],
            [Math.sin(θ), Math.cos(θ), r * Math.sin(θ)],
            [0, 0, 1]
        ]))
    }

    return matrices

}

// apply an array of matrices to an origin matrix
function applyMatrices(origin, matrices) {
    
    let prevMat = origin
    let curr = {}

    for(let i = 0; i < matrices.length; i++){
        curr = math.multiply(prevMat, matrices[i])
        prevMat = matrices[i]
    }

    return curr

}

function renderMatrices(matrices, ctx) {

    let prevMat = matrices[0]

    for (let i = 0; i < matrices.length; i++){

        let currentMat = matrices[i]

        let startX = prevMat.get([0, 2])
        let startY = prevMat.get([1, 2])

        let endX = currentMat.get([0, 2])
        let endY = currentMat.get([1, 2])

        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        prevMat = currentMat

    }
}