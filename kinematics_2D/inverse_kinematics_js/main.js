let canvas = document.getElementById("canvas")
context = canvas.getContext("2d")
width = canvas.width = window.innerWidth
height = canvas.height = window.innerHeight

let mouseX = 0
let mouseY = 0

const iks = new IKSystem(width/2, height/2)
for(let i = 0; i<3;i++){
    iks.addArm(100)
}


document.body.addEventListener("mousemove", (event) => {
    mouseX = event.clientX
    mouseY = event.clientY
})

function update() {
    context.clearRect(0,0,width,height)
    iks.reach(mouseX, mouseY)
    iks.render(context)
    requestAnimationFrame(update)
}

update()