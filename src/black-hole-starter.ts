import { Boilerplate } from "./boilerplate/boilerplate";
import { BlackHoleSystem } from "./black-hole-system";

export class BlackHoleStarter extends Boilerplate {
    system: BlackHoleSystem;
    time_step: number;
    constructor() {
        super();
    }
    postInitHook() {
        this.system = new BlackHoleSystem(this.scene);
        this.system.initializeSystem(this.scene);
    }

    animateHook() {
        this.time_step = 0.03;
        this.system.update(this.time_step);
    }
}