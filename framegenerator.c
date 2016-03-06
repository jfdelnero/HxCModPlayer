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
#include <stdint.h>
#include <sys/types.h>
#include <sys/stat.h>

#include "hxcmod.h"
#include "framegenerator.h"

#include "packer/pack.h"

#include "data_files/data_bmp_font8x8_bmp.h"

bmaptype * bmplist[40];

#define FRAME_XRES 640
#define FRAME_YRES 480

#define FONT_XSIZE 8
#define EFFECT_Y_POS 368
#define EXT_EFFECT_Y_POS (368+8*5)

const char * effectlist[]=
{
	"ARPEGGIO",
	"PORTAMENTO_UP",
	"PORTAMENTO_DOWN",
	"TONE_PORTAMENTO",
	"VIBRATO",
	"VOLSLIDE_TONEPORTA",
	"VOLSLIDE_VIBRATO",
	"VOLSLIDE_TREMOLO",
	"SET_PANNING",
	"SET_OFFSET",
	"VOLUME_SLIDE",
	"JUMP_POSITION",
	"SET_VOLUME",
	"PATTERN_BREAK",
	0
};

const char * exteffectlist[]=
{
	"FINE_PORTA_UP",
	"FINE_PORTA_DOWN",
	"GLISSANDO_CTRL",
	"VIBRATO_WAVEFORM",
	"SET_FINETUNE",
	"PATTERN_LOOP",
	"TREMOLO_WAVEFORM",
	"SET_PANNING_2",
	"RETRIGGER_NOTE",
	"FINE_VOLSLIDE_UP",
	"FINE_VOLSLIDE_DOWN",
	"NOTE_CUT",
	"NOTE_DELAY",
	"PATTERN_DELAY",
	"INVERT_LOOP",
	"SET_SPEED",
	"SET_TEMPO",
	0
};

void printchar(framegenerator * fg,bmaptype * font,int xpos,int ypos,uint32_t fg_color,uint32_t bg_color,unsigned char c)
{
	int i,j,cxpos,cypos;
	uint32_t * fontbuf;

	fontbuf = (uint32_t *)font->data;

	cxpos = ( c % (font->Xsize / 8) ) * 8;
	cypos = ( c / (font->Xsize / 8) ) * 8;

	for(i=0;i<8;i++)
	{
		for(j=0;j<8;j++)
		{
			if(fontbuf[ ( (cypos + i ) * font->Xsize ) + cxpos + j])
				fg->textbuffer[ ( ( ypos + i ) * fg->xres ) + xpos + j] = fg_color;
			else
			{
				if(!bg_color&0xFF000000)
					fg->textbuffer[ ( ( ypos + i ) * fg->xres ) + xpos + j] = bg_color;
			}
		}
	}
}

void printstring(framegenerator * fg,char * str,int xpos,int ypos,uint32_t fg_color,uint32_t bg_color)
{
	int i;

	i=0;
	while(str[i])
	{
		printchar(fg,bmplist[0],xpos + (i*8) ,ypos,fg_color,bg_color,str[i]);
		i++;
	}

}

int graphprintf(framegenerator * fg,int xpos,int ypos,uint32_t fg_color,uint32_t bg_color,char * chaine, ...)
{
	char tmpbuf[512];

	va_list marker;
	va_start( marker, chaine );

	vsprintf((char*)&tmpbuf,chaine,marker);

	printstring(fg,tmpbuf,xpos,ypos,fg_color,bg_color);

	va_end( marker );
	return 0;
}

void box(framegenerator * fg,int xpos,int ypos,int xsize,int ysize,uint32_t fg_color)
{
	int i,j;

	for(i=0;i<ysize;i++)
	{
		for(j=0;j<xsize;j++)
		{
				fg->textbuffer[((ypos+i)*fg->xres)+ xpos + j] = fg_color;
		}
	}
}

