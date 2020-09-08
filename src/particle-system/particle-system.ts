import { IParticle } from "./particle/particle";
import { IForce } from "./forces/I-force";
import { Vector3 } from "three";
import { TimeProfiler } from "../boilerplate/time-profiler";

/**
 * Holds the derivative of a quantity
 * We should be able to specify the TYPE of a derivative explicitly instead of assuming
 * it will always be 6 numbers. 
 * TODO: make this generic
 */
export class ParticleDerivative {
    derivative: Array<Array<number>>;
    constructor() {
        this.derivative = new Array<Array<number>>();
    }
    length(): number {
        return this.derivative.length;
    }
    addParticle() {
        this.derivative.push(new Array<number>(0, 0, 0, 0, 0, 0));
    }
    add(i: number, items: Array<number>) {
        // Could this be faster?
        for (let j = 0; j < items.length; j++)
            this.derivative[i][j] += items[j];
    }
    remove(i: number) {
        this.derivative.splice(i, 1);
    }
    clear() {
        for (let i = 0; i < this.derivative.length; i++)
            for (let j = 0; j < this.derivative[i].length; j++) {
                this.derivative[i][j] = 0;
            }
    }
    set(i: number, items: Array<number>) {
        for (let j = 0; j < items.length; j++)
            this.derivative[i][j] = items[j];

    }
    scale(n: number) {
        for (let i = 0; i < this.derivative.length; i++)
            for (let j = 0; j < this.derivative[i].length; j++) {
                this.derivative[i][j] *= n;
            }
    }
    get(i: number): Array<number> {
        return this.derivative[i];
    }
    print() {
        this.derivative.forEach((p, i) => {
            console.log("Particle " + i);
            console.log("Velocity ", p[0], p[1], p[2]);
            console.log("Acceleration ", p[3], p[4], p[5]);

        }, this);
    }
    printCount() {
        console.log(this.derivative.length);
    }
    destroy() {
        this.derivative.forEach((p) => {
            p = [];
        });
        this.derivative = [];
    }
    clone(cache?: ParticleDerivative): ParticleDerivative {
        if (cache) {
            return this.cacheClone(cache);
        }
        const copy = new ParticleDerivative();
        this.derivative.forEach((p, i) => {
            copy.addParticle();
            copy.add(i, p);
        });
        return copy;
    }
    /**
     * Hoping that this would speed up cloning by just copying and
     * not having to allocate
     * Causes a marginal improvement (15%)
     * @param cache An already allocated array
     */
    cacheClone(cache: ParticleDerivative): ParticleDerivative {
        this.derivative.forEach((p, i) => {
            cache.add(i, p);
        });
        return cache;
    }
}
/**
 * The ParticleSystem class takes an array of particles and updates
 * them given some rules
 * These rules will be defined by the forces that act on these particles
 * which will be held in the forces array
 */
export class ParticleSystem {
    protected particles: Array<IParticle>;
    forces: Array<IForce>;
    protected derivative: ParticleDerivative;
    private minBounds: Vector3;
    private maxBounds: Vector3;
    private profiler: TimeProfiler;
    private derivativeCaches: Array<ParticleDerivative>;
    constructor() {
        this.particles = new Array<IParticle>();
        this.derivative = new ParticleDerivative();
        this.forces = new Array<IForce>();
        this.profiler = new TimeProfiler();
        this.createCaches();
    }
    createCaches() {
        this.derivativeCaches = new Array<ParticleDerivative>(4);
        for (let u = 0; u < 4; u++) {
            this.derivativeCaches[u] = new ParticleDerivative();
        }
    }
    addParticle(particle: IParticle) {
        this.particles.push(particle);
        this.derivative.addParticle();
        this.derivativeCaches.forEach(c => {
            if (this.derivative.length() > c.length()) c.addParticle();
        })
    }
    removeParticle(i: number) {
        this.particles.splice(i, 1);
        this.derivative.remove(i);
        // Not removing from the caches unless needed
    }
    printCOunt() {
        console.log("Particle Count %s Derivative count %s", this.particles.length, this.derivative.length());

    }
    addForce(force: IForce) {
        this.forces.push(force);
    }
    /**
     * Will calculate the derivative of the particles motion and updates them
     * according to the integration method (Midpoint, RK, Euler etc)
     * @param time_step The step by which to advance the system
     */
    update(time_step: number) {
        this.profiler.start("RK4", 1000);
        // this.updateRK4(time_step);
        this.updateMidPoint(time_step);
        this.profiler.stop("RK4", 1000);
        this.updateHook();
        this.postUpdate();
        this.updateParticleLives(time_step);
        this.boundsCheck();
    }
    updateHook() {

    }

    postUpdate() {
        const len = this.particles.length;
        for (let i = 0; i < len; i++) {
            let index = len - i - 1;
            let p = this.particles[index];
            p.update();
            if (!p.isAlive()) {
                this.removeParticle(index);
            }
        }
    }
    setBounds(min: Vector3, max: Vector3) {
        this.minBounds = min;
        this.maxBounds = max;
    }

