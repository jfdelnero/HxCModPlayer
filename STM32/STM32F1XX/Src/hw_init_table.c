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
// File : hw_init_table.c
// Contains: Hardware descriptors tables and hardware init table executor
//
// Written by: Jean-François DEL NERO
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////

#include "stm32f1xx_hal.h"

#include "stm32f1xx_hal_gpio.h"

#include "buildconf.h"

#include "hw_init_table.h"

#include "mini_stm32f1xx_defs.h"

////////////////////////////////////////////////////////////////////////////////////////////////////

#define HW_INIT_TABLE_ID HW_INIT_GLOBAL_INIT // <------
const unsigned long hw_init[] =
{
	0x434F4C42,  ( 0x00005F4B | INT_TO_ASCIIWORD(HW_INIT_TABLE_ID) ),

	CMD_SET,                    (unsigned long)&RCC->CR, /* Reset the RCC clock configuration to the default reset state(for debug purpose) */
								0x00000001,           // /* Set HSION bit */

	/* Reset SW, HPRE, PPRE1, PPRE2, ADCPRE and MCO bits */
	CMD_CLR, (unsigned long)&RCC->CFGR, 0x0F00FFFF,

	/* Reset HSEON, CSSON and PLLON bits */
	CMD_CLR, (unsigned long)&RCC->CR, 0x01090000,

	/* Reset HSEBYP bit */
	CMD_CLR, (unsigned long)&RCC->CR, 0x00040000,

	/* Reset PLLSRC, PLLXTPRE, PLLMUL and USBPRE/OTGFSPRE bits */
	CMD_CLR, (unsigned long)&RCC->CFGR, 0x007F0000,

	/* Reset PLL2ON and PLL3ON bits */
	CMD_CLR, (unsigned long)&RCC->CR, 0x14000000,

	/* Disable all interrupts and clear pending bits  */
	(unsigned long)&RCC->CIR,    0x00FF0000,

	/* Set the interrupts vectors table base */
	(unsigned long)&SCB->VTOR,    (FLASH_BASE),

	(unsigned long)&EXTI->IMR,  0x00000000,
	(unsigned long)&EXTI->RTSR, 0x00000000,
	(unsigned long)&EXTI->FTSR, 0x00000000,

	CMD_SET,                    (unsigned long)&FLASH->ACR,
								FLASH_ACR_PRFTBE,           // __HAL_FLASH_PREFETCH_BUFFER_ENABLE

	CMD_MODIFY_DATA,            (unsigned long)&SCB->AIRCR, // HAL_NVIC_SetPriorityGrouping(NVIC_PRIORITYGROUP_4);
								(SCB_AIRCR_VECTKEY_Msk | SCB_AIRCR_PRIGROUP_Msk),
								((uint32_t)0x5FAUL << SCB_AIRCR_VECTKEY_Pos) | ((uint32_t)NVIC_PRIORITYGROUP_4 << 8U) ,

	// Systick config
	(unsigned long)&SysTick->LOAD  ,            (uint32_t)( (64000000/1000) - 1UL) , // set reload register
	//{(unsigned long)&NVIC->IP[SysTick_IRQn]  , (uint8_t)((  TICK_INT_PRIORITY << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL) ,  // set Priority for Systick Interrupt
	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)SysTick_IRQn) & 0xFUL)-4UL], (uint8_t)((TICK_INT_PRIORITY << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&SysTick->VAL                , 0x00000000 ,           // Load the SysTick Counter Value
	(unsigned long)&SysTick->CTRL               , SysTick_CTRL_CLKSOURCE_Msk | SysTick_CTRL_TICKINT_Msk   | SysTick_CTRL_ENABLE_Msk ,   // Enable SysTick IRQ and SysTick Timer

	(unsigned long)&RCC->APB2ENR                , RCC_APB2ENR_AFIOEN ,   // __HAL_RCC_AFIO_CLK_ENABLE

	// Init cpu systick counter for CMD_DELAY ////////////////////////////////////////////////////////
	CMD_SET,                    (unsigned long)0xE000EDFC,  // SCB_DEMCR
								0x01000000,
	CMD_MODIFY_DATA,            (unsigned long)0xE0001004,  // DWT_CYCCNT - reset the counter
								0xFFFFFFFF,
								0x00000000,
	CMD_SET,                    (unsigned long)0xE0001000,  // DWT_CONTROL
								0x00000001,                 // enable the counter
	/////////////////////////////////////////////////////////////////////////////////////////////////

	CMD_DELAY         ,   5000,         // Delay

	CMD_INITCLK     ,     0x00000000,

	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)MemoryManagement_IRQn) & 0xFUL)-4UL], (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,0,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)BusFault_IRQn) & 0xFUL)-4UL],         (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,0,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)UsageFault_IRQn) & 0xFUL)-4UL],       (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,0,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)SVCall_IRQn) & 0xFUL)-4UL],           (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,0,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)DebugMonitor_IRQn) & 0xFUL)-4UL],     (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,0,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)PendSV_IRQn) & 0xFUL)-4UL],           (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,0,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&SCB->SHP[(((uint32_t)(int32_t)SysTick_IRQn) & 0xFUL)-4UL],          (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,SYSTICK_IRQ_PRIORITY,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),

	//////////////////////////////////////////////////////////////////////////
	// Init SPI
	//////////////////////////////////////////////////////////////////////////

	// PA9 LED
/*  CMD_MODIFY_DATA,        (unsigned long)&GPIOA->CRH,
							PINCFGMASK(PIN_9),
							(( GPIO_SPEED_FREQ_HIGH + GPIO_CR_CNF_GP_OUTPUT_PP ) << PINSHIFT(PIN_9)),
*/

	(unsigned long)&CONFIG_SPI_CTRL->CR2, 0x00000000, /*SPI_CR2_TXDMAEN,*/
	(unsigned long)&CONFIG_SPI_CTRL->CR1,  (SPI_CR1_SSI | SPI_CR1_SSM) | ((SPI_CR1_BIDIMODE | SPI_CR1_BIDIOE |  ((CONFIG_SPI_CLK_DIV&7)<<3) | SPI_CR1_MSTR)),

	(unsigned long)&NVIC->IP[((uint32_t)(int32_t)CONFIG_DMA_CHN_CTRL_IRQ)], (uint8_t)((PRIORITY_CODE(NVIC_PRIORITYGROUP_4,4,0) << (8U - __NVIC_PRIO_BITS)) & (uint32_t)0xFFUL),
	(unsigned long)&NVIC->ISER[(((uint32_t)CONFIG_DMA_CHN_CTRL_IRQ) >> 5UL)], (uint32_t)(1UL << (((uint32_t)CONFIG_DMA_CHN_CTRL_IRQ) & 0x1FUL)),

	// SPI MOSI Pin
#if CONFIG_SPI_PORT == 2
	CMD_MODIFY_DATA,        (unsigned long)&GPIOB->CRH,
							PINCFGMASK(PIN_15),
							(( GPIO_SPEED_FREQ_HIGH + GPIO_CR_CNF_AF_OUTPUT_PP ) << PINSHIFT(PIN_15)),
#else
	CMD_MODIFY_DATA,        (unsigned long)&GPIOA->CRL,
							PINCFGMASK(PIN_7),
							(( GPIO_SPEED_FREQ_HIGH + GPIO_CR_CNF_AF_OUTPUT_PP ) << PINSHIFT(PIN_7)),
#endif

	(unsigned long)&CONFIG_DMA_CHN_CTRL->CCR, 0x00000000,
	(unsigned long)&CONFIG_DMA_CHN_CTRL->CNDTR, 0x00000000,
	(unsigned long)&CONFIG_DMA_CTRL->IFCR, 0x000F0000,

	// Configure DMA Channel data length
	(unsigned long)&CONFIG_DMA_CHN_CTRL->CNDTR, (4*1024),
	(unsigned long)&CONFIG_DMA_CHN_CTRL->CPAR, (uint32_t)&CONFIG_SPI_CTRL->DR,

	(unsigned long)&CONFIG_DMA_CHN_CTRL->CCR, DMA_MEMORY_TO_PERIPH | DMA_PINC_DISABLE | DMA_MINC_ENABLE | \
										DMA_PDATAALIGN_BYTE | DMA_MDATAALIGN_BYTE | DMA_CIRCULAR | DMA_PRIORITY_VERY_HIGH | \
										(DMA_IT_TC | DMA_IT_HT | DMA_IT_TE),

	0x00000000,

	0x42444E45,  ( 0x00004B4C | INT_TO_ASCIIWORD(HW_INIT_TABLE_ID) )   // "ENDBLKxx"
};
#undef HW_INIT_TABLE_ID

