package core;

import utils.GUILogger;
import java.util.concurrent.CountDownLatch;

/**
 * Coordinates CloudKernel boot initialization using a countdown latch.
 */
public class BootManager {

    private final CountDownLatch bootLatch = new CountDownLatch(4);
    private final GUILogger logger;

    /**
     * Creates a boot manager.
     *
     * @param logger logger used for boot event reporting
     */
    public BootManager(GUILogger logger) {
        this.logger = logger;
    }

    /**
     * Starts disk subsystem initialization on its own thread.
     */
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

    /**
     * Starts RAM subsystem initialization on its own thread.
     */
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

    /**
     * Starts network stack initialization on its own thread.
     */
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

    /**
     * Starts CPU scheduler initialization on its own thread.
     */
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

    /**
     * Blocks until all boot tasks complete.
     *
     * @throws InterruptedException if interrupted while waiting
     */
    public void awaitBootCompletion() throws InterruptedException {
        logger.boot("Hypervisor waiting for all subsystems...");
        bootLatch.await();
        logger.boot("All subsystems ready. CloudKernel is ONLINE.");
    }

    /**
     * Returns the latch used by the boot phase.
     *
     * @return boot latch
     */
    public CountDownLatch getBootLatch() {
        return bootLatch;
    }
}