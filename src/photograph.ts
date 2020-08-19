import { IParticle, ParticleDerivative } from "./particle-system/particle-system";

/**
 * This class will take a photograph of the scene on a plane
 * Particles can interact with the photographic plate. Whenever they
 * intersect the plate, a certain color with intensity would be added to 
 * the plate
 */
export class Photograph {
    getPhoto() {
        // return the image on the plate
    }
    // Updates the plate by checking if any of the particles have collided
    // with the plate
    update(particles: Array<IParticle>, derivatives: ParticleDerivative) {

    }
}