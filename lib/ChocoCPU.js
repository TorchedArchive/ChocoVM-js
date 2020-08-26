class ChocoCPU {
	constructor() {
		this.i = 0;
		this.memory = new Uint8Array(4096);
		this.pc = 0x200;
		this.registers = new Uint8Array(16);
		this.stack = new Uint16Array(16);
	}
}

module.exports = ChocoCPU;
