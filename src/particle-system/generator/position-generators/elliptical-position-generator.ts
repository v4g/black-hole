import { IVectorGenerator } from "../i-particle-generator";
import { Matrix4, Vector3 } from "three";

/**
 * Generates positions as defined by an ellipse of certain width
 */
export class EllipticalPositionGenerator implements IVectorGenerator {
    transformMatrix = new Matrix4();
    transformMatrixInv = new Matrix4();
    A: number;
    B: number;
    width = 0;
    constructor(A: number, B: number, C?: Vector3, x?: Vector3, y?: Vector3, z?: Vector3) {
        this.A = A;
        this.B = B;
        if (x !== undefined && y !== undefined && z !== undefined) {
            this.transformMatrix.makeBasis(x, y, z);
            this.transformMatrix.transpose();
        }
        if (C) {
            C.applyMatrix4(this.transformMatrixInv.getInverse(this.transformMatrix));
            this.transformMatrix.setPosition(C);
        }
        this.transformMatrixInv.getInverse(this.transformMatrix);
    }
    setWidth(width: number) {
        this.width = width;
    }
    generate(): Vector3 {
        const pos = new Vector3();
        var theta = Math.PI * 2 * Math.random();
        // Would still be three coordinate axes
        var position = new Vector3((this.A + this.width * Math.random()) * Math.cos(theta),
            (this.width * Math.random() + this.B) * Math.sin(theta));
        position.applyMatrix4(this.transformMatrixInv);
        return position;
    }
}
