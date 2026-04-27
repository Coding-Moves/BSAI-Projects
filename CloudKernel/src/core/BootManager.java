package core;

import utils.GUILogger;
import java.util.concurrent.CountDownLatch;

/**
 * Handles system boot readiness using CountDownLatch.
 * Initializes Disk and RAM subsystems in parallel.
 */
public class BootManager {

    private final CountDownLatch bootLatch = new CountDownLatch(4); // Enhanced: 4 resources to boot
    private final GUILogger logger;

    public BootManager(GUILogger logger) {
        this.logger = logger;
    }

    public void initDisk() {
        new Thread(() -> {
            try {
                logger.log("SYSTEM", "Disk subsystem starting...", "BOOT");
                Thread.sleep(1500);
                logger.log("SYSTEM", "Disk subsystem initialized. [OK]", "BOOT");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                bootLatch.countDown();
            }
        }, "Disk-Init-Thread").start();
    }

    public void initRAM() {
        new Thread(() -> {
            try {
                logger.log("SYSTEM", "RAM subsystem starting...", "BOOT");
                Thread.sleep(1000);
                logger.log("SYSTEM", "RAM subsystem initialized. [OK]", "BOOT");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                bootLatch.countDown();
            }
        }, "RAM-Init-Thread").start();
    }

    public void initNetworkStack() {
        new Thread(() -> {
            try {
                logger.log("SYSTEM", "Network Stack initializing...", "BOOT");
                Thread.sleep(1200);
                logger.log("SYSTEM", "Network Stack initialized. [OK]", "BOOT");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                bootLatch.countDown();
            }
        }, "Network-Init-Thread").start();
    }

    public void initCPUScheduler() {
        new Thread(() -> {
            try {
                logger.log("SYSTEM", "CPU Scheduler initializing...", "BOOT");
                Thread.sleep(800);
                logger.log("SYSTEM", "CPU Scheduler initialized. [OK]", "BOOT");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                bootLatch.countDown();
            }
        }, "CPU-Init-Thread").start();
    }

    public void awaitBootCompletion() throws InterruptedException {
        logger.boot("Hypervisor waiting for all subsystems...");
        bootLatch.await();
        logger.boot("✓ All subsystems ready. CloudKernel is ONLINE.");
    }

    public CountDownLatch getBootLatch() {
        return bootLatch;
    }
}