# CloudKernel ☁️⚙️

## Overview

**CloudKernel** is a small Java-based simulation created for our **Operating Systems Lab**.  
The purpose of this project is to show how a hypervisor-like system can manage multiple **Virtual Machines (VMs)** while coordinating shared resources.

Instead of building a real operating system, this project focuses on demonstrating **important OS concepts** like synchronization, resource sharing, and concurrent execution using Java threads.

The program simulates a system where several virtual machines start after the system boots, run tasks together, and share limited network resources.
<img src ="img/banner.png">

---

## 🎓 Academic Information

**Course:** Operating Systems Lab  
**Semester:** 4th Semester

**Submitted to:**  
[Mam Amara Nadeem](mailto:2k24bsai72@undergrad.nfciet.edu.pk)

### Team Members & Contact Information

- **Muawiya Amir** (2k24_BSAI_72)  
  [2k24bsai72@undergrad.nfciet.edu.pk](mailto:2k24bsai72@undergrad.nfciet.edu.pk)

- **Muhammad Arslan Nasir** (2k24_BSAI_26)  
  [2k24bsai26@undergrad.nfciet.edu.pk](mailto:2k24bsai26@undergrad.nfciet.edu.pk)
- **Ali Raza** (2k24_BSAI_44)  
  [2k24bsai44@undergrad.nfciet.edu.pk](mailto:2k24bsai44@undergrad.nfciet.edu.pk)

**Submission Date:**  
March 03, 2026

---

## Interactive GUI 🎨 — Professional Cloud Hypervisor Dashboard

**As of March 2026**, CloudKernel now features a **professional-grade Java Swing dashboard** with enterprise-level monitoring and control!

### 🎯 Enhanced Features (10 Core Improvements)

✅ **5 Virtual Machines** (was 3) — Run with up to 10 configurable VMs  
✅ **Multiple Resource Types** — CPU Cores, Memory Blocks, Network Ports (Semaphores)  
✅ **VM Lifecycle States** — 8-state FSM: BOOTING → READY → RUNNING → REQUESTING → USING → RELEASING → BARRIER_WAIT → NEXT_CYCLE  
✅ **Priority System** — HIGH/MEDIUM/LOW VM priorities affect resource acquisition  
✅ **Timeout & Deadlock Prevention** — Non-blocking semaphore access with 2-second timeout  
✅ **Colored Event Logging** — ANSI colors: CYAN/GREEN/YELLOW/PURPLE/RED by event type  
✅ **Statistics & Reports** — Per-VM tracking: tasks, resource ops, timeouts, wait times  
✅ **Configuration File** — `config.properties` for customizing VM count, cycles, resource permits  
✅ **Graceful Shutdown** — Ctrl+C handler with statistics summary  
✅ **Professional Dashboard** — 10-component monitoring GUI with dark terminal theme

### 🖥️ Dashboard Components

