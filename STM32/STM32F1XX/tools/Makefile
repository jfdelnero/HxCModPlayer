CC=gcc
CFLAGS=-O3 -g -Wall
LDFLAGS=-lc
EXEC=hw_init_table_gen

all: clean hw_init_data

hw_init_data: hw_init_table_gen
	rm -rf hw_init_data.bin hw_init_data.c
	./hw_init_table_gen ../build/hw_init_table.o hw_init_data
	cp hw_init_data.c ../Src

hw_init_table_gen: hw_init_table_gen.o
	$(CC) -o $@    $^ $(LDFLAGS)

hw_init_table_gen.o: hw_init_table_gen.c
	$(CC) -o $@ -c $< $(CFLAGS)

clean:
	rm -rf *.o *.bin hw_init_data.c $(EXEC) $(EXEC).exe

mrproper: clean
	rm -rf $(EXEC) $(EXEC).exe

.PHONY: clean mrproper
