import { Boilerplate } from "./boilerplate/boilerplate";
import { BlackHoleSystem } from "./black-hole-system";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

export class BlackHoleStarter extends Boilerplate {
    system: BlackHoleSystem;
    time_step: number;
    controls: TrackballControls;
    
    constructor() {
        super();
    }
    postInitHook() {
        this.system = new BlackHoleSystem(this.scene);
        this.system.initializeSystem(this.scene);
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    }

    animateHook() {
        this.time_step = 0.006;
        this.system.update(this.time_step);
        this.controls.update();
    }
}