#define HW_INIT_TABLE_ID HW_INIT_CLOCK_INIT // <------
const unsigned long clk_init[] =
{
	0x434F4C42,  ( 0x00005F4B | INT_TO_ASCIIWORD(HW_INIT_TABLE_ID) ) , // "BLOCK_xx"

	CMD_CLR,                    (unsigned long)&RCC->CR, RCC_CR_PLLON,  // Disable the PLL
	CMD_WAITBITCLR,             (unsigned long)&RCC->CR, RCC_CR_PLLRDY, // Wait for pll disabled

	// Setup the PLL
	CMD_MODIFY_DATA,            (unsigned long)&RCC->CFGR, (RCC_CFGR_PLLSRC | RCC_CFGR_PLLMULL) , RCC_PLLSOURCE_HSI_DIV2 | RCC_PLL_MUL16,

	CMD_SET,                    (unsigned long)&RCC->CR, RCC_CR_PLLON,  // Enable the PLL !
	CMD_WAITBITSET,             (unsigned long)&RCC->CR, RCC_CR_PLLRDY, // Wait for pll ready !

	CMD_MODIFY_DATA,            (unsigned long)&FLASH->ACR, FLASH_ACR_LATENCY , FLASH_LATENCY_2,

	CMD_MODIFY_DATA,            (unsigned long)&RCC->CFGR, RCC_CFGR_HPRE, RCC_SYSCLK_DIV1,                  // AHBCLKDivider 64Mhz/1 = AHBFRQ=64Mhz

	CMD_MODIFY_DATA,            (unsigned long)&RCC->CFGR, RCC_CFGR_SW, RCC_SYSCLKSOURCE_PLLCLK,            // PLL as System clock
	CMD_WAITWORD,               (unsigned long)&RCC->CFGR, RCC_CFGR_SWS , RCC_SYSCLKSOURCE_STATUS_PLLCLK,

	CMD_MODIFY_DATA,            (unsigned long)&RCC->CFGR, RCC_CFGR_PPRE1, RCC_HCLK_DIV2,                   // APB1CLKDivider  AHBFRQ/2=APB1FRQ=32Mhz

	CMD_MODIFY_DATA,            (unsigned long)&RCC->CFGR, RCC_CFGR_PPRE2, RCC_HCLK_DIV2 << 3,              // APB2CLKDivider  AHBFRQ/2=APB2FRQ=32Mhz

	CMD_MODIFY_DATA,            (unsigned long)&RCC->CFGR, RCC_CFGR_ADCPRE, RCC_CFGR_ADCPRE_DIV8,           // ADCCLKDivider  APB2FRQ/8=ADCFRQ=8Mhz

	CMD_SET,                    (unsigned long)&SysTick->CTRL, SYSTICK_CLKSOURCE_HCLK,                      // Systick on the host clock

#if CONFIG_DMA_PORT == 2
	CMD_SET,                    (unsigned long)&RCC->AHBENR, RCC_AHBENR_DMA2EN,    // Enable DMA2 block clock
#else
	CMD_SET,                    (unsigned long)&RCC->AHBENR, RCC_AHBENR_DMA1EN,    // Enable DMA1 block clock
#endif

#if CONFIG_SPI_PORT == 2
	CMD_SET,                    (unsigned long)&RCC->APB2ENR, RCC_APB2ENR_IOPBEN | RCC_APB2ENR_AFIOEN ,  // Enable ports Clock
	CMD_SET,                    (unsigned long)&RCC->APB1ENR, RCC_APB1ENR_SPI2EN,     // Enable SPI 2 Clock
	CMD_CLR,                    (unsigned long)&RCC->APB1RSTR, RCC_APB1RSTR_SPI2RST,  // SPI 2 reset
#else
	CMD_SET,                    (unsigned long)&RCC->APB2ENR, RCC_APB2ENR_IOPAEN | RCC_APB2ENR_AFIOEN ,  // Enable ports Clock
	CMD_SET,                    (unsigned long)&RCC->APB2ENR, RCC_APB2ENR_SPI1EN,     // Enable SPI 2 Clock
	CMD_CLR,                    (unsigned long)&RCC->APB2RSTR, RCC_APB2RSTR_SPI1RST,  // SPI 1 reset
#endif

	0x00000000,

	0x42444E45,  ( 0x00004B4C | INT_TO_ASCIIWORD(HW_INIT_TABLE_ID) )   // "ENDBLKxx"
};
#undef HW_INIT_TABLE_ID



