import { Particle } from "../particle-system/particle/particle";
import { Vector2, Scene } from "three";
import { VisibleParticle } from "../particle-system/particle/visible-particle";

export class PixelRay extends VisibleParticle {
    origin: Vector2;
    constructor(scene: Scene, origin = new Vector2()) {
        // super(0);
        super(scene, "pixelRay", "#ffff00", 1, 0);
        this.origin = origin;
    }
    getOriginPixel() : Vector2 {
        return this.origin;
    }
    setOriginPixel(x: number, y: number) : any {
        this.origin.set(x, y);
    }
}