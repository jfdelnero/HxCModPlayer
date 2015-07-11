// AVI utilities -- for creating avi files
// (c) 2002 Lucian Wischik. No restrictions on use.

#define STRICT
#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <vfw.h>

#include "avi_utils.h"

// First, we'll define the WAV file format.
#include <pshpack1.h>

typedef struct
{
	char id[4];						//="fmt "
	unsigned long size;				//=16
	short wFormatTag;				//=WAVE_FORMAT_PCM=1
	unsigned short wChannels;		//=1 or 2 for mono or stereo
	unsigned long dwSamplesPerSec;	//=11025 or 22050 or 44100
	unsigned long dwAvgBytesPerSec;	//=wBlockAlign * dwSamplesPerSec
	unsigned short wBlockAlign;		//=wChannels * (wBitsPerSample==8?1:2)
	unsigned short wBitsPerSample;	//=8 or 16, for bits per sample
} FmtChunk;

typedef struct
{
	char id[4];						//="data"
	unsigned long size;				//=datsize, size of the following array
	unsigned char data[1];			//=the raw data goes here
} DataChunk;

typedef struct
{
	char id[4];						//="RIFF"
	unsigned long size;				//=datsize+8+16+4
	char type[4];					//="WAVE"
	FmtChunk fmt;
	DataChunk dat;
} WavChunk;

#include <poppack.h>


// This is the internal structure represented by the HAVI handle:
typedef struct
{
	IAVIFile *pfile;				// created by CreateAvi
	WAVEFORMATEX wfx;				// as given to CreateAvi (.nChanels=0 if none was given). Used when audio stream is first created.
	int period;						// specified in CreateAvi, used when the video stream is first created
	IAVIStream *as;					// audio stream, initialised when audio stream is first created
	IAVIStream *ps, *psCompressed;	// video stream, when first created
	unsigned long nframe, nsamp;	// which frame will be added next, which sample will be added next
	int iserr;						// if true, then no function will do anything
} TAviUtil;


HAVI CreateAvi(const char *fn, int frameperiod, const WAVEFORMATEX *wfx)
{
	IAVIFile *pfile;
	HRESULT hr;
	TAviUtil *au;

	AVIFileInit();

	hr = AVIFileOpen(&pfile, fn, OF_WRITE|OF_CREATE, NULL);
	if (hr!=AVIERR_OK)
	{
		AVIFileExit();
		return NULL;
	}

	au = malloc(sizeof(TAviUtil));
	if(au)
	{
		memset(au,0,sizeof(TAviUtil));
		au->pfile = pfile;
		if (wfx==NULL)
			ZeroMemory(&au->wfx,sizeof(WAVEFORMATEX));
		else
			CopyMemory(&au->wfx,wfx,sizeof(WAVEFORMATEX));

		au->period = frameperiod;
		au->as = 0;
		au->ps = 0;
		au->psCompressed = 0;
		au->nframe = 0;
		au->nsamp = 0;
		au->iserr = 0;
	}

	return (HAVI)au;
}


HRESULT CloseAvi(HAVI avi)
{
	TAviUtil *au;

	if (avi==NULL)
		return AVIERR_BADHANDLE;

	au = (TAviUtil*)avi;

	if ( au->as != 0)
		AVIStreamRelease(au->as);

	au->as=0;

	if (au->psCompressed!=0)
		AVIStreamRelease(au->psCompressed);

	au->psCompressed=0;

	if (au->ps!=0)
		AVIStreamRelease(au->ps);

	au->ps=0;

	if (au->pfile!=0)
		AVIFileRelease(au->pfile);
	au->pfile=0;

	AVIFileExit();

	free(au);

	return S_OK;
}


