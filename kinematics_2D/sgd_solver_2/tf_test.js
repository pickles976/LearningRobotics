
function createMatrix(theta, radius) {

    const cos = Math.cos(theta)
    const sin = Math.sin(theta)

    return tf.tensor2d([
        [cos, -sin, radius * cos],
        [sin, cos, radius * sin],
        [0, 0, 1]
    ])

}

tensor1 = createMatrix(0, 1)
tensor2 = createMatrix(Math.PI / 4, 50)
tensor3 = tf.matMul(tensor1, tensor2)
tensor3.print()