void trackbox(framegenerator * fg,int xpos,int ypos,int track,int nbtrack,uint32_t fg_color)
{
	int trk_box_xsize;
	int trk_box_ysize;
	int trk_box_xpos;
	int trk_box_ypos;

	int i,j;

	if( (xpos < (int)(fg->xres-8)) && (ypos < (int)(fg->yres-8)) && track<nbtrack )
	{
		switch(nbtrack)
		{
			case 2:
			case 4:
				trk_box_xsize = 4;
				trk_box_ysize = 4;
			break;
			case 6:
			case 8:
				trk_box_xsize = 4;
				trk_box_ysize = 2;
			break;
			case 10:
			case 12:
			case 14:
			case 16:
				trk_box_xsize = 2;
				trk_box_ysize = 2;
			break;
			default:
				trk_box_xsize = 2;
				trk_box_ysize = 1;
			break;
		}

		trk_box_ypos = track / (8 / trk_box_xsize);
		trk_box_xpos = track  -  (trk_box_ypos * (8 / trk_box_xsize));

		for(i=0;i<trk_box_ysize;i++)
		{
			for(j=0;j<trk_box_xsize;j++)
			{
				fg->textbuffer[((ypos+(trk_box_ypos*trk_box_ysize)+i)*fg->xres)+ xpos + (trk_box_xpos*trk_box_xsize) + j] = fg_color;
			}
		}
	}
}