// |TTttOOOO|mmmmMMMM|Address (0-4)|DATA1(0-4)|DATA2(0-4)|
//             (ext)
// TT : 00 Normal, 01 : With byte masks
// tt : 00 Same address 01 Byte offset 10 Short Offset 11 Long Offset
// mmmm: DATA1 byte mask
// MMMM: DATA2 byte mask

typedef struct _decode_op_stat
{
	volatile uint32_t * current_address;
	uint32_t current_data;
	uint32_t current_mask;
	unsigned char op;
}decode_op_stat;

unsigned int get_cpu_tick()
{
	return *((volatile unsigned int *)0xE0001004); // DWT_CYCCNT
}

unsigned int get_elapsed_cpu_tick(unsigned int start)
{
	unsigned int curcount;

	curcount = *((volatile unsigned int *)0xE0001004); // DWT_CYCCNT

	if( curcount < start )
	{
		return ((0xFFFFFFFF - start) + curcount);
	}
	else
	{
		return (curcount - start);
	}
}

void uswait(unsigned int us)
{
	unsigned int start,total_time;

	total_time = 72 * us;
	start = *((volatile unsigned int *)0xE0001004); // DWT_CYCCNT
	while(get_elapsed_cpu_tick(start) < total_time);
}

static const unsigned char * __attribute__ ((optimize("-Os"))) update_var(const unsigned char * opcode_buffer, uint32_t * var,unsigned int mask)
{
	int i;

	i = 4;
	while(i--)
	{
		if((0x01<<i) & mask)
		{
			*var &= ~(0xFF << (i*8));
			*var |= (*opcode_buffer++ << (i*8));
		}
	}

	return opcode_buffer;
}