1. **Header Bar** — System title, real-time clock, online status indicator
2. **Boot Manager Panel** — CountDownLatch(4) visualization with 4 resource indicators
3. **VM Dashboard** — 5 interactive VM cards (name, priority, state, progress, task count)
4. **Resource Monitor Panel** — CPU/Memory/Network slot visualization (Semaphore status)
5. **Cyclic Barrier Panel** — Global clock sync showing which VMs are barrier-waiting
6. **Live Event Log** — Scrolling, color-coded event feed with timestamps
7. **Statistics Bar** — 6 live counters (Cycles, CPU Ops, Net Ops, Mem Ops, Contentions, Timeouts)
8. **Control Panel** — Boot, Reset buttons + speed slider (0.5× to 3.0×)
9. **Color Theme** — Professional dark (#0a0e1a) with neon accents (cyan, green, purple, red)
10. **Responsive Layout** — Split-pane design with scrollable components

### 🚀 Quick Start (Enhanced Version)

```bash
# Navigate to CloudKernel
cd "C:\Users\4s bazzar\OneDrive\Desktop\DSA LAB\BSAI-Projects\CloudKernel"

# Compile with UTF-8 encoding
javac -encoding UTF-8 -d bin src\Main.java src\ui\CloudKernelGUI.java src\config\ConfigLoader.java src\core\BootManager.java src\core\ClockSynchronizer.java src\core\NetworkPortManager.java src\entities\VirtualMachine.java src\entities\VMState.java src\entities\VMPriority.java src\entities\VMStats.java src\entities\ResourceManager.java src\utils\GUILogger.java src\utils\StatsCollector.java src\shutdown\ShutdownManager.java

# Run the professional dashboard
java -cp "bin;." Main
```

**📖 See [ENHANCEMENT_COMPLETE.md](ENHANCEMENT_COMPLETE.md) for detailed feature documentation**

---

## 🎯 Project Goals

This project was designed to help understand how operating systems manage:

- System boot coordination
- Thread synchronization
- Limited resource sharing
- Parallel execution of processes

All these ideas are implemented using **Java concurrency utilities**.

---

## ⚙️ Key Concepts Used

### 1. System Boot Coordination

Before any virtual machine starts running, the system must finish its boot process.

We simulate this using **CountDownLatch**.  
It ensures that resources like **Disk and RAM** are ready before the virtual machines begin execution.

---

### 2. VM Cycle Synchronization

Each virtual machine performs its work in cycles.  
To keep them synchronized, we use **CyclicBarrier**.

This means all VMs must finish a cycle before the next one begins.

---

### 3. Limited Network Access

In real systems, hardware resources are limited.  
In this simulation, only **two VMs can use the network at the same time**.

This is managed using a **Semaphore**, which controls access to the shared network ports.

---

## 🧩 Project Structure

```
CloudKernel
│
├── src
│ │
│ ├── Main.java
│ │
│ ├── core
│ │ ├── BootManager.java
│ │ ├── ClockSynchronizer.java
│ │ └── NetworkPortManager.java
│ │
│ ├── entities
│ │ └── VirtualMachine.java
│ │
│ └── utils
│ └── Logger.java
│
├── doc
│ └── proposal
│
└── README.md
```

---

## 🏗 System Workflow

The program runs in the following order:

```
System Boot
│
▼
BootManager initializes resources
│
▼
Virtual Machines start (Threads)
│
▼
VMs execute cycles together
│
▼
Network access controlled by Semaphore
│
▼
Logs printed to terminal
```

---

## ▶️ How to Run the Professional Dashboard

### Prerequisites

- **Java 8 or higher** installed
- **1280×800 display** minimum (recommended)
- **512 MB RAM** (typical usage)
- Command Prompt/PowerShell access

### Step 1: Navigate to CloudKernel

```bash
cd "C:\Users\4s bazzar\OneDrive\Desktop\DSA LAB\BSAI-Projects\CloudKernel"
```

### Step 2: Compile ALL Source Files

Use UTF-8 encoding for proper Unicode character support:

```bash
javac -encoding UTF-8 -d bin ^
    src\Main.java ^
    src\ui\CloudKernelGUI.java ^
    src\config\ConfigLoader.java ^
    src\core\BootManager.java ^
    src\core\ClockSynchronizer.java ^
    src\core\NetworkPortManager.java ^
    src\entities\VirtualMachine.java ^
    src\entities\VMState.java ^
    src\entities\VMPriority.java ^
    src\entities\VMStats.java ^
    src\entities\ResourceManager.java ^
    src\utils\GUILogger.java ^
    src\utils\StatsCollector.java ^
    src\shutdown\ShutdownManager.java
```

**On Linux/Mac**, replace `^` with `\`

### Step 3: Run the Application

```bash
java -cp "bin;." Main
```

**Successful startup shows**:

```
[CONFIG] Loaded configuration from: config.properties
```

Then the GUI window appears.

### ⚡ One-Line Command (Windows PowerShell)

Copy-paste this entire command:

```powershell
javac -encoding UTF-8 -d bin src\Main.java src\ui\CloudKernelGUI.java src\config\ConfigLoader.java src\core\BootManager.java src\core\ClockSynchronizer.java src\core\NetworkPortManager.java src\entities\VirtualMachine.java src\entities\VMState.java src\entities\VMPriority.java src\entities\VMStats.java src\entities\ResourceManager.java src\utils\GUILogger.java src\utils\StatsCollector.java src\shutdown\ShutdownManager.java ; if ($?) { java -cp "bin;." Main }
```

---

## 🎮 Using the Professional Dashboard

### Dashboard Walkthrough

#### 1. **Header Bar** (Top)

- Shows "☁ CLOUDKERNEL HYPERVISOR" title
- Displays current time (updates every second)
- Online status indicator (● OFFLINE at startup, ● ONLINE when running)

#### 2. **Boot Manager Panel** (Below header)

- 4 boot resource indicators: Disk, RAM, Network, CPU
- Initially gray (inactive)
- Turn green when each subsystem initializes
- Represents **CountDownLatch(4)** boot coordination

#### 3. **VM Dashboard** (Center - 5 Cards)

- **For each of 5 VMs** (VM-1 through VM-5):
  - VM Name and assigned priority (HIGH/MEDIUM/LOW)
  - Current state with color indicator:
    - CYAN: Ready/Running
    - GREEN: Using resources
    - PURPLE: Waiting at barrier
    - RED: Timeout
  - Progress bar (0-100%)
  - Task counter
- Cards update in real-time during execution

#### 4. **Resource Monitor Panel** (Right side, top)

- Shows **CPU Cores** (3 slots)
- Shows **Memory Blocks** (2 slots)
- Shows **Network Ports** (2 slots)
- Gray slot = available, Green slot = in-use
- Visual representation of **Semaphore permits**

#### 5. **Cyclic Barrier Panel** (Bottom left)

- Displays current cycle number
- Shows 5 VM dots with status:
  - Purple dot = VM waiting at barrier
  - Gray dot = VM free (running)
- Represents **CyclicBarrier(5)** global clock sync

#### 6. **Live Event Log** (Right side, bottom)

- Scrolling feed of all system events
- Color-coded by category:
  - **CYAN**: Boot/initialization events
  - **GREEN**: CPU/Memory/Network resource grants
  - **YELLOW**: Waiting states
  - **PURPLE**: Barrier synchronization events
  - **RED**: Timeouts and errors
- Auto-scrolls to show latest events
- Format: `[HH:MM:SS.SSS] [COMPONENT] [VM-X] → message`

#### 7. **Statistics Bar** (Bottom)

- **Cycles**: Total completed cycles (0-20 max for 5VMs×4cycles)
- **CPU Ops**: CPU resource acquisitions
- **Net Ops**: Network acquisitions
- **Mem Ops**: Memory acquisitions
- **Contentions**: Resource conflicts
- **Timeouts**: Failed acquisitions within timeout window
- Updates in real-time

#### 8. **Control Panel** (Embedded in layout)

- **▶ BOOT SYSTEM** (green button): Starts simulation
  - Becomes disabled during execution
  - Re-enables after completion
- **↺ RESET** (red button): Clears all state, resets to initial
- **Speed Slider**: Adjusts simulation speed
  - 0.5× (very slow - good for study)
  - 1.0× (normal speed)
  - 3.0× (fast execution)

### Step-by-Step Simulation

1. **GUI opens** → See header, boot panel (gray), 5 VM cards (booting), etc.
2. **Click "▶ BOOT SYSTEM"** → Boot indicators turn green in sequence
3. **Boot completes** → Online indicator turns green
4. **VM execution** → Each VM cycles through states
   - Cards show RUNNING → REQUESTING → USING → RELEASING → BARRIER_WAIT
5. **Barrier sync** → All VMs wait at purple barrier
6. **Global clock tick** → Barrier dots turn green, event log shows synchronization
7. **Cycle complete** → Progress bars advance, next cycle begins
8. **After 4 cycles** → Summary statistics printed to console, GUI resets
9. **Press "↺ RESET"** → Manually clear state for another run

### 🎨 Color Reference

| Color                | Meaning                                      |
| -------------------- | -------------------------------------------- |
| #0a0e1a (Dark BG)    | Main background (professional dark terminal) |
| #00d4ff (Cyan)       | Active, ready, running states                |
| #00ff88 (Green)      | Success, resources granted, online           |
| #ffbf00 (Yellow)     | Warning, waiting, pending                    |
| #c800ff (Purple)     | Barrier synchronization                      |
| #ff6464 (Red)        | Timeout, error conditions                    |
| #c8d8f0 (Light Text) | Primary labels and content                   |
| #8296b4 (Muted Text) | Secondary labels, metadata                   |

---

## ⚙️ Configuration (Optional)

Edit `config.properties` before running to customize:

```properties
# Number of VMs (default: 5, range: 1-10)
vm.count=5

# Cycles per VM (default: 4)
cycle.count=4

# Semaphore permits (default: 3, 2, 2)
semaphore.cpu.permits=3
semaphore.memory.permits=2
semaphore.network.permits=2

# Task duration in milliseconds
task.duration.min=500
task.duration.max=1500

# Resource timeout in milliseconds (default: 2000)
timeout.duration=2000

# GUI and logging settings
gui.enabled=true
logging.level=NORMAL
stats.enabled=true
```

**Example**: To run 10 VMs for 8 cycles with 5 CPU cores and 4 memory blocks:

```properties
vm.count=10
cycle.count=8
semaphore.cpu.permits=5
semaphore.memory.permits=4
```

Then recompile and run. The GUI automatically loads new config.

---

## 📊 Understanding Simulation Results

After simulation completes, console shows:

```
========================================
  PHASE 1: SYSTEM BOOT [CountDownLatch]
========================================
[timestamps showing boot progression]

========================================
  PHASE 2: VM EXECUTION [CyclicBarrier + Semaphore]
========================================
[timestamps for VM cycles, resource access, barrier waits]

========================================
  PHASE 3: SYSTEM SHUTDOWN
========================================

SYSTEM STATISTICS SUMMARY
================================================
VM      | Tasks | NetOps | CPUOps | MemOps | Timeouts | AvgWait
--------|-------|--------|--------|--------|----------|--------
VM-1    | 4     | 4      | 4      | 2      | 0        | 45ms
VM-2    | 4     | 4      | 4      | 2      | 0        | 52ms
VM-3    | 4     | 4      | 4      | 2      | 1        | 67ms
VM-4    | 4     | 4      | 4      | 2      | 0        | 41ms
VM-5    | 4     | 4      | 4      | 2      | 2        | 89ms
--------|-------|--------|--------|--------|----------|--------
TOTAL   | 20    | 20     | 20     | 10     | 3        | 58ms
================================================
```

**Key Metrics**:

- **Tasks**: How many work cycles VM completed (should equal cycle.count)
- **NetOps**: Network resource uses (max 4 per VM for 4 cycles)
- **CPUOps**: CPU acquisitions
- **MemOps**: Memory acquisitions
- **Timeouts**: Resource requests that timed out (indicates contention)
- **AvgWait**: Average time waiting for resources

---

## ⏱️ Typical Execution Timeline

At **1.0× speed** (approximately):

- **0-2.5 seconds**: Boot phase (CountDownLatch)
- **2.5-4.5 seconds**: First cycle (5 VMs)
- **4.5-6.5 seconds**: Second cycle
- **6.5-8.5 seconds**: Third cycle
- **8.5-10.5 seconds**: Fourth cycle
- **10.5+ seconds**: Shutdown, stats printed, ready for reset

**Actual time depends on**:

- Your computer speed
- Simulation speed slider (0.5× to 3.0×)
- Resource contention (more timeouts = longer waits)
- Other system processes running

---

## 📋 Console-Based Alternative (Legacy)

If you prefer the original console output instead of GUI:

```bash
# Compile
javac -d bin -cp src src/Main.java src/core/*.java src/entities/*.java src/utils/*.java

# Run (will use original console-based Logger)
java -cp bin Main
```

---

## 🖥 Example GUI Output States

### Boot Phase

```
Boot Panel:
[●] Disk [OK]
[●] RAM [OK]
[●] Network Stack [OK]
[●] CPU Scheduler [OK]
```

### VM Execution

```
VM-1:
  Status: Running 🟦
  Cycle: 1/2
  Progress: ▓▓▓▓▓░░░░░░
  Tasks: 8

Network Ports:
  Port 1: [●] VM-2
  Port 2: [●] VM-3

Barrier Sync (Cycle #1):
  VM-1 [●] WAITING
  VM-2 [○] FREE
  VM-3 [●] WAITING

Event Log:
[00:00:01.234] [BOOT] Disk subsystem starting...
[00:00:02.567] [VM-1] Virtual Machine is ONLINE.
[00:00:03.890] [CLOCK] Global Clock Tick #1
```

---

## 🧠 What We Learned

While building this project, we understood how operating systems handle:

- **Thread** synchronization using CountDownLatch, Semaphore, and CyclicBarrier
- **Shared** resource management with concurrent access control
- **Parallel** execution of independent VM threads
- **Process** coordination at synchronization barriers
- **GUI** visualization of concurrent systems using Swing

These concepts are important for understanding how real operating systems and cloud platforms work.

---

## 📚 Additional Documentation

For more detailed information, see:

- **[GUI_QUICKSTART.md](GUI_QUICKSTART.md)** - Quick reference guide
- **[GUI_IMPLEMENTATION.md](GUI_IMPLEMENTATION.md)** - Technical architecture
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete summary
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Class diagrams and design patterns

---

## 📌 Conclusion

CloudKernel is a simple educational simulation that demonstrates how a hypervisor-like system can coordinate virtual machines and manage shared resources.

Although it is a simplified model, it provides a clear understanding of synchronization and concurrency in operating systems.

---
