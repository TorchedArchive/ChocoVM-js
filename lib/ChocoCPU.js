const Screen = require('./ChocoScreen')

class ChocoCPU {
	constructor(name) {
		this.memory = new Uint8Array(4096); // Memory (obviously)
		this.r = new Uint8Array(16); // Registers
		this.i = 0; // Special I register to store memory addresses
		// TODO: Sound registers
		// this.dt = 0;
		// this.st = 0;
		this.stack = new Uint16Array(16); // Stack
		this.pc = 0x200; // Current address 
		this.romBuffer = []; // ROM
		this.screen = new Screen(name); // Blessed screen 
	}

	load(rom) {
		for (let i = 0; i < rom.length; i++) this.memory[0x200 + rom] = rom[i];
	}

	setupFont() {
		const font = [
			0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
			0x20, 0x60, 0x20, 0x20, 0x70, // 1
			0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
			0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
			0x90, 0x90, 0xF0, 0x10, 0x10, // 4
			0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
			0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
			0xF0, 0x10, 0x20, 0x40, 0x40, // 7
			0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
			0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
			0xF0, 0x90, 0xF0, 0x90, 0x90, // A
			0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
			0xF0, 0x80, 0x80, 0x80, 0xF0, // C
			0xE0, 0x90, 0x90, 0x90, 0xE0, // D
			0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
			0xF0, 0x80, 0xF0, 0x80, 0x80  // F
		];

		for (let i = 0; i < font.length; i++) {
			this.memory[i] = font[i];
		}
	}

	startCycles() {
		setInterval(() => this._step(), 3);
	}

	_step() {
		//const op = (this.memory[this.pc] << 8 | this.memory[this.pc + 1])
		this.screen.setPixel(Math.floor(Math.random() * 64), Math.floor(Math.random() * 32), 1)
		//this._execute(op);
	}

	_execute(op) {
		switch (op & 0xf000) {
			case 0x0000:
				if (op === 0x00e0) this.screen.clear()
				else if (op === 0x00ee) this.pc = this.stack.pop()
				break;

			default:
				break;
		}
	}
}

module.exports = ChocoCPU;
