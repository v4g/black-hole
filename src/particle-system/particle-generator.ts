import { Vector3, Scene } from "three";
import { IParticle, Particle } from "./particle-system";
import { VisibleParticle } from "./visible-particle";

export interface IParticleGenerator {
    generate(): IParticle;
    setPosition(v: Vector3): any;
    getPosition(): Vector3;
    setParameters(mass_min: number, mass_max: number, lifeSpan: number): any;
    setVelocityRandomization(dir: Vector3, spread: number, axis: Vector3, min: number, max: number): any;
}

export class ParticleGenerator implements IParticleGenerator {
    position: Vector3;
    mass_min: number;
    mass_max: number;
    vel: Vector3;
    lifespan: number;

    dir: Vector3;
    spread: number;
    axis: Vector3;
    min_vel: number;
    max_vel: number;

    
    constructor() {
        this.position = new Vector3();
        this.lifespan = 0;
        this.spread = 0;
        this.min_vel = 0;
        this.max_vel = 0;
    }
    generate(): IParticle {
        const mass = this.mass_min + Math.random() * (this.mass_max - this.mass_min);
        const particle = new Particle(mass);
        const vel = this.randomVelocity();
        particle.setVelocity(vel.x, vel.y, vel.z);
        particle.setPosition(this.getPosition().x, this.getPosition().y, this.getPosition().z);
        particle.setLifespan(this.lifespan);
        return particle;
    }
    protected randomVelocity() {
        if (this.min_vel == 0 && this.max_vel == 0) {
            return new Vector3();
        }
        const theta = this.spread * (Math.random() - 0.5);
        const mag = this.min_vel + Math.abs(this.max_vel - this.min_vel) * Math.random();
        const vel = this.dir.clone().applyAxisAngle(this.axis, theta);
        vel.multiplyScalar(mag);
        return vel;
    }
    /**
     * Sets the positions of the particle generator
     * @param v new position
     */
    setPosition(v: Vector3) {
        this.position.copy(v);
    }
    getPosition(): Vector3 {
        return this.position.clone();
    }
    setParameters(mass_min: number, mass_max: number, lifespan: number) {
        this.mass_max = mass_max;
        this.mass_min = mass_min;
        this.lifespan = lifespan;
    }
    /**
     * Sets the velocity to be random based on the following parameters
     * @param dir The direction of velocity
     * @param spread The total angle to distribute the velocities in
     * @param axis The axis around which spread angle is calculated
     * @param min The minimum magnitude of the velocity
     * @param max The maximum magnitude of the velocity
     */
    setVelocityRandomization(dir: Vector3, spread: number, axis: Vector3, min: number, max: number) {
        this.dir = dir;
        this.spread = spread;
        this.axis = axis;
        this.min_vel = min;
        this.max_vel = max;
    }

}


export class VisibleParticleGenerator extends ParticleGenerator {
    scene: Scene;
    radius: number;
    color: string;
    constructor(scene: Scene, radius = 0.3, color = "#ff0000") {
        super();
        this.radius = radius;
        this.scene = scene;
        this.color = color;
    }
    generate(): IParticle {
        const particle = super.generate();
        const visible_particle = new VisibleParticle(this.scene, "p", this.radius, this.color, particle.getMass());
        visible_particle.setVelocity(particle.getVelocity().x, particle.getVelocity().y, particle.getVelocity().z);
        visible_particle.setPosition(particle.getPosition().x, particle.getPosition().y, particle.getPosition().z);
        visible_particle.setLifespan(particle.getLifespan());
        // visible_particle.setPosition(Math.random() * 100, Math.random() * 100 , 0);
        // console.log(visible_particle.getPosition().x, visible_particle.getPosition().y, visible_particle.getPosition().z);
        return visible_particle;
    }
}