HRESULT SetAviVideoCompression(HAVI avi, HBITMAP hbm, AVICOMPRESSOPTIONS *opts, int ShowDialog, HWND hparent)
{
	DIBSECTION dibs;
	TAviUtil *au;
	int sbm;
	AVISTREAMINFO strhdr;
	AVICOMPRESSOPTIONS myopts;
	AVICOMPRESSOPTIONS *aopts[1];
	HRESULT hr;
	BOOL res;

	if (avi==NULL)
		return AVIERR_BADHANDLE;

	if (hbm==NULL)
		return AVIERR_BADPARAM;

	sbm = GetObject(hbm,sizeof(dibs),&dibs);
	if (sbm!=sizeof(DIBSECTION))
		return AVIERR_BADPARAM;

	au = (TAviUtil*)avi;
	if (au->iserr)
		return AVIERR_ERROR;

	if (au->psCompressed!=0)
		return AVIERR_COMPRESSOR;

	if (au->ps==0) // create the stream, if it wasn't there before
	{
		ZeroMemory(&strhdr,sizeof(strhdr));

		strhdr.fccType = streamtypeVIDEO;// stream type
		strhdr.fccHandler = 0;
		strhdr.dwScale = au->period;
		strhdr.dwRate = 1000*10000;
		strhdr.dwSuggestedBufferSize  = dibs.dsBmih.biSizeImage;

		SetRect(&strhdr.rcFrame, 0, 0, dibs.dsBmih.biWidth, dibs.dsBmih.biHeight);

		hr = AVIFileCreateStream(au->pfile, &au->ps, &strhdr);

		if (hr!=AVIERR_OK)
		{
			au->iserr = 1;
			return hr;
		}
	}

	if (au->psCompressed==0) // set the compression, prompting dialog if necessary
	{
		ZeroMemory(&myopts,sizeof(myopts));

		if (opts!=NULL)
			aopts[0]=opts;
		else
			aopts[0]=&myopts;

		if (ShowDialog)
		{
			res = (BOOL)AVISaveOptions(hparent,0,1,&au->ps,aopts);
			if (!res)
			{
				AVISaveOptionsFree(1,aopts);
				au->iserr = 1;
				return AVIERR_USERABORT;
			}
		}

		hr = AVIMakeCompressedStream(&au->psCompressed, au->ps, aopts[0], NULL);

		AVISaveOptionsFree(1,aopts);
		if (hr != AVIERR_OK)
		{
			au->iserr=1;
			return hr;
		}

		GetObject(hbm,sizeof(dibs),&dibs);
		hr = AVIStreamSetFormat(au->psCompressed, 0, &dibs.dsBmih, dibs.dsBmih.biSize+dibs.dsBmih.biClrUsed*sizeof(RGBQUAD));
		if (hr!=AVIERR_OK)
		{
			au->iserr=1;
			return hr;
		}
  }

  return AVIERR_OK;
}


HRESULT AddAviFrame(HAVI avi, HBITMAP hbm)
{
	DIBSECTION dibs;
	int sbm;
	TAviUtil *au;
	HRESULT hr;
	AVISTREAMINFO strhdr;
	AVICOMPRESSOPTIONS opts;

	if (avi==NULL)
		return AVIERR_BADHANDLE;

	if (hbm==NULL)
		return AVIERR_BADPARAM;

	sbm = GetObject(hbm,sizeof(dibs),&dibs);

	if (sbm!=sizeof(DIBSECTION))
		return AVIERR_BADPARAM;

	au = (TAviUtil*)avi;
	if (au->iserr)
		return AVIERR_ERROR;

	if (au->ps==0) // create the stream, if it wasn't there before
	{
		ZeroMemory(&strhdr,sizeof(strhdr));
		strhdr.fccType = streamtypeVIDEO;// stream type
		strhdr.fccHandler = 0;
		strhdr.dwScale = au->period;
		strhdr.dwRate = 1000*10000;
		strhdr.dwSuggestedBufferSize  = dibs.dsBmih.biSizeImage;
		SetRect(&strhdr.rcFrame, 0, 0, dibs.dsBmih.biWidth, dibs.dsBmih.biHeight);

		hr=AVIFileCreateStream(au->pfile, &au->ps, &strhdr);
		if (hr!=AVIERR_OK)
		{
			au->iserr = 1;
			return hr;
		}
	}

	// create an empty compression, if the user hasn't set any
	if (au->psCompressed==0)
	{
		ZeroMemory(&opts,sizeof(opts));
		opts.fccHandler=mmioFOURCC('D','I','B',' ');
		hr = AVIMakeCompressedStream(&au->psCompressed, au->ps, &opts, NULL);
		if (hr != AVIERR_OK)
		{
			au->iserr = 1;
			return hr;
		}

		hr = AVIStreamSetFormat(au->psCompressed, 0, &dibs.dsBmih, dibs.dsBmih.biSize+dibs.dsBmih.biClrUsed*sizeof(RGBQUAD));
		if ( hr != AVIERR_OK )
		{
			au->iserr = 1;
			return hr;
		}
	}

	//Now we can add the frame

	hr = AVIStreamWrite(au->psCompressed, au->nframe, 1, dibs.dsBm.bmBits, dibs.dsBmih.biSizeImage, AVIIF_KEYFRAME, NULL, NULL);
	if (hr!=AVIERR_OK)
	{
		au->iserr = 1;
		return hr;
	}

	au->nframe++;
	return S_OK;
}



