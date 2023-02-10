/**
 * F - state transition matrix (just a derivative)
 * H - sensor transition model (xk = Hxk-1) (like F but for sensors and only for guessing)
 * B - control matrix (like F but for controls input)
 * Q - external noise matrix
 * R - sensor covariance matrix (Like P but for sensor)
 * P - Probability/covariance matrix for state estimation (describes the variance of gaussian for which X represents the mean)
 * u - control vector (our controls input)
 * x - state estimate
 * z - measurement mean (sensor measurement, assumed to be mean with cov of R)
 * K - kalman gain, comes from expected sensor measurements (Hk and xk guess) and real measurements(zk and Rk)
 * These means/variance are used to compute gaussians which are multiplied to form a new gaussian with a more accurate guessing area.
 * This new gaussian is K
 */
export class KalmanFilter {
    constructor(F, H, Q, R, x0) {
        this.n = F._size[1]
        this.m = H._size[1]

        this.F = F
        this.H = H

        this.B = 0

        this.Q = Q === undefined ? identity(this.n) : Q
        this.R = R === undefined ? identity(this.n) : R

        this.P = identity(this.n)
        this.x = x0 === undefined ? math.zeros(this.n, 1) : x0
    }

    // prediction step
    // x = Fx + Bu
    // P = FPFT + Q
    predict(u) {
        this.x = math.add(math.multiply(this.F, this.x), math.multiply(this.B, u === undefined ? 0 : u))
        this.P = math.add(math.multiply(math.multiply(this.F, this.P), math.transpose(this.F)), this.Q)
        return this.x
    }

    // update step
    // K = PHT(HPHT + R)-1  *update kalman gain for estimation and measured sensor vals*
    // x = x + K(z - Hx) *update estimate with measurement*
    // P = (I - KH)P(I-KH)T + KRKT *update estimate uncertainty* (idk where this derivation comes from yet)
    update(z) {
        let Y = math.subtract(z, math.multiply(this.H, this.x))
        let S = math.add(this.R, math.multiply(this.H, math.multiply(this.P, math.transpose(this.H))))
        let K = math.multiply(math.multiply(this.P, math.transpose(this.H)), math.inv(S))
        this.x = math.add(this.x, math.multiply(K, Y))
        let I = identity(this.n)

        // I - KH
        let IKH = math.subtract(I, math.multiply(K, this.H))
        let KRKT = math.multiply(math.multiply(K, this.R), math.transpose(K))

        // P = (I-KH)P(I-KH)T + KRKT
        this.P = math.add(math.multiply(math.multiply(IKH, this.P), math.transpose(IKH)), KRKT)
    }
}

function identity(m) {
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