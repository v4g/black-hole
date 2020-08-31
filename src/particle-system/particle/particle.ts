import { Vector3 } from "three";
import { IRayTraceable } from "../../raytracing/i-raytraceable";

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
    setRadius(r: number): number;
    getLifespan(): number;
    setLifespan(l: number): number;
    getAge(): number;
    setAge(a: number): number;
    onDeath(): any;
    isAlive(): boolean;
    update(): any;
    copy(p: IParticle): any;
}
export class Particle implements IParticle, IRayTraceable {
    private velocity: Vector3;
    private position: Vector3;
    private mass: number;
    private radius: number;
    private lifeSpan: number;
    private age: number;
    private type: number;
    private alive: boolean;
    constructor(mass = 1, radius = 1, lifespan = 0, type = 1) {
        this.velocity = new Vector3();
        this.position = new Vector3();
        this.mass = mass;
        this.radius = radius;
        this.lifeSpan = lifespan;
        this.age = 0;
        this.type = type;
        this.alive = true;
    }
    setRadius(radius: number): number {
        this.radius = radius;
        return this.radius;
    }
    isAlive(): boolean {
        return this.alive;
    }
    intersectsWithRay(from: Vector3, to: Vector3, radius: number): boolean {
        // Calculate the perpendicular distance of this line 
        // with the particle and see if it is inside the radius
        const line = new Vector3().subVectors(to, from).normalize();
        const toRadius = this.getPosition().sub(from);
        const x_proj = toRadius.dot(line);
        const proj = toRadius.sub(line.multiplyScalar(x_proj));
        if (proj.length() <= this.getRadius() + radius)
            return true;
        return false;
    }
    copy(p: IParticle) {
        this.velocity = p.getVelocity();
        this.position = p.getPosition();
        this.age = p.getAge();
        this.mass = p.getMass();
        this.radius = p.getRadius();
        this.lifeSpan = p.getLifespan();
        this.type = p.getType();
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
        this.alive = false;
    }

}
