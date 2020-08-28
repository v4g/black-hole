import { Particle } from "../particle-system/particle/particle";
import { Vector2 } from "three";

export class PixelRay extends Particle {
    origin: Vector2;
    constructor(origin = new Vector2()) {
        super();
        this.origin = origin;
    }
    getOriginPixel() : Vector2 {
        return this.origin;
    }
    setOriginPixel(x: number, y: number) : any {
        this.origin.set(x, y);
    }
}