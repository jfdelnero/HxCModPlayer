call emcc.bat -Wno-pointer-sign -I./ -I../ -Os -O3 --llvm-lto 1 -s NO_FILESYSTEM=1 js_hxcmod_player.c ../hxcmod.c -s EXPORTED_FUNCTIONS="['_malloc','_free','_loadMod','_getNextSoundData','_unloadMod']" -o js_hxcmod_player.html
copy js_hxcmod_player.js .\www


