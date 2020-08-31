import { BlackHoleParticleSystem } from "./black-hole-particle-system";
import { SpaceParticleGenerator } from "./space-particle";
import { Vector3, Scene } from "three";
import { ScaledUnits } from "./scaled-units";
import { VisibleParticle } from "./particle-system/particle/visible-particle";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { Photograph, PhotographicPlate } from "./raytracing/photograph";
import { GravityForce } from "./particle-system/forces/gravity-force";
import { IParticle } from "./particle-system/particle/particle";
import { IParticleGenerator } from "./particle-system/generator/i-particle-generator";
import { EllipticalParticleGenerator } from "./particle-system/generator/elliptical-particle-generator";
import { VisibleParticleGenerator } from "./particle-system/generator/visible-particle-generator";
import { ArcVelocityGenerator } from "./particle-system/generator/velocity-generators/arc-velocity-generator";
import { RayTracingPhotonGenerator, RayTracer } from "./raytracing/pin-hole-camera.";
import { ParticleSystemCustomizer, IRayTracingCustomizer } from "./raytracing/particle-system-raytracer";
import { IRayTraceable } from "./raytracing/i-raytraceable";

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
    obstacles: Array<IRayTraceable>;
    totalTime = 0;

    customizer: ParticleSystemCustomizer;
    raytracer: RayTracer;
    units: ScaledUnits;
    photograph: Photograph;
    count = 0;
    timeBefore = 0;
    constructor(scene: Scene) {
        this.ps = new BlackHoleParticleSystem();
    }
    initializeSystem(scene: Scene) {
        this.units = new ScaledUnits(1.496e9, 1.989e30, 1);
        console.log(this.units.getScaledVelocity(this.MIN_ACCRETION_DISK_VEL));
        this.blackHole = new VisibleParticle(scene, "blackHole", "#ffffff",  1, this.BLACK_HOLE_MASS);
        const gravity = new GravityForce(GravityForce.calculate(this.units.kgs, this.units.metres, this.units.seconds));
        this.ps.addForce(gravity);
        this.ps.addParticle(this.blackHole);
        this.initializeParticleGenerator(scene);
        this.getSchwarzchildRadius();
        // const photoPlate = new PhotographicPlate(100, 100, 100, 100, new Vector3(0, 0, 100), new Vector3(0, 0, 1));
        // this.photograph.getPhoto().position.set(0, 0, 10);
        // scene.add(this.photograph.getPhoto());
        
        this.raytracer = new RayTracer(scene, new Vector3(0, 0, 20), new Vector3(0, 0, -1), Math.PI / 3, 8, this.units.getScaledVelocity(299792458));
        this.obstacles = new Array<IRayTraceable>();
        this.customizer = new ParticleSystemCustomizer(this.ps, this.raytracer, this.obstacles, 0);
        this.raytracer.setCustomizer(this.customizer)
        this.raytracer.emitPhotons();
        scene.add(this.raytracer.getPhoto());

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
        const particleGenerator = new SpaceParticleGenerator(scene, this.ps, this.units, generator);
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
        const N_ITERATIONS = 100;
        const time_before = this.totalTime;
        for (let i = 0; i < N_ITERATIONS; i++) {

            if (Math.random() > 0.6 && this.count < 100) {
                const particle = this.particleGenerator.generate();
                this.ps.addParticle(particle);
                this.obstacles.push(particle as any as IRayTraceable);
                this.count++;
            }            
            this.ps.update(time_step);
            this.customizer.setTimeStep(time_step);
            this.raytracer.update();
            this.totalTime += time_step;
            if (this.totalTime - this.timeBefore > 100) {
                this.raytracer.emitPhotons();
                this.timeBefore = this.totalTime;
            }
            // this.photograph.update(this.ps.particles, time_step);
        }
    }

    scaleVelocity(particle: IParticle) {
        const mag = this.units.getScaledVelocity(particle.getVelocity().length());
        const vel = particle.getVelocity().normalize().multiplyScalar(mag);
        console.log(vel);
        particle.setVelocity(vel.x, vel.y, vel.z);
    }
}
