import { ParticleGenerator } from "./particle-generator";
import { PhotonVelocityGenerator } from "./velocity-generators/photon-velocity-generator";
import { IParticle } from "../particle/particle";
import { SpaceParticle } from "../../space-particle";
import { Vector3 } from "three";

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
        particle.setRadius(1);
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