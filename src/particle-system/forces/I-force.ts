import { IParticle } from "../particle/particle";
import { Vector3 } from "three";

export interface IForce {
    apply(p1: IParticle, p2: IParticle): Vector3[];
}
