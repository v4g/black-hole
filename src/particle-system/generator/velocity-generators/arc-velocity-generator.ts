import { IVectorGenerator } from "../i-particle-generator";
import { Vector3 } from "three";

/**
 * Generates velocities in an arc
 */
export class ArcVelocityGenerator implements IVectorGenerator {
    dir: Vector3;
    spread: number;
    axis: Vector3;
    min_vel: number;
    max_vel: number;

    /**
     * Sets the velocity to be random based on the following parameters
     * @param dir The direction of velocity
     * @param spread The total angle to distribute the velocities in
     * @param axis The axis around which spread angle is calculated
     * @param min The minimum magnitude of the velocity
     * @param max The maximum magnitude of the velocity
     */
    constructor(dir: Vector3, spread: number, axis: Vector3, min: number, max: number) {
        this.dir = dir;
        this.spread = spread;
        this.axis = axis;
        this.min_vel = min;
        this.max_vel = max;
    }

    generate(): Vector3 {
        if (this.min_vel == 0 && this.max_vel == 0) {
            return new Vector3();
        }
        const theta = this.spread * (Math.random() - 0.5);
        const mag = this.min_vel + Math.abs(this.max_vel - this.min_vel) * Math.random();
        const vel = this.dir.clone().applyAxisAngle(this.axis, theta);
        vel.multiplyScalar(mag);
        return vel;
    }
}
