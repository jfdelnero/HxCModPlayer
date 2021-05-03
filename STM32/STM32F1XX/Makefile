CC = arm-none-eabi-gcc
AS = arm-none-eabi-gcc -x assembler-with-cpp
CP = arm-none-eabi-objcopy
AR = arm-none-eabi-ar
SZ = arm-none-eabi-size

HEX = $(CP) -O ihex
BIN = $(CP) -O binary -S

TARGET = HxCModPlayer_STM32F1XX
BUILD_DIR = build
MOD_FW_DIR = mods_fw_bin

# debug build?
DEBUG = 0

# optimization
OPT = -O3

MOD_FILES := $(wildcard mods/*.mod)
MOD_FW_BIN := $(MOD_FILES:mods/%.mod=$(MOD_FW_DIR)/STM32_HxCMOD_%.bin)

#####################################
# source
######################################
C_SOURCES = \
  ../../hxcmod.c \
  Src/hw_init_table.c \
  Src/hw_init_data.c \
  Src/main.c

ASM_SOURCES = \
  Src/fast_delta_sigma_gen.s \
  Src/startup_stm32f1xx.s

#######################################
# CFLAGS
#######################################
# macros for gcc
AS_DEFS =
C_DEFS = -DSTM32F103xB -DHXCMOD_MONO_OUTPUT -DHXCMOD_UNSIGNED_OUTPUT -DHXCMOD_MOD_FILE_IN_ROM

# includes for gcc
AS_INCLUDES =
C_INCLUDES = -IInc
C_INCLUDES += -I../../
C_INCLUDES += -IST_headers/STM32F1xx_HAL_Driver/Inc
C_INCLUDES += -IST_headers/CMSIS/Include
C_INCLUDES += -IST_headers/CMSIS/Device/ST/STM32F1xx/Include
C_INCLUDES += -IST_headers/

# compile gcc flags
ASFLAGS = -mthumb -mcpu=cortex-m3 $(AS_DEFS) $(AS_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections
CFLAGS = -mthumb -mcpu=cortex-m3 $(C_DEFS) $(C_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections
ifeq ($(DEBUG), 1)
CFLAGS += -g -gdwarf-2
endif

#######################################
# LDFLAGS
#######################################
# link script
LDSCRIPT = Src/arm-gcc-link.ld
# libraries
LIBS =
LIBDIR =
LDFLAGS = -mthumb -mcpu=cortex-m3 -specs=nano.specs -T$(LDSCRIPT) $(LIBDIR) $(LIBS) -Wl,-Map=$(BUILD_DIR)/$(TARGET).map,--cref -Wl,--gc-sections

# default action: build all
all: packed_data $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).hex $(BUILD_DIR)/$(TARGET).bin $(MOD_FW_BIN)

packed_data: $(BUILD_DIR)/hw_init_table.o
	cd tools && $(MAKE)

#######################################
# build the application
#######################################

# list of objects
OBJECTS = $(addprefix $(BUILD_DIR)/,$(notdir $(C_SOURCES:.c=.o)))
vpath %.c $(sort $(dir $(C_SOURCES)))

# list of ASM program objects
OBJECTS += $(addprefix $(BUILD_DIR)/,$(notdir $(ASM_SOURCES:.s=.o)))
vpath %.s $(sort $(dir $(ASM_SOURCES)))

$(BUILD_DIR)/%.o: %.c Makefile | $(BUILD_DIR)
	$(CC) -c $(CFLAGS) -Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.c=.lst)) $< -o $@

$(BUILD_DIR)/%.o: %.s Makefile | $(BUILD_DIR)
	$(AS) -c $(CFLAGS) $< -o $@

$(BUILD_DIR)/$(TARGET).elf: $(OBJECTS) Makefile
	$(CC) $(OBJECTS) $(LDFLAGS) -o $@
	$(SZ) $@

$(BUILD_DIR)/%.hex: $(BUILD_DIR)/%.elf | $(BUILD_DIR)
	$(HEX) $< $@

$(BUILD_DIR)/%.bin: $(BUILD_DIR)/%.elf | $(BUILD_DIR)
	$(BIN) $< $@

$(BUILD_DIR):
	mkdir -p $@

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

distrib:
	mkdir -p prebuilt_test_fw

	$(call build_sample, 1, 1, STM32_HxCMOD_DeltaSigma_8MHz_SPI1)
	$(call build_sample, 2, 1, STM32_HxCMOD_DeltaSigma_8MHz_SPI2)
	$(call build_sample, 1, 2, STM32_HxCMOD_DeltaSigma_4MHz_SPI1)
	$(call build_sample, 2, 2, STM32_HxCMOD_DeltaSigma_4MHz_SPI2)

	cd prebuilt_test_fw ; 7z a STM32_HxCMOD_Prebuilt_Test_Firmwares.7z STM32_HxCMOD_DeltaSigma*
	cd prebuilt_test_fw ; rm  -rf STM32_HxCMOD_DeltaSigma*

	echo "" > Inc/custom_buildconf.h

#######################################
# clean up
#######################################
clean:
	-rm -fR .dep $(BUILD_DIR) $(MOD_FW_DIR)
	cd tools && $(MAKE) clean

#######################################
# dependencies
#######################################
-include $(shell mkdir .dep 2>/dev/null) $(wildcard .dep/*)

# *** EOF ***
