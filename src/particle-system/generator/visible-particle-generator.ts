import { ParticleGenerator } from "./particle-generator";
import { Scene } from "three";
import { IParticleGenerator } from "./i-particle-generator";
import { IParticle } from "../particle/particle";
import { VisibleParticle } from "../particle/visible-particle";

export class VisibleParticleGenerator extends ParticleGenerator {
    scene: Scene;
    radius: number;
    color: string;
    generator: IParticleGenerator
    constructor(scene: Scene, radius = 0.3, color = "#ff0000", generator = new ParticleGenerator()) {
        super();
        this.radius = radius;
        this.scene = scene;
        this.color = color;
        this.generator = generator;
    }
    generate(): IParticle {
        const particle = this.generator.generate();
        const visible_particle = new VisibleParticle(this.scene, "p", this.color, this.radius, particle.getMass());
        visible_particle.setVelocity(particle.getVelocity().x, particle.getVelocity().y, particle.getVelocity().z);
        visible_particle.setPosition(particle.getPosition().x, particle.getPosition().y, particle.getPosition().z);
        visible_particle.setLifespan(particle.getLifespan());
        visible_particle.setType(particle.getType());
        // visible_particle.setPosition(Math.random() * 100, Math.random() * 100 , 0);
        // console.log(visible_particle.getPosition().x, visible_particle.getPosition().y, visible_particle.getPosition().z);
        return visible_particle;
    }
}

