import { IParticle, ParticleDerivative } from "./particle-system/particle-system";
import { Vector3, TorusBufferGeometry } from "three";
import { SpaceParticle } from "./space-particle";

/**
 * This class will take a photograph of the scene on a plane
 * Particles can interact with the photographic plate. Whenever they
 * intersect the plate, a certain color with intensity would be added to 
 * the plate
 */
export class Photograph {
    plate: PhotographicPlate;
    constructor(plate: PhotographicPlate) {
        this.plate = plate;
    }
    getPhoto() {
        // return the image on the plate
    }

    // Updates the plate by checking if any of the particles have collided
    // with the plate
    update(particles: Array<IParticle>) {
        particles.forEach(p => {
            if (p.getType() == SpaceParticle.PHOTON) {
                const from = p.getPosition();
                const to = new Vector3().addVectors(p.getPosition(), p.getVelocity());
                const intersection = this.plate.intersectsWithPlate(from, to);
                if (intersection.x != Number.POSITIVE_INFINITY) {
                    console.log("Intersected at", intersection.x, intersection.y, intersection.z);
                }
            }
        });
    }
}

export class PhotographicPlate {
    width: number;
    height: number;
    position: Vector3;
    normal: Vector3; // The normal to the plane in the direction of the object
    constructor(width = 1.0, height = 1.0, position = new Vector3(), normal = new Vector3(0, 0, 1)) {
        this.width = width;
        this.height = height;
        this.position = position;
        this.normal = normal.normalize();
    }
    /**
     * Returns the point at which this plate intersected with the Line
     * Returns inf, inf if it didn't intersect
     */
    intersectsWithPlate(from: Vector3, to: Vector3): Vector3 {
        let intersection = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        // Calculate if both of these points are on either side of the plane
        // If they are, the ratio of their normals give the ratios on either side
        // of the plane
        const line = new Vector3().subVectors(to, from);
        const dot = line.dot(this.normal);
        const planeTo1 = new Vector3().subVectors(from, this.position);
        const dot1 = planeTo1.dot(this.normal);
        const planeTo2 = new Vector3().subVectors(to, this.position);
        const dot2 = planeTo2.dot(this.normal);
        // This check makes sure that dot1 and dot2 are opposite signs 
        if (dot1 * dot2 > 0) {
            // both points on the same side, intersection not possible
            return intersection;
        }
        if (dot1 == 0) {
            return from;
        } else if (dot2 == 0) {
            return to;
        }
        // both points on opposite sides, calculate their normal projections ratio
        // and divide the line between them in the same ratio (similar triangles)
        const ratio = Math.abs(dot1) / Math.abs(dot2);
        intersection = from.add(line.multiplyScalar(ratio));

        //Make sure this intersection is inside the plane
        const dimensions = new Vector3().subVectors(intersection, this.position);
        if (Math.abs(dimensions.x) > this.width || Math.abs(dimensions.y) > this.height) {
            intersection.set(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        }
        return intersection;
    }
}