HRESULT AddAviAudio(HAVI avi, void *dat, unsigned long numbytes)
{
	TAviUtil *au;
	unsigned long numsamps;
	AVISTREAMINFO ahdr;
	HRESULT hr;

	if (avi==NULL)
		return AVIERR_BADHANDLE;

	if (dat==NULL || numbytes==0)
		return AVIERR_BADPARAM;

	au = (TAviUtil*)avi;

	if (au->iserr)
		return AVIERR_ERROR;

	if (au->wfx.nChannels==0)
		return AVIERR_BADFORMAT;

	numsamps = numbytes*8 / au->wfx.wBitsPerSample;

	if ((numsamps*au->wfx.wBitsPerSample/8)!=numbytes)
		return AVIERR_BADPARAM;

	if (au->as==0) // create the stream if necessary
	{
		ZeroMemory(&ahdr,sizeof(ahdr));

		ahdr.fccType = streamtypeAUDIO;
		ahdr.dwScale = au->wfx.nBlockAlign;
		ahdr.dwRate = au->wfx.nSamplesPerSec*au->wfx.nBlockAlign;
		ahdr.dwSampleSize = au->wfx.nBlockAlign;
		ahdr.dwQuality = (DWORD)-1;

		hr = AVIFileCreateStream(au->pfile, &au->as, &ahdr);

		if (hr!=AVIERR_OK)
		{
			au->iserr = 1;
			return hr;
		}
		hr = AVIStreamSetFormat(au->as,0,&au->wfx,sizeof(WAVEFORMATEX));
		if (hr!=AVIERR_OK)
		{
			au->iserr = 1;
			return hr;
		}
	}

	// now we can write the data
	hr = AVIStreamWrite(au->as,au->nsamp,numsamps,dat,numbytes,0,NULL,NULL);
	if (hr!=AVIERR_OK)
	{
		au->iserr = 1;
		return hr;
	}

	au->nsamp+=numsamps;
	return S_OK;
}

HRESULT AddAviWav(HAVI avi, const char *src, DWORD flags)
{
	TAviUtil *au;
	char *buf=0;
	WavChunk *wav;
	HANDLE hf;
	DWORD size;
	DWORD red;
	int badformat;
	HRESULT hr;
	AVISTREAMINFO ahdr;
	unsigned long numbytes;
	unsigned long numsamps;

	buf = 0;

	if (avi==NULL)
		return AVIERR_BADHANDLE;

	if (flags!=SND_MEMORY && flags!=SND_FILENAME)
		return AVIERR_BADFLAGS;

	if (src==0)
		return AVIERR_BADPARAM;

	au = (TAviUtil*)avi;
	if ( au->iserr )
		return AVIERR_ERROR;

	wav = (WavChunk*)src;
	if (flags==SND_FILENAME)
	{
		hf = CreateFile(src,GENERIC_READ,FILE_SHARE_READ,NULL,OPEN_EXISTING,0,NULL);
		if (hf==INVALID_HANDLE_VALUE)
		{
			au->iserr = 1;
			return AVIERR_FILEOPEN;
		}

		size = GetFileSize(hf,NULL);

		buf = malloc(size);
		if(buf)
		{
			ReadFile(hf,buf,size,&red,NULL);
		}

		CloseHandle(hf);
		wav = (WavChunk*)buf;
	}

	// check that format doesn't clash
	badformat = 0;
	if (au->wfx.nChannels==0)
	{
		au->wfx.wFormatTag=wav->fmt.wFormatTag;
		au->wfx.cbSize=0;
		au->wfx.nAvgBytesPerSec=wav->fmt.dwAvgBytesPerSec;
		au->wfx.nBlockAlign=wav->fmt.wBlockAlign;
		au->wfx.nChannels=wav->fmt.wChannels;
		au->wfx.nSamplesPerSec=wav->fmt.dwSamplesPerSec;
		au->wfx.wBitsPerSample=wav->fmt.wBitsPerSample;
	}
	else
	{
		if (au->wfx.wFormatTag!=wav->fmt.wFormatTag)
			badformat = 1;
		if (au->wfx.nAvgBytesPerSec!=wav->fmt.dwAvgBytesPerSec)
			badformat = 1;
		if (au->wfx.nBlockAlign!=wav->fmt.wBlockAlign)
			badformat = 1;
		if (au->wfx.nChannels!=wav->fmt.wChannels)
			badformat = 1;
		if (au->wfx.nSamplesPerSec!=wav->fmt.dwSamplesPerSec)
			badformat = 1;
		if (au->wfx.wBitsPerSample!=wav->fmt.wBitsPerSample)
			badformat = 1;
	}

	if (badformat)
	{
		if (buf!=0)
			free(buf);
		return AVIERR_BADFORMAT;
	}

	if (au->as==0) // create the stream if necessary
	{
		ZeroMemory(&ahdr,sizeof(ahdr));

		ahdr.fccType = streamtypeAUDIO;
		ahdr.dwScale = au->wfx.nBlockAlign;
		ahdr.dwRate = au->wfx.nSamplesPerSec * au->wfx.nBlockAlign;
		ahdr.dwSampleSize = au->wfx.nBlockAlign;
		ahdr.dwQuality = (DWORD)-1;
		hr = AVIFileCreateStream(au->pfile, &au->as, &ahdr);
		if (hr!=AVIERR_OK)
		{
			if (buf!=0)
				free(buf);
			au->iserr = 1;
			return hr;
		}

		hr = AVIStreamSetFormat(au->as,0,&au->wfx,sizeof(WAVEFORMATEX));
		if (hr!=AVIERR_OK)
		{
			if (buf!=0)
				free(buf);
			au->iserr = 1;
			return hr;
		}
	}

	// now we can write the data
	numbytes = wav->dat.size;
	numsamps = numbytes*8 / au->wfx.wBitsPerSample;

	hr = AVIStreamWrite(au->as,au->nsamp,numsamps,wav->dat.data,numbytes,0,NULL,NULL);
	if (buf!=0)
		free(buf);

	if (hr!=AVIERR_OK)
	{
		au->iserr = 1;
		return hr;
	}

	au->nsamp+=numsamps;
	return S_OK;
}

