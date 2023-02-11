export function identity(m) {
    let mat = []

    for (let i = 0; i < m; i++) {
        let row = []
        for (let j = 0; j < m; j++) {
            row.push(i === j ? 1 : 0)
        }
        mat.push(row)
    }

    return math.matrix(mat)
}

export function linspace(start, end, points) {

    let delta = ((end - start) / points)

    let arr = []

    for (let i = 0; i < points; i++) {
        arr.push(start + i * delta)
    }

    return arr

}

export function gaussianRandom(mean=0, stdev=1) {
    let u = 1 - Math.random(); //Converting [0,1) to (0,1)
    let v = Math.random();
    let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}