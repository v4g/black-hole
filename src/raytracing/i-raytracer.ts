import { Color, Vector3, Vector2 } from "three";

export interface IRayTracer {
    setPixel(x: number, y: number, color: number[], position: Vector3): any;
    emitFrom(x: number, y: number): any;
    emitFromRandomPixel(): any;
    getResolution(): Vector2;
}