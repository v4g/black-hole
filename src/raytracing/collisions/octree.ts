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
    private minDiagLength = 0;
    private maxDepth = Number.POSITIVE_INFINITY;
    private depth = 0;
    // TODO : this should not be ray traceable but collidable
    constructor(objects: Array<IRayTraceable>, corner1?: Vector3, corner2?: Vector3, minDiagLength = 0, max_depth = Number.POSITIVE_INFINITY, depth = 0) {
        this.node = new Array<Octree>();
        this.setMinDiagLength(minDiagLength);
        this.create(objects, corner1, corner2);
        this.corners = new Array<Vector3>(2);
        this.corners[0] = corner1;
        this.corners[1] = corner2;
        this.maxDepth = max_depth;
        this.depth = depth;
    }
    setMinDiagLength(length: number) {
        this.minDiagLength = length;
    }

    // This code ran flawlessly on the first run
    private create(objects: Array<IRayTraceable>, corner1: Vector3, corner2: Vector3) {
        // Putting this outside for larger intersection tests
        this.objects = objects;
        const dimensions = [corner2.x - corner1.x, corner2.y - corner1.y, corner2.z - corner1.z];
        // Dont create children if they are smaller than this length
        let diagLength = dimensions[0] * dimensions[0] + dimensions[1] * dimensions[1] + dimensions[2] * dimensions[2];
        diagLength = diagLength / 4;
        if (objects.length <= this.MAX_OBJECTS_IN_NODE || this.minDiagLength >= diagLength) {
            return;
        }
        if (this.depth >= this.maxDepth) {
            return;
        }
        // create the corners of the new cubes
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
            if (subobjects.length > 0 && subobjects.length < objects.length) {
                // console.log("Creating an octree with {0} objects", subobjects.length);
                this.node.push(new Octree(subobjects, corners[2 * i], corners[2 * i + 1],
                    this.minDiagLength, this.maxDepth, this.depth + 1));
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

    // This is tricky business
    // TODO : If both the points are present in one node, we're good and can recurse down
    // However, if both are in different nodes, this becomes a challenge
    // We could return both of those whole nodes, but that would be too many
    // We could find the intersections of the nodes with the edge of the boxes
    // and search those
    // We'll ignore that scenario for now
    public findRay(from: Vector3, to: Vector3): Octree | null {
        if (this.contains(from) && this.contains(to)) {
            if (this.node.length == 0) {
                return this;
            }
            for (let i = 0; i < this.node.length; i++) {
                const tree = this.node[i];
                const search = tree.findRay(from, to);
                if (search !== null) {
                    return search;
                }
            };
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

    public getObjects() { return this.objects; }
}