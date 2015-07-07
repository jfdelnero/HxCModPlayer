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
// File : hxcmodplayer.c
// Contains: win32 main window handler.
//
// Written by: Jean François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////////
#include <windows.h>
#include <commctrl.h>
#include <stdio.h>
#include <time.h>
#include <mmsystem.h>

#include "resource.h"
#include "fileselector.h"
#include "../hxcmod.h"
#include "../framegenerator.h"
#include "../data_files/data_cartoon_dreams_n_fantasies_mod.h"
#include "../packer/pack.h"

#define WINDOW_CLASS "hxc2001_class"
#define NOMFENETRE   "HxCMod"

#define ABOVE_NORMAL_PRIORITY_CLASS 0x00008000
#define BELOW_NORMAL_PRIORITY_CLASS 0x00004000

#define FRAMEXRES 640
#define FRAMEYRES 480

HINSTANCE hInst;
HWAVEOUT wout;

#define NBSTEREO16BITSAMPLES 16384

unsigned long nb_wr_block;
unsigned short sndbuffer1[NBSTEREO16BITSAMPLES*2];
tracker_buffer_state trackbuf_state1;

unsigned short sndbuffer2[NBSTEREO16BITSAMPLES*2];
tracker_buffer_state trackbuf_state2;

void * modloaded;
unsigned char * modfile;

framegenerator * fg;

HWND IconButton(HWND hParent,unsigned long a,unsigned long b,unsigned long wd,unsigned long ht,HMENU ID)
{
    return CreateWindowEx(0,"BUTTON","",WS_CHILD|WS_VISIBLE|BS_ICON,a,b,wd,ht,hParent,ID,GetModuleHandle(NULL),NULL);
}

void ListPopup(HWND hwnd)
{
	//MENUITEMINFO mii;
	POINT pt;
	HMENU hm;
	HMENU sb;

	hm = LoadMenu(GetModuleHandle(NULL),(LPCSTR)600);
	sb = GetSubMenu(hm,0);

	//mii.cbSize = sizeof(MENUITEMINFO);
	//mii.fMask = MIIM_STATE;
	//mii.fState = MFS_GRAYED;

	GetCursorPos(&pt);
	TrackPopupMenu(sb,TPM_LEFTALIGN|TPM_LEFTBUTTON,pt.x,pt.y,0,hwnd,NULL);
	DestroyMenu(hm);
}

int loadmod(char * file)
{
	FILE * f;
	int filesize;

	if(modloaded)
	{
		hxcmod_unload(modloaded);
		modloaded = 0;
	}

	if(modfile)
	{
		free(modfile);
		modfile = 0;
	}

	f = fopen(file,"rb");
	if(f)
	{
		fseek(f,0,SEEK_END);
		filesize = ftell(f);
		fseek(f,0,SEEK_SET);
		if(filesize && filesize < 32*1024*1024)
		{
			modfile = malloc(filesize);
			if(modfile)
			{
				memset(modfile,0,filesize);
				fread(modfile,filesize,1,f);

				modloaded = hxcmod_load((void*)modfile,filesize);
			}
		}

		fclose(f);
	}

	return 0;
}

void updateScreen(HWND hwnd,unsigned long * buffer,int xres,int yres)
{
	RECT myRect;
	HDC hdc;
    BITMAPINFO bmapinfo;

	bmapinfo.bmiHeader.biSize=sizeof(bmapinfo.bmiHeader);
	bmapinfo.bmiHeader.biWidth=xres;
	bmapinfo.bmiHeader.biHeight=-yres;
	bmapinfo.bmiHeader.biPlanes=1;
	bmapinfo.bmiHeader.biBitCount=32;
	bmapinfo.bmiHeader.biCompression=BI_RGB;
	bmapinfo.bmiHeader.biSizeImage=0;
	bmapinfo.bmiHeader.biXPelsPerMeter=0;
	bmapinfo.bmiHeader.biYPelsPerMeter=0;
	bmapinfo.bmiHeader.biClrUsed=0;
	bmapinfo.bmiHeader.biClrImportant=0;

	hdc=GetDC(hwnd);
	GetClientRect(hwnd,&myRect);
	StretchDIBits(hdc,0,0,xres,yres,0,0,xres,yres,buffer,&bmapinfo,0,SRCCOPY);
	ReleaseDC(hwnd,hdc);
}



LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
	int wmId, wmEvent;
	char file[512];
	WAVEHDR * pwhOut;
	MMTIME mmt;
	unsigned long * framebuf;

	switch (message) // switch selon le message
	{
		case WM_CREATE:
			SetTimer(hWnd,0,10,NULL);
		break;

		case WM_DROPFILES:
			file[0] = 0;
			DragQueryFile((HDROP)wParam, 0, (char*)file, sizeof(file));
			loadmod(file);
		break;

		case WM_TIMER:
			mmt.wType = TIME_SAMPLES;
			if(waveOutGetPosition(wout,&mmt,sizeof(MMTIME)) == MMSYSERR_NOERROR)
			{
				file[0] = 0;

				if(IsWindowVisible(hWnd) && fg)
				{
					if(mmt.u.sample&NBSTEREO16BITSAMPLES)
					{
						framebuf = fg_generateFrame(fg,&trackbuf_state2,mmt.u.sample&(NBSTEREO16BITSAMPLES-1));
					}
					else
					{
						framebuf = fg_generateFrame(fg,&trackbuf_state1,mmt.u.sample&(NBSTEREO16BITSAMPLES-1));
					}

					updateScreen(hWnd, framebuf, fg->xres,fg->yres);
				}
			}
		break;
		case WM_COMMAND:	//Action sur un menu
			wmId    = LOWORD(wParam);
			wmEvent = HIWORD(wParam);
			switch(wmId)
			{
				case IDI_PLAY:
					waveOutRestart(wout);
				break;
				case IDI_PAUSE:
					waveOutPause(wout);
				break;
				case IDI_EJECT:
					file[0] = 0;
					if(fileselector(hWnd,file,"Load mod file","*.mod","*.mod",0,0))
					{
						loadmod(file);
					}
				break;
				case IDI_INFO:
				break;
				case IDI_FILTER:
				break;
				case IDI_STEREO:
				break;

				case IDI_QUIT:
					PostQuitMessage(0);
				break;

			}
		break;

		case WM_DESTROY:
		break;

		case WM_USER: //Message venant de l'icone de la barre des taches
			switch(lParam)
			{
				case WM_LBUTTONDOWN:
					if(GetFocus() == hWnd)
					{
						ShowWindow(hWnd,SW_HIDE);
					}
					else
					{
						ShowWindow(hWnd,SW_SHOWNORMAL);
						SetFocus(hWnd);
					}
				break;
				case WM_RBUTTONDOWN:
					ListPopup(hWnd);
				break;
			}

		break;

		case WM_USER+1:
		break;

		case WM_CLOSE: //message de fermeture
			ShowWindow(hWnd,SW_HIDE);
		break;

		case WM_MOUSEMOVE:
		break;

		case MM_WOM_OPEN:
		break;

		case MM_WOM_CLOSE:
		break;

		case MM_WOM_DONE:
			pwhOut = (struct wavehdr_tag *)lParam;
			if(modloaded)
			{
				if(pwhOut->lpData == (char*)&sndbuffer1)
				{
					trackbuf_state1.nb_of_state = 0;
					hxcmod_fillbuffer(modloaded,(unsigned short*)pwhOut->lpData, pwhOut->dwBufferLength /4,&trackbuf_state1);
				}
				else
				{
					trackbuf_state2.nb_of_state = 0;
					hxcmod_fillbuffer(modloaded,(unsigned short*)pwhOut->lpData, pwhOut->dwBufferLength /4,&trackbuf_state2);
				}
			}
			waveOutWrite((HWAVEOUT)wParam,pwhOut,sizeof(WAVEHDR));
			nb_wr_block++;

		break;

		case WM_KEYDOWN:
		break;

		default: // traitement par defaut de l'evenement (gerer par windows)
			return DefWindowProc(hWnd, message, wParam, lParam);
	}
	return 0;
}



ATOM MyRegisterClass(HINSTANCE hInstance)
{
	WNDCLASSEX wcex;

	wcex.cbSize = sizeof(WNDCLASSEX);
	wcex.style			= 0;
	wcex.lpfnWndProc	= (WNDPROC)WndProc;
	wcex.cbClsExtra		= 0;
	wcex.cbWndExtra		= 0;
	wcex.hInstance		= hInstance;
	wcex.hIcon			= LoadIcon(hInstance, (LPCTSTR)IDI_APPLIICON);
	wcex.hCursor		= LoadCursor(NULL, IDC_ARROW);
	wcex.hbrBackground	= (HBRUSH)(COLOR_BTNFACE);
	wcex.lpszMenuName	= NULL;
	wcex.lpszClassName	= WINDOW_CLASS;
	wcex.hIconSm		= LoadIcon(wcex.hInstance, (LPCTSTR)IDI_APPLIICON);
	wcex.hIcon		    = LoadIcon(wcex.hInstance, (LPCTSTR)IDI_APPLIICON);
	wcex.cbWndExtra		= 0;
	return RegisterClassEx(&wcex);
}


HWND InitInstance(HINSTANCE hInstance, int nCmdShow)
{
	HWND hWnd;
	int TailleX,TailleY;

	hWnd = 0;
	hInst = hInstance;

	if(FindWindow(NULL,NOMFENETRE) == NULL)
	{
		MyRegisterClass(hInstance);

		TailleX = (640 + GetSystemMetrics(SM_CXFRAME)*2) - 1;
		TailleY = (480 + GetSystemMetrics(SM_CYCAPTION)+(GetSystemMetrics(SM_CYFRAME)*2)) - 1;

		hWnd = CreateWindowEx(WS_EX_LEFT,WINDOW_CLASS,NOMFENETRE,WS_OVERLAPPED|WS_SYSMENU|WS_MINIMIZEBOX,16,16,TailleX,TailleY,NULL,NULL,hInstance,NULL);
		if (!hWnd)
		{
			return hWnd;
		}

		ShowWindow(hWnd,SW_SHOWNORMAL);

		UpdateWindow(hWnd);

		SetPriorityClass(GetCurrentProcess(),ABOVE_NORMAL_PRIORITY_CLASS);

		DragAcceptFiles(hWnd,TRUE);

	}

	return hWnd;
}

