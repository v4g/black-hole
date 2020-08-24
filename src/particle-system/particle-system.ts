import { Vector3 } from "three";

export interface IParticle {
    getType(): number;
    setType(type: number): number;
    getMass(): number;
    setMass(mass: number): any;
    getVelocity(): Vector3;
    getPosition(): Vector3;
    setPosition(x: number, y: number, z: number): Vector3;
    setVelocity(x: number, y: number, z: number): Vector3;
    getRadius(): number;
    getLifespan(): number;
    setLifespan(l: number): number;
    getAge(): number;
    setAge(a: number): number;
    onDeath(): any;
    update(): any;
}
export class Particle implements IParticle {
    private velocity: Vector3;
    private position: Vector3;
    private mass: number;
    private radius: number;
    private lifeSpan: number;
    private age: number;
    private type: number;
    constructor(mass = 1, radius = 1, lifespan = 0, type = 1) {
        this.velocity = new Vector3();
        this.position = new Vector3();
        this.mass = mass;
        this.radius = radius;
        this.lifeSpan = lifespan;
        this.age = 0;
        this.type = type;
    }
    getType(): number {
        return this.type;
    }
    setType(type: number): number {
        this.type = type;
        return type;
    }
    update() {
    }
    setLifespan(lifespan: number): number {
        this.lifeSpan = lifespan;
        return this.lifeSpan;
    }
    setAge(age: number): number {
        this.age = age;
        return this.age;
    }
    getLifespan(): number {
        return this.lifeSpan;
    }
    getAge(): number {
        return this.age;
    }
    getMass(): number {
        return this.mass;
    };
    setMass(m: number) {
        this.mass = m;
    }
    getVelocity(): Vector3 { return this.velocity.clone(); }
    getPosition(): Vector3 { return this.position.clone(); }
    setPosition(x: number, y: number, z: number): Vector3 {
        return this.position.set(x, y, z);
    }
    setVelocity(x: number, y: number, z: number): Vector3 {
        return this.velocity.set(x, y, z);
    };
    getRadius() {
        return this.radius;
    }
    onDeath() {

    }

}
export interface IForce {
    apply(p1: IParticle, p2: IParticle): Vector3[];
}

export class GravityForce implements IForce {
    private _G: number;
    static readonly GRAVITATION_CONSTANT = 6.67430e-11; // Value of G in m kg s
    constructor(G?: number) {
        if (G) this.G = G;
        else this.G = 1;
    }
    apply(p1: IParticle, p2: IParticle): Vector3[] {
        const r_vec = p1.getPosition().sub(p2.getPosition());
        let r = r_vec.length();
        r = r * r;
        let f1 = new Vector3();
        let f2 = new Vector3();
        if (r > 0) {
            const unit_r = r_vec.normalize();
            f1 = unit_r.clone().multiplyScalar(-this.G * p2.getMass() / (r));
            f2 = unit_r.clone().multiplyScalar(this.G * p1.getMass() / (r));
        }
        return [f1, f2];
    }
    /**
     * This method calculates the value of G for new units of distance, mass and time
     * @kg Number of Kilograms that go into the new unit of mass
     * @m Number of meters that go into the new unit of distance
     * @s Number of seconds that go into the new unit of time
     */
    static calculate(kg: number, m: number, s: number): number {
        const g = this.GRAVITATION_CONSTANT * kg * s * s / (m * m * m);
        return g;
    }
    set G(g: number) {
        this._G = g;
    }

    get G(): number {
        return this._G;
    }
}
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
    destroy() {
        this.derivative.forEach((p) => {
            p = [];
        });
        this.derivative = [];
    }
    clone(): ParticleDerivative {
        const copy = new ParticleDerivative();
        this.derivative.forEach((p, i) => {
            copy.addParticle();
            copy.add(i, p);
        });
        return copy;
    }
}
/**
 * The ParticleSystem class takes an array of particles and updates
 * them given some rules
 * These rules will be defined by the forces that act on these particles
 * which will be held in the forces array
 */
export class ParticleSystem {
    particles: Array<IParticle>;
    forces: Array<IForce>;
    derivative: ParticleDerivative;
    constructor() {
        this.particles = new Array<IParticle>();
        this.derivative = new ParticleDerivative();
        this.forces = new Array<IForce>();
    }
    addParticle(particle: IParticle) {
        this.particles.push(particle);
        this.derivative.addParticle();
    }
    removeParticle(i: number) {
        this.particles.splice(i, 1);
        this.derivative.remove(i);
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
        this.updateRK4(time_step);
        this.postUpdate();
        this.updateParticleLives(time_step);
    }

    postUpdate() {
        this.particles.forEach(p => {
            p.update();
        }, this);
    }

    /**
     * Put this in a different class that is able to do post processing on particle
     * system after it is done integrating
     * @param time_step 
     */
    updateParticleLives(time_step: number) {
        for (let i = 0; i < this.particles.length; i++) {
            let particle = this.particles[i];
            particle.setAge(particle.getAge() + time_step);
            if (particle.getLifespan() > 0 && particle.getAge() > particle.getLifespan()) {
                particle.onDeath();
                this.removeParticle(i);
            }
            if (particle.getPosition().x > 50 || particle.getPosition().y > 50
                || particle.getPosition().x < -50 || particle.getPosition().y < -50
                || particle.getPosition().z < 0 || particle.getPosition().z > 300) {
                particle.onDeath();
                this.removeParticle(i);
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
        this.calculateDerivative();
        this.derivative.scale(time_step / 2);
        // console.log('========Intermediate=======');
        // this.derivative.print();
        this.updateAllParticles();
        // console.log('--------Intermediate particle------');
        // this.print();
        this.calculateDerivative();
        this.derivative.scale(time_step);
        this.restoreState(state);
        this.updateAllParticles();
    }
    updateRK4(time_step: number) {
        const state = this.storeState();
        this.calculateDerivative();
        this.derivative.scale(time_step / 2);
        const k1 = this.derivative.clone();
        this.updateAllParticles();
        this.calculateDerivative();
        this.derivative.scale(time_step / 2);
        const k2 = this.derivative.clone();
        this.restoreState(state);
        this.updateAllParticles();
        this.calculateDerivative();
        this.derivative.scale(time_step);
        const k3 = this.derivative.clone();
        this.restoreState(state);
        this.updateAllParticles();
        this.calculateDerivative();
        this.derivative.scale(time_step);
        const k4 = this.derivative.clone();
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
    }

    calculateDerivative() {
        // clear the derivative first
        this.derivative.clear();
        this.particles.forEach((p, i) => {
            this.derivative.add(i, [p.getVelocity().x, p.getVelocity().y, p.getVelocity().z, 0, 0, 0]);
        })
        this.forces.forEach(force => {
            for (let i = 1; i < this.particles.length; i++) {
                for (let j = 0; j < i; j++) {
                    let forces = force.apply(this.particles[i], this.particles[j]);
                    this.derivative.add(i, [0, 0, 0, forces[0].x, forces[0].y, forces[0].z]);
                    this.derivative.add(j, [0, 0, 0, forces[1].x, forces[1].y, forces[1].z]);
                }
            }
        }, this);
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