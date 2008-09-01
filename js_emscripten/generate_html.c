#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <dirent.h>
#include <errno.h>
#include <stdarg.h>
#include <limits.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdint.h>

#include "../hxcmod.h"

typedef struct filefoundinfo_
{
	int isdirectory;
	char filename[256];
	int size;
}filefoundinfo;

void * find_first_file(char *folder, char *file, filefoundinfo* fileinfo)
{
	struct dirent *d;
	DIR * dir;
	struct stat fileStat;
	char * tmpstr;

	dir = opendir (folder);
	if(dir)
	{
		d = readdir (dir);
		if(d)
		{
			tmpstr = malloc (strlen(folder) + strlen(d->d_name) + 4 );
			if(tmpstr)
			{
				strcpy(tmpstr,folder);
				strcat(tmpstr,"/");
				strcat(tmpstr,d->d_name);

				memset(&fileStat,0,sizeof(struct stat));
				if(!lstat (tmpstr, &fileStat))
				{

					if ( S_ISDIR ( fileStat.st_mode ) )
						fileinfo->isdirectory=1;
					else
						fileinfo->isdirectory=0;

					fileinfo->size=fileStat.st_size;

					strncpy(fileinfo->filename,d->d_name,256);

					free(tmpstr);
					return (void*)dir;
				}

				free(tmpstr);
			}

			closedir (dir);
			dir=0;

		}

		closedir (dir);
		dir=0;;
	}
	else
	{
		dir=0;
	}

	return (void*)dir;
}

int find_next_file(void* handleff, char *folder, char *file, filefoundinfo* fileinfo)
{
	int ret;

	struct dirent *d;
	DIR * dir;
	struct stat fileStat;
	char * tmpstr;

	dir = (DIR*) handleff;
	d = readdir (dir);

	ret = 0;
	if(d)
	{
		tmpstr = malloc (strlen(folder) + strlen(d->d_name) + 4 );
		if(tmpstr)
		{
			strcpy(tmpstr,folder);
			strcat(tmpstr,"/");
			strcat(tmpstr,d->d_name);

			if(!lstat (tmpstr, &fileStat))
			{
				if ( S_ISDIR ( fileStat.st_mode ) )
					fileinfo->isdirectory=1;
				else
					fileinfo->isdirectory=0;

				fileinfo->size=fileStat.st_size;
				strncpy(fileinfo->filename,d->d_name,256);

				ret = 1;
				free(tmpstr);
				return ret;
			}

			free(tmpstr);
		}
    }

	return ret;
}

int find_close(void* handle)
{
	if(handle)
		closedir((DIR*) handle);

	return 0;
}

const char * effectlist[]=
{
	"ARPEGGIO",
	"PORTA_UP",
	"PORTA_DWN",
	"TONE_PORTA",
	"VIBRATO",
	"VOL_TONEPORTA",
	"VOL_VIBRA",
	"VOL_TREMO",
	"PANNING",
	"OFFSET",
	"VOLSLIDE",
	"JUMP",
	"VOL",
	"BREAK",
	"EXTENDED",
	"SPEED/TEMPO",
	0
};

const char * exteffectlist[]=
{
	"",
	"FPORTA_UP",
	"FPORTA_DWN",
	"GLISS_CTRL",
	"VIBRA_WAVF",
	"FINETUNE",
	"PATTERN_LOOP",
	"TREMOLO_WAVF",
	"PANNING2",
	"RETRIG",
	"FVOLSLIDE_UP",
	"FVOLSLIDE_DWN",
	"NOTE_CUT",
	"NOTE_DELAY",
	"PATTERN_DELAY",
	"INVERT_LOOP",
	0
};

static int entryCompare (const void * a, const void * b) 
{
	filefoundinfo * entry1;
	filefoundinfo * entry2;

	entry1 = (filefoundinfo *)a;
	entry2 = (filefoundinfo *)b;

	return strcasecmp (entry1->filename, entry2->filename); 
}

void sort(filefoundinfo * entries[], int n) 
{
	qsort (entries, n, sizeof(filefoundinfo), entryCompare); 
}

