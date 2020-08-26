import { IVectorGenerator } from "../i-particle-generator";
import { Vector3 } from "three";

/**
 * Generates random velocities with components between 0 and 1
 */
export class PhotonVelocityGenerator implements IVectorGenerator {
    c = 299792458;
    parameter(c: number) {
        this.c = c;
    }
    generate(): Vector3 {
        const vel = new Vector3(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random());
        vel.multiplyScalar(this.c);
        return vel;
    }
}