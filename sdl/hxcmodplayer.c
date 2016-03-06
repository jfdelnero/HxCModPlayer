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

//
// SDL main file (Windows / Linux / Mac OS X)
//

#include <time.h>
#include <sys/time.h>
#include <unistd.h>

#include <malloc.h>
#include <stdio.h>
#include <stdlib.h>

#include <SDL/SDL.h>
#include <SDL/SDL_audio.h>

#include "../hxcmod.h"
#include "../framegenerator.h"
#include "../data_files/data_cartoon_dreams_n_fantasies_mod.h"
#include "../packer/pack.h"

#define FRAMEXRES 640
#define FRAMEYRES 480
#define SAMPLERATE 44100
#define NBSTEREO16BITSAMPLES 16384


// SDL Stuff
SDL_Surface	*screen;
SDL_Surface	*bBuffer;
SDL_Rect	rScreen;
SDL_Rect	rBuffer;
SDL_AudioSpec fmt;

modcontext modloaded;
unsigned char * modfile;
framegenerator * fg;
tracker_buffer_state trackbuf_state1;

// callback audio
void mixaudio(void *unused, Uint8 *stream, int len)
{
	trackbuf_state1.nb_of_state = 0;
	hxcmod_fillbuffer(&modloaded, (unsigned short*)stream, len / 4, &trackbuf_state1);
}

// ---------------------------------------------------------------------------------

int main (int argc, char **argv)
{
	Uint32 *buffer_dat;
	Uint32 *framebuf;
	int i;
	int fullscreen;

	int flag = SDL_SWSURFACE;

	fullscreen=0;

	if (fullscreen)
	{
		flag |= SDL_FULLSCREEN;
	}

	SDL_Init( SDL_INIT_VIDEO );

	screen = SDL_SetVideoMode( FRAMEXRES, FRAMEYRES, 32, flag);
    SDL_EventState(SDL_DROPFILE, SDL_ENABLE);

	fg = init_fg(FRAMEXRES,FRAMEYRES);

	hxcmod_init(&modloaded);
	hxcmod_setcfg(&modloaded, SAMPLERATE, 16, 1, 0, 0);

	modfile = unpack(data_cartoon_dreams_n_fantasies_mod->data,data_cartoon_dreams_n_fantasies_mod->csize ,data_cartoon_dreams_n_fantasies_mod->data, data_cartoon_dreams_n_fantasies_mod->size);

	hxcmod_load(&modloaded,(void*)modfile,data_cartoon_dreams_n_fantasies_mod->size);

	bBuffer = SDL_CreateRGBSurface( SDL_HWSURFACE, screen->w,
					screen->h,
					screen->format->BitsPerPixel,
					screen->format->Rmask,
					screen->format->Gmask,
					screen->format->Bmask,
					screen->format->Amask);

	rBuffer.x = 0;
	rBuffer.y = 0;
	rBuffer.w = bBuffer->w;
	rBuffer.h = bBuffer->h;

	// on init le son
	fmt.freq = 44100;
	fmt.format = AUDIO_S16;
	fmt.channels = 2;
	fmt.samples = NBSTEREO16BITSAMPLES/4;
	fmt.callback = mixaudio;
	fmt.userdata = NULL;

	memset(&trackbuf_state1,0,sizeof(tracker_buffer_state));

	trackbuf_state1.nb_max_of_state = 100;
	trackbuf_state1.track_state_buf = malloc(sizeof(tracker_state) * trackbuf_state1.nb_max_of_state);
	memset(trackbuf_state1.track_state_buf,0,sizeof(tracker_state) * trackbuf_state1.nb_max_of_state);
	trackbuf_state1.sample_step = ( NBSTEREO16BITSAMPLES ) / trackbuf_state1.nb_max_of_state;

	if ( SDL_OpenAudio(&fmt, NULL) < 0 )
	{
		fprintf(stderr, "Impossible d'accéder à l'audio: %s\n", SDL_GetError());
	}
	else
	{
		// lancement du son
		SDL_PauseAudio(0);
	}

	SDL_EventState(SDL_ACTIVEEVENT, SDL_IGNORE);
	SDL_EventState(SDL_MOUSEMOTION, SDL_IGNORE);

	while (SDL_PollEvent(NULL)==0)
	{
		framebuf =(Uint32 *)fg_generateFrame(fg,&trackbuf_state1,NBSTEREO16BITSAMPLES-1);

		buffer_dat = (Uint32*)bBuffer->pixels;

		SDL_LockSurface(bBuffer);

		for(i=0;i<(FRAMEXRES*FRAMEYRES);i++)
			buffer_dat[i] = framebuf[i];

		SDL_UnlockSurface(bBuffer);

		SDL_BlitSurface( bBuffer, NULL, screen, &rBuffer );
		SDL_UpdateRect( screen, 0, 0, 0, 0 );

		SDL_Delay(20);
	}

	deinit_fg(fg);

	SDL_CloseAudio();

	return 0;
}


