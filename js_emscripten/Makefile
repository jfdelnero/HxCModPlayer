CC=gcc
EMCC=emcc

INCLUDES = -I ../

CFLAGS=-O3 $(INCLUDES) -Wall -DEFFECTS_USAGE_STATE
LDFLAGS= -lc

EMCC_CFLAGS=-O3 $(INCLUDES) -Wall
EMCC_LDFLAGS=-s EXPORTED_FUNCTIONS="['_malloc','_free','_loadMod','_getNextSoundData','_unloadMod','_main']" -s WASM=0

all: generate_html js_hxcmod_player.js
	cp js_hxcmod_player.js ./www

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

js_hxcmod_player.js: hxcmod.bc js_hxcmod_player.bc
	$(EMCC) -o $@    $^ $(EMCC_LDFLAGS)


clean:
	rm -rf *.o
	rm -rf *.so
	rm -rf *.js
	rm -rf *.wasm
	rm -rf *.bc

mrproper: clean
	rm -rf $(EXEC)

.PHONY: clean mrproper

