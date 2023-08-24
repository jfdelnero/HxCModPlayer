#include <kinc/log.h>
#include <kinc/audio1/audio.h>
#include <kinc/audio2/audio.h>
#include <kinc/audio1/sound.h>
#include <kinc/input/keyboard.h>
#include <kinc/graphics1/graphics.h>
#include <kinc/system.h>
#include <kinc/memory.h>
#include <stdint.h>

#include "kinc_hxcmod.h"
#include "../../packer/pack.h"
#include "../../hxcmod.h"
#include "../../framegenerator.h"
#include "../../data_files/data_cartoon_dreams_n_fantasies_mod.h"

#define FRAMEXRES 640
#define FRAMEYRES 480

#define GETRED(RGB)     ((RGB>>16)&0xFF)
#define GETBLUE(RGB)    ((RGB)&0xFF)
#define GETGREEN(RGB)   ((RGB>>8)&0xFF)

unsigned char * modfile;
uint32_t *framebuf;
kinc_a1_sound_t* sound;

#ifdef USE_TRACKBUFFER
framegenerator * fg;
tracker_buffer_state trackbuf_state1;
#endif

static void keydown(int key){
    if (key == KINC_KEY_SPACE){
        if (kinc_mod_is_paused()){
            kinc_mod_unpause();
        } else {
            kinc_mod_pause();
        }
    }
    else if (key == KINC_KEY_1){
        kinc_mod_play("files/cartoon-dreams_n_fantasies.mod");
    }
    else if (key == KINC_KEY_2){
        kinc_mod_play("files/alphavil.mod");
    }
    else if (key == KINC_KEY_3){
        kinc_a1_play_sound(sound,false,1.0f,false);
    }
    else if (key == KINC_KEY_ESCAPE){
        kinc_stop();
    }
}


static void update(void) {
#ifdef USE_TRACKBUFFER    
    tracker_buffer_state* tb_state = kinc_mod_trackbufferstate();
    if (tb_state->track_state_buf){
        framebuf =(uint32_t*)fg_generateFrame(fg,tb_state,NBSTEREO16BITSAMPLES-1);
    }
    kinc_g1_begin();
    for (int y=0;y<FRAMEYRES;y++){
        for (int x=0;x<FRAMEXRES;x++){
            uint32_t data = framebuf[y*FRAMEXRES+x];
            unsigned char r = GETRED(data);
            unsigned char g = GETGREEN(data);
            unsigned char b = GETBLUE(data);
            kinc_g1_set_pixel(x,y,r,g,b);
        }
    }
    kinc_g1_end();
#else
    kinc_g1_begin();
    kinc_g1_end();
#endif    
}

static void shutdown(){
    kinc_mod_shutdown();
}

void setup_player(){
#ifdef USE_TRACKBUFFER    
	fg = init_fg(FRAMEXRES,FRAMEYRES); 
#endif    
    kinc_mod_init();

    sound = kinc_a1_sound_create("files/chop1.wav");

    bool result = kinc_mod_play("files/alphavil.mod");
    //bool result = kinc_mod_play("files/cartoon-dreams_n_fantasies.mod");

    //modfile = unpack(data_cartoon_dreams_n_fantasies_mod->data,data_cartoon_dreams_n_fantasies_mod->csize ,data_cartoon_dreams_n_fantasies_mod->data, data_cartoon_dreams_n_fantasies_mod->size);
    //kinc_mod_play_from_memory(modfile,data_cartoon_dreams_n_fantasies_mod->size);
    if (!result){
        kinc_internal_shutdown();
        return;
    }
}

int kickstart(int argc, char **argv) {
    kinc_init("hxcmod kinc",FRAMEXRES,FRAMEYRES,NULL,NULL);
    kinc_g1_init(FRAMEXRES,FRAMEYRES);

    setup_player();

    kinc_set_shutdown_callback(shutdown);

    kinc_keyboard_set_key_down_callback(keydown);

    kinc_set_update_callback(update);
    kinc_start();
}