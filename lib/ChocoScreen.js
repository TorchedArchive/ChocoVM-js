const blessed = require('blessed');

class ChocoScreen {
	constructor(name) {
		this._screen = blessed.screen({
			smartCSR: true,
			title: `ChocoVM - ${name}`
		});
		this.frameBuffer = this._initFrameBuffer();
		this.color = 7;

		this._screen.key(['q', 'C-c'], () => { process.exit(); });
	}

	setPixel(x, y, v) {
		if (x > 64) x -= 64;
		else if (x < 0) x += 64;

		if (y > 32) y -= 32;
		else if (y < 0) y += 32;

		const location = x + (y * 64);
		this.frameBuffer[location] ^= v;

		if (this.frameBuffer[location]) this._screen.fillRegion(this.color, ' ', x, x + 1, y, y + 1);
		else this._screen.clearRegion(x, x + 1, y, y + 1);

		this._screen.render()
		return !this.frameBuffer[location]
	}

	setColor(color) {
		if (color === 0) color = (Math.random() * (8 - 1) + 1)
		this.color = color;
	}

	clear() {
		this._screen.clearRegion(0, 64, 0, 32); 
		this.frameBuffer = this._initFrameBuffer();
	}

	error(code, msg) {
		this.clear()
		blessed.text({
			parent: this._screen,
			top: 16,
			left: 18,
			content: `Error: CVM-${code}\n${msg}`
		});
		this._screen.render()
	}

	_initFrameBuffer() {
		let buffer = [];
		for (let i = 0; i < 2048; i++) buffer[i] = 0;

		return buffer;
	}
}

module.exports = ChocoScreen;
