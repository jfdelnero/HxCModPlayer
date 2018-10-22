#CC=i386-pc-linux-gcc
CC=gcc

INCLUDES = -I ../

CFLAGS=-O3 $(INCLUDES) -Wall -DFULL_STATE
LDFLAGS= -lc

all: generate_html

generate_html:  generate_html.o hxcmod.o
	$(CC) -o $@    $^ $(LDFLAGS)

generate_html.o: generate_html.c 
	$(CC) -o $@ -c $< $(CFLAGS)

hxcmod.o: ../hxcmod.c 
	$(CC) -o $@ -c $< $(CFLAGS)

clean:
	rm -rf *.o
	rm -rf *.so

mrproper: clean
	rm -rf $(EXEC)

.PHONY: clean mrproper
