package core;

import utils.Logger;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

// Keeps all VM threads synchronized at each cycle.
public class ClockSynchronizer {

    private final CyclicBarrier barrier;

    public ClockSynchronizer(int vmCount, int[] cycleNum) {
        Runnable clockTick = () -> {
            cycleNum[0]++;
            Logger.log("CLOCK",
                    "=== Global Clock Tick #" + cycleNum[0] +
                            " - All VMs synchronized. Next cycle begins. ===",
                    Logger.BOLD + Logger.CYAN);
        };

        this.barrier = new CyclicBarrier(vmCount, clockTick);
    }

    public void sync(String vmName) throws InterruptedException, BrokenBarrierException {
        Logger.log(vmName, "Work unit done. Waiting at clock barrier...", Logger.YELLOW);
        barrier.await();
    }
}