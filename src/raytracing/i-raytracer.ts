import { Color, Vector3 } from "three";

export interface IRayTracer {
    setPixel(x: number, y: number, color: number[], position: Vector3): any;
}