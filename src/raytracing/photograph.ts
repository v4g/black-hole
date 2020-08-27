import { Vector3, Quaternion, Vector2, Texture, DataTexture, Mesh, MeshBasicMaterial, PlaneGeometry, RGBAFormat } from "three";
import { SpaceParticle } from "../space-particle";
import { IParticle } from "../particle-system/particle/particle";

/**
 * This class will take a photograph of the scene on a plane
 * Particles can interact with the photographic plate. Whenever they
 * intersect the plate, a certain color with intensity would be added to 
 * the plate
 */
export class Photograph {
    plate: PhotographicPlate;
    image: Texture;
    photo: MeshBasicMaterial;
    mesh: Mesh;
    constructor(plate: PhotographicPlate) {
        this.plate = plate;
        this.image = new DataTexture(this.plate.getImage(), plate.resolution.x, plate.resolution.y, RGBAFormat);
        this.photo = new MeshBasicMaterial();
        this.photo.map = this.image;
        this.mesh = new Mesh(new PlaneGeometry(10, 10), this.photo);
    }
    getPhoto(): Mesh {
        // return the image on the plate
        return this.mesh;
    }

    // Updates the plate by checking if any of the particles have collided
    // with the plate
    update(particles: Array<IParticle>, deltaT: number) {
        this.plate.expose(particles, deltaT);
        this.image.needsUpdate = true;
    }
}

/**
 * Photographic plate is the one exposed to the particles
 * It contains an array of which parts of it were exposed and by how much
 * Maybe using a fragment shader on these as texture would help display them
 */
export class PhotographicPlate {
    resolution: Vector2;
    width: number;
    height: number;
    position: Vector3;
    normal: Vector3; // The normal to the plane in the direction of the object
    private data: Uint8Array;
    constructor(width = 1.0, height = 1.0, resolutionX = 100, resolutionY = 100, position = new Vector3(), normal = new Vector3(0, 0, 1)) {
        this.width = width;
        this.height = height;
        this.position = position;
        this.normal = normal.normalize();
        this.resolution = new Vector2(resolutionX, resolutionY);
        this.data = new Uint8Array(4 * resolutionX * resolutionY);
    }
    getImage(): Uint8Array { return this.data; }

    expose(particles: Array<IParticle>, deltaT: number) {
        const quarternion = new Quaternion().setFromUnitVectors(this.normal, new Vector3(0, 0, 1));
        const color = [16, 0, 0, 0];
        particles.forEach(p => {
            if (p.getType() == SpaceParticle.PHOTON) {
                const from = p.getPosition();
                const to = new Vector3().addVectors(p.getPosition(), p.getVelocity().multiplyScalar(deltaT));
                const intersection = this.intersectsWithPlate(from, to);
                if (intersection.x != Number.POSITIVE_INFINITY) {
                    const relativeCoordinates = intersection.sub(this.position);
                    relativeCoordinates.applyQuaternion(quarternion);
                    relativeCoordinates.x = this.width / 2 + relativeCoordinates.x * this.resolution.x / this.width;
                    relativeCoordinates.y = this.height / 2 + relativeCoordinates.y * this.resolution.y / this.height;
                    relativeCoordinates.x = 4 * Math.round(relativeCoordinates.x);
                    relativeCoordinates.y = 4 * Math.round(relativeCoordinates.y);
                    const index = relativeCoordinates.y * this.resolution.x + relativeCoordinates.x;
                    color.forEach((i, j) => {
                        this.data[index + j] = Math.min(this.data[index + j]+i, 255);
                        // this.data[index + j] += i;

                    });
                    // this.data[index + 3] = Math.min(this.data[index+3] + alpha, 255);
                }
            }
        });
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
        const ratio = Math.abs(dot1) / (Math.abs(dot1) + Math.abs(dot2));
        intersection = from.add(line.multiplyScalar(ratio));

        //Make sure this intersection is inside the plane
        const dimensions = new Vector3().subVectors(intersection, this.position);
        if (Math.abs(dimensions.x) > this.width || Math.abs(dimensions.y) > this.height) {
            intersection.set(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        }
        return intersection;
    }
}