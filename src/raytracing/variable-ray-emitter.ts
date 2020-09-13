import { IRayEmitter } from "./i-ray-emitter";
import { Vector2, MixOperation, Vector3 } from "three";
import { IRayTracer } from "./i-raytracer";
import { RayTracingPhotonGenerator } from "./pin-hole-camera.";
import { PixelRay } from "./pixel-ray";

/**
 * The VariableRayEmitter will emit rays from the camera
 * in a recursive manner. It will subdivide the canvas into
 * N regions and send R rays from these regions. If some object
 * was hit by these rays, it would subdivide that region into 
 * N smaller regions and repeat
 */
export class VariableRayEmitter implements IRayEmitter {
    private resolution: Vector2;
    private regions: Array<Vector2>;
    private pixelMap: Array<number>;
    private readonly N_REGION_LEN = 4;
    private raytracer: IRayTracer;
    private generator: RayTracingPhotonGenerator;
    private MAX_EMISSIONS_FROM_PIXEL = 1;
    private rayEmittedCount: Array<number>;
    constructor(resolution: Vector2, raytracer: IRayTracer, generator: RayTracingPhotonGenerator) {
        this.resolution = resolution;
        this.pixelMap = new Array<number>(resolution.x * resolution.y);
        this.rayEmittedCount = new Array<number>(resolution.x * resolution.y);
        for (let i = 0 ; i < this.rayEmittedCount.length; i++) {
            this.rayEmittedCount[i] = 0;
        }
        this.regions = new Array<Vector2>();
        this.raytracer = raytracer;
        this.generator = generator;
        this.divideAndRassignPixels(new Vector2(0, 0), new Vector2(resolution.x, resolution.y));
    }

    emit(): PixelRay[] {
        const len = this.regions.length / 2;
        const rays = new Array<PixelRay>();
        for (let i = 0; i < len; i++) {
            const min = this.regions[i * 2];
            const max = this.regions[i * 2 + 1];
            const ray = this.emitFromRegion(min, max);
            rays.push(ray);
        }
        return rays;
    }

    test() {
        this.divideAndRassignPixels(new Vector2(0, 0), new Vector2(64, 64));
        console.log("The pixel map", this.pixelMap);
        console.log("Regions", this.regions);
    }
    divideAndRassignPixels(min: Vector2, max: Vector2) {
        const len = this.regions.length;
        const width = max.x - min.x;
        const height = max.y - min.y;
        if (width <= 1 || height <= 1)
            return;
        this.divide(min, width, height);
        for (let i = 0; i < this.N_REGION_LEN * this.N_REGION_LEN; i++) {
            let region_min = this.regions[len + (i * 2)];
            let region_max = this.regions[len + (i * 2) + 1];
            let max_x = Math.floor(region_max.x);
            for (let u = Math.floor(region_min.x); u < max_x; u++) {
                let max_y = Math.floor(region_max.y);
                for (let v = Math.floor(region_min.y); v < max_y; v++) {
                    const index = v * this.resolution.x + u;
                    this.pixelMap[index] = len + (2 * i);
                }

            }
        }
    }
    divide(offset: Vector2, width: number, height: number) {
        const N_REGIONS = this.N_REGION_LEN * this.N_REGION_LEN;
        for (let u = 0; u < N_REGIONS; u++) {
            let i = u % this.N_REGION_LEN;
            let j = Math.floor(u / this.N_REGION_LEN);
            const min = new Vector2(width * (i / this.N_REGION_LEN), height * (j / this.N_REGION_LEN));
            const max = new Vector2(width * ((i + 1) / this.N_REGION_LEN), height * ((j + 1) / this.N_REGION_LEN));
            min.add(offset);
            max.add(offset);
            this.regions.push(min);
            this.regions.push(max);
        }
    }
    emitFrom(x: number, y: number): PixelRay {
        const regions = this.getRegion(x, y);
        return this.emitFromRegion(regions[0], regions[1]);
    }
    incrementPixelCount(x: number, y: number) {
        const index = y * this.resolution.x + x;
        this.rayEmittedCount[index]++;
    }
    hasExceededRayCount(x: number, y: number): boolean {
        const index = y * this.resolution.x + x;
        const limit = this.MAX_EMISSIONS_FROM_PIXEL;
        return this.rayEmittedCount[index] > limit;
    }
    emitFromRegion(min: Vector2, max: Vector2): PixelRay {
        const u = Math.floor(min.x + Math.random() * (max.x - min.x));
        const v = Math.floor(min.y + Math.random() * (max.y - min.y));
        return this.emitFromPixel(u, v);
    }
    emitFromPixel(i: number, j: number): PixelRay {
        if (this.hasExceededRayCount(i, j)) {
            // console.log("Max count was reached");
            return null;
        
        }
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
        this.incrementPixelCount(i, j);
        return ray;
    }
    private getRegionIndex(x: number, y: number) {
        const index = y * this.resolution.x + x;
        return this.pixelMap[index];
    }
    private getRegion(x: number, y: number): Vector2[] {
        const index = this.getRegionIndex(x, y);
        const min = this.regions[index];
        const max = this.regions[index + 1];
        return [min, max];
    }
    objectWasHit(x: number, y: number) {
        // console.log("New Emissions");
        const regions = this.getRegion(x, y);
        const len = this.regions.length;
        this.divideAndRassignPixels(regions[0], regions[1]);
        for (let i = len; i < this.regions.length; i += 2) {
            const ray = this.emitFromRegion(this.regions[i], this.regions[i + 1]);
            this.raytracer.postEmit(ray);
        }
    }
}