CC=gcc
CFLAGS=-O3
LDFLAGS=-lc -lm -lSDL
EXEC=hxcmodplayer 

all: $(EXEC)
      
hxcmodplayer: hxcmodplayer.o framegenerator.o hxcmod.o pack.o lzw.o
	$(CC) -o $@    $^ $(LDFLAGS) 

hxcmodplayer.o: hxcmodplayer.c
	$(CC) -o $@ -c $< $(CFLAGS)

hxcmod.o: ../hxcmod.c ../hxcmod.h
	$(CC) -o $@ -c $< $(CFLAGS)

framegenerator.o: ../framegenerator.c ../framegenerator.h
	$(CC) -o $@ -c $< $(CFLAGS)

pack.o: ../packer/pack.c ../packer/pack.h
	$(CC) -o $@ -c $< $(CFLAGS)

lzw.o: ../packer/lzw.c ../packer/lzw.h
	$(CC) -o $@ -c $< $(CFLAGS)

clean:
	rm -rf *.o

mrproper: clean
	rm -rf $(EXEC)

.PHONY: clean mrproper
