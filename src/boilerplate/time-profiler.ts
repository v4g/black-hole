import { TimeProfile } from "./time-profile";

export class TimeProfiler {
    private timeProfiles: Map<string, TimeProfile>
    constructor() {
        this.timeProfiles = new Map<string, TimeProfile>();
    }
    start(name: string, interval = 1) {
        if (this.timeProfiles.has(name)) {
            this.timeProfiles.get(name).start();
        } else {
            const profile = new TimeProfile(name, interval);
            this.timeProfiles.set(name, profile);
            profile.start();
        }
    }
    stop(name: string, interval = 1) {
        if (this.timeProfiles.has(name)) {
            this.timeProfiles.get(name).stop();
        } else {
            const profile = new TimeProfile(name, interval);
            this.timeProfiles.set(name, profile);
            profile.stop();
        }
    }
}