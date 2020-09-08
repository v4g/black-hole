import { Color, Vector3, Vector2, Quaternion } from "three";
import { PixelRay } from "./pixel-ray";

export interface IRayTracer {
    setPixel(x: number, y: number, color: number[], position: Vector3): any;
    emitFrom(x: number, y: number): any;
    emitFromRandomPixel(): any;
    getResolution(): Vector2;
    getDistanceToCanvas(): number;
    getPosition(): Vector3;
    getRotation(): Quaternion;
    getWidth(): number;
    getHeight(): number;
    postEmit(ray: PixelRay): any;
}