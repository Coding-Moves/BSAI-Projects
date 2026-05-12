package core;

import utils.GUILogger;
import utils.StatsCollector;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

/**
 * Synchronizes VM cycle boundaries through a cyclic barrier.
 */
public class ClockSynchronizer {

    private final CyclicBarrier barrier;
    private final GUILogger logger;
    private final StatsCollector stats;
    private int cycleCount = 0;

    /**
     * Creates a clock synchronizer.
     *
     * @param vmCount number of participating VM threads
     * @param logger  logger instance
     * @param stats   statistics collector
     */
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

    /**
     * Waits for all VMs to arrive at the barrier and synchronizes the cycle.
     *
     * @param vmName VM identifier for log messages
     * @throws InterruptedException   if interrupted while waiting
     * @throws BrokenBarrierException if the barrier is broken
     */
    public void sync(String vmName) throws InterruptedException, BrokenBarrierException {
        logger.log(vmName, "Work unit done. Waiting at clock barrier...", "BARRIER");
        barrier.await();
    }

    /**
     * @return underlying cyclic barrier
     */
    public CyclicBarrier getBarrier() {
        return barrier;
    }

    /**
     * @return completed cycle count
     */
    public int getCycleCount() {
        return cycleCount;
    }
}