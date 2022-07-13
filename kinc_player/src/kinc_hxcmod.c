#include "kinc_hxcmod.h"
#include "../../hxcmod.h"
#include <kinc/audio1/audio.h>
#include <kinc/audio2/audio.h>

#include <kinc/io/filereader.h>
#include <kinc/log.h>
#include <kinc/memory.h>
#include <kinc/system.h>
#include <kinc/math/core.h>
#include <string.h>

modcontext modloaded;
float a1_volume = 1.0f;
float mod_volume = 1.0f;

bool current_file_data_locked = false;
uint8_t* current_file_data=0;

int16_t output_samples[SAMPLERATE];
#ifdef USE_TRACKBUFFER
tracker_buffer_state trackbuf_state1;
#endif

typedef enum { KINC_MOD_STOPPED,KINC_MOD_RUNNING,KINC_MOD_PAUSED } kinc_mod_state_t;
kinc_mod_state_t mod_state = KINC_MOD_STOPPED;

static void mixaudio_callback(kinc_a2_buffer_t *buffer, int samples){
    int write_location = buffer->write_location;
    
    // call a1 to do its mixing
    kinc_internal_a1_mix(buffer,samples);
    // go back to the position and mix the mod into the A1-mix
    buffer->write_location = write_location;

    if (mod_state==KINC_MOD_PAUSED || mod_state==KINC_MOD_STOPPED){
        // nothing to play
        for (int idx=0;idx<samples;idx++){
            *((float*)&(buffer->data[buffer->write_location]))=0;
            buffer->write_location+=4;
            if (buffer->write_location>=buffer->data_size){
                buffer->write_location=0;
            }
        }
        return;
    } 

#ifdef USE_TRACKBUFFER
    trackbuf_state1.nb_of_state = 0;
	hxcmod_fillbuffer(&modloaded, &output_samples[0], samples/2, &trackbuf_state1);
#else
	hxcmod_fillbuffer(&modloaded, &output_samples[0], samples/2, 0);
#endif    
    
    for (int idx=0;idx<samples;idx++){
        //*((float*)&(buffer->data[buffer->write_location]))=output_samples[idx] / 32767.0f;
        float new_mix_value = (*((float*)&(buffer->data[buffer->write_location]))*a1_volume + output_samples[idx] / 32767.0f)*mod_volume;
        //*((float*)&(buffer->data[buffer->write_location]))=kinc_clamp(new_mix_value,-1.0f,1.0f);
        *((float*)&(buffer->data[buffer->write_location]))=new_mix_value;
        buffer->write_location+=4;
        if (buffer->write_location>=buffer->data_size){
            buffer->write_location=0;
        }
    }
}

void kinc_mod_init()
{
    kinc_a1_init();
    kinc_a2_init();
    kinc_a2_set_callback(mixaudio_callback);
	hxcmod_init(&modloaded);
	hxcmod_setcfg(&modloaded, SAMPLERATE, 0, 0);        
}

void kinc_mod_shutdown(void)
{
    kinc_mod_stop();
    kinc_a2_shutdown();
}

bool kinc_mod_play(const char* filename)
{
	kinc_mod_stop();
    kinc_file_reader_t file;
    if (!kinc_file_reader_open(&file,filename,KINC_FILE_TYPE_ASSET)){
        kinc_log(KINC_LOG_LEVEL_ERROR,"Could not open mod-file:%s",filename);
        return false;
    }
    size_t file_size = kinc_file_reader_size(&file);
    current_file_data = kinc_allocate(file_size);
    current_file_data_locked = true; // lock the data, so it won't be disposed by kinc_mod_play_from_memory
    kinc_file_reader_read(&file,current_file_data,file_size);
    kinc_file_reader_close(&file);
    kinc_mod_play_from_memory((void*)current_file_data,file_size);
    return true;
}

void kinc_mod_play_from_memory(void* mod_data,size_t mod_size){
    if (!current_file_data_locked && current_file_data) {
        kinc_free(current_file_data);
        current_file_data = 0;
    }
    current_file_data_locked = false;
    hxcmod_unload(&modloaded);
    hxcmod_load(&modloaded,(void*)mod_data,mod_size);
    mod_state = KINC_MOD_RUNNING;
#ifdef USE_TRACKBUFFER    
	memset(&trackbuf_state1,0,sizeof(tracker_buffer_state));

    trackbuf_state1.nb_max_of_state = 100;
    trackbuf_state1.track_state_buf = malloc(sizeof(tracker_state) * trackbuf_state1.nb_max_of_state);
    memset(trackbuf_state1.track_state_buf,0,sizeof(tracker_state) * trackbuf_state1.nb_max_of_state);
    trackbuf_state1.sample_step = ( NBSTEREO16BITSAMPLES ) / trackbuf_state1.nb_max_of_state;
#endif    
}

void kinc_mod_pause(void)
{
    mod_state=KINC_MOD_PAUSED;
}

void kinc_mod_unpause(void)
{
    if (kinc_mod_is_paused()){
        mod_state=KINC_MOD_RUNNING;
    }
}

void kinc_mod_stop(void)
{
    if (current_file_data){
        kinc_free(current_file_data);
        current_file_data=NULL;
    }
    hxcmod_unload(&modloaded);
}

#ifdef USE_TRACKBUFFER
tracker_buffer_state* kinc_mod_trackbufferstate()
{
    return &trackbuf_state1;
}
#endif

bool kinc_mod_is_playing(void)
{
    return mod_state==KINC_MOD_RUNNING;
}

bool kinc_mod_is_stopped(void)
{
    return mod_state==KINC_MOD_STOPPED;
}

bool kinc_mod_is_paused(void
)
{
    return mod_state==KINC_MOD_PAUSED;
}

void kinc_mod_a1_mod_mixing(float _a1_volume,float _mod_volume)
{
    a1_volume = kinc_clamp(_a1_volume,0.0f,10.0f);
    mod_volume = kinc_clamp(_mod_volume,0.0f,10.0f);
}

