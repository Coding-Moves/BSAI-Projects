package ui;

import entities.VMState;
import entities.VMStats;
import utils.StatsCollector;

import javax.swing.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Centralized UI refresh adapter for dashboard widgets.
 */
public class DashboardUpdater {
    private final Map<String, VMCard> cards;
    private final ResourceMonitorPanel resourcePanel;
    private final BarrierPanel barrierPanel;
    private final StatsBar statsBar;

    /**
     * Creates an updater bound to all dashboard sections.
     *
     * @param cards         VM cards indexed by VM name
     * @param resourcePanel resource panel
     * @param barrierPanel  barrier panel
     * @param statsBar      stats bar
     */
    public DashboardUpdater(Map<String, VMCard> cards,
            ResourceMonitorPanel resourcePanel,
            BarrierPanel barrierPanel,
            StatsBar statsBar) {
        this.cards = cards;
        this.resourcePanel = resourcePanel;
        this.barrierPanel = barrierPanel;
        this.statsBar = statsBar;
    }

    /**
     * Updates one VM state card.
     *
     * @param vmName VM name
     * @param state  VM state
     */
    public void update(String vmName, VMState state) {
        SwingUtilities.invokeLater(() -> {
            VMCard card = cards.get(vmName);
            if (card != null) {
                card.setState(state);
            }
        });
    }

    /**
     * Refreshes displayed resource holders and VM resource indicators.
     *
     * @param cpuHolders     CPU holder map
     * @param memoryHolders  memory holder map
     * @param networkHolders network holder map
     */
    public void updateResourceSlots(Map<String, String> cpuHolders,
            Map<String, String> memoryHolders,
            Map<String, String> networkHolders) {
        SwingUtilities.invokeLater(() -> {
            List<String> cpu = sortedValues(cpuHolders);
            List<String> memory = sortedValues(memoryHolders);
            List<String> network = sortedValues(networkHolders);

            resourcePanel.updateCPU(cpu);
            resourcePanel.updateMemory(memory);
            resourcePanel.updateNetwork(network);

            for (VMCard card : cards.values()) {
                String vm = card.getVmName();
                card.setResourceHold(cpu.contains(vm), memory.contains(vm), network.contains(vm));
            }
        });
    }

    /**
     * Updates barrier arrival state for one VM.
     *
     * @param vmId    VM numeric id
     * @param arrived arrived VM count
     * @param total   total VM count
     */
    public void updateBarrierArrivals(int vmId, int arrived, int total) {
        SwingUtilities.invokeLater(() -> barrierPanel.markArrived(vmId, arrived, total));
    }

    /**
     * Updates cycle value and executes barrier flash animation.
     *
     * @param cycle cycle number
     * @param total total VM count
     */
    public void updateBarrierCycle(int cycle, int total) {
        SwingUtilities.invokeLater(() -> {
            barrierPanel.setCycle(cycle);
            barrierPanel.flashAllAndReset(total);
        });
    }

    /**
     * Updates VM cards and aggregate operation counters.
     *
     * @param vmStats     per-VM stats map
     * @param totalCycles configured total cycles
     */
    public void updateVMStats(Map<String, VMStats> vmStats, int totalCycles) {
        SwingUtilities.invokeLater(() -> {
            int networkOps = 0;
            int cpuOps = 0;
            int totalTimeouts = 0;

            for (Map.Entry<String, VMStats> entry : vmStats.entrySet()) {
                VMStats stats = entry.getValue();
                VMCard card = cards.get(entry.getKey());
                if (card != null) {
                    card.setTaskCount(stats.getTasksCompleted());
                    card.setAvgWait(stats.getAverageWaitTime());
                    int progress = totalCycles == 0 ? 0
                            : Math.min(100, (stats.getTasksCompleted() * 100) / Math.max(1, totalCycles * 4));
                    card.setCycleProgress(progress);
                }

                networkOps += stats.getNetworkUses();
                cpuOps += stats.getCPUUses();
                totalTimeouts += stats.getTimeouts();
            }

            statsBar.setValue("Network Ops", String.valueOf(networkOps));
            statsBar.setValue("CPU Ops", String.valueOf(cpuOps));
            statsBar.setValue("Timeouts", String.valueOf(totalTimeouts));
        });
    }

    /**
     * Updates system-wide statistics cards.
     *
     * @param statsCollector collector instance
     */
    public void updateSystemStats(StatsCollector statsCollector) {
        SwingUtilities.invokeLater(() -> {
            statsBar.setValue("Total Cycles", String.valueOf(statsCollector.getTotalCycles()));
            statsBar.setValue("Contentions", String.valueOf(statsCollector.getTotalContentions()));
            statsBar.setValue("Uptime", CloudKernelGUI.formatUptime(statsCollector.getUptimeMs()));
        });
    }

    /** Resets stats bar values to initial state. */
    public void reset() {
        SwingUtilities.invokeLater(statsBar::reset);
    }

    /**
     * Converts a slot holder map into a key-sorted holder list.
     *
     * @param map holder map
     * @return sorted holder values
     */
    private List<String> sortedValues(Map<String, String> map) {
        List<String> keys = new ArrayList<>(map.keySet());
        Collections.sort(keys);
        List<String> values = new ArrayList<>();
        for (String key : keys) {
            values.add(map.get(key));
        }
        return values;
    }
}