unsigned int FormatAviMessage(HRESULT code, char *buf,unsigned int len)
{
	unsigned int mlen;
	unsigned int n;
	const char *msg="unknown avi result code";

	switch (code)
	{
		case S_OK:
			msg="Success";
		break;
		case AVIERR_BADFORMAT:
			msg="AVIERR_BADFORMAT: corrupt file or unrecognized format";
		break;
		case AVIERR_MEMORY:
			msg="AVIERR_MEMORY: insufficient memory";
		break;
		case AVIERR_FILEREAD:
			msg="AVIERR_FILEREAD: disk error while reading file";
		break;
		case AVIERR_FILEOPEN:
			msg="AVIERR_FILEOPEN: disk error while opening file";
		break;
		case REGDB_E_CLASSNOTREG:
			msg="REGDB_E_CLASSNOTREG: file type not recognised";
		break;
		case AVIERR_READONLY:
			msg="AVIERR_READONLY: file is read-only";
		break;
		case AVIERR_NOCOMPRESSOR:
			msg="AVIERR_NOCOMPRESSOR: a suitable compressor could not be found";
		break;
		case AVIERR_UNSUPPORTED:
			msg="AVIERR_UNSUPPORTED: compression is not supported for this type of data";
		break;
		case AVIERR_INTERNAL:
			msg="AVIERR_INTERNAL: internal error";
		break;
		case AVIERR_BADFLAGS:
			msg="AVIERR_BADFLAGS";
		break;
		case AVIERR_BADPARAM:
			msg="AVIERR_BADPARAM";
		break;
		case AVIERR_BADSIZE:
			msg="AVIERR_BADSIZE";
		break;
		case AVIERR_BADHANDLE:
			msg="AVIERR_BADHANDLE";
		break;
		case AVIERR_FILEWRITE:
			msg="AVIERR_FILEWRITE: disk error while writing file";
		break;
		case AVIERR_COMPRESSOR:
			msg="AVIERR_COMPRESSOR";
		break;
		case AVIERR_NODATA:
			msg="AVIERR_READONLY";
		break;
		case AVIERR_BUFFERTOOSMALL:
			msg="AVIERR_BUFFERTOOSMALL";
		break;
		case AVIERR_CANTCOMPRESS:
			msg="AVIERR_CANTCOMPRESS";
		break;
		case AVIERR_USERABORT:
			msg="AVIERR_USERABORT";
		break;
		case AVIERR_ERROR:
			msg="AVIERR_ERROR";
		break;
	}

	mlen = (unsigned int)strlen(msg);

	if (buf == 0 || len == 0)
		return mlen;

	n = mlen;
	if (n+1>len)
		n=len-1;

	strncpy(buf,msg,n);
	buf[n]=0;

	return mlen;
}
