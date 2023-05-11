class FKSystem {

    constructor(x,y){
        this.x = x
        this.y = y
        this.arms = []
        this.lastArm = null

        this.phase = 0
        this.speed = 0.05

    }

    addArm(length, centerAngle, rotationRange) {
        const arm = new Arm(length, centerAngle, rotationRange)
        this.arms.push(arm)

        arm.parent = this.lastArm
        this.lastArm = arm
        this.update()
    }

    update(){
        for (let i= 0; i < this.arms.length; i++){
            let arm = this.arms[i]
            arm.setPhase(this.phase)
            if(arm.parent) {
                arm.x = arm.parent.getEndX()
                arm.y = arm.parent.getEndY()
            }else{
                arm.x = this.x
                arm.y = this.y
            }
        }
        this.phase += this.speed
    }

    render(){
        for(let i =0;i<this.arms.length;i++){
            this.arms[i].render(context)
        }
    }

    rotateArm(index, angle){
        this.arms[index].angle = angle
    }

}