    /**
     * Put this in a different class that is able to do post processing on particle
     * system after it is done integrating
     * @param time_step 
     */
    updateParticleLives(time_step: number) {
        const len = this.particles.length;
        for (let i = len - 1; i >= 0; i--) {
            let particle = this.particles[i];
            particle.setAge(particle.getAge() + time_step);
            if (particle.getLifespan() > 0 && particle.getAge() > particle.getLifespan()) {
                particle.onDeath();
                this.removeParticle(i);
            }
        }
    }

    boundsCheck() {
        if (this.minBounds && this.maxBounds) {
            const len = this.particles.length;
            for (let i = len - 1; i >= 0; i--) {
                let particle = this.particles[i];
                if (particle.getPosition().x > this.maxBounds.x || particle.getPosition().y > this.maxBounds.y
                    || particle.getPosition().x < this.minBounds.x || particle.getPosition().y < this.minBounds.y
                    || particle.getPosition().z < this.minBounds.z || particle.getPosition().z > this.maxBounds.z) {
                    particle.onDeath();
                    this.removeParticle(i);
                }
            }
        }
    }


    storeState(): Array<Array<number>> {
        const state = new Array<Array<number>>();
        this.particles.forEach((particle, i) => {
            const pos = particle.getPosition();
            const v = particle.getVelocity();
            state.push(new Array<number>(pos.x, pos.y, pos.z, v.x, v.y, v.z));
        }, this);
        return state;
    }
    restoreState(state: Array<Array<number>>) {
        this.particles.forEach((particle, i) => {
            particle.setPosition(state[i][0], state[i][1], state[i][2]);
            particle.setVelocity(state[i][3], state[i][4], state[i][5]);
        }, this);
    }
    updateMidPoint(time_step: number) {
        const state = this.storeState();
        this.derivative = this.calculateDerivative(this.derivative);
        this.derivative.scale(time_step / 2);
        // console.log('========Intermediate=======');
        // this.derivative.print();
        this.updateAllParticles();
        // console.log('--------Intermediate particle------');
        // this.print();
        this.derivative = this.calculateDerivative(this.derivative);
        this.derivative.scale(time_step);
        this.restoreState(state);
        this.updateAllParticles();
    }
    updateRK4(time_step: number) {
        const oldDerivative = this.derivative;
        this.profiler.start("PS : StoreState", 1000);
        const state = this.storeState();
        this.derivativeCaches[0] = this.calculateDerivative(this.derivativeCaches[0]);
        this.derivativeCaches[0].scale(time_step / 2);
        const k1 = this.derivativeCaches[0];
        this.derivative = k1;
        this.updateAllParticles();
        this.derivativeCaches[1] = this.calculateDerivative(this.derivativeCaches[1]);
        this.derivativeCaches[1].scale(time_step / 2);
        const k2 = this.derivativeCaches[1];
        this.derivative = k2;
        this.restoreState(state);
        this.updateAllParticles();
        this.derivativeCaches[2] = this.calculateDerivative(this.derivativeCaches[2]);
        this.derivativeCaches[2].scale(time_step);
        const k3 = this.derivativeCaches[2];
        this.derivative = k3;
        this.restoreState(state);
        this.updateAllParticles();
        this.derivativeCaches[3] = this.calculateDerivative(this.derivativeCaches[3]);
        this.derivativeCaches[3].scale(time_step);
        const k4 = this.derivativeCaches[3];
        this.profiler.stop("PS : StoreState", 1000);
        this.profiler.start("PS : RestoreState", 1000);
        this.derivative = k4;
        this.restoreState(state);
        k1.scale(1 / 3);
        this.derivative = k1;
        this.updateAllParticles();
        k2.scale(2 / 3);
        this.derivative = k2;
        this.updateAllParticles();
        k3.scale(1 / 3);
        this.derivative = k3;
        this.updateAllParticles();
        k4.scale(1 / 6);
        this.derivative = k4;
        this.updateAllParticles();
        this.derivative = oldDerivative;
        this.profiler.stop("PS : RestoreState", 1000);
        
    }

    calculateDerivative(derivative: ParticleDerivative): ParticleDerivative {
        // clear the derivative first
        derivative.clear();
        this.particles.forEach((p, i) => {
            derivative.add(i, [p.getVelocity().x, p.getVelocity().y, p.getVelocity().z, 0, 0, 0]);
        })
        this.forces.forEach(force => {
            for (let i = 1; i < this.particles.length; i++) {
                for (let j = 0; j < i; j++) {
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
            const d = this.derivative.get(i);
            const pos = particle.getPosition();
            const v = particle.getVelocity();
            particle.setPosition(pos.x + d[0], pos.y + d[1], pos.z + d[2]);
            particle.setVelocity(v.x + d[3], v.y + d[4], v.z + d[5]);
        }, this);
    }

    print() {
        console.log("----Particle System-----");

        this.particles.forEach((particle, i) => {
            console.log("--------------------------");
            const pos = particle.getPosition();
            const v = particle.getVelocity();
            console.log("Particle " + i);
            console.log("Mass ", particle.getMass());
            console.log("Position ", pos.x, pos.y, pos.z);
            console.log("Velocity ", v.x, v.y, v.z);
        }, this);
        console.log("------------X-----------");

    }

    printDerivative() {
        this.derivative.print();
    }

    destroy() {
        this.particles = [];
        this.forces = [];
        this.derivative.destroy();
    }

}