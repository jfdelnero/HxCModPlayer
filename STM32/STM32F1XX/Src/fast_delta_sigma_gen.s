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
// File : fast_delta_sigma_dac_gen.s
// Contains: Fast delta sigma DAC data generator
//
// Written by: Jean-François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////

#include "buildconf.h"

  .syntax unified
  .cpu cortex-m3
  .thumb

  .p2align 3 // 64 bits FLASH alignment

  .global fast_delta_sigma_dac_gen

/*
	typedef struct delta_sigma_dac_gen_state_
	{
		volatile unsigned short * wave_buffer;        // 0x00 - Wave ptr
		volatile unsigned char  * deltasigma_buffer;  // 0x04 - Delta sigma buffer
		volatile unsigned int     wave_offset;        // 0x08
		volatile unsigned int     encoded_dat_offset; // 0x0C
		volatile unsigned int     accumulator;        // 0x10
	}delta_sigma_dac_gen_state;
*/

#define  state_wave_buffer        0x00
#define  state_deltasigma_buffer  0x04
#define  state_wave_offset        0x08
#define  state_encoded_dat_offset 0x0C
#define  state_accumulator        0x10

.macro deltasigma_bitgen
	adds  r6, r6, r0            // add the wave value to the accumulator.
	lsr   r1, r1, #1            // delta_sigma_word >>= 1
	it    cs
	orrcs r1, r1, #0x80000000   // If overflow occurs at the previous add
								// set the higher bit
.endm

//  void fast_delta_sigma_dac_gen(delta_sigma_dac_gen_state * p_gen_state)
.thumb
.thumb_func
fast_delta_sigma_dac_gen:

	push  {r4, r5, r6, r7, r8, r9, r10, fp, lr}

	mov   r7,r0                                          // Backup struct ptr

	ldr   r4, [r7, state_wave_buffer]
	ldr   r8, [r7, state_wave_offset]

	ldr   r5, [r7, state_deltasigma_buffer]
	ldr   r9, [r7, state_encoded_dat_offset]

	ldrh  r6, [r7, state_accumulator]
	lsl   r6, r6, #16

	mov   r10, #0xFF
	orr   r10, r10, #0x0700
	mov   r1, 0

	mov   r3, #128
block_loop:

	ldrh  r0, [r4, r8]
	add   r8, r8, #2

	and   r8, r8, r10       // #(2048-1)
	lsl   r0, r0, #16       // left shifted sample.

	mov   r2, #8            // Generate 32 Bytes  (4*8)
inner_acc_loop:

	// Generate a 32 bits delta-sigma word
.rept 32
	deltasigma_bitgen
.endr

	str   r1, [r5, r9]      // store the new delta-sigma word
	add   r9, r9, #4

	subs  r2, r2, #1
	bne   inner_acc_loop

	subs  r3, r3, #1
	bne   block_loop

	lsr   r6, r6, #16

	strh  r6, [r7, state_accumulator]
	str   r8, [r7, state_wave_offset]
	str   r9, [r7, state_encoded_dat_offset]

	// leave function...
	pop   {r4, r5, r6, r7, r8, r9, r10, fp, pc}

//////////////////////////////////////////////////////////////////////////////////////////
