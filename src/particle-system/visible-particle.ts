import { IParticle, Particle } from "./particle-system";
import { SphereBufferGeometry, MeshBasicMaterial, Mesh, Scene, Vector3, PointLight } from "three";

export class VisibleParticle implements IParticle {

    name: string;
    geometry: SphereBufferGeometry;
    material: MeshBasicMaterial;
    mesh: Mesh;
    particle: Particle;
    color: string;
    scene: Scene;
    constructor(scene: Scene, name: string, radius: number, color: string, mass?: number) {
        this.name = name;
        this.geometry = new SphereBufferGeometry(radius);
        //color to be replaced with texture
        this.material = new MeshBasicMaterial({ color });
        this.mesh = new Mesh(this.geometry, this.material);
        this.particle = new Particle(mass, radius);
        this.color = color;
        this.scene = scene;
        this.scene.add(this.mesh);
    }
    setType(type: number): number {
        return this.particle.setType(type);
    }
    getType(): number {
        return this.particle.getType();
    }
    update() {
    }
    getLifespan(): number {
        return this.particle.getLifespan();
    }
    setLifespan(l: number): number {
        return this.particle.setLifespan(l);
    }
    getAge(): number {
        return this.particle.getAge();
    }
    setAge(a: number): number {
        return this.particle.setAge(a);
    }
    position(v?: Vector3) {
        if (v !== undefined)
            this.mesh.position.copy(v);
        return this.mesh.position.clone();
    }
    setMass(m: number) { this.particle.setMass(m) };
    getMass(): number { return this.particle.getMass() };
    getVelocity(): Vector3 { return this.particle.getVelocity(); };
    getPosition(): Vector3 { return this.position() };
    setPosition(x: number, y: number, z: number): Vector3 {
        const pos = this.position(new Vector3(x, y, z));
        return pos;
    };
    setVelocity(x: number, y: number, z: number): Vector3 {
        const vel = this.particle.setVelocity(x, y, z);
        return vel;
    }
    getRadius(): number {
        return this.particle.getRadius();
    }
    destroy() {
        this.geometry.dispose();
        this.material.dispose();
    }
    addLightSource(color: string) {
        // this.material.emissive = new Color(this.color);
        let light = new PointLight(color);
        this.mesh.add(light);
    }
    onDeath() {
        this.scene.remove(this.mesh);
        this.destroy();
    }
}