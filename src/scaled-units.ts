export class ScaledUnits {
    private _metres: number; // the number of metres in new unit
    private _kilograms: number; // the number of kilograms in new unit
    private _seconds: number; // the number of kilograms in new unit

    constructor(metres = 1, kgs = 1, seconds = 1) {
        this._metres = metres;
        this._kilograms = kgs;
        this._seconds = seconds;
    }
    /**
     * Sets the new unit of metres
     * @param val The number of meters that go into the new unit wrt to the value given in to
     * @param to 
     */
    setMetresScale(val: number, to = 1) {
        this._metres = val / to;
    }

    /**
     * Sets the new unit of kgs
     * @param val The number of kgs that go into the new unit wrt to the value given in to
     * @param to 
     */
    setKgsScale(val: number, to = 1) {
        this._kilograms = val / to;
    }
    /**
      * Sets the new unit of time
      * @param val The number of seconds that go into the new unit wrt to the value given in to
      * @param to 
      */
    setTimeScale(val: number, to = 1) {
        this._seconds = val / to;
    }
    get metres(): number { return this._metres; };
    get kgs(): number { return this._kilograms; };
    get seconds(): number { return this._seconds; };

    /**
     * Returns value of the distance in new units
     * @param val The distance in metres you want in the new units
     */
    getScaledDistance(val: number): number {
        return val / this._metres;
    }

    /**
     * Returns value of the mass in new units
     * @param val The mass in kgs you want in the new units
     */
    getScaledMass(val: number): number {
        return val / this._kilograms;
    }

    /**
     * Returns value of the time in new units
     * @param val The time in seconds you want in the new units
     */
    getScaledTime(val: number): number {
        return val / this._seconds;
    }

    /**
     * Returns value of the time in seconds
     * @param val The time in new units that you want in seconds
     */
    getUnscaledTime(val: number): number {
        return val * this._seconds;
    }

    /**
     * Returns value of the velocity in new units
     * @param val The velocity in metres/second you want in the new units
     */
    getScaledVelocity(val: number): number {
        return val * this.seconds / this.metres;
    }

    /**
     * Returns value of the time in seconds
     * @param val The velocity in new units that you want in m/s
     */
    getUnscaledVelocity(val: number): number {
        return val * this._metres / this._seconds;
    }

}