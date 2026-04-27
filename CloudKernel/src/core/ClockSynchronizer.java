package core;

import utils.GUILogger;
import utils.StatsCollector;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

/**
 * Keeps all VM threads synchronized at each cycle using CyclicBarrier.
 * Triggers clock tick when all VMs reach the barrier.
 */
public class ClockSynchronizer {

    private final CyclicBarrier barrier;
    private final GUILogger logger;
    private final StatsCollector stats;
    private int cycleCount = 0;

    public ClockSynchronizer(int vmCount, GUILogger logger, StatsCollector stats) {
        this.logger = logger;
        this.stats = stats;

        Runnable clockTick = () -> {
            cycleCount++;
            GUILogger.cycleComplete(cycleCount);
            logger.boot("Global Clock Tick #" + cycleCount + " - All VMs synchronized.");
            stats.recordCycleCompletion();
        };

        this.barrier = new CyclicBarrier(vmCount, clockTick);
    }

    public void sync(String vmName) throws InterruptedException, BrokenBarrierException {
        logger.log(vmName, "Work unit done. Waiting at clock barrier...", "BARRIER");
        barrier.await();
    }

    public CyclicBarrier getBarrier() {
        return barrier;
    }

    public int getCycleCount() {
        return cycleCount;
    }
}