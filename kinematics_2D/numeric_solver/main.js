let canvas = document.getElementById("canvas")
context = canvas.getContext("2d")
width = canvas.width = window.innerWidth
height = canvas.height = window.innerHeight


const ORIGIN = math.matrix([
    [1, 0, width/2],
    [0, 1, height/2],
    [0, 0, 1]
])

theta1 = 0

let fullArm = []

arm.forEach(link => {

    let parent = (fullArm.length > 0) ? fullArm[fullArm.length - 1] : null
    fullArm.push(new Arm(link[0], 0, parent))

});

fullArm[0].updateOrigin(ORIGIN)

function update() {
    context.clearRect(0,0,width,height)
    
    // fks.update()
    theta1 += 0.01

    fullArm.forEach(link => {
        link.update(theta1)
        link.render(context)
    })

 
    requestAnimationFrame(update)
}

update()