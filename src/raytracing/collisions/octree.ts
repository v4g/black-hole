import { IRayTraceable } from "../i-raytraceable";
import { Vector3 } from "three";

/**
 * An octree is a tree where each node has 8 children. Here we partition
 * space into 8 components and keep doing this until we reach a maximum depth
 * or have no children in that space.
 * How will we update the octree when the particles are moving?
 * Axis aligned partitioning 
 */
export class Octree {
    private node: Array<Octree>;
    private objects: Array<IRayTraceable>;
    private corners: Array<Vector3>;
    private readonly MAX_OBJECTS_IN_NODE = 3;
    // TODO : this should not be ray traceable but collidable
    constructor(objects: Array<IRayTraceable>, corner1?: Vector3, corner2?: Vector3) {
        this.node = new Array<Octree>();
        this.create(objects, corner1, corner2);
        this.corners = new Array<Vector3>(2);
        this.corners[0] = corner1;
        this.corners[1] = corner2;
    }

    // This code ran flawlessly on the first run
    private create(objects: Array<IRayTraceable>, corner1: Vector3, corner2: Vector3) {
        if (objects.length <= this.MAX_OBJECTS_IN_NODE) {
            this.objects = objects;
            return;
        }
        // create the corners of the new cubes
        const dimensions = [corner2.x - corner1.x, corner2.y - corner1.y, corner2.z - corner1.z];
        const corners = new Array<Vector3>();
        const mid = new Vector3().addVectors(corner1, corner2).multiplyScalar(0.5);
        corners.push(corner1);
        corners.push(mid);
        dimensions.forEach((d, idx) => {
            const len = corners.length;
            for (let i = 0; i < len; i++) {
                const c = corners[i].clone();
                const arr = c.toArray();
                arr[idx] = arr[idx] + d / 2;
                c.fromArray(arr);
                corners.push(c);
            }
        });
        // TODO: only considering points for now with 0 radius
        // for each cube, check if the particle is in it
        // if it is, add it to its array list
        for (let i = 0; i < 8; i++) {
            const subobjects = new Array<IRayTraceable>();
            objects.forEach(o => {
                if (o.intersectsWithBox(corners[2 * i], corners[2 * i + 1])) {
                    subobjects.push(o);
                }
            });
            // Finished creating an array of objects that are contained in this box
            // Create its own octree
            if (subobjects.length > 0) {
                // console.log("Creating an octree with {0} objects", subobjects.length);
                this.node.push(new Octree(subobjects, corners[2 * i], corners[2 * i + 1]));
            }
        }
    }

    // Returns an octree node containing the point
    // Or none if it doesn't
    public find(point: Vector3): Octree | null {
        if (this.contains(point)) {
            for (let i = 0; i < this.node.length; i++) {
                const tree = this.node[i];
                const search = tree.find(point);
                if (search !== null) {
                    return search;
                }
            };
            return this;
        }
        return null;
    }

    public contains(point: Vector3): boolean {
        if (point.x > Math.max(this.corners[0].x, this.corners[1].x)) return false;
        if (point.y > Math.max(this.corners[0].y, this.corners[1].y)) return false;
        if (point.z > Math.max(this.corners[0].z, this.corners[1].z)) return false;
        if (point.x < Math.min(this.corners[0].x, this.corners[1].x)) return false;
        if (point.y < Math.min(this.corners[0].y, this.corners[1].y)) return false;
        if (point.z < Math.min(this.corners[0].z, this.corners[1].z)) return false;
        return true;
    }
}