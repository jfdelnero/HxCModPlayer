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
// File : framegenerator.c
// Contains: frame generator for the mod player
//
// Written by: Jean François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////////

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <stdarg.h>
#include <sys/types.h>
#include <sys/stat.h>

#include "hxcmod.h"
#include "framegenerator.h"

#include "packer/pack.h"

#include "data_files/data_bmp_font8x8_bmp.h"

bmaptype * bmplist[40];

void printchar(framegenerator * fg,bmaptype * font,int xpos,int ypos,unsigned char c)
{
	int i,j,cxpos,cypos;
	unsigned long * fontbuf;

	fontbuf = (unsigned long *)font->data;

	cxpos = (c%(font->Xsize / 8))*8;
	cypos = (c / (font->Xsize / 8)) * 8;

	for(i=0;i<8;i++)
	{
		for(j=0;j<8;j++)
		{
			fg->textbuffer[((ypos+i)*fg->xres)+ xpos + j] = fontbuf[(cypos+i)*font->Xsize + cxpos + j];
		}
	}
}

void printstring(framegenerator * fg,char * str,int xpos,int ypos)
{
	int i;

	i=0;
	while(str[i])
	{
		printchar(fg,bmplist[0],xpos + (i*8) ,ypos,str[i]);
		i++;
	}

}

int graphprintf(framegenerator * fg,int xpos,int ypos,char * chaine, ...)
{
	char tmpbuf[512];

	va_list marker;
	va_start( marker, chaine );

	vsprintf((char*)&tmpbuf,chaine,marker);

	printstring(fg,tmpbuf,xpos,ypos);

	va_end( marker );
	return 0;
}


void convert1b32b(unsigned char * source, unsigned char * dest,unsigned short sx,unsigned short sy)
{
	unsigned long i,j;

	for(i=0;i<(unsigned long)((sx*sy)/8);i++)
	{
		for(j=0;j<8;j++)
		{

			if(source[i]&(0x80>>j))
			{
				dest[((i*8+j)*4)+0 ]= 0xFF;
				dest[((i*8+j)*4)+1 ]= 0xFF;
				dest[((i*8+j)*4)+2 ]= 0xFF;
				dest[((i*8+j)*4)+3 ]= 0x00;
			}
			else
			{
				dest[((i*8+j)*4)+0 ]= 0x00;
				dest[((i*8+j)*4)+1 ]= 0x00;
				dest[((i*8+j)*4)+2 ]= 0x00;
				dest[((i*8+j)*4)+3 ]= 0x00;
			}
		}

	}
	return;
}

void convertimage(bmaptype * bmp)
{
	unsigned char * tmpbuffer;
	switch(bmp->type)
	{
		case 1:
			tmpbuffer = malloc(bmp->Xsize*bmp->Ysize*4);
			convert1b32b(bmp->data, tmpbuffer,bmp->Xsize,bmp->Ysize);
			free(bmp->data);
			bmp->data = tmpbuffer;
		break;
		case 8:
		break;
		case 9:
		break;

	}
}

framegenerator * init_fg(unsigned int xres,unsigned int yres)
{
	framegenerator * fg;
	int i;

	fg = malloc(sizeof(framegenerator));
	if(fg)
	{
		memset(fg,0,sizeof(framegenerator));
		fg->xres = xres;
		fg->yres = yres;

		fg->effectbuffer = (unsigned long*)malloc( xres * yres * sizeof(unsigned long));
		fg->textbuffer = (unsigned long*)malloc( xres * yres * sizeof(unsigned long));
		fg->framebuffer = (unsigned long*)malloc( xres * yres * sizeof(unsigned long));
		if(fg->framebuffer)
		{
			memset(fg->framebuffer,0,xres * yres * sizeof(unsigned long));
			memset(fg->effectbuffer,0,xres * yres * sizeof(unsigned long));
			memset(fg->textbuffer,0,xres * yres * sizeof(unsigned long));

				// unpack & convert 8->16 bits bmps ....
			i=0;
			bmplist[i++]=bitmap_font8x8_bmp;
			bmplist[i++]=0;

			i=0;
			while(bmplist[i]!=0)
			{
				bmplist[i]->data=unpack(bmplist[i]->data,bmplist[i]->csize ,bmplist[i]->data, bmplist[i]->size);
				convertimage(bmplist[i]);
				i++;
			}

			for(i=0;i<32;i++)
			{
				fg->instrucolortable[(i^0xAA)&0x1F] = (unsigned long)((((float)i/(float)32)*(float)0xC0) + 0x40);
				fg->instrucolortable[(i^0xAA)&0x1F] <<= 8;
				fg->instrucolortable[(i^0xAA)&0x1F] |=  (255-(fg->instrucolortable[(i^0xAA)&0x1F] >> 8)) ;
				fg->instrucolortable[(i^0xAA)&0x1F] |=  ((fg->instrucolortable[(i^0xAA)&0x1F]+0x80)<<16) & 0xFF0000 ;
			}

		}
		else
		{
			free(fg);
			fg = 0;
		}
	}

	return fg;
}

