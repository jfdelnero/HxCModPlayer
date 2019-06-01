CC=gcc
EMCC=emcc

INCLUDES = -I ../

CFLAGS=-O3 $(INCLUDES) -Wall -DEFFECTS_USAGE_STATE -DHXCMOD_MAXCHANNELS=999
LDFLAGS= -lc

EMCC_CFLAGS=-O3 $(INCLUDES) -Wall -DHXCMOD_MAXCHANNELS=999
EMCC_LDFLAGS_WASM=-s EXPORTED_FUNCTIONS="['_malloc','_free','_loadMod','_getNextSoundData','_unloadMod','_main']" -s BINARYEN=1 -s BINARYEN_METHOD='native-wasm'
EMCC_LDFLAGS=-s EXPORTED_FUNCTIONS="['_malloc','_free','_loadMod','_getNextSoundData','_unloadMod','_main']" -s WASM=0 -s LEGACY_VM_SUPPORT=1

all: generate_html js_hxcmod_player_asmjs.js js_hxcmod_player_wasm.js
	cp js_hxcmod_player_asmjs.js ./www
	cp js_hxcmod_player_wasm.js ./www
	cp js_hxcmod_player_wasm.wasm ./www

generate_html:  generate_html.o hxcmod.o
	$(CC) -o $@    $^ $(LDFLAGS)

generate_html.o: generate_html.c
	$(CC) -o $@ -c $< $(CFLAGS)

hxcmod.o: ../hxcmod.c
	$(CC) -o $@ -c $< $(CFLAGS)

hxcmod.bc: ../hxcmod.c
	$(EMCC) -o $@ -c $< $(EMCC_CFLAGS)

js_hxcmod_player.bc: js_hxcmod_player.c
	$(EMCC) -o $@ -c $< $(EMCC_CFLAGS)

js_hxcmod_player_asmjs.js: hxcmod.bc js_hxcmod_player.bc
	$(EMCC) -o $@    $^ $(EMCC_LDFLAGS)

js_hxcmod_player_wasm.js: hxcmod.bc js_hxcmod_player.bc
	$(EMCC) -o $@    $^ $(EMCC_LDFLAGS_WASM)

clean:
	rm -rf *.o
	rm -rf *.so
	rm -rf *.js
	rm -rf *.wasm
	rm -rf *.bc

mrproper: clean
	rm -rf $(EXEC)

.PHONY: clean mrproper

