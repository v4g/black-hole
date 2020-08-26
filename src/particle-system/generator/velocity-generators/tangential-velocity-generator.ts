import { IVectorGenerator } from "../i-particle-generator";
import { Vector3 } from "three";

/**
 * Generates unit velocities tangential to a vector 
 */
export class TangentialVelocityGenerator implements IVectorGenerator {
    center: Vector3;
    position: Vector3;
    axis: Vector3;
    /**
     * 
     * @param center The start of the vector
     * @param position The end of the vector
     * @param axis The axis perpendicular to which velocities will be generated
     */
    parameters(center: Vector3, position: Vector3, axis: Vector3) {
        this.position = position;
        this.center = center;
        this.axis = axis.normalize();
    }
    generate(): Vector3 {
        // get a perpendicular vector from the current vector
        const dir = new Vector3().subVectors(this.position, this.center).normalize();
        const vel = new Vector3().crossVectors(dir, this.axis);
        return vel;
    }
}
