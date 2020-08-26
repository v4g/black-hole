import { IForce } from "./I-force";
import { IParticle } from "../particle/particle";
import { Vector3 } from "three";

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
