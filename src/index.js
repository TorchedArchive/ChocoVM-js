const chocovm = require('../lib');

const args = process.argv.slice(2);
if (!args[0]) return console.log('Provide the name of the ROM to load.')
if (!fs.existsSync(`../roms/${args[0]}`)) return console.log('Could not find that ROM.');

const rom = fs.readFileSync(`../roms/${args[0]}`);
const cpu = new chocovm.CPU();

cpu.load(rom);
cpu.startCycles();
