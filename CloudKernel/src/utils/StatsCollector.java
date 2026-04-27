package utils;

import entities.VMStats;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Collects and manages system-wide statistics.
 */
public class StatsCollector {
    private final Map<String, VMStats> vmStats = new LinkedHashMap<>();
    private final AtomicInteger totalCycles = new AtomicInteger(0);
    private final AtomicInteger totalContentions = new AtomicInteger(0);
    private final AtomicInteger peakConcurrency = new AtomicInteger(0);
    private final AtomicLong startTime = new AtomicLong(0);
    private final AtomicInteger totalTimeouts = new AtomicInteger(0);

    public StatsCollector() {
        startTime.set(System.currentTimeMillis());
    }

    public VMStats getOrCreateVMStats(String vmName) {
        return vmStats.computeIfAbsent(vmName, k -> new VMStats(vmName));
    }

    public void recordCycleCompletion() {
        totalCycles.incrementAndGet();
    }

    public void recordContention() {
        totalContentions.incrementAndGet();
    }

    public void recordPeakConcurrency(int concurrency) {
        int current = peakConcurrency.get();
        while (concurrency > current) {
            peakConcurrency.compareAndSet(current, concurrency);
            current = peakConcurrency.get();
        }
    }

    public void recordTimeout() {
        totalTimeouts.incrementAndGet();
    }

    public void printSummary() {
        long elapsedMs = System.currentTimeMillis() - startTime.get();
        long hours = elapsedMs / 3600000;
        long minutes = (elapsedMs % 3600000) / 60000;
        long seconds = (elapsedMs % 60000) / 1000;

        System.out.println();
        System.out.println(
                GUILogger.BOLD + "═══════════════════════════════════════════════════════════" + GUILogger.RESET);
        System.out.println(GUILogger.BOLD + GUILogger.CYAN + "  SIMULATION SUMMARY" + GUILogger.RESET);
        System.out.println(
                GUILogger.BOLD + "═══════════════════════════════════════════════════════════" + GUILogger.RESET);

        System.out.println();
        System.out.println(GUILogger.BOLD + "System Statistics:" + GUILogger.RESET);
        System.out.println(String.format("  Total Cycles Completed: %d", totalCycles.get()));
        System.out.println(String.format("  Total Contentions:      %d", totalContentions.get()));
        System.out.println(String.format("  Peak Concurrency:       %d VMs", peakConcurrency.get()));
        System.out.println(String.format("  Total Timeouts:         %d", totalTimeouts.get()));
        System.out.println(String.format("  Total Uptime:           %02d:%02d:%02d", hours, minutes, seconds));

        System.out.println();
        System.out.println(GUILogger.BOLD + "Per-VM Statistics:" + GUILogger.RESET);
        System.out.println(
                GUILogger.BOLD + String.format("  %-8s | Tasks | Network | CPU | Memory | Timeouts | Avg Wait", "VM")
                        + GUILogger.RESET);
        System.out.println(GUILogger.BOLD + "  " + "─".repeat(70) + GUILogger.RESET);

        for (VMStats stats : vmStats.values()) {
            System.out.println(String.format(
                    "  %-8s | %5d | %7d | %3d | %6d | %8d | %6dms",
                    stats.toString().split("\\|")[0],
                    stats.getTasksCompleted(),
                    stats.getNetworkUses(),
                    stats.getCPUUses(),
                    stats.getMemoryUses(),
                    stats.getTimeouts(),
                    stats.getAverageWaitTime()));
        }

        System.out.println();
        System.out.println(
                GUILogger.BOLD + "═══════════════════════════════════════════════════════════" + GUILogger.RESET);
    }

    public int getTotalCycles() {
        return totalCycles.get();
    }

    public int getTotalContentions() {
        return totalContentions.get();
    }

    public int getPeakConcurrency() {
        return peakConcurrency.get();
    }

    public int getTotalTimeouts() {
        return totalTimeouts.get();
    }

    public long getUptimeMs() {
        return System.currentTimeMillis() - startTime.get();
    }

    public Map<String, VMStats> getAllVMStats() {
        return new LinkedHashMap<>(vmStats);
    }
}
