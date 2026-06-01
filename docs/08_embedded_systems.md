# 8. EMBEDDED SYSTEMS SUPPORT (Phase 2)

## 8.1 Targets

| MCU | Toolchain | RTOS |
|---|---|---|
| STM32 (F4/H7/G4) | arm-none-eabi-gcc, STM32CubeMX | FreeRTOS, ThreadX |
| ESP32 (S3/C3/C6) | ESP-IDF, Xtensa/RISC-V | FreeRTOS (ESP-IDF) |
| nRF52/nRF53 | Zephyr / nrfx | Zephyr RTOS |
| Raspberry Pi Pico | pico-sdk | bare-metal / FreeRTOS |
| Generic Cortex-M | PlatformIO | Zephyr / FreeRTOS |

## 8.2 Indexing

- Parse `.ioc` files (STM32CubeMX) → pin map, peripheral config
- Parse `Kconfig` / `prj.conf` (Zephyr) → enabled modules
- Parse `platformio.ini` → boards, frameworks
- Parse linker scripts → memory regions
- Build with clangd integration → semantic index

## 8.3 Capabilities

- **Peripheral generation**: "I need UART2 at 115200 with DMA RX" → generates HAL code matching the target's CubeMX/Zephyr conventions
- **Pin map sanity**: detect conflicting alternate functions, missing pull-ups
- **RTOS analysis**: stack high-water-mark estimates, priority inversion detection from FreeRTOS traces
- **Interrupt analysis**: estimate interrupt latency, detect ISRs that call non-ISR-safe APIs
- **Memory analysis**: parse `.map` file, flag overflows, suggest `.ld` adjustments
- **Bus debugging**: ingest `.sal` (Saleae) / Sigrok captures; AI annotates protocol-level

## 8.4 Flash + debug workflow

- Wrap OpenOCD / probe-rs / pyocd / esptool / J-Link as tools
- One-click flash + auto-attached RTT/SWO console in IDE
- Live variable watch (via OpenOCD MI or RTT)

## 8.5 micro-ROS unification

- Detect `micro_ros_agent` in workspace
- Cross-reference firmware-side topic publishers with ROS2-side subscribers in launch IR
- This is the **moat** for embedded: nobody else does cross-domain reasoning.
