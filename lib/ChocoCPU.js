const Screen = require('./ChocoScreen');
const keys = null;

class ChocoCPU {
	constructor(name, c8) {
		this.memory = new Uint8Array(4096); // Memory (obviously)
		this.r = new Uint8Array(16); // Registers
		this.i = 0; // Special I register to store memory addresses
		// TODO: Sound registers
		// this.dt = 0;
		// this.st = 0;
		this.stack = new Array(16); // Stack
		this.pc = 0x200; // Current address 
		this.screen = new Screen(name); // Blessed screen
		this.paused = false; // Used for keypress awaiting, etc.
		this.c8 = c8; // Whether we can use ChocoVM opcodes or not.
	}

	load(_rom) {
		this.setupFont()
		const rom = new Uint8Array(_rom)
		if (rom.length > (4096 - 0x1ff)) {
			this.oom = true;
			this.screen.error('00', 'Out of memory to use')
		}
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
		if (this.oom) return;
		this._cycle = setInterval(() => this._step(), 3);
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
				switch (op & 0xff) {
					case 0xe0:
						this.screen.clear()
						break;
					case 0xea:
						this._check
						this.screen.setColor(x);
						break;
					case 0xee:
						this.pc = this.stack.pop()
						break;
				}
				break;
			case 0x1000:
				this.pc = (op & 0xfff);
				break;
			case 0x2000:
				this.stack.push(this.pc);
                this.pc = (op & 0xFFF);
                break;
			case 0x3000:
				if (this.r[x] === (op & 0xff)) this.pc += 2;
				break;
			case 0x4000:
				if (this.r[x] !== (op & 0xff)) this.pc += 2;
				break;
			case 0x5000:
				if (this.r[x] === this.r[y]) this.pc += 2;
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
						this.r[x] = this.r[y];
						break;
					case 0x1:
						this.r[x] |= this.r[y];
						break;
					case 0x2:
						this.r[x] &= this.r[y];
						break;
					case 0x3:
						this.r[x] ^= this.r[y];
						break;
					case 0x4:
						const total = this.r[x] += this.r[y]
						this.r[0xf] = 0;

						if (total > 255) this.r[0xf] = 1;
						this.r[x] = total;
						break;
					case 0x5:
						this.r[0xf];

						if (this.r[x] > this.r[y]) this.r[0xf] = 1;
						this.r[x] -= this.r[y];
						break;
					case 0x6:
						this.r[0xf] = (this.r[x] & 0x1);
						this.r[x] = this.r[x] / 2;
						break;
					case 0x7:
						this.r[0xf];

						if (this.r[y] > this.r[x]) this.r[0xf] = 1;
						this.r[x] = this.r[y] - this.r[x];
						break;
					case 0xe:
						this.r[0xf] = (this.r[x] & 128) ? 1 : 0;
						this.r[x] *= 2;
						break;
				}
				break;
			case 0x9000:
				if (this.r[x] !== this.r[y]) this.pc += 2;
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
			case 0xe000:
				const subOp = (op & 0xff);

				// TODO: Implement keyboard
				//if (subOp === 0x9e) if (this.keyboard.key(this.r[x]).down) this.pc += 2;
				//else if (subOp === 0xa1) if (!this.keyboard.key(this.r[x]).down) this.pc += 2;
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
				this._unknownOp(op);
				break;
		}
	}

	get _check() {
		if (this.c8) {
			clearInterval(this._cycle);
			this.screen.error('02', 'Unsupported opcode used while in Chip-8 mode');
		}
	}

	_unknownOp(op) {
		clearInterval(this._cycle);
		this.screen.error('01', `Unknown opcode: ${op.toString(16)}`);
	}
}

module.exports = ChocoCPU;
