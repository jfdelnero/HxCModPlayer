* kinc ( https://github.com/Kode/Kinc )-backend by dertom

* to build the player: 
    * kfile-js: modify 'kinc'-path to point to your kinc-installation
      * in the kfile you can deactivate visual output
    * run 'kmake' in kinc_player-folder and build with your systems build-tool
    * copy exe in Deployment folder and run exe
      * space: toggle (un)pause
      * 1 : play song 1
      * 2 : play song 2
      * 3 : play a short wav-sound (to test A1 and MOD-mixing)
      * esc: stop

To use the api you only need kinc_hxcmod.h/c and hxcmode.h/.c.

```
void kinc_mod_init(void); // init the api( inits kinc_a1 and kinc_a2)

/// play mod from file, memory of loaded file automatically released on stop-/play-call
bool kinc_mod_play(const char* filename); 
/// play mod from memory, user needs to release this data on his own
void kinc_mod_play_from_memory(void* data,size_t size);

void kinc_mod_stop(void);
void kinc_mod_pause(void);
void kinc_mod_unpause(void);

bool kinc_mod_is_stopped(void);
bool kinc_mod_is_paused(void);
bool kinc_mod_is_playing(void);

void kinc_mod_shutdown(void);

// give the whole a1-mix a 'volume' and the mod-sound a volume for mixing them together
void kinc_mod_a1_mod_mixing(float a1_volume,float mod_volume);


#ifdef USE_TRACKBUFFER
tracker_buffer_state* kinc_mod_trackbufferstate();
#endif
```