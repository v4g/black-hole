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
    /**
     * On collision of ray with particle, set the color for the 
     * rays pixel
     * Do a red-shift by dot product of the velocities 
     * If velocities are going in opposite directions, the particle
     * will be red-shifted
     * @param particle 
     */
    onCollision(particle: IParticle, ray: PixelRay) {
        let color = [16, 0, 0, 0];
        color = this.dopplerShiftColor(color, particle.getVelocity(), ray.getVelocity());
        this.raytracer.setPixel(ray.getOriginPixel().x, ray.getOriginPixel().y, color, new Vector3());                    
    }
    dopplerShiftColor(color: Array<number>, vel_particle: Vector3, vel_ray: Vector3): Array<number> {
        let dir = vel_ray.clone().normalize();
        let dot = vel_particle.dot(dir);
        let diff = dir.multiplyScalar(vel_particle.dot(dir));
        const ratio = diff.length()/vel_ray.length();
        const INCREMENTS = 16;
        // TODO should we remove color from other components. Technically the color should
        // be interpolated along the frequency spectrum
        if (dot > 0) {
            // red shift
            color[0] = Math.min(color[0] + Math.ceil(ratio * INCREMENTS), 255);
        } else {
            // blue shift
            color[2] = Math.min(color[2] + Math.ceil(ratio * INCREMENTS), 255);
        }
        return color;
    }
    update(time_step: number) {
        this.rays.forEach(r => {
            const from = r.getPosition();
            const to = r.getPosition().addScaledVector(r.getVelocity(), (time_step));
            // Collision detection logic here
            // Compare each ray the octree it is in
            const node = this.octree.findRay(from, to)
            if (node) {
                const obstacles = node.getObjects();
                obstacles.forEach(o => {
                    if (o.intersectsWithRay(from, to, r.getRadius())) {
                        r.onDeath();
                        const color = [16, 0, 0, 0];
                        // if (r.getOriginPixel().y > 24) {
                        // console.log("Collision has occured",r.getOriginPixel(), r.getPosition(), (o as Particle).getPosition());
                        // }
                        // TODO ugly code here should perhaps be overridden in another collision manager that does not take static objects
                        this.onCollision(o as any as IParticle, r);
                        // this.raytracer.setPixel(r.getOriginPixel().x, r.getOriginPixel().y, color, new Vector3());
                    }
                });
            }
        });
    }
}