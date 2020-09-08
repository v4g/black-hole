/**
 * A ray emitter sits in the raycaster and decides where to emit rays
 */
export interface IRayEmitter {
    emitFrom(x: number, y: number): any;
}