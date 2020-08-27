const Screen = require('./ChocoScreen');
const keys = null;

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
		this.screen = new Screen(name); // Blessed screen
		this.paused = false; // Used for keypress awaiting, etc.
	}

	load(_rom) {
		this.setupFont()
		const rom = new Uint8Array(_rom)
		for (let i = 0; i < rom.length; i++) this.memory[0x200 + i] = rom[i];
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
		if (this.paused) return;
		const op = (this.memory[this.pc] << 8 | this.memory[this.pc + 1]);
		this._execute(op);
	}

	_execute(op) {
		this.pc += 2
		const x = (op & 0x0f00) >> 8;
		const y = (op & 0x00f0) >> 4;

		switch (op & 0xf000) {
			case 0x0000:
				if (op === 0x00e0) this.screen.clear()
				else if (op === 0x00ee) this.pc = this.stack.pop()
				break;
			case 0x1000:
				this.pc = (op & 0xfff);
				break;
			case 0x3000:
				if (this.r[x] === (op & 0xff)) this.pc += 2;
				break;
			case 0x6000:
				this.r[x] = (op & 0xff)
				break;
			case 0x7000:
				this.r[x] += (op & 0xff);
				break;
			case 0x8000:
				switch (op & 0xf) {
					case 0x0:
						this.r[x] = r[y];
						break;
				}
				break;
			case 0xa000:
				this.i = (op & 0xfff)
				break;
			case 0xb000:
				this.pc = (op & 0xfff) + this.r[0];
				break;
			case 0xc000:
				const rand = Math.floor(Math.random() * 255);
				this.r[x] = rand & (op & 0xff);
				break;
			case 0xd000:
				const height = (op & 0xf);
				this.r[0xf] = 0;

				for (let row = 0; row < height; row++) {
					let sprite = this.memory[this.i + row];

					for (let col = 0; col < 8; col++) {
						if ((sprite & 0x80) > 0) if (this.screen.setPixel(this.r[x] + col, this.r[y] + row, 1)) this.r[0xf] = 1;

						sprite <<= 1;
					}
				}
				break;
			case 0xf000:
				switch(op & 0xff) {
					case 0x0a:
						this.paused = true;
						this.screen._screen.on('keypress', (k) => {
							// TODO: Add constant values
							//this.r[x] = constants.keys[k]
							this.paused = false;
						})
						break;
					case 0x29:
						this.i = this.r[x] * 5
						break;
					case 0x33:
						this.memory[this.i] = parseInt(this.r[x] / 100)
						this.memory[this.i + 1] = parseInt((this.r[x] % 100) / 10);
						this.memory[this.i + 2] = parseInt(this.r[x] % 10);
						break;

					 case 0x65:
						for (let idx = 0; idx <= x; idx++) this.r[idx] = this.memory[this.i + idx];
						break;
				}
				break;
			default:
				console.log(op.toString(16)) // Prints opcode in hex (which is what we want)
				break;
		}
	}
}

module.exports = ChocoCPU;
