import { BlackHoleParticleSystem } from "./black-hole-particle-system";
import { SpaceParticleGenerator } from "./space-particle";
import { Vector3, Scene, Vector2, ImageBitmapLoader, ImageLoader, TextureLoader, Texture } from "three";
import { ScaledUnits } from "./scaled-units";
import { VisibleParticle } from "./particle-system/particle/visible-particle";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { Photograph, PhotographicPlate } from "./raytracing/photograph";
import { GravityForce } from "./particle-system/forces/gravity-force";
import { IParticle, Particle } from "./particle-system/particle/particle";
import { IParticleGenerator } from "./particle-system/generator/i-particle-generator";
import { EllipticalParticleGenerator } from "./particle-system/generator/elliptical-particle-generator";
import { VisibleParticleGenerator } from "./particle-system/generator/visible-particle-generator";
import { ArcVelocityGenerator } from "./particle-system/generator/velocity-generators/arc-velocity-generator";
import { RayTracingPhotonGenerator, RayTracer } from "./raytracing/pin-hole-camera.";
import { ParticleSystemCustomizer, IRayTracingCustomizer } from "./raytracing/particle-system-raytracer";
import { IRayTraceable } from "./raytracing/i-raytraceable";
import { Octree } from "./raytracing/collisions/octree";
import { TimeProfile } from "./boilerplate/time-profile";
import { VariableRayEmitter } from "./raytracing/variable-ray-emitter";
import { GridEmitter } from "./raytracing/grid-emitter";

/**
 * This class will encapsulate all the things needed to get the black
 * hole system running
 */
export class BlackHoleSystem {
    readonly MIN_ACCRETION_DISK_VEL = 199792458;
    readonly MAX_ACCRETION_DISK_VEL = 299792458;
    readonly BLACK_HOLE_MASS = 4.3e6;
    readonly RESOLUTION = 256;
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
    psprofiler : TimeProfile;
    tracerprofiler : TimeProfile;
    constructor(scene: Scene) {
        this.ps = new BlackHoleParticleSystem();
        this.psprofiler = new TimeProfile("Particle System", 1000);
        this.tracerprofiler = new TimeProfile("Raytracer", 1000);
    }
    initializeSystem(scene: Scene) {
        this.units = new ScaledUnits(1.496e9, 1.989e30, 1);
        console.log(this.units.getScaledVelocity(this.MIN_ACCRETION_DISK_VEL));
        this.blackHole = new VisibleParticle(scene, "blackHole", "#ffffff",  1, this.BLACK_HOLE_MASS);
        const gravity = new GravityForce(GravityForce.calculate(this.units.kgs, this.units.metres, this.units.seconds));
        this.ps.addForce(gravity);
        this.ps.addParticle(this.blackHole);
        this.initializeParticleGenerator(scene);
        this.ps.setEventHorizon(this.getSchwarzchildRadius());
        this.ps.setBounds(new Vector3(-50, -50, -50), new Vector3(50, 50, 200));
        this.raytracer = new RayTracer(scene, new Vector3(0, 0, 100), new Vector3(0, 0, -1), Math.PI / 8, this.RESOLUTION, this.units.getScaledVelocity(299792458));
        const gridEmitter = new GridEmitter(this.raytracer, new Vector2(this.RESOLUTION, this.RESOLUTION), new RayTracingPhotonGenerator(scene, this.units.getScaledVelocity(299792458)));
        this.obstacles = new Array<IRayTraceable>();
        this.emitParticles();
        this.customizer = new ParticleSystemCustomizer(this.ps, this.raytracer, this.obstacles, 0);
        this.raytracer.setCustomizer(this.customizer)
        this.raytracer.emitPhotons(gridEmitter);
        scene.add(this.raytracer.getPhoto());

    }

    testOctree() {
        let particle = new Particle();
        particle.setPosition(-10, -10, -10);
        this.obstacles.push(particle);
        particle = new Particle();
        particle.setPosition(10, 10, 10);
        this.obstacles.push(particle);
        particle = new Particle();
        particle.setPosition(-10, -10, 10);
        this.obstacles.push(particle);
        particle = new Particle();
        particle.setPosition(-10, 10, 10);
        this.obstacles.push(particle);
        const octree = new Octree(this.obstacles, new Vector3(-20, -20, -20), new Vector3(20, 20, 20));
        const res = octree.find(particle.getPosition()) ;
        
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
        const multiplier = 1.5;
        const generator = new EllipticalParticleGenerator(multiplier * radius, multiplier * radius, this.blackHole.getPosition(),
            new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, -1, 0), this.units.getScaledVelocity(this.MIN_ACCRETION_DISK_VEL));
        generator.setParameters(0.0001, 0.00015, 0);
        generator.setWidth(3 * radius);

        const particleGenerator = new SpaceParticleGenerator(scene, this.ps, this.units, generator);
        this.particleGenerator = particleGenerator;
        this.particleGenerator.setPosition(new Vector3(0, 0, 0));
        this.blackHole.addLightSource("#ffffff");
    }
    update(time_step: number) {
        const N_ITERATIONS = 100;
        const time_before = this.totalTime;
        
        for (let i = 0; i < N_ITERATIONS; i++) {
            // this.psprofiler.start();
            this.ps.update(time_step);
            // this.psprofiler.stop();
            // this.tracerprofiler.start();
            this.customizer.setTimeStep(time_step);
            this.raytracer.update();
            // this.tracerprofiler.stop();
            this.totalTime += time_step;
            // if (this.totalTime - this.timeBefore > 500) {
            //     this.raytracer.emitPhotons();
            //     this.timeBefore = this.totalTime;
            // }
        }
    }

    emitParticles() {
        let count = 0;
        const PARTICLE_COUNT = 0;
        while(count < PARTICLE_COUNT) {
            const particle = this.particleGenerator.generate();
            this.ps.addParticle(particle);
            this.obstacles.push(particle as any as IRayTraceable);
            count++;
        } 
    }
    scaleVelocity(particle: IParticle) {
        const mag = this.units.getScaledVelocity(particle.getVelocity().length());
        const vel = particle.getVelocity().normalize().multiplyScalar(mag);
        console.log(vel);
        particle.setVelocity(vel.x, vel.y, vel.z);
    }
}
