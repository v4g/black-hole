import { Particle, IParticle, ParticleSystem } from "./particle-system/particle-system";
import { SphereBufferGeometry, MeshStandardMaterial, Mesh, Vector3, PointLight, Color, Scene, MeshBasicMaterial } from "three";
import { IParticleGenerator, VisibleParticleGenerator, ParticleGenerator } from "./particle-system/particle-generator";
import { VisibleParticle } from "./particle-system/visible-particle";
import { ScaledUnits } from "./scaled-units";

/**
 * Space Particle is the particle that will revolve around the black hole
 * It will hold the visible particle clas for now to show the particle
 * But will be switched out for a particle that emits photons into the system
 */
export class SpaceParticle implements IParticle {
    particle: IParticle;
    generator: PhotonGenerator;
    ps: ParticleSystem;
    constructor(scene: Scene, mass: number, ps: ParticleSystem, units: ScaledUnits) {
        this.particle = new VisibleParticle(scene, "p",0.21, "#ff0000", mass);
        this.generator = new PhotonGenerator(scene, 0.1, "#ffff00");
        this.generator.setSpeedOfLight(units.getScaledVelocity(this.generator.speedOfLight));
        this.ps = ps;
    }
    /**
     * Generate photons
     */
    update() {
        // const photon = this.generator.generate();
        // console.log(photon.getMass());
        // this.ps.addParticle(photon);
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
    constructor(scene: Scene, ps: ParticleSystem, units: ScaledUnits, radius = 0.3, color = "#ff0000") {
        super();
        this.scene = scene;
        this.ps = ps;
        this.units = units;
    }
    generate(): IParticle {
        const particle = super.generate();
        const space_particle = new SpaceParticle(this.scene, particle.getMass(), this.ps, this.units);
        space_particle.setVelocity(particle.getVelocity().x, particle.getVelocity().y, particle.getVelocity().z);
        space_particle.setPosition(particle.getPosition().x, particle.getPosition().y, particle.getPosition().z);
        space_particle.setLifespan(particle.getLifespan());
        return space_particle;
    }
}


export class PhotonGenerator extends VisibleParticleGenerator {
    speedOfLight = 299792458;
    constructor(scene: Scene, radius = 0.3, color = "#ff0000") {
        super(scene, radius, color);
        this.mass_max = 0;
        this.mass_min = 0;
        this.lifespan = 10;
    }
    setSpeedOfLight(s: number) {
        this.speedOfLight = s;
    }
    protected randomVelocity(): Vector3 {
        const vel = new Vector3(Math.random(), Math.random(), Math.random());
        vel.normalize();
        vel.multiplyScalar(this.speedOfLight);
        return vel;
    }   
}