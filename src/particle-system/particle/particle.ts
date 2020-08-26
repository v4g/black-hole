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
