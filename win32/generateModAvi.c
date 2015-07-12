#include <windows.h>
#include <stdio.h>
#include <vfw.h>

#include "avi_utils.h"

#include "../hxcmod.h"
#include "../framegenerator.h"

#define AUDIORATE 44100

#define GETRED(RGB)     ((RGB>>16)&0xFF)
#define GETBLUE(RGB)    ((RGB)&0xFF)
#define GETGREEN(RGB)   ((RGB>>8)&0xFF)
#define CONVRGB(r,v,b)  ((b&0x1F) | (v&0x3F)<<5 | (r&0x1F)<<11)

short sound_buffer[128*1024];

int generateModAVI(int min, char * modfile, char * basename,int xres,int yres,int nbavi)
{
	HBITMAP hbm;
	HAVI avi;
	AVICOMPRESSOPTIONS opts;

	int i,j,filenb,fileend,frame;
	int audiosize,totalimg;
	char filename[512];
	void *bits;
	float frame_rate;
	unsigned long frameperiod, audiooffset,mainaudiooffset;
	unsigned char *dbits,*module;
	int filesize;
	FILE * fmod;
	framegenerator * fg;
	unsigned long * framebuf;

	BITMAPINFO bi;
	WAVEFORMATEX wfx;

	HDC hdcscreen;
	HDC comphdc;
	tracker_buffer_state trackbuf_state;

	modcontext modctx;

	hdcscreen = GetDC(0),
	comphdc = CreateCompatibleDC(hdcscreen);
	ReleaseDC(0,hdcscreen);

	ZeroMemory(&bi,sizeof(bi));

	bi.bmiHeader.biSize = sizeof(bi.bmiHeader);
	bi.bmiHeader.biWidth = xres;
	bi.bmiHeader.biHeight = yres;
	bi.bmiHeader.biPlanes = 1;
	bi.bmiHeader.biBitCount = 24;
	bi.bmiHeader.biCompression = BI_RGB;
	bi.bmiHeader.biSizeImage = ((bi.bmiHeader.biWidth*bi.bmiHeader.biBitCount/8)&0xFFFFFFFC)*bi.bmiHeader.biHeight;
	bi.bmiHeader.biXPelsPerMeter = 10000;
	bi.bmiHeader.biYPelsPerMeter = 10000;
	bi.bmiHeader.biClrUsed = 0;
	bi.bmiHeader.biClrImportant = 0;

	hbm = CreateDIBSection(comphdc,(BITMAPINFO*)&bi.bmiHeader,DIB_RGB_COLORS,&bits,NULL,0);

	frame_rate = (float)29.97;
	frameperiod = (unsigned long)((1/frame_rate) * (1000 * 1000 * 10));

	fileend = 0;
	filenb = 0;

	totalimg = 0;

	mainaudiooffset = 0;

	filesize = 0;
	fmod = fopen(modfile,"rb");
	if(fmod)
	{
		fseek(fmod,0,SEEK_END);
		filesize = ftell(fmod);
		fseek(fmod,0,SEEK_SET);

		module = malloc(filesize);
		if(module)
		{
			fread(module,filesize,1,fmod);
		}

		fclose(fmod);
	}
	else
	{
		return 0;
	}

	if(!module)
		return 0;

	hxcmod_init( &modctx );

	fg = init_fg(xres,yres);

	if(!hxcmod_load( &modctx, module, filesize ))
	{
		free(module);
		return 0;
	}

	audiosize = (int)((float)AUDIORATE * (float)((float)frameperiod/(float)(1000*1000*10)));

	memset(&trackbuf_state,0,sizeof(trackbuf_state));
	trackbuf_state.nb_max_of_state = 100;
	trackbuf_state.track_state_buf = malloc(sizeof(tracker_state) * trackbuf_state.nb_max_of_state);
	memset(trackbuf_state.track_state_buf,0,sizeof(tracker_state) * trackbuf_state.nb_max_of_state);
	trackbuf_state.sample_step = ( audiosize * 4 ) / trackbuf_state.nb_max_of_state;

	do
	{
		audiooffset = 0;

		if(basename)
			sprintf(filename,"%s_%d.avi",basename,filenb);
		else
			sprintf(filename,"outavi_%d.avi",filenb);

		wfx.wFormatTag = 1;
		wfx.nChannels = 2;
		wfx.nSamplesPerSec = AUDIORATE;
		wfx.nAvgBytesPerSec = AUDIORATE*2*2;
		wfx.nBlockAlign = 4;
		wfx.wBitsPerSample = 16;
		wfx.cbSize = 0;

		avi = CreateAvi(filename,frameperiod,&wfx);

		ZeroMemory(&opts,sizeof(opts));
		opts.fccHandler=mmioFOURCC('L','A','G','S');
		//opts.fccHandler=mmioFOURCC('d','i','v','x');
		SetAviVideoCompression(avi,hbm,&opts,0,NULL);

		for (frame=0; (frame<=(int)(frame_rate*(float)60*(float)min)) && !fileend; frame++)
		{
			printf("file %d :  %d - %.2f \\%\n",filenb,frame,((float)frame*100/(float)((int)(frame_rate*(float)60*(float)min))));
			dbits=(unsigned char*)bits;

			audiosize = (int)((float)AUDIORATE * (float)((float)frameperiod/(float)(1000*1000*10)));
			if( ((float)(frame*(((float)AUDIORATE)/frame_rate) ) - (float)audiooffset)>=1)
			{
				audiosize++;
			}

			framebuf = fg_generateFrame(fg,&trackbuf_state,audiosize/4);
			for(i=0;i<yres;i++)
			{
				for(j=0;j<xres;j++)
				{
					dbits[(((((yres-1)-i)*xres)+j)*3)+0] = (unsigned char)GETBLUE(framebuf[(((i*xres)+j))]);
					dbits[(((((yres-1)-i)*xres)+j)*3)+1] = (unsigned char)GETGREEN(framebuf[(((i*xres)+j))]);
					dbits[(((((yres-1)-i)*xres)+j)*3)+2] = (unsigned char)GETRED(framebuf[(((i*xres)+j))]);
				}
			}

			trackbuf_state.nb_of_state = 0;
			hxcmod_fillbuffer(&modctx, sound_buffer, audiosize, &trackbuf_state );
			AddAviAudio(avi, &sound_buffer, audiosize*4);

			AddAviFrame(avi,hbm);

			audiooffset += audiosize;

			totalimg++;
		}

		mainaudiooffset += audiooffset;
		audiooffset = 0;

		CloseAvi(avi);

		filenb++;
	}while(!fileend && filenb < nbavi );


	DeleteDC(comphdc);
	DeleteObject(hbm);

	return 0;
}
