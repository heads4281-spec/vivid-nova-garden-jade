/**
 * Quantum Live API
 * Automatic 0/1 system – both can mean ON or OFF
 * Modes: NORMAL | INVERTED | QUANTUM (auto-flip)
 */
class QuantumLiveAPI {
    constructor() {
        this.mode = "INVERTED";          // default: 0=ON, 1=OFF
        this.switches = {
            ai: 1,
            formations: 1,
            lives: 1,
            particles: 1,
            quantum: 1,
            debug: 0
        };
        this.listeners = [];
        this.autoPulse = false;          // Quantum automatic pulse
        this.pulseTimer = 0;
    }

    // Convert user value → internal state
    _toInternal(value) {
        const v = value ? 1 : 0;
        if (this.mode === "INVERTED") return 1 - v;
        if (this.mode === "QUANTUM")  return Math.random() > 0.5 ? v : 1 - v; // quantum uncertainty
        return v; // NORMAL
    }

    _toExternal(internal) {
        if (this.mode === "INVERTED") return 1 - internal;
        return internal;
    }

    set(name, value) {
        const internal = this._toInternal(value);
        const old = this.switches[name];
        this.switches[name] = internal;

        if (old !== internal) {
            this.emit({
                name,
                value: this._toExternal(internal),
                internal,
                state: internal === 1 ? "ON" : "OFF",
                mode: this.mode
            });
        }
        return this._toExternal(internal);
    }

    get(name) {
        return this._toExternal(this.switches[name] ?? 0);
    }

    getInternal(name) {
        return this.switches[name] ?? 0;
    }

    isOn(name) {
        return this.getInternal(name) === 1;
    }

    toggle(name) {
        return this.set(name, 1 - this.get(name));
    }

    // Change logic mode
    setMode(newMode) {
        const allowed = ["NORMAL", "INVERTED", "QUANTUM"];
        if (!allowed.includes(newMode)) return;
        this.mode = newMode;
        console.log(`[QuantumLiveAPI] Mode → ${this.mode}`);
        this.emit({ name: "mode", state: this.mode, value: this.mode });
    }

    cycleMode() {
        const order = ["NORMAL", "INVERTED", "QUANTUM"];
        const next = order[(order.indexOf(this.mode) + 1) % order.length];
        this.setMode(next);
    }

    // Quantum automatic pulse (live update)
    enableAutoPulse(enabled = true) {
        this.autoPulse = enabled;
        console.log(`[QuantumLiveAPI] Auto Pulse ${enabled ? "ON" : "OFF"}`);
    }

    // Called every frame from the engine
    update(dt) {
        if (!this.autoPulse) return;
        this.pulseTimer += dt;
        if (this.pulseTimer >= 3.5) {          // every 3.5 seconds quantum flip
            this.pulseTimer = 0;
            // Randomly flip AI as quantum demonstration
            if (Math.random() > 0.6) {
                this.toggle("ai");
            }
        }
    }

    setMany(obj) {
        for (const [k, v] of Object.entries(obj)) this.set(k, v);
    }

    onChange(cb) {
        this.listeners.push(cb);
    }

    emit(event) {
        this.listeners.forEach(fn => fn(event));
        if (event.name !== "mode") {
            console.log(`[Quantum] ${event.name.toUpperCase()} → ${event.state} (${event.value}) [${event.mode}]`);
        }
    }

    snapshot() {
        const snap = {};
        for (const k of Object.keys(this.switches)) {
            snap[k] = this.get(k);
        }
        snap._mode = this.mode;
        snap._autoPulse = this.autoPulse;
        return snap;
    }
}

window.QuantumLive = new QuantumLiveAPI();