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
// File : framegenerator.h
// Contains: frame generator for the mod player
//
// Written by: Jean François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////////
#ifndef FRAMEGENERATOR_H
#define FRAMEGENERATOR_H

#ifdef __cplusplus
extern "C" {
#endif

typedef struct framegenerator_
{
	unsigned int xres,yres;
	uint32_t * framebuffer;
	uint32_t * textbuffer;
	uint32_t * effectbuffer;

	uint32_t  instrucolortable[32];
}framegenerator;


framegenerator * init_fg(unsigned int xres,unsigned int yres);
uint32_t * fg_generateFrame(framegenerator * fg,tracker_buffer_state *tb,unsigned int currentsampleoffset);
void deinit_fg(framegenerator * fg);

#ifdef __cplusplus
}
#endif

#endif /* FRAMEGENERATOR_H */