int main(int argc, char *argv[])
{
	FILE * flayout;
	int layout_size,i,j;
	char * layout_buffer;

	char * header;
	char * end;
	char * marker;
	msample outbuffer[44100*2];

	time_t t = time(NULL);
	struct tm tm = *localtime(&t);

	void * handle;
	int ret;
	unsigned char * modbuffer;
	FILE *f;
	filefoundinfo fileinfo;
	modcontext * modctx;
	char fullpath[512];
	int first_effect;
	int entry_in_dir,entry_index;

	filefoundinfo* fileinfo_list;

	fileinfo_list = 0;

	entry_in_dir = 0;
	handle = find_first_file("./www/mods/", "*.mod", &fileinfo);
	if(handle)
	{
		do
		{
			entry_in_dir++;
			ret = find_next_file(handle, "./www/mods/", "*.mod", &fileinfo);
		}while(ret);
		find_close(handle);
	}

	if( entry_in_dir )
	{
		fileinfo_list = malloc(sizeof(filefoundinfo) * (entry_in_dir+1));
		if(fileinfo_list) 
			memset(fileinfo_list,0,sizeof(filefoundinfo) * (entry_in_dir+1));
	}

	if(!fileinfo_list)
		exit(-2);

	entry_index = 0;
	handle = find_first_file("./www/mods/", "*.mod", &fileinfo_list[entry_index]);
	if(handle)
	{
		do
		{
			entry_index++;
			ret = find_next_file(handle, "./www/mods/", "*.mod", &fileinfo_list[entry_index]);
		}while(ret);
		find_close(handle);
	}

	sort((filefoundinfo **)fileinfo_list, entry_in_dir);

	flayout = fopen("page_layout.html","r");
	if(!flayout)
	{
		printf("html layout not found!\n");
		exit(-1);
	}

	fseek(flayout,0, SEEK_END);
	layout_size = ftell(flayout);
	
	layout_buffer = (char*)malloc(layout_size+1);
	if(!layout_buffer)
	{
		fclose(flayout);
		printf("html layout alloc error!\n");
		exit(-1);
	}
	memset(layout_buffer,0,layout_size+1);
	fseek(flayout,0, SEEK_SET);

	modctx = (modcontext*)malloc(sizeof(modcontext));
	if(!modctx)
	{
		printf("mod context alloc error!\n");
		exit(-1);
	}

	if( fread(layout_buffer,layout_size,1,flayout) != 1 )
	{
		free(layout_buffer);
		printf("Can't read the layout file !\n");
		fclose(flayout);
		exit(-2);
	}
	fclose(flayout);

	header = layout_buffer;

	marker = strstr(header,"<INSERTIONMARKER>");
	if(marker)
	{
		*marker = 0;
		marker += strlen("<INSERTIONMARKER>");
		end = marker;
	}

	printf("%s",header);

	printf("\t\t\t<p><b>Last update: %.4d-%.2d-%.2d %.2d:%.2d:%.2d</b></p>\n\n", tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);

	entry_index = 0;
	printf("\t\t\t<div class=\x22hxcthumbnailcont\x22>\n");
	printf("\t\t\t\t<div class=\x22hxcthumbnail_mods\x22>\n");

	do
	{

		if(!fileinfo_list[entry_index].isdirectory)
		{
			sprintf(fullpath,"./www/mods/%s",(char*)&fileinfo_list[entry_index].filename);
			modbuffer = malloc( fileinfo_list[entry_index].size );
			if(modbuffer)
			{	
				f = fopen(fullpath,"rb");
				if(f)
				{

					if( fread(modbuffer,fileinfo_list[entry_index].size,1,f) != 1 )
					{
						free(modbuffer);
						free(layout_buffer);
						printf("Can't read the mod file !\n");
						fclose(f);
						exit(-3);
					}						

					if(hxcmod_init(modctx))
					{
						hxcmod_setcfg( modctx, 4000, 100, 0);

						if( hxcmod_load( modctx, modbuffer, fileinfo_list[entry_index].size ) )
						{
							for(i=0;i<4*60;i++)
							{
								hxcmod_fillbuffer(  modctx, (msample*)&outbuffer, 2000, 0 );
							}

							printf("\t\t\t\t\t<div>\n");

							printf("\t\t\t\t\t\t<a onclick=\x22loadMOD(\x27mods/%s\x27)\x22 href=\x22#\x22><img src=\x22play.png\x22 alt=\x22Play %s !\x22><br>%s<br>%d bytes - %d Channels<br>\n",
								(char*)&fileinfo_list[entry_index].filename,
								(char*)&fileinfo_list[entry_index].filename,
								(char*)&fileinfo_list[entry_index].filename,
								fileinfo_list[entry_index].size,
								modctx->number_of_channels);
							first_effect = 1;
							printf("\t\t\t\t\t\t<div style=\x22 font-size: 55%%\x3B\x22>Effects: ");
							for(j=0;j<32;j++)
							{
								if(modctx->effects_event_counts[j])
								{
									if(j < 0x10 )
									{
										if(j!=0xE)
										{
											if(!first_effect)
											{
												printf(",");
											}
											printf(" %s",effectlist[j]);
											first_effect = 0;
										}	
									}
									else
									{
										if(!first_effect)
										{
											printf(",");
										}
										printf(" %s", exteffectlist[j - 0x10] );
										first_effect = 0;
									}
								}
							}
							printf("</div></a>\n");

							printf("\t\t\t\t\t</div>\n");

						}

						hxcmod_unload( modctx );
					}
					fclose(f);
				}
				free(modbuffer);
			}
		}
		entry_index++;
		
	}while(strlen(fileinfo_list[entry_index].filename));

	printf("\t\t\t\t</div>\n");
	printf("\t\t\t</div>\n");

	printf("%s",end);

	free(fileinfo_list);
	free(layout_buffer);
	free(modctx);

	return 0;
}
