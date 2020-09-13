import { Vector2, Vector3 } from "three";
import { IParticleGenerator } from "../particle-system/generator/i-particle-generator";
import { IRayEmitter } from "./i-ray-emitter";
import { IRayTracer } from "./i-raytracer";
import { RayTracingPhotonGenerator } from "./pin-hole-camera.";
import { PixelRay } from "./pixel-ray";

export class GridEmitter implements IRayEmitter{
    resolution: Vector2;
    raytracer: IRayTracer;
    generator: RayTracingPhotonGenerator;
    constructor(raytracer: IRayTracer, resolution: Vector2, generator: RayTracingPhotonGenerator) {
        this.raytracer = raytracer;
        this.resolution = resolution;
        this.generator = generator;
    }
    emitFrom(x: number, y: number): PixelRay {
        return null;
    }
    emit(): PixelRay[] {
        const INCREMENTS = 5;
        const rays = new Array<PixelRay>();
        for (let i = this.resolution.x/4; i <= this.resolution.x/4; i+=INCREMENTS) {
            for (let j = 0; j < this.resolution.y; j+=1) {
                const ray = this.emitFromPixel(i, j);
                rays.push(ray);
            }   
        }
        return rays;
    }
    emitFromPixel(i: number, j: number): PixelRay {
        const perturbx = 0; Math.random() * 0.6 + 0.2;
        const perturby = 0; Math.random() * 0.6 + 0.2;
        const x = (i + perturbx) / this.resolution.x * this.raytracer.getWidth() - this.raytracer.getWidth() / 2;
        const y = (j + perturby) / this.resolution.y * this.raytracer.getHeight() - this.raytracer.getHeight() / 2;
        const z = this.raytracer.getDistanceToCanvas();
        // Transform this velocity by the camera's transform
        const vel = new Vector3(x, y, z);
        vel.applyQuaternion(this.raytracer.getRotation());
        this.generator.parameter(i, j, vel);
        const ray = this.generator.generate();
        ray.setPosition(this.raytracer.getPosition().x, this.raytracer.getPosition().y, this.raytracer.getPosition().z);
        return ray;
    }
    objectWasHit(x: number, y: number) {
    }

}