import { Vector3, Scene } from "three";
import { ScaledUnits } from "./scaled-units";
import { IParticle, Particle } from "./particle-system/particle/particle";
import { IParticleGenerator } from "./particle-system/generator/i-particle-generator";
import { ParticleSystem } from "./particle-system/particle-system";
import { ParticleGenerator } from "./particle-system/generator/particle-generator";
import { PhotonGenerator } from "./particle-system/generator/photon-generator";
/**
 * Space Particle is the particle that will revolve around the black hole
 * It will hold the visible particle clas for now to show the particle
 * But will be switched out for a particle that emits photons into the system
 */
export class SpaceParticle implements IParticle {
    particle: IParticle;
    generator: IParticleGenerator;
    ps: ParticleSystem;
    static readonly PHOTON = 1010;
    constructor(mass: number, ps: ParticleSystem, units: ScaledUnits) {
        // this.particle = new VisibleParticle(scene, "p",0.21, "#ff0000", mass);
        this.particle = new Particle(mass, 0.21);
        const photonGenerator = new PhotonGenerator();
        photonGenerator.setSpeedOfLight(units.getScaledVelocity(photonGenerator.speedOfLight));
        // this.generator = new VisibleParticleGenerator(scene, 0.1, "#ffff00", photonGenerator);
        this.generator =photonGenerator;
        this.ps = ps;
    }
    setType(type: number): number {
        return this.particle.setType(type);
    }
    getType(): number {
        return this.particle.getType();
    }
    /**
     * Generate photons
     */
    update() {
        if (Math.random() > 0.99) {
            const photon = this.generator.generate();
            const pos = this.getPosition();
            photon.setPosition(pos.x, pos.y, pos.z);
            // console.log(photon.getMass());
            this.ps.addParticle(photon);    
        }
    }
    getMass(): number {
        return this.particle.getMass();
    }
    setMass(mass: number) {
        this.particle.setMass(mass);
    }
    getVelocity(): Vector3 {
        return this.particle.getVelocity();
    }
    getPosition(): Vector3 {
        return this.particle.getPosition();
    }
    setVelocity(x: number, y: number, z: number): Vector3 {
        return this.particle.setVelocity(x, y, z);
    }
    getRadius(): number {
        return this.particle.getRadius();
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
    onDeath() {
        this.particle.onDeath();
    }
    setPosition(x: number, y: number, z:number): Vector3   {
        this.generator.setPosition(new Vector3(x, y, z));
        return this.particle.setPosition(x, y, z);

    }
}

export class SpaceParticleGenerator extends ParticleGenerator {
    scene: Scene;
    ps: ParticleSystem;
    units: ScaledUnits;
    generator: IParticleGenerator;
    constructor(scene: Scene, ps: ParticleSystem, units: ScaledUnits, generator: IParticleGenerator) {
        super();
        this.scene = scene;
        this.ps = ps;
        this.units = units;
        this.generator = generator;
    }
    setGenerator(generator: ParticleGenerator) {
        this.generator = generator;
    }
    generate(): IParticle {
        let particle: IParticle;
        if (this.generator) {
            particle = this.generator.generate();    
        } else {
            particle = super.generate();
        }

        const space_particle = new SpaceParticle(particle.getMass(), this.ps, this.units);
        const pos = particle.getPosition().add(this.position);
        space_particle.setVelocity(particle.getVelocity().x, particle.getVelocity().y, particle.getVelocity().z);
        space_particle.setPosition(pos.x, pos.y, pos.z);
        space_particle.setLifespan(particle.getLifespan());
        space_particle.setType(particle.getType());
        return space_particle;
    }
}