int APIENTRY WinMain(HINSTANCE hInstance,
                     HINSTANCE hPrevInstance,
                     LPSTR     lpCmdLine,
                     int       nCmdShow)
{
	MSG msg;
	HACCEL hAccelTable;
	HWND hWnd;

	HWAVEOUT shwd;
	WAVEFORMATEX pwfx;
	WAVEHDR pwhOut1;
	WAVEHDR pwhOut2;
	NOTIFYICONDATA notificon;

	fg = 0;

	hWnd = InitInstance(hInstance, nCmdShow);

	if(hWnd)
	{
		hAccelTable = LoadAccelerators(hInstance, (LPCTSTR)IDI_MAINICON);

		if(waveOutGetNumDevs())
		{

			fg = init_fg(FRAMEXRES,FRAMEYRES);

			nb_wr_block = 0;
			modloaded = 0;
			modfile = 0;

			pwfx.wFormatTag=1;
			pwfx.nChannels=2;
			pwfx.nSamplesPerSec=44100;
			pwfx.nAvgBytesPerSec=pwfx.nSamplesPerSec*4;
			pwfx.nBlockAlign=4;
			pwfx.wBitsPerSample=16;
			pwfx.cbSize=0;

			memset(&trackbuf_state1,0,sizeof(tracker_buffer_state));
			trackbuf_state1.nb_max_of_state = 100;
			trackbuf_state1.track_state_buf = malloc(sizeof(tracker_state) * trackbuf_state1.nb_max_of_state);
			memset(trackbuf_state1.track_state_buf,0,sizeof(tracker_state) * trackbuf_state1.nb_max_of_state);
			trackbuf_state1.sample_step = ( sizeof(sndbuffer1) / (sizeof(unsigned short)*2) ) / trackbuf_state1.nb_max_of_state;

			memset(&trackbuf_state2,0,sizeof(tracker_buffer_state));
			trackbuf_state2.nb_max_of_state = 100;
			trackbuf_state2.track_state_buf = malloc(sizeof(tracker_state) * trackbuf_state2.nb_max_of_state);
			memset(trackbuf_state2.track_state_buf,0,sizeof(tracker_state) * trackbuf_state2.nb_max_of_state);
			trackbuf_state2.sample_step = ( sizeof(sndbuffer2) / (sizeof(unsigned short)*2) ) / trackbuf_state2.nb_max_of_state;

			waveOutOpen(&shwd,WAVE_MAPPER,&pwfx,(unsigned long)hWnd,0,CALLBACK_WINDOW);
			wout = shwd;
			if(shwd)
			{
				pwhOut1.lpData=(char*)sndbuffer1;
				pwhOut1.dwBufferLength=sizeof(sndbuffer1);
				pwhOut1.dwFlags=0;
				pwhOut1.dwLoops=0;

				pwhOut2.lpData=(char*)sndbuffer2;
				pwhOut2.dwBufferLength=sizeof(sndbuffer2);
				pwhOut2.dwFlags=0;
				pwhOut2.dwLoops=0;

				waveOutPrepareHeader(shwd, &pwhOut1, sizeof(pwhOut1));
				waveOutPrepareHeader(shwd, &pwhOut2, sizeof(pwhOut2));

				waveOutWrite(shwd,&pwhOut1,sizeof(pwhOut1));
				nb_wr_block++;
				waveOutWrite(shwd,&pwhOut2,sizeof(pwhOut2));
				nb_wr_block++;

				notificon.cbSize = sizeof(NOTIFYICONDATA);
				notificon.hIcon = LoadIcon(hInstance, (LPCTSTR)IDI_APPLIICON);
				notificon.hWnd = hWnd;
				notificon.szTip[0] = 0;
				notificon.uID = 0;
				notificon.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP;
				notificon.uCallbackMessage = WM_USER;

				Shell_NotifyIcon(NIM_ADD,&notificon);

				modfile = unpack(data_cartoon_dreams_n_fantasies_mod->data,data_cartoon_dreams_n_fantasies_mod->csize ,data_cartoon_dreams_n_fantasies_mod->data, data_cartoon_dreams_n_fantasies_mod->size);
				modloaded = hxcmod_load((void*)modfile,data_cartoon_dreams_n_fantasies_mod->size);

				///////////////////////////////////////
				// Main message loop:
				while (GetMessage(&msg, NULL, 0, 0))
				{
					if (!TranslateAccelerator(msg.hwnd, hAccelTable, &msg))
					{
						TranslateMessage(&msg);
						DispatchMessage(&msg);
					}
				}

				Shell_NotifyIcon(NIM_DELETE,&notificon);

				deinit_fg(fg);

				return msg.wParam;
			}

		}
		else
		{
			MessageBox(NULL,"ERROR : Sound System Failure!!!",NOMFENETRE,MB_ICONHAND|MB_OK);
		}

	}

	return FALSE;
}