int __attribute__ ((optimize("-Os"))) decode_opcode(const unsigned char * opcode_buffer, decode_op_stat * op_stat)
{
	unsigned char datamask;
	unsigned char addressmask;
	unsigned char opcode;
	uint32_t      address;
	const unsigned char * start_ptr;

	/*
	int i;
	printf("%.8X :",opcode_buffer);

	for(i=0;i<8;i++)
		printf("%.2X ",opcode_buffer[i]);

		printf("\n");
	*/

	start_ptr = opcode_buffer;

	datamask = 0xF0;
	addressmask = 0x0F;

	opcode = *opcode_buffer;
	opcode_buffer++;

	op_stat->op = opcode & 0xF;

	if( ( op_stat->op == (CMD_WAITWORD&0xF) ) || ( op_stat->op == (CMD_MODIFY_DATA&0xF) ) )
		datamask = 0xFF;

	if(opcode & 0xC0)
	{
		datamask = *opcode_buffer;
		opcode_buffer++;
	}

	if( ( op_stat->op == (CMD_READ_DATA&0xF) ) || ( op_stat->op == (CMD_INITCLK&0xF) ) )
		datamask = 0x00;

	// tt : 00 Same address 01 Byte offset 10 Short Offset 11 Long Offset
	addressmask = (opcode>>4)&0x3;
	if(addressmask == 0x3)
		addressmask = 0xF;

	if(addressmask == 0x2)
		addressmask = 0x3;

	address = 0x00000000;

	if((*opcode_buffer & 0x80) && addressmask)
	{
		address = 0xFFFFFFFF;
	}

	opcode_buffer = update_var(opcode_buffer, &address,addressmask);

	op_stat->current_address = (void*)((unsigned char *)op_stat->current_address) + (int)address;

	opcode_buffer = update_var(opcode_buffer, &op_stat->current_data,datamask>>4);
	opcode_buffer = update_var(opcode_buffer, &op_stat->current_mask,datamask);

	return opcode_buffer-start_ptr;
}

