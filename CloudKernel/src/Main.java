import core.BootManager;
import core.ClockSynchronizer;
import core.NetworkPortManager;
import entities.VirtualMachine;
import utils.Logger;

// Entry point for the CloudKernel simulation.
public class Main {

    private static final int NUM_VMS = 3;
    private static final int NUM_CYCLES = 2;

    public static void main(String[] args) throws InterruptedException {
        // Phase 1: boot
        Logger.section("PHASE 1: SYSTEM BOOT  [CountDownLatch]");
        Logger.log("HYPERVISOR", "CloudKernel v1.0 starting...", Logger.BOLD + Logger.GREEN);

        BootManager bootManager = new BootManager();
        bootManager.initDisk();
        bootManager.initRAM();
        bootManager.awaitBootCompletion();

        Thread.sleep(500);

        // Phase 2: VM execution
        Logger.section("PHASE 2: VM EXECUTION  [CyclicBarrier + Semaphore]");
        int[] cycleNum = { 0 };
        ClockSynchronizer clock = new ClockSynchronizer(NUM_VMS, cycleNum);
        NetworkPortManager networkManager = new NetworkPortManager();

        Logger.log("HYPERVISOR",
                "Launching " + NUM_VMS + " VMs for " + NUM_CYCLES + " cycles each...",
                Logger.CYAN);

        Thread[] vmThreads = new Thread[NUM_VMS];
        for (int i = 1; i <= NUM_VMS; i++) {
            int workDuration = 600 + (i * 200);

            VirtualMachine vm = new VirtualMachine(
                    "VM-" + i, NUM_CYCLES, clock, networkManager, workDuration);
            vmThreads[i - 1] = new Thread(vm, "VM-" + i);
            vmThreads[i - 1].start();
        }

        for (Thread t : vmThreads) {
            t.join();
        }

        // Phase 3: shutdown
        Logger.section("PHASE 3: SYSTEM SHUTDOWN");
        Logger.log("HYPERVISOR", "All VMs have completed execution.", Logger.GREEN);
        Logger.log("HYPERVISOR", "Releasing all system resources...", Logger.YELLOW);
        Thread.sleep(300);
        Logger.log("HYPERVISOR", "CloudKernel has shut down cleanly. Goodbye. [OK]", Logger.BOLD + Logger.GREEN);
        Logger.separator();
        System.out.println();
    }
}