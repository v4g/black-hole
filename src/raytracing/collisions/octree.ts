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
    // TODO : this should not be ray traceable but collidable
    constructor(objects: Array<IRayTraceable>, corner1 ?:Vector3, corner2 ?: Vector3){
        this.node = new Array<Octree>(8);
        this.create(objects, new Vector3(1,1,1), new Vector3(3,3,3));
    }

    private create(objects: Array<IRayTraceable>, corner1: Vector3, corner2: Vector3) {
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
                arr[idx] = arr[idx] + d/2;
                c.fromArray(arr);
                corners.push(c);
            }
        });
        corners.forEach(c => {
            console.log(c);
        })

    }
}