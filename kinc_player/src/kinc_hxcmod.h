#ifndef __kinc_mod__
#define __kinc_mod__

#include <stdbool.h>
#include <stddef.h>

#ifdef USE_TRACKBUFFER
# include "../../hxcmod.h"
#endif

#define SAMPLERATE 44100
#define NBSTEREO16BITSAMPLES 16384


void kinc_mod_init(void);

/// play mod from file, memoery automatically released on stop
bool kinc_mod_play(const char* filename); 
/// play mod from memory, user needs to release this data on his own
void kinc_mod_play_from_memory(void* data,size_t size);

void kinc_mod_stop(void);
void kinc_mod_pause(void);
void kinc_mod_unpause(void);

bool kinc_mod_is_stopped(void);
bool kinc_mod_is_paused(void);
bool kinc_mod_is_playing(void);

// give the whole a1-mix a 'volume' and the mod-sound a volume for mixing them together (values clamped to 10.0f)
void kinc_mod_a1_mod_mixing(float a1_volume,float mod_volume);

void kinc_mod_shutdown(void);

#ifdef USE_TRACKBUFFER
tracker_buffer_state* kinc_mod_trackbufferstate();
#endif

#endif