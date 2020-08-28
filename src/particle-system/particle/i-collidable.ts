import { Box3, Sphere } from "three";

export interface ICollidable {
    collidesWith(object: ICollidable): boolean;
    // getBoundingBox(): Box3;
    getBoundingSphere(): Sphere;
}