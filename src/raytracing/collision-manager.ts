import { IParticle, Particle } from "../particle-system/particle/particle";
import { IRayTracer } from "./i-raytracer";
import { IRayTraceable } from "./i-raytraceable";
import { Raycaster, Color, Vector3, Vector2 } from "three";
import { PixelRay } from "./pixel-ray";
import { Octree } from "./collisions/octree";

/**
 * This class will manage all the collision checking between rays
 * and raytraceable particles
 * How should I update the octree when particles are updated. Maybe
 * call octree update when the particle's setPosition is called
 */
export class RayTracingCollisionManager {
    raytracer: IRayTracer;
    rays: Array<PixelRay>;
    obstacles: Array<IRayTraceable>;
    octree: Octree;
    bg: BackgroundImage;
    constructor(raytracer: IRayTracer) {
        this.raytracer = raytracer;
        this.bg = new BackgroundImage(this.raytracer.getResolution().x, this.raytracer.getResolution().y, 1);
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
        let color = [200, 0, 0, 0];
        color = this.dopplerShiftColor(color, particle.getVelocity(), ray.getVelocity());
        this.raytracer.setPixel(ray.getOriginPixel().x, ray.getOriginPixel().y, color, new Vector3());
        this.raytracer.objectWasHit(ray.getOriginPixel().x, ray.getOriginPixel().y);
    }
    dopplerShiftColor(color: Array<number>, vel_particle: Vector3, vel_ray: Vector3): Array<number> {
        let dir = vel_ray.clone().normalize();
        let dot = vel_particle.dot(dir);
        let diff = dir.multiplyScalar(vel_particle.dot(dir));
        const ratio = diff.length() / vel_ray.length();
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
            if (from.z < -45) {
                const prob = 1;// / (this.raytracer.getResolution().x);
                const x = this.raytracer.getResolution().x / 2 + Math.floor(from.x / 100 * this.raytracer.getResolution().x);
                const y = this.raytracer.getResolution().y / 2 + Math.floor(from.y / 100 * this.raytracer.getResolution().y);
                if (Math.random() < prob && this.bg.shouldFill(x, y)) {
                    r.onDeath();
                    let variability = 0; //-64 + Math.floor(Math.random() * 128);
                    let color = [128 + variability, 128 + variability, 128 + variability, 0];
                    this.raytracer.setPixel(r.getOriginPixel().x, r.getOriginPixel().y, color, new Vector3());
                }
            } else {
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

            }
        });
    }
}

class BackgroundImage {
    private dimensions: Vector2;
    private pixels: Array<number>;
    constructor(x: number, y: number, fill: number) {
        this.pixels = new Array<number>(x * y);
        this.dimensions = new Vector2(x, y);
        this.assign(fill * (x * y));
    }
    // private assign(fill: number) {
    //     let filled = 0;
    //     console.log(fill);
    //     while (filled < fill) {
    //         let pixel = Math.floor(Math.random() * this.pixels.length);
    //         this.pixels[pixel] = 1;
    //         filled++;
    //     }
    // }
    private assign(fill: number) {
        const INCREMENTS = 7;
        for (let i = 0; i < this.dimensions.x; i++) {
            for (let j = 0; j < this.dimensions.y; j++) {
                if (i % INCREMENTS == 0 || j % INCREMENTS == 0) {
                    const index = j * this.dimensions.x + i;
                    this.pixels[index] = 1;

                }
            }
        }
    }
    shouldFill(x: number, y: number): boolean {
        const index = y * this.dimensions.x + x;
        if (this.pixels[index] == 1)
            return true;
        return false;
    }
}