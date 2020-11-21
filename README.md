<div align="center">
  <img src="https://modeus.is-inside.me/13fg3jgW.png" width="256">
	<blockquote>🍫 Chip-8 VM in the terminal, made with Node.js.</blockquote>
	<br>
</div>

ChocoVM is a Chip-8 VM that allows you to play any Chip-8 game. ChocoVM itself also acts as an extension with color, more RAM and other things.

# Install 
```
git clone https://github.com/Luvella/ChocoVM
cd ChocoVM
npm i
npm link
```
If you don't want to install globally, the `npm link` is not necessary.

# Usage
When installed globally, ChocoVM can be invoked with:
```
chocovm
```  

To avoid the menu and go straight to the game, you can do:
```
chocovm <ROM>.cvm
```  
For example: `chocovm RandomInt.cvm`

Original Chip-8 games have the `.c8` extension, so they can be run like: `chocovm RandomInt.c8`
