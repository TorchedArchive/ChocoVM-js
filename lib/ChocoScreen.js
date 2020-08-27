const blessed = require('blessed');

class ChocoScreen {
	constructor(name) {
		this._screen = blessed.screen({
			smartCSR: true,
			title: `ChocoVM - ${name.toUpperCase()}`
		});
		this.frameBuffer = this._initFrameBuffer();

		this._screen.key(['q', 'C-c'], () => { process.exit(); });
	}

	setPixel(x, y, v) {
		if (x > 64) x -= 64;
		else if (x < 0) x += 64;

		if (y > 32) y -= 32;
		else if (y < 0) y += 32;

		const location = x + (y * 64);
		this.frameBuffer[location] ^= v;

		if (this.frameBuffer[location]) this._screen.fillRegion(6, ' ', x, x + 1, y, y + 1); // TODO: Change to white
		else this._screen.clearRegion(x, x + 1, y, y + 1);

		this._screen.render()
		return !this.frameBuffer[location]
	}

	clear() {
		this._screen.clearRegion(0, 64, 0, 32); 
		this.frameBuffer = this._initFrameBuffer();
	}

	_initFrameBuffer() {
		let buffer = [];
		for (let i = 0; i < 2048; i++) buffer[i] = 0;

		return buffer;
	}
}

module.exports = ChocoScreen;
