///////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------//
//----------H----H--X----X-----CCCCC-----22222----0000-----0000-----11-------//
//---------H----H----X-X-----C--------------2---0----0---0----0---1-1--------//
//--------HHHHHH-----X------C----------22222---0----0---0----0-----1---------//
//-------H----H----X--X----C----------2-------0----0---0----0-----1----------//
//------H----H---X-----X---CCCCC-----22222----0000-----0000----11111---------//
//---------------------------------------------------------------------------//
//----- Contact: hxc2001 at hxc2001.com ----------- https://hxc2001.com -----//
//----- (c) 2018-2021 Jean-François DEL NERO ------ http://hxc2001.free.fr --//
///////////////////////////////////////////////////////////////////////////////
// File : hw_init_table_gen.c
// Contains: HTIG / Hardware Init Table Generator
//
// Written by: Jean-François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <stdint.h>

#define PRINT_OBJ_TABLE 1
#define MAX_NB_BLOCKS 32

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

int save_bin(unsigned char * buf, int size,char * filename)
{
	FILE * fo;

	fo = fopen(filename,"wb");
	if(fo)
	{
		fwrite(buf,size,1,fo);
		fclose(fo);

		printf("save_bin: %s saved, size : %d bytes\n",filename,size);

		return 0;
	}
	else
	{
		printf("save_bin: ERROR ! can't save to %s !\n",filename);

		return -1;
	}
}

unsigned char* load_bin(int * size,char * filename)
{
	FILE * fi;
	int filesize;
	unsigned char * mem_buf;

	mem_buf = NULL;

	fi = fopen(filename,"rb");
	if( fi )
	{
		fseek( fi, 0, SEEK_END );
		filesize = ftell(fi);
		fseek( fi, 0, SEEK_SET );

		mem_buf = malloc(filesize);

		if( !fread(mem_buf,filesize,1,fi) )
		{
			goto error;
		}

		fclose(fi);

		if(size)
			*size = filesize;

		printf("load_bin: %s loaded, size : %d bytes\n",filename,filesize);
	}
	else
	{
		goto error;
	}

	return mem_buf;

error:
	printf("load_bin: ERROR ! Can't load %s !\n",filename);

	if(mem_buf)
		free(mem_buf);
	if(fi)
		fclose(fi);

	return NULL;
}

