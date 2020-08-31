/**
 * This class will hold a raytracing pin hole camera
 * Photons will be released from the plate on this camera
 * That will pass through its aperture
 */

import { PhotographicPlate } from "./photograph";
import { Texture, MeshBasicMaterial, Mesh, DataTexture, RGBAFormat, PlaneGeometry, Vector3, Color, Quaternion, Vector2, Scene } from "three";
import { PhotonGenerator } from "../particle-system/generator/photon-generator";
import { FixedPositionGenerator } from "../particle-system/generator/position-generators/fixed-position-generator";
import { IVectorGenerator } from "../particle-system/generator/i-particle-generator";
import { IRayTracer } from "./i-raytracer";
import { PixelRay } from "./pixel-ray";
import { IRayTracingCustomizer } from "./particle-system-raytracer";

export class RayTracer implements IRayTracer {
    private plate: PhotographicPlate;
    private image: Texture;
    private photo: MeshBasicMaterial;
    private mesh: Mesh;
    private hole: Vector3;
    private fov: number;
    private generator: RayTracingPhotonGenerator;
    private rotation: Quaternion;
    private customizer: IRayTracingCustomizer;
    private scene: Scene;
    readonly DIST_TO_PLATE = 1;
    readonly ASPECT_RATIO = 1;

    constructor(scene: Scene, hole = new Vector3(), lookAt = new Vector3(0, 0, 1), fov = Math.PI / 4, resolutionX = 100, c = 299792458) {
        this.hole = hole;
        this.createPlate(fov, resolutionX);
        this.scene = scene;
        this.image = new DataTexture(this.plate.getImage(), this.plate.resolution.x, this.plate.resolution.y, RGBAFormat);
        this.photo = new MeshBasicMaterial();
        this.photo.map = this.image;
        this.mesh = new Mesh(new PlaneGeometry(10, 10), this.photo);
        this.mesh.position.copy(this.hole);
        this.rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), lookAt.normalize());
        this.createGenerator(c);
    }
    setCustomizer(customize: IRayTracingCustomizer) {
        this.customizer = customize;
    }
    createGenerator(c: number) {
        this.generator = new RayTracingPhotonGenerator(this.scene, c);
    }
    createPlate(fov: number, res_x: number) {
        const width = 2 * this.DIST_TO_PLATE * Math.tan(fov);
        const height = this.ASPECT_RATIO * width;
        const res_y = this.ASPECT_RATIO * res_x;
        const plate = new PhotographicPlate(width, height, res_x, res_y, new Vector3(0, 0, this.DIST_TO_PLATE), new Vector3(0, 0, -1));
        this.plate = plate;
    }
    getPhoto(): Mesh {
        // return the image on the plate
        return this.mesh;
    }

    // Updates the plate by checking if any of the particles have collided
    // with the plate
    update() {
        if (this.customizer) {
            this.customizer.update();
        } this.image.needsUpdate = true;
    }
    emitPhotons() {
        for (let i = 0; i < this.plate.resolution.x; i++) {
            for (let j = 0; j < this.plate.resolution.y; j++) {
                const x = (i + 0.5) / this.plate.resolution.x * this.plate.width - this.plate.width/2;
                const y = (j + 0.5) / this.plate.resolution.y * this.plate.height- this.plate.height/2;
                const z = this.DIST_TO_PLATE;
                // Transform this velocity by the camera's transform
                const vel = new Vector3(x, y, z);
                vel.applyQuaternion(this.rotation);
                this.generator.parameter(i, j, vel);
                const ray = this.generator.generate();
                // console.log("Photon was emitted");
                ray.setPosition(this.hole.x, this.hole.y, this.hole.z);
                this.postEmit(ray);
            }
        }
    }
    postEmit(ray: PixelRay) {
        if (this.customizer) {
            this.customizer.postEmit(ray);
        }
    }
    /**
     * Callback to set the color of the pixel with this color
     * @color The color to set the pixel to
     * @position The position at which the material holding this color is
     */
    setPixel(x: number, y: number, color: number[], position: Vector3): any {
        this.plate.setPixel(x, y, color);
    }
}
export class RayTracingPhotonVelocityGenerator implements IVectorGenerator {
    dir: Vector3;
    c = 299792458;
    constructor(c = 299792458) {
        this.c = c;
    }
    parameter(dir: Vector3) {
        this.dir = dir.normalize();
    }
    generate(): Vector3 {
        const vel = this.dir.clone();
        vel.multiplyScalar(this.c);
        return vel;
    }
}
export class RayTracingPhotonGenerator {
    generator: PhotonGenerator;
    velocity_generator: RayTracingPhotonVelocityGenerator;
    x = 0;
    y = 0;
    scene: Scene;

    constructor(scene: Scene, c = 299792458) {
        this.generator = new PhotonGenerator();
        this.velocity_generator = new RayTracingPhotonVelocityGenerator(c)
        this.generator.setVelocityGenerator(this.velocity_generator);
        this.generator.setPositionGenerator(new FixedPositionGenerator(new Vector3()));
        this.scene = scene;
    }
    parameter(x: number, y: number, dir: Vector3) {
        this.x = x;
        this.y = y;
        this.velocity_generator.parameter(dir);
    }
    generate(): PixelRay {
        const baseParticle = this.generator.generate();
        const particle = new PixelRay(this.scene, new Vector2(this.x, this.y));
        particle.copy(baseParticle);
        return particle;
    }
}