//#define PRINT_NEW_TABLE 1

void __attribute__ ((optimize("-Os"))) exec_hw_init_table(unsigned int table_id)
{
	decode_op_stat stat;
	//volatile unsigned int data;
	const unsigned char * table;

	table = (const unsigned char *)&packed_hw_init;
	table += *(((unsigned short*)&packed_hw_init) + table_id);

	stat.current_address = (volatile uint32_t *)0x00000000;
	stat.current_data    = 0x00000000;
	stat.current_mask    = 0x00000000;
	stat.op = 0x00;

	while(1)
	{
		table += decode_opcode(table, &stat);
		switch(stat.op)
		{
			case (CMD_DELAY&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_DELAY       : %d uS\n",stat.current_data);
				#endif
				uswait(stat.current_data);
			break;
			case (CMD_WAITBITCLR&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WAITBITCLR  : ADDRESS 0x%.8X MASK 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				while ( (*stat.current_address & stat.current_data) );
			break;
			case (CMD_WAITBITSET&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WAITBITSET  : ADDRESS 0x%.8X MASK 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				while ( !(*stat.current_address & stat.current_data) );
			break;
			case (CMD_CLR&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_CLR         : ADDRESS 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				*stat.current_address &= (~stat.current_data);
			break;
			case (CMD_SET&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_SET         : ADDRESS 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				*stat.current_address |= (stat.current_data);
			break;
			case (CMD_READ_DATA&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_READ_DATA   : ADDRESS 0x%.8X\n",stat.current_address);
				#endif
				//data = *stat.current_address;
				*stat.current_address;
			break;
			case (CMD_MODIFY_DATA&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_MODIFY_DATA : ADDRESS 0x%.8X MASK 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_mask,stat.current_data);
				#endif
				*stat.current_address = (( *stat.current_address & (~stat.current_mask) ) | (stat.current_data & stat.current_mask));
			break;
			case (CMD_WAITWORD&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WAITWORD    : ADDRESS 0x%.8X MASK 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_mask,stat.current_data);
				#endif
				while ( (*stat.current_address & stat.current_mask) != (stat.current_data & stat.current_mask) );
			break;
			case (CMD_INITCLK&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_INITCLK\n");
				#endif
				exec_hw_init_table(HW_INIT_CLOCK_INIT); //clk_init
			break;
			case (CMD_WRITE_DATA&0xF):
				#ifdef PRINT_NEW_TABLE
				printf("CMD_WRITE_DATA  : ADDRESS 0x%.8X DATA 0x%.8X\n",stat.current_address,stat.current_data);
				#endif
				*stat.current_address = stat.current_data;
			break;
			default:
				#ifdef PRINT_NEW_TABLE
				printf("bad/end opcode : %x\n",stat.op);
				#endif
				goto end_loop;
			break;
		}
	}
end_loop:
	return;
}
