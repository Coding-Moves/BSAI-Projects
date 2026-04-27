# CloudKernel ☁️⚙️

## Overview

**CloudKernel** is a small Java-based simulation created for our **Operating Systems Lab**.  
The purpose of this project is to show how a hypervisor-like system can manage multiple **Virtual Machines (VMs)** while coordinating shared resources.

Instead of building a real operating system, this project focuses on demonstrating **important OS concepts** like synchronization, resource sharing, and concurrent execution using Java threads.

The program simulates a system where several virtual machines start after the system boots, run tasks together, and share limited network resources.

---

## 🎓 Academic Information

**Course:** Operating Systems Lab  
**Semester:** 4th Semester  

**Submitted to:**  
Mam Amara Nadeem  

**Submitted by:**

- **Moavia Amir** (2k24_BSAI_72)  
- **Ali Raza** (2k24_BSAI_44)  
- **Muhammad Arslan Nasir** (2k24_BSAI_26)

**Submission Date:**  
March 03, 2026

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

## ▶️ How to Run the Project

### 1. Compile the project

```bash
javac -d out -sourcepath src src/Main.java
```
### 2. Run the program
```bash
java -cp out Main
```
## 🖥 Example Output

When the program runs, you may see output like:
```
[BOOT] Disk initialized
[BOOT] RAM initialized
[BOOT] System ready

[VM-1] Starting execution
[VM-2] Starting execution
[VM-3] Starting execution

[VM-1] Requesting network access
[VM-2] Requesting network access

[VM-1] Using network port
[VM-2] Using network port

[VM-3] Waiting for network port
```
The Logger class keeps the output organized so it is easier to read.

## 🧠 What We Learned

While building this project, we understood how operating systems handle:

+ **Thread** synchronization

+ **Shared** resource management

+ **Parallel** execution

+ **Process** coordination

These concepts are important for understanding how real operating systems and cloud platforms work.

---

## 📌 Conclusion

CloudKernel is a simple educational simulation that demonstrates how a hypervisor-like system can coordinate virtual machines and manage shared resources.

Although it is a simplified model, it provides a clear understanding of synchronization and concurrency in operating systems.

---