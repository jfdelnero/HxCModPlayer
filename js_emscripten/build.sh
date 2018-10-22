rm *.bc *.wasm *.htm *.js
emcc -I./ -I../ -O3 ../hxcmod.c -o hxcmod.bc
emcc -I./ -I../ -O3 js_hxcmod_player.c -o js_hxcmod_player.bc
emcc hxcmod.bc js_hxcmod_player.bc -s EXPORTED_FUNCTIONS="['_malloc','_free','_loadMod','_getNextSoundData','_unloadMod','_main']" -o js_hxcmod_player.js
cp js_hxcmod_player.js ./www
cp js_hxcmod_player.wasm ./www

