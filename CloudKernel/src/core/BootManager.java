package core;

import utils.Logger;
import java.util.concurrent.CountDownLatch;

// Handles system boot readiness using CountDownLatch.
public class BootManager {

    private final CountDownLatch bootLatch = new CountDownLatch(2);

    public void initDisk() {
        new Thread(() -> {
            try {
                Logger.log("BOOT", "Disk subsystem starting...", Logger.YELLOW);
                Thread.sleep(1500);
                Logger.log("BOOT", "Disk subsystem initialized. [OK]", Logger.GREEN);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                // Count down in finally to avoid deadlock on errors.
                bootLatch.countDown();
            }
        }, "Disk-Init-Thread").start();
    }

    public void initRAM() {
        new Thread(() -> {
            try {
                Logger.log("BOOT", "RAM subsystem starting...", Logger.YELLOW);
                Thread.sleep(1000);
                Logger.log("BOOT", "RAM subsystem initialized. [OK]", Logger.GREEN);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                bootLatch.countDown();
            }
        }, "RAM-Init-Thread").start();
    }

    public void awaitBootCompletion() throws InterruptedException {
        Logger.log("BOOT", "Hypervisor waiting for subsystems...", Logger.CYAN);
        bootLatch.await();
        Logger.log("BOOT", "All subsystems ready. CloudKernel is ONLINE. [OK]", Logger.GREEN);
    }
}