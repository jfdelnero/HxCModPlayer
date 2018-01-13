// "GOTEK" / TM1651 Display init and print functions
// (c) Jean-François DEL NERO
// (c) HxC2001

#include "stm32f1xx_hal.h"
#include "stm32_hal_legacy.h"

#include "gotek_display.h"

#define DIO_SIGNAL GPIO_PIN_10
#define CLK_SIGNAL GPIO_PIN_11

//   a
// f   b
//   g
// e   c
//   d
//     DP

// gfedcba
//00111111   0 0x3F
//00000110   1 0x06
//01011011   2 0x5B
//01001111   3 0x4F
//01100110   4 0x66
//01101101   5 0x6D
//01111101   6 0x7D
//00000111   7 0x07
//01111111   8 0x7F
//01101111   9 0x6F

const unsigned char digittab[13] =
{
	0x3F,0x06,0x5B,0x4F,0x66,0x6D,0x7D,0x07,0x07F,0x6F,0x40
};

// GPIO helper

#define SET_GPIO(PORT,PIN) (PORT->BSRR = PIN)
#define CLR_GPIO(PORT,PIN) (PORT->BSRR = (uint32_t)PIN << 16)

// Delay helper

void init_cpu_tick_cnt()
{
	volatile unsigned int *DWT_CYCCNT = (unsigned int *)0xE0001004;
	volatile unsigned int *DWT_CONTROL = (unsigned int *)0xE0001000;
	volatile unsigned int *SCB_DEMCR = (unsigned int *)0xE000EDFC;

	*SCB_DEMCR = *SCB_DEMCR | 0x01000000;
	*DWT_CYCCNT = 0; // reset the counter
	*DWT_CONTROL = *DWT_CONTROL | 1 ; // enable the counter
}

int udelay(unsigned int us)
{
	unsigned int count = 0,curcount;
	int out;
	volatile unsigned int *DWT_CYCCNT = (unsigned int *)0xE0001004;

	count = *DWT_CYCCNT;

	out = 0;
	do
	{
		curcount = *DWT_CYCCNT;

		if( curcount < count )
		{
			if( ((0xFFFFFFFF - count) + curcount) > ( (72*us)/2 ) )
			{
				out = 1;
			}
		}
		else
		{
			if( (curcount - count) > ( (72*us)/2 ) )
			{
				out = 1;
			}
		}
	}while(!out);

	return 0;
}

int write_TM1651_cmd(unsigned char * cmd,int size)
{
	int i,b,time_out,to;

	to = 0;

	udelay(5);
	SET_GPIO(GPIOB,DIO_SIGNAL);
	udelay(5);
	SET_GPIO(GPIOB,CLK_SIGNAL);
	udelay(5);

	time_out = 0;
	while(!( GPIOB->IDR & DIO_SIGNAL ) && time_out<50)
	{
		udelay(5);
		time_out++;
	}

	if( time_out >= 50 )
	{
		return 1;
	}

	// Start
	CLR_GPIO(GPIOB,DIO_SIGNAL);
	udelay(5);
	CLR_GPIO(GPIOB,CLK_SIGNAL);
	udelay(5);

	b = 0;
	while( b < size )
	{
		// Push the current byte.
		for( i = 0 ; i < 8 ; i++ )
		{
			if( cmd[b] & (0x01<<i) )
			{
				SET_GPIO(GPIOB,DIO_SIGNAL);
			}
			else
			{
				CLR_GPIO(GPIOB,DIO_SIGNAL);
			}

			udelay(5);
			SET_GPIO(GPIOB,CLK_SIGNAL);
			udelay(5);
			CLR_GPIO(GPIOB,CLK_SIGNAL);
			udelay(5);
		}

		SET_GPIO(GPIOB,DIO_SIGNAL);
		udelay(5);

		// Wait Ack
		time_out = 0;
		while( ( GPIOB->IDR & DIO_SIGNAL ) && time_out < 50 )
		{
			udelay(5);
			time_out++;
		}

		if( time_out >= 50 )
		{
			to = 1;
		}

		CLR_GPIO(GPIOB,DIO_SIGNAL);
		SET_GPIO(GPIOB,CLK_SIGNAL);
		udelay(5);
		CLR_GPIO(GPIOB,CLK_SIGNAL);
		udelay(5);

		b++;
	}

	// Stop
	udelay(5);
	CLR_GPIO(GPIOB,DIO_SIGNAL);
	udelay(5);
	SET_GPIO(GPIOB,CLK_SIGNAL);
	udelay(5);
	SET_GPIO(GPIOB,DIO_SIGNAL);
	udelay(5);

	return to;
}

void printdigit(unsigned short value)
{
	unsigned int digit1,digit2,digit3;
	unsigned char cmdtab[5];

	cmdtab[0] = 0x00;
	cmdtab[1] = 0x00;
	cmdtab[2] = 0x00;
	cmdtab[3] = 0x00;
	cmdtab[4] = 0x00;

	if( value < 1000 )
	{
		digit1 = (value / 100);
		digit2 = (value - (digit1 * 100)) / 10;
		digit3 = (value - ((digit1 * 100) + (digit2*10)));

		// first
		cmdtab[0] = 0xC0;    // Set address 0
		cmdtab[1] = digittab[digit1];
		cmdtab[2] = digittab[digit2];
		cmdtab[3] = digittab[digit3];
		cmdtab[4] = 0x00;
	}

	write_TM1651_cmd((unsigned char*)&cmdtab,5);
}

unsigned char init_display(void)
{
	unsigned char buf[4];
	int i;
	GPIO_InitTypeDef GPIO_InitStructure;

	init_cpu_tick_cnt();

	__GPIOB_CLK_ENABLE();

	GPIO_InitStructure.Mode  = GPIO_MODE_OUTPUT_OD;
	GPIO_InitStructure.Pin   = DIO_SIGNAL;
	GPIO_InitStructure.Pull  = GPIO_PULLUP;
	HAL_GPIO_Init(GPIOB, &GPIO_InitStructure);

	GPIO_InitStructure.Mode  = GPIO_MODE_OUTPUT_PP;
	GPIO_InitStructure.Pin   = CLK_SIGNAL ;
	HAL_GPIO_Init(GPIOB, &GPIO_InitStructure);

	SET_GPIO(GPIOB,DIO_SIGNAL);
	udelay(5);

	// Bus Reset
	for(i=0;i<32;i++)
	{
		CLR_GPIO(GPIOB,CLK_SIGNAL);
		udelay(5);

		SET_GPIO(GPIOB,CLK_SIGNAL);
		udelay(5);
	}

	if( GPIOB->IDR & DIO_SIGNAL )
	{
		// Data not sticked to 0
		buf[0] = 0x40; // Reg mode (sync)
		write_TM1651_cmd((unsigned char*)&buf,1);

		buf[0] = 0x40; // Reg mode
		if(write_TM1651_cmd((unsigned char*)&buf,1))
		{
			return 1; // Failed...
		}
		else
		{
			buf[0] = 0x40;
			write_TM1651_cmd((unsigned char*)&buf,1);

			buf[0] = 0x80; // Display OFF
			write_TM1651_cmd((unsigned char*)&buf,1);
			udelay(20);

			printdigit(0);

			buf[0] = 0x89; // Display ON
			write_TM1651_cmd((unsigned char*)&buf,1);

			return 1;
		}
	}

	return 1;
}
