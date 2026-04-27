package entities;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Statistics tracker for each Virtual Machine.
 * Tracks completed tasks, resource usage, timeouts, and wait times.
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

    public void recordTaskCompleted() {
        tasksCompleted.incrementAndGet();
    }

    public void recordNetworkUse() {
        networkUses.incrementAndGet();
    }

    public void recordCPUUse() {
        cpuUses.incrementAndGet();
    }

    public void recordMemoryUse() {
        memoryUses.incrementAndGet();
    }

    public void recordTimeout() {
        timeouts.incrementAndGet();
    }

    public void recordWaitTime(long waitTimeMs) {
        totalWaitTime.addAndGet(waitTimeMs);
        waitCount.incrementAndGet();
    }

    public int getTasksCompleted() {
        return tasksCompleted.get();
    }

    public int getNetworkUses() {
        return networkUses.get();
    }

    public int getCPUUses() {
        return cpuUses.get();
    }

    public int getMemoryUses() {
        return memoryUses.get();
    }

    public int getTimeouts() {
        return timeouts.get();
    }

    public long getAverageWaitTime() {
        if (waitCount.get() == 0)
            return 0;
        return totalWaitTime.get() / waitCount.get();
    }

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
