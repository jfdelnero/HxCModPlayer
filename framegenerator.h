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

typedef struct framegenerator_
{
	unsigned int xres,yres;
	unsigned long * framebuffer;
	unsigned long * textbuffer;
	unsigned long * effectbuffer;

	unsigned long  instrucolortable[32];
}framegenerator;

framegenerator * init_fg(unsigned int xres,unsigned int yres);
unsigned long* fg_generateFrame(framegenerator * fg,tracker_buffer_state *tb,unsigned int currentsampleoffset);
void deinit_fg(framegenerator * fg);