export class TimeProfile {
    private startTime: number;
    private interval: number;
    private updateEvery: number;
    private updateCount = 0;
    private name: string;
    private time: number;
    constructor(name = "Method", updateEvery = 1) {
        this.updateEvery = updateEvery;
        this.name = name;
    }
    start() {
        this.startTime = new Date().getTime();
    }
    stop(): number {
        const newTime = new Date().getTime();
        const interval = newTime - this.startTime;
        this.startTime = newTime;
        this.updateCount++;
        if (this.updateCount > this.updateEvery) {
            this.updateCount = 0;
            this.print();
            this.interval = 0;
        }
        this.interval += interval;
        return this.interval;
    }
    print() {
        console.log("%s took %s ms", this.name, this.interval);
    }
}
