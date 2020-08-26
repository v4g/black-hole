import { IParticle } from "../particle/particle";
import { Vector3 } from "three";
/**
 * Generates Particles. Specify your own implementation of velocity and position
 * generators to customize where this particles are generated and how fast they 
 * travel
 */
export interface IParticleGenerator {
    generate(): IParticle;
    setPosition(v: Vector3): any;
    getPosition(): Vector3;
    setParameters(mass_min: number, mass_max: number, lifeSpan: number): any;
    setVelocityGenerator(generator: IVectorGenerator): any;
    setPositionGenerator(generator: IVectorGenerator): any;
}

export interface IVectorGenerator {
    generate(): Vector3;
}

