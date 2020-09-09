import { ParticleSystem, ParticleDerivative } from "./particle-system/particle-system";
import { SpaceParticle } from "./space-particle";
import { Vector3 } from "three";
import { TimeProfile } from "./boilerplate/time-profile";
import { TimeProfiler } from "./boilerplate/time-profiler";

export class BlackHoleParticleSystem extends ParticleSystem {
    eventHorizon = Number.POSITIVE_INFINITY;
    private myprofiler = new TimeProfiler();
    setEventHorizon(schwarzchildRadius: number) {
        this.eventHorizon = schwarzchildRadius;

    }
    calculateDerivative(derivative: ParticleDerivative): ParticleDerivative {
        // clear the derivative first
        this.particles.forEach((p, i) => {
            const vel = p.getVelocity();
            derivative.set(i, [vel.x, vel.y, vel.z, 0, 0, 0]);
        });
        this.forces.forEach(force => {
            const j = 0; // only calculate with respect to the black hole
            for (let i = 1; i < this.particles.length; i++) {
                // TODO
                // Only update photons until we figure out how to update particles in Octree
                if (this.particles[i].getType() == SpaceParticle.PHOTON) {
                    let forces = force.apply(this.particles[i], this.particles[j]);
                    derivative.add(i, [0, 0, 0, forces[0].x, forces[0].y, forces[0].z]);
                    derivative.add(j, [0, 0, 0, forces[1].x, forces[1].y, forces[1].z]);
                }
            }
        }, this);

        return derivative;
    }
    updateAllParticles() {
        this.particles.forEach((particle, i) => {
            if (this.particles[i].getType() == SpaceParticle.PHOTON) {
                const d = this.derivative.get(i);
                const pos = particle.getPosition();
                const v = particle.getVelocity();
                particle.setPosition(pos.x + d[0], pos.y + d[1], pos.z + d[2]);
                particle.setVelocity(v.x + d[3], v.y + d[4], v.z + d[5]);
            }
        }, this);
    }
    updateHook() {
        const len = this.particles.length;
        for (let i = len - 1; i > 0; i--) {
            const hole = this.particles[0];
            const vec = new Vector3().subVectors(hole.getPosition(), this.particles[i].getPosition());
            if (vec.length() < this.eventHorizon) {
                this.particles[i].onDeath();
                this.removeParticle(i);
            }
        }
    }
}