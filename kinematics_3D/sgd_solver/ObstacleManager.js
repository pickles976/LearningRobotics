import { ShapeFromGeometry } from 'SAT'

export class ObstacleManager {

    constructor(scene, obstacles) {
        this.scene = scene
        this.obstacles = obstacles 

        this.obstacles.forEach((obs) => this.scene.add(obs))
        
        this.colliders = this.generateColliders(obstacles)
    }

    generateColliders(obstacles) {
        return obstacles.map((obs) => ShapeFromGeometry(obs.geometry))
    }

    cleanup() {
        this.obstacles.forEach((obs) => this.scene.remove(obs))
    }

}