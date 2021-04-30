///////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------//
//----------H----H--X----X-----CCCCC-----22222----0000-----0000-----11-------//
//---------H----H----X-X-----C--------------2---0----0---0----0---1-1--------//
//--------HHHHHH-----X------C----------22222---0----0---0----0-----1---------//
//-------H----H----X--X----C----------2-------0----0---0----0-----1----------//
//------H----H---X-----X---CCCCC-----22222----0000-----0000----11111---------//
//---------------------------------------------------------------------------//
//----- Contact: hxc2001 at hxc2001.com ----------- https://hxc2001.com -----//
//----- (c) 2021 Jean-François DEL NERO ----------- http://hxc2001.free.fr --//
///////////////////////////////////////////////////////////////////////////////
// File : main.c
// Contains: STM32F1xx delta sigma HxCMod play main code
//
// Written by: Jean-François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////

#include "buildconf.h"

#include "stm32f1xx_hal.h"
#include "stm32f1xx_hal_gpio.h"

#include "mini_stm32f1xx_defs.h"

#include "hw_init_table.h"
#include "fast_delta_sigma_dac_gen.h"

#include "hxcmod.h"

msample wave_buffer[CONFIG_WAVE_BUFFER_SIZE];
unsigned char deltasigma_buffer[CONFIG_DELTASIGMA_BUFFER_SIZE] __attribute__((aligned(4)));

delta_sigma_dac_gen_state spigen;

void SysTick_Handler(void)
{

}

void DMA_IRQ_ENTRY_NAME(void)
{
	if (CONFIG_DMA_CTRL->ISR & (DMA_ISR_TCIF1 << ((CONFIG_DMA_CHANNEL-1)*4)) )
	{
		CONFIG_DMA_CTRL->IFCR = (DMA_IFCR_CTCIF1 << ((CONFIG_DMA_CHANNEL-1)*4));

		spigen.encoded_dat_offset = (sizeof(deltasigma_buffer)/2);

		fast_delta_sigma_dac_gen(&spigen);
	}

	if (CONFIG_DMA_CTRL->ISR & (DMA_ISR_HTIF1 << ((CONFIG_DMA_CHANNEL-1)*4)) )
	{
		CONFIG_DMA_CTRL->IFCR = (DMA_IFCR_CHTIF1 << ((CONFIG_DMA_CHANNEL-1)*4));

		spigen.encoded_dat_offset = 0;

		fast_delta_sigma_dac_gen(&spigen);
	}

	if (CONFIG_DMA_CTRL->ISR & (DMA_ISR_TEIF1 << ((CONFIG_DMA_CHANNEL-1)*4)) )
	{
		CONFIG_DMA_CTRL->IFCR = (DMA_IFCR_CTEIF1 << ((CONFIG_DMA_CHANNEL-1)*4));

		__DSB();
	}

	__asm(" nop\n");
}

void set_led(int state)
{
#if 0
	if(state)
		GPIOA->CRH = ((GPIOA->CRH & ~PINCFGMASK(PIN_9)) | (( GPIO_SPEED_FREQ_HIGH + GPIO_CR_CNF_GP_OUTPUT_PP ) << PINSHIFT(PIN_9)) );
	else
		GPIOA->CRH = ((GPIOA->CRH & ~PINCFGMASK(PIN_9)) | (( GPIO_CR_CNF_INPUT_FLOATING ) << PINSHIFT(PIN_9)) );
#endif
}

void start_dma()
{
	int i;

	for(i=0;i<sizeof(deltasigma_buffer);i++)
		deltasigma_buffer[i] = 0x00;

	spigen.wave_buffer  = (unsigned short*)&wave_buffer;
	spigen.deltasigma_buffer  = (unsigned char*)&deltasigma_buffer;
	spigen.wave_offset = 0;
	spigen.encoded_dat_offset  = 0;
	spigen.accumulator = 0;

	CONFIG_DMA_CHN_CTRL->CMAR  = (uint32_t)&deltasigma_buffer;
	CONFIG_DMA_CHN_CTRL->CNDTR = sizeof(deltasigma_buffer);
	CONFIG_DMA_CHN_CTRL->CPAR  = (uint32_t)&CONFIG_SPI_CTRL->DR;

	CONFIG_DMA_CHN_CTRL->CCR  |= DMA_CCR_EN; // Ch5 enabled

	__DSB();

	CONFIG_SPI_CTRL->CR1 |= SPI_CR1_SPE;
	CONFIG_SPI_CTRL->CR2 =  SPI_CR2_TXDMAEN;
}

extern unsigned char * _sidata, * _edata, * _sdata;

int main(void)
{
	modcontext modctx;
	unsigned char * mod;

	exec_hw_init_table(HW_INIT_GLOBAL_INIT);

	hxcmod_init( &modctx );

	hxcmod_setcfg( &modctx, CONFIG_SAMPLE_RATE, 0, 0);

	mod = (unsigned char *)( &_sidata + ( &_edata - &_sdata ) );

	hxcmod_load( &modctx, (unsigned char*)mod, 0x7FFFFFFF );

	start_dma();

	while (1)
	{
		while(spigen.wave_offset < sizeof(wave_buffer)/2)
		{
			__WFI();
		}

		set_led(1);
		hxcmod_fillbuffer(&modctx, (msample *)&wave_buffer, sizeof(wave_buffer)/(2*sizeof(msample)), NULL);
		set_led(0);

		while(spigen.wave_offset >= sizeof(wave_buffer)/2)
		{
			__WFI();
		}

		set_led(1);
		hxcmod_fillbuffer(&modctx, (msample *)&wave_buffer[sizeof(wave_buffer)/(2*sizeof(msample))], sizeof(wave_buffer)/(2*sizeof(msample)), NULL);
		set_led(0);

	}
}
