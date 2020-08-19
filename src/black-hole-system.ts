import { BlackHoleParticleSystem } from "./black-hole-particle-system";
import { GravityForce, IParticle } from "./particle-system/particle-system";
import { IParticleGenerator, VisibleParticleGenerator, ArcVelocityGenerator, EllipticalPositionGenerator, EllipticalParticleGenerator } from "./particle-system/particle-generator";
import { SpaceParticleGenerator, PhotonGenerator } from "./space-particle";
import { Vector3, Scene } from "three";
import { ScaledUnits } from "./scaled-units";
import { VisibleParticle } from "./particle-system/visible-particle";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

/**
 * This class will encapsulate all the things needed to get the black
 * hole system running
 */
export class BlackHoleSystem {
    readonly MIN_ACCRETION_DISK_VEL = 199792458;
    readonly MAX_ACCRETION_DISK_VEL = 299792458;
    readonly BLACK_HOLE_MASS = 4.3e6;
    controls: TrackballControls;
    ps: BlackHoleParticleSystem;
    blackHole: VisibleParticle;
    particleGenerator: IParticleGenerator;
    particleGenerator2: IParticleGenerator;
    units: ScaledUnits;
    count = 0;
    constructor(scene: Scene) {
        this.ps = new BlackHoleParticleSystem();
    }
    initializeSystem(scene: Scene) {
        this.units = new ScaledUnits(1.496e9, 1.989e30, 1 * 60);
        console.log(this.units.getScaledVelocity(this.MIN_ACCRETION_DISK_VEL));
        this.blackHole = new VisibleParticle(scene, "blackHole", 1, "#ffffff", this.BLACK_HOLE_MASS);
        const gravity = new GravityForce(GravityForce.calculate(this.units.kgs, this.units.metres, this.units.seconds));
        this.ps.addForce(gravity);
        this.ps.addParticle(this.blackHole);
        this.initializeParticleGenerator(scene);
        this.getSchwarzchildRadius();
    }

    getSchwarzchildRadius() {
        const c = this.units.getScaledVelocity(299792458);
        const gravity = new GravityForce(GravityForce.calculate(this.units.kgs, this.units.metres, this.units.seconds));
        const radius = 2 * gravity.G * this.BLACK_HOLE_MASS / (c * c);
        console.log("The Schwarzchild Radius is ", radius);
        return radius
    }

    initializeParticleGenerator(scene: Scene) {
        const radius = this.getSchwarzchildRadius();
        const generator = new EllipticalParticleGenerator(1.5 * radius, 1.5 * radius, this.blackHole.getPosition(),
            new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1), this.units.getScaledVelocity(this.MIN_ACCRETION_DISK_VEL));
        generator.setParameters(0.0001, 0.00015, 0);
        generator.setWidth(0.2 * radius);
        const particleGenerator = new SpaceParticleGenerator(scene, this.ps, this.units, generator, 0.1);
        this.particleGenerator = particleGenerator;
        this.particleGenerator.setPosition(new Vector3(0, 0, 0));
        this.blackHole.addLightSource("#ffffff");
        // this.particleGenerator.setVelocityGenerator(new ArcVelocityGenerator(new Vector3(1, 0, 0), Math.PI / 3, new Vector3(0, 0, 1),
        //     this.units.getScaledVelocity(this.MIN_ACCRETION_DISK_VEL), this.units.getScaledVelocity(this.MAX_ACCRETION_DISK_VEL)));
        // this.particleGenerator.setPositionGenerator(new EllipticalPositionGenerator(20, 20, this.blackHole.getPosition(),
        //     new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)));
        this.particleGenerator2 = new VisibleParticleGenerator(scene, 0.1);
        this.particleGenerator2.setParameters(0.0001, 0.00015, 0);
        this.particleGenerator2.setVelocityGenerator(new ArcVelocityGenerator(new Vector3(-1, 0, 0), Math.PI / 3, new Vector3(0, 0, 1),
            this.units.getScaledVelocity(this.MIN_ACCRETION_DISK_VEL), this.units.getScaledVelocity(this.MAX_ACCRETION_DISK_VEL)));
        this.particleGenerator2.setPosition(new Vector3(0, 20, 0));

    }
    update(time_step: number) {
        if (Math.random() > 0.6 && this.count < 100) {
            const particle = this.particleGenerator.generate();
            // this.scaleVelocity(particle);
            this.ps.addParticle(particle);
            // const particle2 = this.particleGenerator2.generate();
            // this.scaleVelocity(particle2);
            // this.ps.addParticle(particle2);
            this.count++;
        }
        this.ps.update(time_step);
    }

    scaleVelocity(particle: IParticle) {
        const mag = this.units.getScaledVelocity(particle.getVelocity().length());
        const vel = particle.getVelocity().normalize().multiplyScalar(mag);
        console.log(vel);
        particle.setVelocity(vel.x, vel.y, vel.z);
    }
}