int write_c_file(unsigned char * buf, int size,char * filename,char * varname)
{
	FILE * fo;
	int i;

	fo = fopen(filename,"w");
	if(fo)
	{
		fprintf(fo,"///////////////////////////////////////////////////////////////////////////////\n");
		fprintf(fo,"//---------------------------------------------------------------------------//\n");
		fprintf(fo,"//----------H----H--X----X-----CCCCC-----22222----0000-----0000-----11-------//\n");
		fprintf(fo,"//---------H----H----X-X-----C--------------2---0----0---0----0---1-1--------//\n");
		fprintf(fo,"//--------HHHHHH-----X------C----------22222---0----0---0----0-----1---------//\n");
		fprintf(fo,"//-------H----H----X--X----C----------2-------0----0---0----0-----1----------//\n");
		fprintf(fo,"//------H----H---X-----X---CCCCC-----22222----0000-----0000----11111---------//\n");
		fprintf(fo,"//---------------------------------------------------------------------------//\n");
		fprintf(fo,"//----- Contact: hxc2001 at hxc2001.com ----------- https://hxc2001.com -----//\n");
		fprintf(fo,"//----- (c) 2018-2021 Jean-François DEL NERO ------ http://hxc2001.free.fr --//\n");
		fprintf(fo,"///////////////////////////////////////////////////////////////////////////////\n");
		fprintf(fo,"// File generated by HTIG / Hardware Init Table Generator                    //\n");
		fprintf(fo,"///////////////////////////////////////////////////////////////////////////////\n\n");

		fprintf(fo,"const unsigned char __attribute__ ((aligned (16))) %s[]=\n{\n\t",varname);

		for(i=0;i<size;i++)
		{
			if(!(i&0xF) && i)
				fprintf(fo,"\n\t");

			fprintf(fo,"0x%.2X",buf[i]);

			if( i!= (size - 1) )
				fprintf(fo,",");
		}
		fprintf(fo,"\n};\n");
		fclose(fo);

		printf("write_c_file: %s saved\n",filename);

		return 0;
	}
	else
	{
		printf("write_c_file: ERROR : Can't create %s !\n",filename);
	}

	return -1;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

unsigned char * search_block(unsigned char * membuf, int memlen, unsigned char * tosearch, int arraylen)
{
	int i;

	for(i=0;i < (memlen - (arraylen+16)); i++)
	{
		if( !memcmp(&membuf[i],tosearch,arraylen) )
		{
			return &membuf[i];
		}
	}

	return NULL;
}

unsigned char get_mask(uint32_t old,uint32_t new, int * final_size)
{
	uint32_t mask;
	int size,i;

	mask = 0;
	size = 0;

	for(i=0;i<4;i++)
	{
		if( (old&(0xFF<<(i*8))) != (new&(0xFF<<(i*8))) )
		{
			mask |= (0x01<<i);
			size++;
		}
	}

	if(final_size)
		*final_size = size;

	return mask;
}

typedef struct io_op_state_
{
	uint32_t encode_address;
	uint32_t encode_data;
	uint32_t encode_mask;
}io_op_state;

//
// -- Opcodes definition --
// |TTttOOOO|mmmmMMMM|Address (0-4)|DATA1(0-4)|DATA2(0-4)|
//             (ext)
// OOOO : Opcode
// TT   : 00 Normal, 01 : With byte masks
// tt   : 00 Same address 01 Byte offset 10 Short Offset 11 Long Offset
// mmmm : DATA1 byte mask
// MMMM : DATA2 byte mask
//

#define CMD_DELAY          0xFFFF0000
#define CMD_WAITBITCLR     0xFFFF0001
#define CMD_WAITBITSET     0xFFFF0002
#define CMD_CLR            0xFFFF0003
#define CMD_SET            0xFFFF0004
#define CMD_READ_DATA      0xFFFF0005
#define CMD_MODIFY_DATA    0xFFFF0006 // OP + ADDRESS + MASK + DATA
#define CMD_WAITWORD       0xFFFF0007
#define CMD_INITCLK        0xFFFF0008
#define CMD_WRITE_DATA     0xFFFF000E
#define CMD_END            0xFFFF000F

int encode_op_code(io_op_state * io_state,uint32_t new_data,uint32_t new_mask,uint32_t new_address, int flag,unsigned char op,unsigned char * out_buffer,int index)
{
	int i;
	int data_size,mask_size,address_size;
	unsigned char data_mask,mask_mask,address_mask;

	int sign;
	int total_size;
	uint32_t delta,adr_mask;
	unsigned char op_type,addr_type;
	int32_t delta_signed;

	total_size = 0;
	data_size = 0;
	mask_size = 0;
	address_size = 0;

	delta_signed = 0;

	data_mask = 0;
	mask_mask = 0;
	address_mask = 0;

	if(flag&0x01)
	{
		data_mask = get_mask(io_state->encode_data,new_data, &data_size);
		total_size += data_size;
		io_state->encode_data = new_data;
	}

	if(flag&0x04)
	{
		mask_mask = get_mask(io_state->encode_mask,new_mask, &mask_size);
		total_size += mask_size;
		io_state->encode_mask = new_mask;
	}

	sign = 0;

	if(flag&0x02)
	{

		if( new_address >= io_state->encode_address )
		{
			delta = new_address - io_state->encode_address;
		}
		else
		{
			delta = io_state->encode_address - new_address;
			sign = 1;
		}

		if(delta > 0x7FFFFF)
			adr_mask = 0xFFFFFFFF;
		else
			if(delta > 0x7FFF)
				adr_mask = 0xFFFFFFFF;
			else
				if(delta > 0x7F)
					adr_mask = 0xFFFF;
				else
					if(delta > 0x00)
						adr_mask = 0xFF;
					else
						adr_mask = 0x00;

		delta_signed = delta;
		if(sign)
			delta_signed = -delta_signed;

		address_mask = get_mask(0x00000000,adr_mask, &address_size);
		total_size += address_size;
		io_state->encode_address = new_address;
	}

	op_type = 0;
	addr_type = 0;

	total_size++;

	if( (flag&0x04) && (flag&0x01) && ((data_size+mask_size)<8) )
	{
		op_type = 0x1;
		total_size++;
	}
	else
	{
		if((flag&0x04) && mask_size<4)
		{
			op_type = 0x1;
			total_size++;
		}

		if((flag&0x01) && data_size<4)
		{
			op_type = 0x1;
			total_size++;
		}
	}

	// tt : 00 Same address 01 Byte offset 10 Short Offset 11 Long Offset
	switch(address_size)
	{
		case 0:
			addr_type = 0x0;
		break;
		case 1:
			addr_type = 0x1;
		break;
		case 2:
			addr_type = 0x2;
		break;
		case 3:
		case 4:
			addr_type = 0x3;
		break;
	}

	out_buffer[ index++ ] = (op_type << 6) | (addr_type << 4) | (op & 0xF);
	if(op_type == 0x01)
	{
		out_buffer[ index++ ] = (( data_mask << 4) | (mask_mask & 0xF));
	}

	for(i=0;i<4;i++)
	{
		if( address_mask & (0x8>>i) )
		{
			out_buffer[ index++ ] = ((delta_signed & (0xFF<<((3-i)*8))) >> ((3-i) * 8));
		}
	}

	for(i=0;i<4;i++)
	{
		if( data_mask & (0x8>>i) )
		{
			out_buffer[ index++ ] = ((new_data & (0xFF<<((3-i)*8))) >> ((3-i) * 8));
		}
	}

	for(i=0;i<4;i++)
	{
		if( mask_mask & (0x8>>i) )
		{
			out_buffer[ index++ ] = ((new_mask & (0xFF<<((3-i)*8))) >> ((3-i) * 8));
		}
	}

	//printf("total size = %d\n",total_size);

	return total_size;
}

int exec_table_init(const uint32_t * table,unsigned char * outbuffer,int index)
{
	int i;
	uint32_t ptr;
	uint32_t data,mask;
	uint32_t address;
	int total_size,cur_encode_size;
	io_op_state encode_state;

	ptr = 0x00000000;
	total_size = 0;
	address = 0x00000000;
	data = 0x00000000;
	mask = 0x00000000;

	encode_state.encode_address = 0x00000000;
	encode_state.encode_data = 0x00000000;
	encode_state.encode_mask = 0x00000000;

	cur_encode_size = 0;
	i = 0;

	//if(table[i] == 0x434F4C42)
	//  i += 2;

	while( table[i] )
	{
		if( ( table[i] >> 16 != 0xFFFF ) )
		{
			ptr = (uint32_t)table[i++];
			#ifdef PRINT_OBJ_TABLE
			printf("[0x%.4X] WRITE_DATA      : ADDRESS 0x%.8X DATA 0x%.8X\n",i,ptr,table[i]);
			#endif
			cur_encode_size = encode_op_code(&encode_state,table[i],0,ptr, 0x01 | 0x02,CMD_WRITE_DATA&0xFF,outbuffer,index);
			total_size += cur_encode_size;
			index += cur_encode_size;
			i++;
			//*ptr = table[i++];
		}
		else
		{
			switch( table[i++] )
			{
				case CMD_READ_DATA:
					address = table[i++];
					ptr = (uint32_t)address;
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_READ_DATA   : ADDRESS 0x%.8X\n",i,address);
					#endif
					cur_encode_size = encode_op_code(&encode_state,table[i],0,ptr, 0x02,CMD_READ_DATA&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					//data = *ptr;
				break;
				/*case CMD_MASK_DATA:
					data = data & table[i++];
				break;
				case CMD_MASKCLR_DATA:
					data = data & (~table[i++]);
				break;
				case CMD_OR_DATA:
					data = data | table[i++];
				break;
				case CMD_OR_WRITE_DATA:
					data = data | table[i++];
					ptr = (uint32_t)address;
					*ptr = data;
				break;
				case CMD_WRITE_DATA:
					ptr = (uint32_t)table[i++];
					*ptr = data;
				break;
				case CMD_SET_ADDR:
					address = table[i++];
				break;*/
				case CMD_WAITBITSET:
					ptr  = (uint32_t)table[i++];
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_WAITBITSET  : ADDRESS 0x%.8X MASK 0x%.8X\n",i,ptr,table[i]);
					#endif
					cur_encode_size = encode_op_code(&encode_state,table[i],0,ptr, 0x01 | 0x02,CMD_WAITBITSET&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					//while ( !(*ptr & table[i]) );
					i++;
				break;
				case CMD_WAITBITCLR:
					ptr  = (uint32_t)table[i++];
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_WAITBITCLR  : ADDRESS 0x%.8X MASK 0x%.8X\n",i,ptr,table[i]);
					#endif
					cur_encode_size = encode_op_code(&encode_state,table[i],0,ptr, 0x01 | 0x02,CMD_WAITBITCLR&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					//while ( (*ptr & table[i]) );
					i++;
				break;
				case CMD_INITCLK:
					//exec_table_init((const uint32_t*)&clk_init);
					//exec_table_init(get_inittable(5)); //clk_init
					//SystemCoreClock = 72000000;
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_INITCLK\n",i);
					#endif
					cur_encode_size = encode_op_code(&encode_state,table[i],0,ptr, 0,CMD_INITCLK&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					i++;
				break;
				case CMD_DELAY:
					// Delay
					//uswait(table[i++]);
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_DELAY       : %d uS\n",i,table[i]);
					#endif
					cur_encode_size = encode_op_code(&encode_state,table[i],0,ptr, 0x01,CMD_DELAY&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					i++;
				break;
				case CMD_MODIFY_DATA: //OP + ADDRESS + MASK + DATA
					ptr  = (uint32_t)table[i++];
					mask = table[i++];
					data = table[i++];
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_MODIFY_DATA : ADDRESS 0x%.8X MASK 0x%.8X DATA 0x%.8X\n",i,ptr,mask,data);
					#endif
					cur_encode_size = encode_op_code(&encode_state,data,mask,ptr, 0x01 | 0x02 | 0x04,CMD_MODIFY_DATA&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					//*ptr = (( *ptr & (~mask) ) | (data & mask));
				break;
				case CMD_WAITWORD: //OP + ADDRESS + MASK + DATA
					ptr  = (uint32_t)table[i++];
					mask = table[i++];
					data = table[i++];
					//while ( (*ptr & mask) != (data & mask) );
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_WAITWORD    : ADDRESS 0x%.8X MASK 0x%.8X DATA 0x%.8X\n",i,ptr,mask,data);
					#endif
					cur_encode_size = encode_op_code(&encode_state,data,mask,ptr, 0x01 | 0x02 | 0x04,CMD_WAITWORD&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
				break;
				case CMD_CLR:
					ptr  = (uint32_t)table[i++];
					//*ptr &= (~table[i++]);
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_CLR         : ADDRESS 0x%.8X DATA 0x%.8X\n",i,ptr,table[i]);
					#endif
					cur_encode_size = encode_op_code(&encode_state,table[i],mask,ptr, 0x01 | 0x02,CMD_CLR&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					i++;
				break;
				case CMD_SET:
					ptr  = (uint32_t)table[i++];
					//*ptr |= table[i++];
					#ifdef PRINT_OBJ_TABLE
					printf("[0x%.4X] CMD_SET         : ADDRESS 0x%.8X DATA 0x%.8X\n",i,ptr,table[i]);
					#endif
					cur_encode_size = encode_op_code(&encode_state,table[i],mask,ptr, 0x01 | 0x02,CMD_SET&0xFF,outbuffer,index);
					total_size += cur_encode_size;
					index += cur_encode_size;
					i++;
				break;
			}
		}
	}

	cur_encode_size = encode_op_code(&encode_state,0x00000000,0x00000000,ptr, 0x00,CMD_END&0xFF,outbuffer,index);
	total_size += cur_encode_size;

	return total_size;
}

typedef struct _decode_op_stat
{
	uint32_t current_address;
	uint32_t current_data;
	uint32_t current_mask;
	unsigned char op;
}decode_op_stat;

static const unsigned char * update_var(const unsigned char * opcode_buffer, uint32_t * var,unsigned int mask)
{
	int i;

	i = 4;
	while(i--)
	{
		if((0x01<<i) & mask)
		{
			*var &= ~(0xFF << (i*8));
			*var |= (*opcode_buffer++ << (i*8));
		}
	}

	return opcode_buffer;
}

int decode_opcode(const unsigned char * opcode_buffer, decode_op_stat * op_stat)
{
	unsigned char datamask;
	unsigned char addressmask;
	unsigned char opcode;
	uint32_t      address;
	const unsigned char * start_ptr;

	/*
	unsigned char i;
	printf("%.8X :",opcode_buffer);

	for(i=0;i<8;i++)
		printf("%.2X ",opcode_buffer[i]);

		printf("\n");
	*/

	start_ptr = opcode_buffer;

	datamask = 0xF0;
	addressmask = 0x0F;

	opcode = *opcode_buffer;
	opcode_buffer++;

	op_stat->op = opcode & 0xF;

	if( ( op_stat->op == (CMD_WAITWORD&0xF) ) || ( op_stat->op == (CMD_MODIFY_DATA&0xF) ) )
		datamask = 0xFF;

	if(opcode & 0xC0)
	{
		datamask = *opcode_buffer;
		opcode_buffer++;
	}

	if( ( op_stat->op == (CMD_READ_DATA&0xF) ) || ( op_stat->op == (CMD_INITCLK&0xF) ) )
		datamask = 0x00;

	// tt : 00 Same address 01 Byte offset 10 Short Offset 11 Long Offset
	addressmask = (opcode>>4)&0x3;
	if(addressmask == 0x3)
		addressmask = 0xF;

	if(addressmask == 0x2)
		addressmask = 0x3;

	address = 0x00000000;

	if((*opcode_buffer & 0x80) && addressmask)
	{
		address = 0xFFFFFFFF;
	}

	opcode_buffer = update_var(opcode_buffer, &address,addressmask);

	op_stat->current_address = op_stat->current_address + address;

	opcode_buffer = update_var(opcode_buffer, &op_stat->current_data,datamask>>4);
	opcode_buffer = update_var(opcode_buffer, &op_stat->current_mask,datamask);

	return opcode_buffer-start_ptr;
}

#define PRINT_NEW_TABLE 1

void exec_hw_init_table(const unsigned char * packed_hw_init,unsigned int table_id)
{
	decode_op_stat stat;
	//volatile unsigned int data;
	const unsigned char * table;

	table = (const unsigned char *)packed_hw_init;
	table += *(((unsigned short*)packed_hw_init) + table_id);

	stat.current_address = 0x00000000;
	stat.current_data    = 0x00000000;
	stat.current_mask    = 0x00000000;
	stat.op = 0x00;

	while(1)
	{
		table += decode_opcode(table, &stat);
		switch(stat.op)
		{
			case (CMD_DELAY&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_DELAY       : %d uS\n",stat.current_data);
				#endif
				//uswait(stat.current_data);
			break;
			case (CMD_WAITBITCLR&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WAITBITCLR  : ADDRESS 0x%.8X MASK 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				//while ( (*stat.current_address & stat.current_data) );
			break;
			case (CMD_WAITBITSET&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WAITBITSET  : ADDRESS 0x%.8X MASK 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				//while ( !(*stat.current_address & stat.current_data) );
			break;
			case (CMD_CLR&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_CLR         : ADDRESS 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				//*stat.current_address &= (~stat.current_data);
			break;
			case (CMD_SET&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_SET         : ADDRESS 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				//*stat.current_address |= (stat.current_data);
			break;
			case (CMD_READ_DATA&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_READ_DATA   : ADDRESS 0x%.8X\n",stat.current_address);
				#endif
				//data = *stat.current_address;
			break;
			case (CMD_MODIFY_DATA&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_MODIFY_DATA : ADDRESS 0x%.8X MASK 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_mask,stat.current_data);
				#endif
				//*stat.current_address = (( *stat.current_address & (~stat.current_mask) ) | (stat.current_data & stat.current_mask));
			break;
			case (CMD_WAITWORD&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WAITWORD    : ADDRESS 0x%.8X MASK 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_mask,stat.current_data);
				#endif
				//while ( (*stat.current_address & stat.current_mask) != (stat.current_data & stat.current_mask) );
			break;
			case (CMD_INITCLK&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_INITCLK\n");
				#endif
				//exec_hw_init_table(5); //clk_init
				//SystemCoreClock = 72000000;
			break;
			case (CMD_WRITE_DATA&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WRITE_DATA  : ADDRESS 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				//*stat.current_address = stat.current_data;
			break;
			default:
				#ifdef PRINT_NEW_TABLE
				printf("bad/end opcode : %x\n",stat.op);
				#endif
				goto end_loop;
			break;
		}
	}
end_loop:
	return;
}

int main(int argc, char *argv[])
{
	int i,ret;
	int filesize;
	int blk_count;
	unsigned char *obj_buf,*encode_mem_buf;
	unsigned char *start_ptr,*end_ptr;
	int total_size,encode_index,cur_encode_size;
	unsigned char start_marker[]="BLOCK_00";
	unsigned char end_marker[]="ENDBLK00";
	char tmp_filename[256];

	obj_buf = NULL;
	encode_mem_buf = NULL;

	printf("---------------------------------------------------------------------\n");
	printf("--           HITG / Hardware Init Table Generator  v2.1            --\n");
	printf("--          (c)2018/2021 Jean-François DEL NERO / HxC2001          --\n");
	printf("---------------------------------------------------------------------\n");

	if(argc > 2)
	{
		obj_buf = load_bin(&filesize,argv[1]);
		if(obj_buf)
		{
			encode_mem_buf = malloc(filesize);
			if(!encode_mem_buf)
			{
				printf("ERROR : memory allocation error !\n");
				goto main_error;
			}

			total_size = 0;
			encode_index = 0;
			blk_count = 0;

			for(i=0;i<MAX_NB_BLOCKS;i++)
			{
				start_marker[6] = '0' + (i/10);
				start_marker[7] = '0' + (i%10);

				end_marker[6] = '0' + (i/10);
				end_marker[7] = '0' + (i%10);

				start_ptr = search_block( obj_buf, filesize, start_marker, 8);

				end_ptr = search_block( obj_buf, filesize, end_marker, 8);

				if(start_ptr && end_ptr)
				{
					blk_count++;
				}
				else
				{
					break;
				}
			}

			printf("%d block(s) found in the object file...\n",blk_count);

			total_size = blk_count * 2;
			encode_index = blk_count * 2;

			for(i=0;i<blk_count;i++)
			{
				start_marker[6] = '0' + (i/10);
				start_marker[7] = '0' + (i%10);

				end_marker[6]   = '0' + (i/10);
				end_marker[7]   = '0' + (i%10);

				start_ptr = search_block( obj_buf, filesize, start_marker, 8);
				end_ptr = search_block( obj_buf, filesize, end_marker, 8);

				if(start_ptr && end_ptr)
				{
					printf("Processing block %d (%d bytes)...\n",i,(int)((end_ptr-start_ptr)-(8)));

					encode_mem_buf[i*2] = (encode_index & 0xFF);
					encode_mem_buf[(i*2)+1] = (encode_index>>8) & 0xFF;

					cur_encode_size = exec_table_init((const uint32_t *)(start_ptr+8),encode_mem_buf,encode_index);

					printf("Testing the re-encoded block %d (%d bytes)...\n",i,cur_encode_size);
					exec_hw_init_table(encode_mem_buf,i);

					total_size += cur_encode_size;
					encode_index += cur_encode_size;
				}
			}

			printf("Re-encoded buffer total size : %d\n",total_size);

			sprintf(tmp_filename,"%s.bin",argv[2]);
			ret = save_bin(encode_mem_buf, total_size, tmp_filename);
			if(ret < 0)
				goto main_error;

			sprintf(tmp_filename,"%s.c",argv[2]);
			ret = write_c_file(encode_mem_buf, total_size, tmp_filename,"packed_hw_init");
			if(ret < 0)
				goto main_error;

			free(encode_mem_buf);
			free(obj_buf);
		}
		else
		{
			printf("ERROR : can't load %s !\n",argv[0]);
			exit(-1);
		}
	}
	else
	{
		printf("Syntax : %s [OBJECT_FILE.O] [OUTPUT_FILE_BASE_NAME (without the file extension)]\n",argv[0]);
	}

	exit(0);

	return 0;

main_error:
	if(encode_mem_buf)
		free(encode_mem_buf);

	if(obj_buf)
		free(obj_buf);

	exit(-1);

}
