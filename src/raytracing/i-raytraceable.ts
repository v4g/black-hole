import { Vector3 } from "three";

export interface IRayTraceable {
    intersectsWithRay(from: Vector3, to: Vector3, radius: number): boolean;
}