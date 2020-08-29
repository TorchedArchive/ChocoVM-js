const blessed = require('blessed');
const fs = require('fs');
const CPU = require('./ChocoCPU');

class ChocoMain {
	static run() {
		const screen = blessed.screen({
			smartCSR: true,
			title: 'ChocoVM'
		});
		const romList = blessed.list({
			parent: screen,
			top: 0,
			left: 'center',
			width: "100%",
			height: "98%",
			items: [],
			tags: true,
			keys: true,
			scrollable: true,
			border: {
				type: "line"
			},
			style: {
				selected: {
					fg: "white",
					bg: "red"
				},
				border: {
					fg: "red"
				}
			}
		})
		romList.setLabel('ChocoVM')

		const statusBox = blessed.box({
			parent: romList,
			top: 'center',
			left: 'center',
			width: '25%',
			height: '25%',
			tags: true,
			border: {
				type: 'line'
			},
			style: {
				border: {
					fg: 'cyan'
				}
			},
			content: '{center}Searching for ROMs...{/center}'
		});

		screen.key(['q', 'C-c'], () => { process.exit(); });
		screen.render();

		const roms = fs.readdirSync(`${__dirname}/../roms/`, {withFileTypes: true}).filter(f => !f.isDirectory() && f.name.split('.').pop() === 'cvm').map(f => f.name);

		if (roms.length === 0) {
			statusBox.content = '{center}No ROMs found!{/center}'
		} else {
			romList.setItems(roms)
			statusBox.toggle()
		}
		screen.render()

		romList.on('select', (d) => {
			screen.destroy()
			const cpu = new CPU(d.content.split('.')[0]);
			const rom = fs.readFileSync(require.resolve(`../roms/${d.content}`));

			cpu.load(rom);
			cpu.startCycles();
		});
	}
}

module.exports = ChocoMain;
