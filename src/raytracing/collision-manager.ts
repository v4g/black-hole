import { IParticle, Particle } from "../particle-system/particle/particle";
import { IRayTracer } from "./i-raytracer";
import { IRayTraceable } from "./i-raytraceable";
import { Raycaster, Color, Vector3 } from "three";
import { PixelRay } from "./pixel-ray";
import { Octree } from "./collisions/octree";

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
    octree: Octree;
    counter = 0
    time_taken = 0;
    constructor(raytracer: IRayTracer) {
        this.raytracer = raytracer;
    }

    setRays(rays: Array<PixelRay>) {
        this.rays = rays;
    }

    setObstacles(obstacles: Array<IRayTraceable>) {
        this.obstacles = obstacles;
        this.octree = new Octree(this.obstacles, new Vector3(-50, -50, -50), new Vector3(50, 50, 50), 4, 10);
    }

    updateParticleInOctree(particle: IParticle) {

    }

    update(time_step: number) {
        const time_before = new Date().getTime();
        this.rays.forEach(r => {
            const from = r.getPosition();
            const to = r.getPosition().addScaledVector(r.getVelocity(), (time_step));
            // Collision detection logic here
            // Compare each ray the octree it is in
            const node = this.octree.findRay(from, to)
            if (node) {
                const obstacles = node.getObjects();
                // if (obstacles.length > 3) {
                // console.log("Comparing with %s objects", obstacles.length);                
                // }
                obstacles.forEach(o => {
                    if (o.intersectsWithRay(from, to, r.getRadius())) {
                        r.onDeath();
                        const color = [16, 0, 0, 0];
                        // if (r.getOriginPixel().y > 24) {
                            // console.log("Collision has occured",r.getOriginPixel(), r.getPosition(), (o as Particle).getPosition());
                        // }
                        this.raytracer.setPixel(r.getOriginPixel().x, r.getOriginPixel().y, color, new Vector3());
                    }
                });
            }
            // this.obstacles.forEach(o => {
            //     // Keeping this very specific to constant colored spheres here
            //     // Update this to return a more complex object that contains
            //     // the desired color. What happens in case of refractions?
            //     if (o.intersectsWithRay(from, to, r.getRadius())) {
            //         r.onDeath();
            //         if (r.getOriginPixel().y > 24) {
            //             console.log("Collision has occured", r.getPosition(), (o as Particle).getPosition());

            //         }
            //         const color = [16, 0, 0, 0];
            //         // console.log("Collision has occured", r.getOriginPixel());
            //         this.raytracer.setPixel(r.getOriginPixel().x, r.getOriginPixel().y, color, new Vector3());
            //     }
            // });
        });
        this.time_taken += (new Date().getTime() - time_before);
        this.counter++;
        if (this.counter > 10000) {
            console.log("Time Taken ", this.time_taken);
            this.time_taken = 0;
            this.counter = 0;
        }
    }
}