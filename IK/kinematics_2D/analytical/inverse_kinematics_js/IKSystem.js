class IKSystem {

    constructor(x,y){
        this.x = x
        this.y = y
        this.arms = []
        this.lastArm = null
    }

    addArm(length){
        let arm = new Arm(0,0,length,0)
        if(this.lastArm){
            arm.x = this.lastArm.getEndX()
            arm.y = this.lastArm.getEndY()
            arm.parent = this.lastArm
        }else{
            arm.x = this.x
            arm.y = this.y
        }

        this.arms.push(arm)
        this.lastArm = arm

    }

    render(context){
        for(let i = 0; i<this.arms.length; i++){
            this.arms[i].render(context)
        }
    }

    drag(x,y){
        this.lastArm.drag(x,y)
    }

    reach(x, y){
        this.drag(x, y)
        this.update()

    }

    update(){
        for (let i= 0; i < this.arms.length; i++){
            let arm = this.arms[i]
            if(arm.parent) {
                arm.x = arm.parent.getEndX()
                arm.y = arm.parent.getEndY()
            }else{
                arm.x = this.x
                arm.y = this.y
            }
        }
    }

    
}