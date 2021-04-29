///////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------//
//----------H----H--X----X-----CCCCC-----22222----0000-----0000-----11-------//
//---------H----H----X-X-----C--------------2---0----0---0----0---1-1--------//
//--------HHHHHH-----X------C----------22222---0----0---0----0-----1---------//
//-------H----H----X--X----C----------2-------0----0---0----0-----1----------//
//------H----H---X-----X---CCCCC-----22222----0000-----0000----11111---------//
//---------------------------------------------------------------------------//
//----- Contact: hxc2001 at hxc2001.com ----------- https://hxc2001.com -----//
//----- (c) 2021 Jean-François DEL NERO ----------- http://hxc2001.free.fr --//
///////////////////////////////////////////////////////////////////////////////
// File : hw_init_table.h
// Contains: Hardware descriptors tables and hardware init table executor
//
// Written by: Jean-François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////

enum
{
	HW_INIT_GLOBAL_INIT = 0,
	HW_INIT_CLOCK_INIT
};


#define HIGH_DIGIT(value)       ( ( 0x30 + ( value / 10 ) ) << 16 )
#define LOW_DIGIT(value)        ( ( 0x30 + ( value - (value / 10) * 10 ) ) << 24 )
#define INT_TO_ASCIIWORD(value) ( HIGH_DIGIT(value) | LOW_DIGIT(value) )

#define CMD_DELAY         0xFFFF0000
#define CMD_WAITBITCLR    0xFFFF0001
#define CMD_WAITBITSET    0xFFFF0002
#define CMD_CLR           0xFFFF0003
#define CMD_SET           0xFFFF0004
#define CMD_READ_DATA     0xFFFF0005
#define CMD_MODIFY_DATA   0xFFFF0006 // OP + ADDRESS + MASK + DATA
#define CMD_WAITWORD      0xFFFF0007
#define CMD_INITCLK       0xFFFF0008
#define CMD_WRITE_DATA    0xFFFF000E
#define CMD_END           0xFFFF000F

void exec_hw_init_table(unsigned int table_id);
extern const unsigned char packed_hw_init[];
