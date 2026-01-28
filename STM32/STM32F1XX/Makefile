ARCH = arm-none-eabi
CC = $(ARCH)-gcc
AS = $(ARCH)-gcc -x assembler-with-cpp
CP = $(ARCH)-objcopy
AR = $(ARCH)-ar
SZ = $(ARCH)-size

HEX = $(CP) -O ihex
BIN = $(CP) -O binary -S

BUILD_DIR = ./build

C_DEFS = -DSTM32F103xB -DHXCMOD_MONO_OUTPUT -DHXCMOD_UNSIGNED_OUTPUT -DHXCMOD_MOD_FILE_IN_ROM

TARGET = HxCModPlayer_STM32F1XX

# debug build?
DEBUG = 0

# optimization
OPT = -O3


AS_INCLUDES =
C_INCLUDES = -IInc
C_INCLUDES += -I../../
C_INCLUDES += -IST_headers/STM32F1xx_HAL_Driver/Inc
C_INCLUDES += -IST_headers/CMSIS/Include
C_INCLUDES += -IST_headers/CMSIS/Device/ST/STM32F1xx/Include
C_INCLUDES += -IST_headers/

LDSCRIPT = Src/arm-gcc-link.ld
override CFLAGS += -mthumb -mcpu=cortex-m3 -Wall $(OPT) $(C_DEFS) $(C_INCLUDES)
LIBS =
LIBDIR =
LDFLAGS = -mthumb -mcpu=cortex-m3 -specs=nano.specs -T$(LDSCRIPT) $(LIBDIR) $(LIBS) -Wl,-Map=$(BUILD_DIR)/$(TARGET).map,--cref -Wl,--gc-sections

MOD_FW_DIR = mods_fw_bin
MOD_FILES := $(wildcard mods/*.mod)
MOD_FW_BIN := $(MOD_FILES:mods/%.mod=$(MOD_FW_DIR)/STM32_HxCMOD_%.bin)

sources := $(wildcard Src/*.c)
objects := $(sources:Src/%.c=$(BUILD_DIR)/%.o)

asm_sources := $(wildcard Src/*.s)
asm_objects := $(asm_sources:Src/%.s=$(BUILD_DIR)/%.o)

all: output_dir packed_data output_dir $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).bin $(BUILD_DIR)/$(TARGET).hex  $(MOD_FW_BIN)

packed_data: $(BUILD_DIR)/hw_init_table.o
	cd tools && $(MAKE)

$(BUILD_DIR)/$(TARGET).elf: $(objects) $(asm_objects) hxcmod.o
	${CC} -o $@    $^ $(LDFLAGS)
	$(SZ)    $@

$(BUILD_DIR)/$(TARGET).bin: $(BUILD_DIR)/$(TARGET).elf
	$(BIN) $< $@

$(BUILD_DIR)/$(TARGET).hex: $(BUILD_DIR)/$(TARGET).elf
	$(HEX) $< $@

$(objects): $(BUILD_DIR)/%.o: Src/%.c
	${CC} -o $@ $^ -c $(CFLAGS)

$(asm_objects): $(BUILD_DIR)/%.o: Src/%.s
	$(AS) -c $(CFLAGS) $< -o $@

hxcmod.o: ../../hxcmod.c
	$(CC) -o $@ -c $< $(CFLAGS)


$(MOD_FW_DIR):
	mkdir -p $@

$(MOD_FW_BIN): $(MOD_FW_DIR)/STM32_HxCMOD_%.bin: mods/%.mod  | $(MOD_FW_DIR)
	cp  $(BUILD_DIR)/$(TARGET).bin $@
	cat $^ >> $@

define build_sample

	$(eval SUB_FOLDER := $3)
	mkdir -p prebuilt_test_fw/$(SUB_FOLDER)

	echo "#undef  CONFIG_SPI_PORT" > Inc/custom_buildconf.h
	echo "#define CONFIG_SPI_PORT " $1 >> Inc/custom_buildconf.h
	echo "#undef  CONFIG_SPI_CLK_DIV" >> Inc/custom_buildconf.h
	echo "#define CONFIG_SPI_CLK_DIV" $2 >> Inc/custom_buildconf.h
	make clean
	make all

	cp mods_fw_bin/*              prebuilt_test_fw/$(SUB_FOLDER)
	cp $(BUILD_DIR)/$(TARGET).bin prebuilt_test_fw/$(SUB_FOLDER)
endef

distrib: $(MOD_FW_DIR)
	mkdir -p prebuilt_test_fw

	$(call build_sample, 1, 1, STM32_HxCMOD_DeltaSigma_8MHz_SPI1)
	$(call build_sample, 2, 1, STM32_HxCMOD_DeltaSigma_8MHz_SPI2)
	$(call build_sample, 1, 2, STM32_HxCMOD_DeltaSigma_4MHz_SPI1)
	$(call build_sample, 2, 2, STM32_HxCMOD_DeltaSigma_4MHz_SPI2)

	cd prebuilt_test_fw ; 7z a STM32_HxCMOD_Prebuilt_Test_Firmwares.7z STM32_HxCMOD_DeltaSigma*
	cd prebuilt_test_fw ; rm  -rf STM32_HxCMOD_DeltaSigma*

	echo "" > Inc/custom_buildconf.h

output_dir:
	@mkdir -p $(BUILD_DIR)

#######################################
# clean up
#######################################

clean:
	rm -Rf  *.o  .*.o  .*.o.* $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).bin $(BUILD_DIR)/$(TARGET).hex $(BUILD_DIR)

mrproper: clean
	rm -Rf  prebuilt_test_fw $(MOD_FW_DIR)
	cd tools && $(MAKE) clean

