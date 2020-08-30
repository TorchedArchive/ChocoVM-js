const chocovm = require('../lib');
const fs = require('fs');

const args = process.argv.slice(2);
if (!args[0]) {
	chocovm.main.run()
} else {
	if (!fs.existsSync(`${__dirname}/../roms/${args[0]}`)) return console.log('Could not find that ROM.');

	const rom = fs.readFileSync(require.resolve(`../roms/${args[0]}`));
	const cpu = new chocovm.CPU(args[0], args[0].split('.')[1] === 'c8' ? true : false);

	cpu.load(rom);
	cpu.startCycles();
}