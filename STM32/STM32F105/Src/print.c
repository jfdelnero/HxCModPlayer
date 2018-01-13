// Minimal print functions
// (c) Jean-François DEL NERO
// (c) HxC2001

#include "stm32f1xx_hal.h"
#include "print.h"

extern UART_HandleTypeDef huart1;

void printchar(char c)
{
	HAL_UART_Transmit(&huart1, (unsigned char*)&c, 1, 1000);
}

void printhex(unsigned char c)
{	
	unsigned char c1;

	c1=c>>4;

	if(c1<10)
	{
		printchar('0'+c1);
	}
	else
	{
		printchar('A'+(c1-10));
	}

	c1=c&0xF;

	if(c1<10)
	{
		printchar('0'+c1);
	}
	else
	{
		printchar('A'+(c1-10));
	}
}

void printhex_long(unsigned long c)
{
	printhex((c>>24)&0xFF);
	printhex((c>>16)&0xFF);
	printhex((c>>8)&0xFF);
	printhex(c&0xFF);
}

void print(const char *pucBuffer)
{
	int i;
    //
    // Loop while there are more characters to send.
    //
	i=0;
    while(pucBuffer[i])
    {
		printchar(pucBuffer[i]);
        i++;
    }
}

void printdec(unsigned char c)
{
	unsigned char c1,c2,c3;

	c1=c/100;
	printchar('0'+c1);
	c2=(c/10) - (c1*10);
	printchar('0'+c2);
	c3= c - ( (c1*100) + (c2*10) );
	printchar('0'+c3);
}

void printbuf(unsigned char * buf,int size)
{
	int i;
	print("\r\n");
	for(i=0;i<size;i++)
	{
		if(!(i&0xF))
			print("\r\n");

		printhex(buf[i]);
	}
	print("\r\n");
}
