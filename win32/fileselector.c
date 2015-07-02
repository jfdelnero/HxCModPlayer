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
// File : fileselector.c
// Contains: win32 file selector
//
// Written by: Jean François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////////

#include <windows.h>
#include <commctrl.h>
#include <stdio.h>
#include "fileselector.h"


extern unsigned char cfg_file_buffer[4*1024];

int fileselector(HWND hWnd,char * files,char * title,char* selector,char * defext,unsigned int * ext_def,unsigned char initialdir)
{
	OPENFILENAME sfile;
	int i;

	memset(&sfile,sizeof(sfile),0);
	sfile.lStructSize=sizeof(OPENFILENAME);
	sfile.hwndOwner=hWnd;
	sfile.hInstance=GetModuleHandle(NULL);
	sfile.lpstrCustomFilter = NULL;
	sfile.nFilterIndex      = 0;
	sfile.lpstrFileTitle    = NULL;

	sfile.lpstrInitialDir   = 0;
	
	sfile.Flags=OFN_PATHMUSTEXIST|OFN_LONGNAMES|OFN_EXPLORER;
	sfile.lpstrDefExt       = defext;
	sfile.nMaxFile=1024;
	sfile.lpstrFilter=selector;
	sfile.lpstrTitle=title;

	sfile.lpstrFile=(char*)files;	

	if(GetOpenFileName(&sfile))
	{	
		if(ext_def) *ext_def=sfile.nFilterIndex;
			
		if(initialdir)
		{
			i=strlen(sfile.lpstrFile);
			while(i && sfile.lpstrFile[i]!='\\')
			{
				i--;
			}
			if(sfile.lpstrFile[i]=='\\')
			{
				i++;
			}
		}
		return 1;
	}
	else
	{
		return 0;
	}
	
}