void deinit_fg(framegenerator * fg)
{
	if(fg)
	{
		free( fg->framebuffer );
		free( fg->effectbuffer );
		free( fg->textbuffer );
		free( fg );
	}
}

unsigned long* fg_generateFrame(framegenerator * fg,tracker_buffer_state *tb,int currentsampleoffset)
{
	int i,j,x,y,s;
	unsigned char r,v,b;
	unsigned long * buffer;

	memset(fg->textbuffer,0,640*480*4);

	buffer = fg->effectbuffer;

	s = 0;
	i = tb->cur_rd_index;
	while((i<tb->nb_of_state) && (tb->track_state_buf[i].buf_index < currentsampleoffset))
	{
		i++;
		s++;
	}

	for(y=0;y<480;y++)
	{
		for(x=0;x<640-s;x++)
		{
			buffer[(y*640)+x] = buffer[(y*640)+x+s];
		}
	}

	i = tb->cur_rd_index;
	while((i<tb->nb_of_state) && (tb->track_state_buf[i].buf_index < currentsampleoffset))
	{

		for(j=0;j<tb->track_state_buf[i].number_of_tracks;j++)
		{
			x = 630-s;

			y = ((float)tb->track_state_buf[i].tracks[j].cur_period / (float)1200) * (float)480;

			if(tb->track_state_buf[i].tracks[j].cur_volume)
			{
				r = ((float)tb->track_state_buf[i].tracks[j].cur_volume / (float)64) * (float)(fg->instrucolortable[tb->track_state_buf[i].tracks[j].instrument_number]&0xFF);
				v = ((float)tb->track_state_buf[i].tracks[j].cur_volume / (float)64) * (float)((fg->instrucolortable[tb->track_state_buf[i].tracks[j].instrument_number]>>8)&0xFF);
				b = ((float)tb->track_state_buf[i].tracks[j].cur_volume / (float)64) * (float)((fg->instrucolortable[tb->track_state_buf[i].tracks[j].instrument_number]>>16)&0xFF);

				if(y<480)
					buffer[(y*640)+x] =v | (b<<8) | (r<<16);
			}

		}

		i++;
		s--;
	}

	tb->cur_rd_index = i;

	graphprintf(fg,0,0,"%d Channels, Pos %.3d, Pattern %.3d:%.2d, %.3d BPM, Speed %.3d",tb->track_state_buf[i-1].number_of_tracks,tb->track_state_buf[i-1].cur_pattern_table_pos,tb->track_state_buf[i-1].cur_pattern,tb->track_state_buf[i-1].cur_pattern_pos,tb->track_state_buf[i-1].bpm,tb->track_state_buf[i-1].speed);

	graphprintf(fg,16,16,"%s",tb->name);
	for(i=0;i<31;i++)
	{
		graphprintf(fg,16,16+32+i*8,"%.2d: %s",i,tb->instruments[i].name);
	}

	for(i=0;i<fg->xres*fg->yres;i++)
	{
		fg->framebuffer[i] = fg->effectbuffer[i];
		if(fg->textbuffer[i])
			fg->framebuffer[i] = fg->textbuffer[i];
	}
	/*for(i=0;i<640;i++)
	{
		for(j=0;j<480;j++)
		{
			buffer[(i*480)+j] = rand()<<16 | rand()<<8 | rand();
		}
	}*/
	return fg->framebuffer;
}
