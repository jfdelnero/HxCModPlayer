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
// File : fast_delta_sigma_dac_gen.h
// Contains: Fast delta sigma DAC data generator
//
// Written by: Jean-François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////

typedef struct delta_sigma_dac_gen_state_
{
	volatile unsigned short * wave_buffer;        // 0x00 - Wave ptr
	volatile unsigned char  * deltasigma_buffer;  // 0x04 - Delta sigma buffer
	volatile unsigned int     wave_offset;        // 0x08
	volatile unsigned int     encoded_dat_offset; // 0x0C
	volatile unsigned int     accumulator;        // 0x10
}delta_sigma_dac_gen_state;

unsigned int fast_delta_sigma_dac_gen(delta_sigma_dac_gen_state * p_gen_state);
