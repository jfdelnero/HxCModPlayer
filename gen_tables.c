///////////////////////////////////////////////////////////////////////////////////
//-------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------//
//-----------H----H--X----X-----CCCCC----22222----0000-----0000------11----------//
//----------H----H----X-X-----C--------------2---0----0---0----0--1--1-----------//
//---------HHHHHH-----X------C----------22222---0----0---0----0-----1------------//
//--------H----H----X--X----C----------2-------0----0---0----0-----1-------------//
//-------H----H---X-----X---CCCCC-----222222----0000-----0000----1111------------//
//-------------------------------------------------------------------------------//
//----------------------------------------------------- http://hxc2001.free.fr --//
///////////////////////////////////////////////////////////////////////////////////
// File : gen_tables.c
// Contains: The finetune period table generator.
//           Only useful to update the table present in hxcmod.c
//
// Written by: Jean François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////////
//
///////////////////////////////////////////////////////////////////////////////////

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

void print_dec(int val,int index,int maxdigit,int maxindex, int numberperline)
{
	if(!(index%numberperline))
		printf("\t");
	else
		printf(" ");

	printf("%*d",maxdigit,val);

	if(index != maxindex)
	{
		printf(",");
	}

	if(index && !((index+1)%numberperline))
		printf("\n");
}

void print_str(char * str,int index,int maxindex, int numberperline)
{
	if(!(index%numberperline))
		printf("\t");
	else
		printf(" ");

	printf("%s",str);

	if(index != maxindex)
	{
		printf(",");
	}

	if(index && !((index+1)%numberperline))
		printf("\n");
}

static const short periodtable[]=
{
	27392, 25856, 24384, 23040, 21696, 20480, 19328, 18240, 17216, 16256, 15360, 14496,
	13696, 12928, 12192, 11520, 10848, 10240,  9664,  9120,  8606,  8128,  7680,  7248,
	 6848,  6464,  6096,  5760,  5424,  5120,  4832,  4560,  4304,  4064,  3840,  3624,
	 3424,  3232,  3048,  2880,  2712,  2560,  2416,  2280,  2152,  2032,  1920,  1812,
	 1712,  1616,  1524,  1440,  1356,  1280,  1208,  1140,  1076,  1016,   960,   906,
	  856,   808,   762,   720,   678,   640,   604,   570,   538,   508,   480,   453,
	  428,   404,   381,   360,   339,   320,   302,   285,   269,   254,   240,   226,
	  214,   202,   190,   180,   170,   160,   151,   143,   135,   127,   120,   113,
	  107,   101,    95,    90,    85,    80,    75,    71,    67,    63,    60,    56,
	   53,    50,    47,    45,    42,    40,    37,    35,    33,    31,    30,    28,
	   27,    25,    24,    22,    21,    20,    19,    18,    17,    16,    15,    14,
	   13,    13,    12,    11,    11,    10,     9,     9,     8,     8,     7,     7
};

int finetunes[16] = {0,1,2,3,4,5,6,7,-8,-7,-6,-5,-4,-3,-2,-1};

//
// Finetuning periods -> Amiga period * 2^(-finetune/12/8)
//

void generate_period_table()
{
	int i,j,c;
	float mul;

	printf("static const short periodtable[]=\n{\n");

	c = 0;
	for(i=0;i<16;i++)
	{
		mul = pow(2, ((float)-finetunes[i]/(float)12) / (float)8 );

		if(i)
			printf("\n");

		printf("\t// Finetune %d (* %f), Offset 0x%.4lx\n",finetunes[i],mul,i * sizeof(periodtable));

		for(j=0;j<sizeof(periodtable)/sizeof(short);j++)
		{
			print_dec((int)roundf(mul*periodtable[j]),c,5,(16*sizeof(periodtable)/sizeof(short)) - 1, 12);
			c++;
		}
	}

	printf("};\n");

	printf("\n\n");

	printf("static const short * periodtable_finetune_ptr[]=\n{\n\t");

	for(i=0;i<16;i++)
	{
		printf(" &periodtable[0x%.4lX]",(sizeof(periodtable)/sizeof(short))*i);
		if(i<(16)-1)
			printf(",");

		if(i && !((i+1)%4))
		{
			printf("\n");
			if(i<(16)-1)
				printf("\t");
		}
	}
	printf("};\n");

	printf("\n\n");

	return;
}

int main()
{
	generate_period_table();

	exit(0);
}
