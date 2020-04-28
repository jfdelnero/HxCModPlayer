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
// File : sb_io.h
// Contains: Low level Sound blaster IO function and IRQ vector
//
// Written by: Jean Fran�ois DEL NERO
///////////////////////////////////////////////////////////////////////////////////

#define SB_DSP_RESET_REG           0x6
#define SB_DSP_READ_REG            0xA
#define SB_DSP_WRITE_DATCMD_REG    0xC
#define SB_DSP_READ_BUF_IT_STATUS  0xE
#define SB_DSP_IT16B_STATUS        0xF

#define DSP_CMD_8BITS_PCM_OUTPUT    0x1C
#define DSP_CMD_SAMPLE_RATE         0x40
#define DSP_CMD_OUTPUT_RATE         0x41
#define DSP_CMD_BLOCK_TRANSFER_SIZE 0x48
#define DSP_CMD_TRANSFER_MODE       0xB6
#define DSP_CMD_ENABLE_SPEAKER      0xD1
#define DSP_CMD_STOP                0xD5
#define DSP_CMD_DMA8_EXITAUTOMODE   0xDA
#define DSP_CMD_VERSION             0xE1

extern volatile unsigned char it_flag;
extern volatile unsigned char it_toggle;
extern volatile unsigned char it_irq;
extern volatile unsigned int  it_sbport;

extern unsigned short get_cur_ds( );
extern void install_irq();
extern void uninstall_irq();
extern void SB_DSP_wr(unsigned int baseport, unsigned char value);
extern unsigned char SB_DSP_rd(unsigned int baseport);
