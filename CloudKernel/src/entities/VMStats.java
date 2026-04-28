package entities;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Stores per-VM runtime statistics.
 */
public class VMStats {
    private final String vmName;
    private final AtomicInteger tasksCompleted = new AtomicInteger(0);
    private final AtomicInteger networkUses = new AtomicInteger(0);
    private final AtomicInteger cpuUses = new AtomicInteger(0);
    private final AtomicInteger memoryUses = new AtomicInteger(0);
    private final AtomicInteger timeouts = new AtomicInteger(0);
    private final AtomicLong totalWaitTime = new AtomicLong(0);
    private final AtomicInteger waitCount = new AtomicInteger(0);

    public VMStats(String vmName) {
        this.vmName = vmName;
    }

    /** Records one completed task unit. */
    public void recordTaskCompleted() {
        tasksCompleted.incrementAndGet();
    }

    /** Records one network acquisition. */
    public void recordNetworkUse() {
        networkUses.incrementAndGet();
    }

    /** Records one CPU acquisition. */
    public void recordCPUUse() {
        cpuUses.incrementAndGet();
    }

    /** Records one memory acquisition. */
    public void recordMemoryUse() {
        memoryUses.incrementAndGet();
    }

    /** Records one timeout event. */
    public void recordTimeout() {
        timeouts.incrementAndGet();
    }

    /**
     * Adds a wait duration sample.
     *
     * @param waitTimeMs wait duration in milliseconds
     */
    public void recordWaitTime(long waitTimeMs) {
        totalWaitTime.addAndGet(waitTimeMs);
        waitCount.incrementAndGet();
    }

    /** @return total completed tasks */
    public int getTasksCompleted() {
        return tasksCompleted.get();
    }

    /** @return total network acquisitions */
    public int getNetworkUses() {
        return networkUses.get();
    }

    /** @return total CPU acquisitions */
    public int getCPUUses() {
        return cpuUses.get();
    }

    /** @return total memory acquisitions */
    public int getMemoryUses() {
        return memoryUses.get();
    }

    /** @return total timeout count */
    public int getTimeouts() {
        return timeouts.get();
    }

    /** @return average wait time in milliseconds */
    public long getAverageWaitTime() {
        if (waitCount.get() == 0)
            return 0;
        return totalWaitTime.get() / waitCount.get();
    }

    /** @return total resource uses across CPU, memory, and network */
    public int getTotalResourceUses() {
        return networkUses.get() + cpuUses.get() + memoryUses.get();
    }

    @Override
    public String toString() {
        return String.format(
                "%s | Tasks: %d | Network: %d | CPU: %d | Memory: %d | Timeouts: %d | Avg Wait: %dms",
                vmName, tasksCompleted.get(), networkUses.get(), cpuUses.get(),
                memoryUses.get(), timeouts.get(), getAverageWaitTime());
    }
}
