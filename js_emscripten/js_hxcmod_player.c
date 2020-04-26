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
// File : js_hxcmod_player.c
// Contains: Emscripten Javascript <> HxCMod Glue
//
// Written by: Jean François DEL NERO
//
///////////////////////////////////////////////////////////////////////////////////

#include <emscripten.h>

#include <stdlib.h>
#include <string.h>

#include "../hxcmod.h"

#define NBSAMPS_OUTBUF 16384
#define NBAUDIO_CHANNELS 2

void * EMSCRIPTEN_KEEPALIVE loadMod(void * inBuffer, int inBufSize,float samplerate)
{
	modcontext * modctx;

	modctx = 0;

	if(inBuffer && inBufSize)
	{
		modctx = malloc(sizeof(modcontext));
		if(modctx)
		{
			memset(modctx,0,sizeof(modcontext));

			hxcmod_init( modctx );

			hxcmod_setcfg( modctx, (int)samplerate, 1, 1);

			hxcmod_load( modctx, inBuffer, inBufSize );
		}
	}

   	return (void*)modctx;
}

int EMSCRIPTEN_KEEPALIVE getNextSoundData(void * mod,float * leftchannel,float * rightchannel, int nbsamples)
{
	modcontext * modctx;
	short outputbuffer[NBSAMPS_OUTBUF * NBAUDIO_CHANNELS];
	int samplesdone,chunksize;
	int i,j;

	modctx = (modcontext *)mod;
	if(mod && leftchannel && rightchannel && nbsamples > 0)
	{
		samplesdone = 0;
		j=0;
		do
		{
			if(nbsamples - samplesdone >= NBSAMPS_OUTBUF )
			{
				chunksize = NBSAMPS_OUTBUF;
				hxcmod_fillbuffer( modctx, outputbuffer, chunksize, 0 );
				samplesdone += chunksize;
			}
			else
			{
				chunksize = ( NBSAMPS_OUTBUF - (nbsamples - samplesdone) );
				if( chunksize > 0 )
				{
					hxcmod_fillbuffer( modctx, outputbuffer, chunksize, 0 );
				}
				else
					chunksize = 0;

				samplesdone += chunksize;
			}

			// Convert the PCM buffer to float.
			for(i=0;i<chunksize;i++)
			{
				leftchannel[j] = ((float)outputbuffer[i*2] * (float)( (float)1 / (float)32767 ));
				rightchannel[j] = ((float)outputbuffer[(i*2)+1] * (float)( (float)1 / (float)32767 ));
				j++;
			}

		}while(samplesdone < nbsamples);
	}

	return 0;
}

void EMSCRIPTEN_KEEPALIVE unloadMod(void * mod)
{
	if(mod)
	{
		free(mod);
	}
	return;
}


int main() {
}

