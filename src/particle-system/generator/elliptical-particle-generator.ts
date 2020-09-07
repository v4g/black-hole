import { ParticleGenerator } from "./particle-generator";
import { TangentialVelocityGenerator } from "./velocity-generators/tangential-velocity-generator";
import { Vector3 } from "three";
import { IParticle, Particle } from "../particle/particle";
import { EllipticalPositionGenerator } from "./position-generators/elliptical-position-generator";

export class EllipticalParticleGenerator extends ParticleGenerator {
    velocity_generator: TangentialVelocityGenerator;
    position_generator: EllipticalPositionGenerator;
    center: Vector3;
    axis: Vector3;
    mag: number;
    constructor(a: number, b: number, center: Vector3, x: Vector3, y: Vector3, z: Vector3, vel: number) {
        super();
        this.velocity_generator = new TangentialVelocityGenerator();
        this.position_generator = new EllipticalPositionGenerator(a, b, center, x, y, z);
        this.center = center;
        this.axis = z;
        this.mag = vel;
        // console.log(vel);
    }
    setWidth(width: number) {
        this.position_generator.setWidth(width);
    }
    generate(): IParticle {
        const mass = this.mass_min + Math.random() * (this.mass_max - this.mass_min);
        const particle = new Particle(mass);
        const pos = this.position_generator.generate();
        this.velocity_generator.parameters(this.center, pos, this.axis);
        const vel = this.velocity_generator.generate();
        vel.multiplyScalar(this.mag);
        // particle.setVelocity(vel.x, vel.y, vel.z);
        particle.setPosition(pos.x, pos.y, pos.z);
        particle.setLifespan(this.lifespan);
        return particle;
    }
}
