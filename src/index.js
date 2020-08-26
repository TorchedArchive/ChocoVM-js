const chocovm = require('../lib');
const fs = require('fs');

const args = process.argv.slice(2);
if (!args[0]) return console.log('Provide the name of the ROM to load.')
if (!fs.existsSync(require.resolve(`../roms/${args[0]}`))) return console.log('Could not find that ROM.');

const rom = fs.readFileSync(require.resolve(`../roms/${args[0]}`));
const cpu = new chocovm.CPU(args[0]);

cpu.load(rom);
cpu.startCycles();
