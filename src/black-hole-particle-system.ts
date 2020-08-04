import { ParticleSystem } from "./particle-system/particle-system";

export class BlackHoleParticleSystem extends ParticleSystem {
    calculateDerivative() {
        // clear the derivative first
        this.derivative.clear();
        this.particles.forEach((p, i) => {
            this.derivative.add(i, [p.getVelocity().x, p.getVelocity().y, p.getVelocity().z, 0, 0, 0]);
        });
        this.forces.forEach(force => {
            const j = 0; // only calculate with respect to the black hole
            for (let i = 1; i < this.particles.length; i++) {
                let forces = force.apply(this.particles[i], this.particles[j]);
                this.derivative.add(i, [0, 0, 0, forces[0].x, forces[0].y, forces[0].z]);
                this.derivative.add(j, [0, 0, 0, forces[1].x, forces[1].y, forces[1].z]);
            }
        }, this);
    }
}