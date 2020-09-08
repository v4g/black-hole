import { IRayEmitter } from "./i-ray-emitter";
import { Vector2 } from "three";

/**
 * The VariableRayEmitter will emit rays from the camera
 * in a recursive manner. It will subdivide the canvas into
 * N regions and send R rays from these regions. If some object
 * was hit by these rays, it would subdivide that region into 
 * N smaller regions and repeat
 */
class 
export class VariableRayEmitter implements IRayEmitter {
    private resolution: Vector2;
    private regions: Array<Vector2>;
    private pixelMap: Array<number>;
    private readonly N_REGION_LEN = 2;
    constructor(resolution: Vector2 ) {
        this.resolution = resolution;
        this.pixelMap = new Array<number>(resolution.x * resolution.y);
    }

    initialize() {
        const N_REGIONS = this.N_REGION_LEN * this.N_REGION_LEN;
        this.regions = new Array<Vector2>(this.N_REGION_LEN * this.N_REGION_LEN);
        for (let u = 0; u < N_REGIONS; u++) {
            let i = u % 2;
            let j = Math.floor(u / 2);
            const min = new Vector2(this.resolution.x * ( i / this.N_REGION_LEN ), this.resolution.y * (j / this.N_REGION_LEN));
            const max = new Vector2(this.resolution.x * ( (i+1) / this.N_REGION_LEN ), this.resolution.y * ((j+1) / this.N_REGION_LEN));
            this.regions.push()
        }
    }
    emitFrom(x: number, y: number) {
        throw new Error("Method not implemented.");
    }
    objectWasHit(x: number, y: number) {

    }
}