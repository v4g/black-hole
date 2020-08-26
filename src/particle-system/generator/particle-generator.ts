import { Vector3 } from "three";
import { IParticleGenerator, IVectorGenerator } from "./i-particle-generator";
import { FixedPositionGenerator } from "./position-generators/fixed-position-generator";
import { RandomVelocityGenerator } from "./velocity-generators/random-velocity-generator";
import { IParticle, Particle } from "../particle/particle";

/**
 * Generates Particles. Specify your own implementation of velocity and position
 * generators to customize where this particles are generated and how fast they 
 * travel
 * TODO: Implement the same to generate lifespans and other particle properties
 */
export class ParticleGenerator implements IParticleGenerator {
    position: Vector3;
    mass_min: number;
    mass_max: number;
    lifespan: number;
    velocity_generator: IVectorGenerator;
    position_generator: IVectorGenerator;

    constructor() {
        this.position = new Vector3();
        this.lifespan = 0;
        this.position_generator = new FixedPositionGenerator(this.position);
        this.velocity_generator = new RandomVelocityGenerator();
    }
    setVelocityGenerator(generator: IVectorGenerator) {
        this.velocity_generator = generator;
    }
    setPositionGenerator(generator: IVectorGenerator) {
        this.position_generator = generator;
    }
    generate(): IParticle {
        const mass = this.mass_min + Math.random() * (this.mass_max - this.mass_min);
        const particle = new Particle(mass);
        const vel = this.velocity_generator.generate();
        const pos = this.position_generator.generate();
        particle.setVelocity(vel.x, vel.y, vel.z);
        particle.setPosition(pos.x, pos.y, pos.z);
        particle.setLifespan(this.lifespan);
        return particle;
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
}



