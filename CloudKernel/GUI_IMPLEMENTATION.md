# CloudKernel GUI Implementation

## Overview

A complete Java Swing GUI has been added to the CloudKernel Hypervisor Simulator project. The GUI visualizes all concurrency aspects of the simulation: boot process, VM execution, network port allocation, barrier synchronization, and event logging.

## Architecture

### File Structure

```
CloudKernel/src/
├── Main.java                    # Updated to launch GUI
├── core/
│   ├── BootManager.java         # (unchanged)
│   ├── ClockSynchronizer.java   # (unchanged)
│   └── NetworkPortManager.java  # (unchanged)
├── entities/
│   └── VirtualMachine.java      # (unchanged)
├── utils/
│   └── Logger.java              # (unchanged)
└── ui/
    └── CloudKernelGUI.java      # NEW - Main GUI with all panels
```

### Key Classes in CloudKernelGUI.java

#### 1. **CloudKernelGUI** (Main Window)

- **Window Title**: "CloudKernel - Hypervisor Simulator"
- **Size**: 1400 × 900 pixels
- **Theme**: Dark background (#1a1a2e) with white text
- **Panels**:
  - Top: BootPanel
  - Center: VMPanel
  - Right: NetworkPortPanel, CyclicBarrierPanel, LogPanel
  - Bottom: ControlPanel

#### 2. **BootPanel**

- Displays 4 resource indicators: Disk, RAM, Network Stack, CPU Scheduler
- **Visual Design**: Circular indicators (1" diameter)
- **Status**:
  - Gray circle with "[WAIT]" → Not initialized
  - Green circle with "[OK]" → Initialized
- **Concurrency**: Waits on `CountDownLatch(2)` for Disk and RAM initialization
- Uses SwingWorker to run boot phase on background thread

#### 3. **VMPanel** (3 VM Cards)

- **Card Layout**: 3 cards side-by-side (VM-1, VM-2, VM-3)
- **Card Contents**:
  - VM name (cyan text)
  - Status display box (colored based on state)
  - Current cycle counter (0 to 2)
  - Progress bar (visual progress through cycles)
  - Task counter (number of state transitions)
- **Status Colors**:
  - Cyan: Running
  - Green: Network Access (port acquired)
  - Purple: Barrier Wait (waiting at CyclicBarrier)
  - Amber: Waiting for Network
  - Gray: Booting
- **Progress Bar**: Length = (currentCycle / 2) × 190px

#### 4. **NetworkPortPanel**

- **Concurrency**: Uses `Semaphore(2, true)` for fair port allocation
- **Visual Design**: 2 port indicators (Port 1, Port 2)
- **Indicator Components**:
  - Green circle = Port in use
  - Gray circle = Port free
  - Text below shows "VM-X" or "FREE"
- **Updates**: Acquires/releases ports as VMs request network access

#### 5. **CyclicBarrierPanel**

- **Concurrency**: Uses `CyclicBarrier(3)` for VM synchronization
- **Display**:
  - Current cycle number (starts at 0, increments after each cycle)
  - 3 VM status lines: "VM-X [WAITING]" or "VM-X [FREE]"
  - Purple indicator dots for waiting VMs
  - Gray dots for free VMs
- **Updates**: Reflects which VMs are blocked at barrier.await()

#### 6. **LogPanel**

- **Layout**: JList with custom cell renderer
- **Log Format**: `[HH:mm:ss.SSS] [TAG] message`
- **Color Coding**:
  - Green: Success events (VM online, port granted, etc.)
  - Cyan: Information (cycle progress, synchronization)
  - Amber: Warnings (waiting for resources)
  - Red: Errors
  - White: General messages
- **Auto-scroll**: New events scroll into view
- **Max Depth**: Unlimited scrollback

#### 7. **ControlPanel**

- **Boot System Button**:
  - Green background
  - Launches simulation in background thread
  - Disables controls until simulation completes
- **Reset Button**:
  - Red background
  - Stops simulation and resets all state
  - Re-enables controls
- **Speed Slider**:
  - Range: 0.5× to 3× speed multiplier
  - Default: 0.5× (slower, easier to see events)
  - Applied to all sleep durations in VM simulation
  - Real-time label showing current speed

#### 8. **SimulationState** (Shared State)

```java
class SimulationState {
    CountDownLatch bootLatch = new CountDownLatch(2);      // Boot sync
    Semaphore networkSemaphore = new Semaphore(2, true);   // Fair port access
    CyclicBarrier barrier = new CyclicBarrier(3);          // VM sync
    int[] cycleNumber = { 0 };                              // Current cycle
    boolean[] vmWaitingAtBarrier = new boolean[4];          // Barrier state
    Map<Integer, String> networkPortStatus;                // Port allocation
}
```

## Concurrency Model

### Boot Phase

1. GUI clicks "Boot System"
2. SwingWorker spawns background thread
3. BootPanel waits on `CountDownLatch(2)`:
   - Disk thread: counts down after 1500ms
   - RAM thread: counts down after 1000ms
4. Once both count down, boot indicators turn green
5. VM execution phase begins

### VM Execution Phase

1. 3 VM threads spawned (one per VM)
2. Each VM runs `NUM_CYCLES` (2) iterations:
   - **Work phase**: Sleep for workDuration (600 + vmId×200 ms)
   - **Network phase**:
     - Request port via `semaphore.acquire()`
     - Sleep 500ms (transmit)
     - Release port via `semaphore.release()`
   - **Barrier phase**: Wait at `barrier.await()`
3. After all VMs reach barrier, clock ticks and next cycle begins
4. After 2 cycles, all VMs shutdown

### Thread Safety

- All UI updates wrapped in `SwingUtilities.invokeLater()`
- No UI operations on VM threads
- Shared state uses thread-safe data structures:
  - `CountDownLatch` (thread-safe)
  - `Semaphore` (thread-safe)
  - `CyclicBarrier` (thread-safe)
  - `ConcurrentHashMap` (thread-safe map)

## Simulation Timeline

### Expected Events (at 1.0× speed, 2 cycles)

```
00:00:00 - BOOT: Disk/RAM initialization (2500ms total)
00:02:50 - HYPERVISOR: All subsystems ready
00:03:00 - VM startup + 3 × (work + network + barrier):
         - VM-1: work 800ms, network 500ms, barrier
         - VM-2: work 1000ms, network 500ms, barrier
         - VM-3: work 1200ms, network 500ms, barrier
00:30:00 - Cycle 1 complete (all at barrier)
         - Cycle 2 begins
01:00:00 - Cycle 2 complete
01:01:00 - Shutdown complete
```

### Speed Modulation

- **0.5×**: 2x slower (easier to observe)
- **1.0×**: Normal speed
- **3.0×**: 3x faster (for quick testing)
- Formula: `actualSleep = baseSleep / speedMultiplier`

## Color Scheme

| Component         | Normal  | Active  | Waiting | Error   |
| ----------------- | ------- | ------- | ------- | ------- |
| Background        | #1a1a2e | -       | -       | -       |
| Text              | #ffffff | -       | -       | -       |
| Boot Indicator    | #505050 | #00DC00 | -       | -       |
| VM Status         | #646464 | #00FFFF | #C800FF | #FF3232 |
| Network Port      | #505050 | #00DC00 | -       | -       |
| Barrier Indicator | #505050 | #C800FF | -       | -       |
| Accent (Panels)   | -       | #00FFFF | #C800FF | #FF6464 |

## Usage

### Compilation

```bash
cd CloudKernel
javac -d bin -cp src src/Main.java src/core/*.java src/entities/*.java src/utils/*.java src/ui/CloudKernelGUI.java
```

### Execution

```bash
java -cp bin ui.CloudKernelGUI
```

### GUI Operation

1. **Start Simulation**: Adjust speed slider, click "Boot System"
2. **Observe**: Watch VM execution, network access, barrier synchronization in real-time
3. **Stop**: Click "Reset" to stop and clear all state
4. **Restart**: Adjust speed, click "Boot System" again

## Key Features Implemented

✅ **Boot Panel with Indicator Lights**

- Gray/Green status indicators for Disk, RAM, Network Stack, CPU Scheduler
- CountDownLatch synchronization (Disk and RAM)

✅ **VM Panel with 3 Cards**

- Real-time status updates (Booting → Running → Network Access → Barrier Wait)
- Cycle progress bar
- Task counter

✅ **Semaphore Panel (2 Ports)**

- Fair semaphore-based port allocation
- Shows which VM holds each port or "FREE"

✅ **CyclicBarrier Panel**

- Displays current cycle number
- Shows which VMs are waiting at barrier

✅ **Event Log**

- Timestamped messages with color coding
- Auto-scrolling, unlimited history
- Captures all system events

✅ **Control Panel**

- Boot System button (launches simulation)
- Reset button (stops and clears state)
- Speed slider (0.5× to 3×)

✅ **Thread Safety**

- All UI updates on EDT (Event Dispatch Thread)
- Proper use of SwingUtilities.invokeLater()
- No race conditions on shared state

✅ **Dark Theme**

- Dark background (#1a1a2e)
- White text (#ffffff)
- Accent colors: Cyan, Green, Purple, Amber
- High contrast for readability

## Original Code Preserved

The following files remain **completely unchanged**:

- `core/BootManager.java` - CountDownLatch boot logic
- `core/ClockSynchronizer.java` - CyclicBarrier sync logic
- `core/NetworkPortManager.java` - Semaphore port management
- `entities/VirtualMachine.java` - VM execution logic
- `utils/Logger.java` - Console logging utilities

The GUI merely **visualizes** what these classes are doing—all concurrency is handled by the original code.

## Compatibility

- **Java Version**: 8+ (uses standard Swing, no Java 12+ features)
- **Platform**: Windows, Linux, macOS (cross-platform Swing)
- **Dependencies**: None (only standard Java library)

## Future Enhancements

Potential additions:

- Pause/Resume simulation
- Step through cycles manually
- Export logs to file
- Metrics panel (latency, throughput, resource utilization)
- Thread pool visualization
- Memory heap graph