void convert1b32b(unsigned char * source, unsigned char * dest,unsigned short sx,unsigned short sy)
{
	unsigned int i,j;

	for(i=0;i<(unsigned int)((sx*sy)/8);i++)
	{
		for(j=0;j<8;j++)
		{

			if(source[i]&(0x80>>j))
			{
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 0 ] = 0xFF;
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 1 ] = 0xFF;
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 2 ] = 0xFF;
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 3 ] = 0x00;
			}
			else
			{
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 0 ] = 0x00;
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 1 ] = 0x00;
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 2 ] = 0x00;
				dest[ ( ( ( i * 8 ) + j ) * 4 ) + 3 ] = 0x00;
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
			convert1b32b(bmp->data, tmpbuffer,(unsigned short)bmp->Xsize,(unsigned short)bmp->Ysize);
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

		fg->effectbuffer = (uint32_t*)malloc( xres * yres * sizeof(uint32_t));
		fg->textbuffer = (uint32_t*)malloc( xres * yres * sizeof(uint32_t));
		fg->framebuffer = (uint32_t*)malloc( xres * yres * sizeof(uint32_t));
		if(fg->framebuffer)
		{
			memset(fg->framebuffer,0,xres * yres * sizeof(uint32_t));
			memset(fg->effectbuffer,0,xres * yres * sizeof(uint32_t));
			memset(fg->textbuffer,0,xres * yres * sizeof(uint32_t));

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
				fg->instrucolortable[(i^0xAA)&0x1F] = (uint32_t)((((float)i/(float)32)*(float)0xC0) + 0x40);
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

uint32_t getcodecolor(int volume,int period)
{
	unsigned char r,g,b;

	// 32768    16000   0
	// LF       MF     HF
	// Blue  - Green - Red

	if(period > 1024)
	{
		period = period - 1024;
		period &= (1024)-1;
		r = 0;
		g = 0xFF;
		b = 0xFF;

		b = (unsigned char)( (float)b * ((float)period / (float)1024));
		g = (unsigned char)( (float)g * ((float)1-((float)period / (float)1024)));
	}
	else
	{
		r = 0xFF;
		g = 0xFF;
		b = 0x00;

		g = (unsigned char)( (float)g * ((float)period / (float)1024));
		r = (unsigned char)( (float)r * ((float)1-((float)period / (float)1024)));
	}

	r = (unsigned char)( (float)r * (float)((float)volume/(float)64) );
	g = (unsigned char)( (float)g * (float)((float)volume/(float)64) );
	b = (unsigned char)( (float)b * (float)((float)volume/(float)64) );

	return r | g<<8 | b << 16 ;
}

uint32_t* fg_generateFrame(framegenerator * fg,tracker_buffer_state *tb,unsigned int currentsampleoffset)
{
	int i,j,x,y,s,instnum,effnum;
	unsigned char effparam;
	unsigned char r,v,b;
	uint32_t * buffer;

	memset(fg->textbuffer,0,FRAME_XRES*FRAME_YRES*4);

	buffer = fg->effectbuffer;

	s = 0;
	i = tb->cur_rd_index;
	while((i<tb->nb_of_state) && (tb->track_state_buf[i].buf_index < currentsampleoffset))
	{
		i++;
		s++;
	}

	for(y=0;y<FRAME_YRES;y++)
	{
		for(x=0;x<FRAME_XRES-s;x++)
		{
			buffer[(y*FRAME_XRES)+x] = buffer[(y*FRAME_XRES)+x+s];
		}
	}

	// Draw the periods traces.
	i = tb->cur_rd_index;
	while((i<tb->nb_of_state) && (tb->track_state_buf[i].buf_index < currentsampleoffset))
	{

		for(j=0;j<tb->track_state_buf[i].number_of_tracks;j++)
		{
			x = 630-s;

			y = (int)(((float)tb->track_state_buf[i].tracks[j].cur_period / (float)1200) * (float)FRAME_YRES);

			if(tb->track_state_buf[i].tracks[j].cur_volume)
			{
				r = (unsigned char)(((float)tb->track_state_buf[i].tracks[j].cur_volume / (float)64) * (float)(fg->instrucolortable[tb->track_state_buf[i].tracks[j].instrument_number]&0xFF));
				v = (unsigned char)(((float)tb->track_state_buf[i].tracks[j].cur_volume / (float)64) * (float)((fg->instrucolortable[tb->track_state_buf[i].tracks[j].instrument_number]>>8)&0xFF));
				b = (unsigned char)(((float)tb->track_state_buf[i].tracks[j].cur_volume / (float)64) * (float)((fg->instrucolortable[tb->track_state_buf[i].tracks[j].instrument_number]>>16)&0xFF));

				if(y<FRAME_YRES)
					buffer[(y*FRAME_XRES)+x] = v | (b<<8) | (r<<16);
			}
		}

		i++;
		s--;
	}

	if(i)
		tb->cur_rd_index = i - 1;
	else
		tb->cur_rd_index = 0;

	i = tb->cur_rd_index;

	graphprintf(fg,fg->xres - (FONT_XSIZE*12),fg->yres - (FONT_XSIZE),0x585888,0x000000,"HxCMOD v2.08");

	graphprintf(fg,FONT_XSIZE*2,1,0xFFFFFF,0x000000,"%d Channels, Pos %.3d, Pattern %.3d:%.2d, %.3d BPM, Speed %.3d",tb->track_state_buf[i].number_of_tracks,tb->track_state_buf[i].cur_pattern_table_pos,tb->track_state_buf[i].cur_pattern,tb->track_state_buf[i].cur_pattern_pos,tb->track_state_buf[i].bpm,tb->track_state_buf[i].speed);

	graphprintf(fg,FONT_XSIZE*2,16,0xFFFFFF,0xFF000000,"%s",tb->name);


	// Display the active tracks & samples
	for(j=0;j<tb->track_state_buf[i].number_of_tracks;j++)
	{
		instnum = tb->track_state_buf[i].tracks[j].instrument_number;
		if(instnum<=30)
		{
			box(fg,16,16+16+instnum*9,8*26,7,getcodecolor(tb->track_state_buf[i].tracks[j].cur_volume,tb->track_state_buf[i].tracks[j].cur_period));
			trackbox(fg, 4 ,16+16+instnum*9,j,tb->track_state_buf[i].number_of_tracks,tb->track_state_buf[i].tracks[j].cur_period | 0xC00000);
		}
	}

	// Print channels status
	for(j=0;j<tb->track_state_buf[i].number_of_tracks && j<10;j++)
	{
		graphprintf(fg,FONT_XSIZE*2 + (j * 8*FONT_XSIZE),320,   0xFFFFFF,0x000000,"Chn %d",j);
		graphprintf(fg,FONT_XSIZE*2 + (j * 8*FONT_XSIZE),320+8, 0xFFFFFF,0x000000,"Smp:%d",tb->track_state_buf[i].tracks[j].instrument_number);
		graphprintf(fg,FONT_XSIZE*2 + (j * 8*FONT_XSIZE),320+16,0xFFFFFF,0x000000,"Per:%d",tb->track_state_buf[i].tracks[j].cur_period);
		graphprintf(fg,FONT_XSIZE*2 + (j * 8*FONT_XSIZE),320+24,0xFFFFFF,0x000000,"Vol:%d",tb->track_state_buf[i].tracks[j].cur_volume);
		graphprintf(fg,FONT_XSIZE*2 + (j * 8*FONT_XSIZE),320+32,0xFFFFFF,0x000000,"Eff:%.3X",tb->track_state_buf[i].tracks[j].cur_effect);
	}

	// Print instruments list
	for(i=0;i<31;i++)
	{
		graphprintf(fg,FONT_XSIZE*2,16+16+i*9,0xFFFFFF,0x000000,"%.2d: %s",i,tb->instruments[i].name);
	}

	// Print effect list
	i=0;
	while(effectlist[i])
	{
		graphprintf(fg,FONT_XSIZE*2 + (i%4 * 20 * FONT_XSIZE),EFFECT_Y_POS + (((i&~3)>>2)*8),0x444444,0x000000,  (char*)effectlist[i]);
		i++;
	}

	// Print extended effect list
	i=0;
	while(exteffectlist[i])
	{
		graphprintf(fg,FONT_XSIZE*2 + (i%4 * 20 * FONT_XSIZE),EXT_EFFECT_Y_POS + (((i&~3)>>2)*8),0x444444,0x000000,  (char*)exteffectlist[i]);
		i++;
	}

	// Display the active effects
	i = tb->cur_rd_index;
	for(j=0;j<tb->track_state_buf[i].number_of_tracks;j++)
	{
		effnum = tb->track_state_buf[i].tracks[j].cur_effect>>8;
		effparam = tb->track_state_buf[i].tracks[j].cur_effect & 0xFF;

		if(effnum<0xE)
		{
			if(effnum==0)
			{
				if(tb->track_state_buf[i].tracks[j].cur_parameffect)
				{
					graphprintf(fg,FONT_XSIZE*2 + (effnum%4 * 20 * FONT_XSIZE),EFFECT_Y_POS + (((effnum&~3)>>2)*8),0xFFFFFF,0x000000,  (char*)effectlist[effnum]);
					trackbox(fg, 6 + (effnum%4 * 20 * FONT_XSIZE),EFFECT_Y_POS + (((effnum&~3)>>2)*8),j,tb->track_state_buf[i].number_of_tracks,0xFF0000 | (effparam<<8));
				}
			}
			else
			{
				graphprintf(fg,FONT_XSIZE*2 + (effnum%4 * 20 * FONT_XSIZE),EFFECT_Y_POS + (((effnum&~3)>>2)*8),0xFFFFFF,0x000000,  (char*)effectlist[effnum]);
				trackbox(fg, 6 + (effnum%4 * 20 * FONT_XSIZE),EFFECT_Y_POS + (((effnum&~3)>>2)*8),j,tb->track_state_buf[i].number_of_tracks,0xFF0000 | (effparam<<8));
			}
		}
		else
		{
			if(effnum==0xE)
			{
				effnum = (tb->track_state_buf[i].tracks[j].cur_effect>>(4))&0xF;
				if(effnum)
				{
					effnum--;
					graphprintf(fg,FONT_XSIZE*2 + (effnum%4 * 20 * FONT_XSIZE),EXT_EFFECT_Y_POS + (((effnum&~3)>>2)*8),0xFFFFFF,0x000000,  (char*)exteffectlist[effnum]);
					trackbox(fg, FONT_XSIZE + (effnum%4 * 20 * FONT_XSIZE),EXT_EFFECT_Y_POS + (((effnum&~3)>>2)*8),j,tb->track_state_buf[i].number_of_tracks,0xFF0000 | (effparam<<8));
				}
			}
			else
			{
				if( ((tb->track_state_buf[i].tracks[j].cur_effect)&0xFF) < 0x21 )
				{
					effnum = 15;
				}
				else
				{
					effnum = 16;
				}

				graphprintf(fg,FONT_XSIZE*2 + (effnum%4 * 20 * FONT_XSIZE),EXT_EFFECT_Y_POS + (((effnum&~3)>>2)*8),0xFFFFFF,0x000000,  (char*)exteffectlist[effnum]);
				trackbox(fg, FONT_XSIZE + (effnum%4 * 20 * FONT_XSIZE),EXT_EFFECT_Y_POS + (((effnum&~3)>>2)*8),j,tb->track_state_buf[i].number_of_tracks,0xFF0000 | (effparam<<8));
			}
		}
	}

	printchar(fg,bmplist[0],0,0,0x00FFFF,0x000000,'A');

	// Text layer over the effect layer.
	for(i=0;i<(int)(fg->xres*fg->yres);i++)
	{
		fg->framebuffer[i] = fg->effectbuffer[i];
		if(fg->textbuffer[i])
			fg->framebuffer[i] = fg->textbuffer[i];
	}

	return fg->framebuffer;
}
