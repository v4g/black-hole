import { Particle, IParticle, ParticleSystem } from "./particle-system/particle-system";
import { SphereBufferGeometry, MeshStandardMaterial, Mesh, Vector3, PointLight, Color, Scene, MeshBasicMaterial } from "three";
import { IParticleGenerator, VisibleParticleGenerator, ParticleGenerator, EllipticalParticleGenerator, PhotonVelocityGenerator } from "./particle-system/particle-generator";
import { VisibleParticle } from "./particle-system/visible-particle";
import { ScaledUnits } from "./scaled-units";

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
    constructor(scene: Scene, mass: number, ps: ParticleSystem, units: ScaledUnits) {
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
    constructor(scene: Scene, ps: ParticleSystem, units: ScaledUnits, generator: IParticleGenerator,  radius = 0.3, color = "#ff0000") {
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

        const space_particle = new SpaceParticle(this.scene, particle.getMass(), this.ps, this.units);
        const pos = particle.getPosition().add(this.position);
        space_particle.setVelocity(particle.getVelocity().x, particle.getVelocity().y, particle.getVelocity().z);
        space_particle.setPosition(pos.x, pos.y, pos.z);
        space_particle.setLifespan(particle.getLifespan());
        space_particle.setType(particle.getType());
        return space_particle;
    }
}


export class PhotonGenerator extends ParticleGenerator {
    speedOfLight = 299792458;
    constructor() {
        super();
        this.velocity_generator = new PhotonVelocityGenerator();
        this.mass_max = 0;
        this.mass_min = 0;
        this.lifespan = 0;
    }
    generate(): IParticle {
        const particle = super.generate();
        particle.setType(SpaceParticle.PHOTON);
        return particle;
    }
    setSpeedOfLight(s: number) {
        this.speedOfLight = s;
        const vel = new PhotonVelocityGenerator();
        this.velocity_generator = vel;
        vel.parameter(s);
    }
    protected randomVelocity(): Vector3 {
        const vel = new Vector3(Math.random(), Math.random(), Math.random());
        vel.normalize();
        vel.multiplyScalar(this.speedOfLight);
        return vel;
    }   
}