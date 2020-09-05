import { PixelRay } from "./pixel-ray";
import { ParticleSystem } from "../particle-system/particle-system";
import { RayTracingCollisionManager } from "./collision-manager";
import { IRayTracer } from "./i-raytracer";
import { IRayTraceable } from "./i-raytraceable";

export interface IRayTracingCustomizer {
    postEmit(ray: PixelRay): any;
    update(): any;
}
/**
 * Let's try a plug and play approach instead of extending the main ray-tracer
 * That way we don't have to override any of its existing methods, keeping things
 * simple.
 * However, we don't get total access to the super class, but only at certain points
 * and with certain variables
 */
export class ParticleSystemCustomizer implements IRayTracingCustomizer {
    private particleSystem: ParticleSystem;
    private rays: Array<PixelRay>;
    private collisionManager: RayTracingCollisionManager;
    raytracer: IRayTracer;
    private time_step: number;
    constructor(ps: ParticleSystem, raytracer: IRayTracer, obstacles: Array<IRayTraceable>, time_step: number) {
        this.rays = new Array<PixelRay>();
        this.particleSystem = ps;
        this.collisionManager = new RayTracingCollisionManager(raytracer);
        this.collisionManager.setRays(this.rays);
        this.time_step = time_step;
        this.collisionManager.setObstacles(obstacles)
        this.raytracer = raytracer;
    }
    postEmit(ray: PixelRay): any {
        this.particleSystem.addParticle(ray);
        this.rays.push(ray);
    }
    setTimeStep(time_step: number) {
        this.time_step = time_step;
    }
    update() {
        // this is not good. This needs to be managed somewhere else
        const len = this.rays.length;
        for (let i = len - 1; i >= 0; i--) {
            const ray = this.rays[i];
            if (!ray.isAlive()) {
                this.rays.splice(i, 1);
                this.raytracer.emitFrom(ray.getOriginPixel().x, ray.getOriginPixel().y);                    
                // this.raytracer.emitFromRandomPixel();     
                // this.particleSystem.printCOunt();           
            }
        }
        // console.log("No. of rays ", this.rays.length);
        this.collisionManager.update(this.time_step);
    }

}