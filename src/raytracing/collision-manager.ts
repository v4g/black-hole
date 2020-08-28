import { IParticle, Particle } from "../particle-system/particle/particle";
import { IRayTracer } from "./i-raytracer";
import { IRayTraceable } from "./i-raytraceable";
import { Raycaster, Color, Vector3 } from "three";
import { PixelRay } from "./pixel-ray";

/**
 * This class will manage all the collision checking between rays
 * and raytraceable particles
 * How should I build an octree
 * How should I update the octree when particles are updated. Maybe
 * call octree update when the particle's setPosition is called
 */
export class RayTracingCollisionManager {
    raytracer: IRayTracer;
    rays: Array<PixelRay>;
    obstacles: Array<IRayTraceable>;
    constructor(raytracer: IRayTracer) {
        this.raytracer = raytracer;
    }

    setRays(rays: Array<PixelRay>) {
        this.rays = rays;
    }

    setObstacles(obstacles: Array<IRayTraceable>) {
        this.obstacles = obstacles;
    }

    updateParticleInOctree(particle: IParticle) {

    }

    update(time_step: number) {
        this.rays.forEach(r => {
            const from = r.getPosition();
            const to = r.getPosition().addScaledVector(r.getVelocity(), (time_step));
            // Collision detection logic here
            // Compare each ray with the collidable particle
            this.obstacles.forEach(o => {
                // Keeping this very specific to constant colored spheres here
                // Update this to return a more complex object that contains
                // the desired color. What happens in case of refractions?
                if(o.intersectsWithRay(from, to)) {
                    const color = [255, 0, 0, 0];

                    this.raytracer.setPixel(r.getOriginPixel().x, r.getOriginPixel().y, color, new Vector3());
                }
            });
        });
    }
}