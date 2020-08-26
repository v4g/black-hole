import { IVectorGenerator } from "../i-particle-generator";
import { Vector3 } from "three";

export class FixedPositionGenerator implements IVectorGenerator {
    pos: Vector3;
    constructor(fix: Vector3) {
        this.pos = fix;
    }
    generate(): Vector3 {
        return this.pos;
    }

}