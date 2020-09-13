import { Vector2 } from "three";
import { IParticle } from "../particle-system/particle/particle";
import { IRayEmitter } from "./i-ray-emitter";

export class GridMaker {
    // This method will trace vertically by sampling points in a line
    // And then interpolating the results. Emit rays from the camera
    // in a vertical line and see where they end up. Then interpolate these points
    grid: Array<Vector2>;
    resolution: Vector2;
    emitter: IRayEmitter;
    traceVertically() {
        const INCREMENTS = 10;
        for (let i = 0; i < this.resolution.x; i+=INCREMENTS) {
            for (let j = 0; j < this.resolution.y; j+=INCREMENTS) {
                const ray = this.emitter.emitFrom(i, j);
                ray.onHit = (p: IParticle) : any => {
                    this.onHit(p, ray);    
                };
            }   
        }
    }
    onHit(particle: IParticle, ray: IParticle) {
        
    }
}