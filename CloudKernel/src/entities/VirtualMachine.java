package entities;

import core.ClockSynchronizer;
import entities.ResourceManager;
import utils.GUILogger;
import utils.StatsCollector;
import java.util.concurrent.BrokenBarrierException;

/**
 * Represents one Virtual Machine in the simulation.
 * Each VM transitions through defined lifecycle states and manages resources.
 */
public class VirtualMachine implements Runnable {

    private final String name;
    private final int vmId;
    private final int cycles;
    private final ClockSynchronizer clock;
    private final ResourceManager resourceManager;
    private final int workDuration;
    private final GUILogger logger;
    private final VMPriority priority;
    private final VMStats stats;
    private final StatsCollector statsCollector;

    private VMState currentState;

    public VirtualMachine(String name, int vmId, int cycles, ClockSynchronizer clock,
            ResourceManager resourceManager, int workDuration, GUILogger logger,
            VMPriority priority, VMStats stats, StatsCollector statsCollector) {
        this.name = name;
        this.vmId = vmId;
        this.cycles = cycles;
        this.clock = clock;
        this.resourceManager = resourceManager;
        this.workDuration = workDuration;
        this.logger = logger;
        this.priority = priority;
        this.stats = stats;
        this.statsCollector = statsCollector;
        this.currentState = VMState.BOOTING;
    }

    @Override
    public void run() {
        try {
            setState(VMState.READY);
            logger.log(name, "Virtual Machine is ONLINE. Priority: " + priority, "BOOT");

            for (int i = 1; i <= cycles; i++) {
                logger.log(name, "Starting Cycle " + i + " of " + cycles, "INFO");

                setState(VMState.RUNNING);
                logger.log(name, "Executing workload for " + workDuration + "ms...", "INFO");
                Thread.sleep(workDuration);
                stats.recordTaskCompleted();

                // Request and use CPU
                setState(VMState.REQUESTING_RESOURCE);
                long cpuWaitStart = System.currentTimeMillis();
                if (resourceManager.acquireCPU(name)) {
                    setState(VMState.USING_RESOURCE);
                    Thread.sleep(300);
                    resourceManager.releaseCPU(name);
                    setState(VMState.RELEASING);
                    stats.recordWaitTime(System.currentTimeMillis() - cpuWaitStart);
                } else {
                    stats.recordTimeout();
                }

                // Request and use Memory
                setState(VMState.REQUESTING_RESOURCE);
                long memWaitStart = System.currentTimeMillis();
                if (resourceManager.acquireMemory(name)) {
                    setState(VMState.USING_RESOURCE);
                    Thread.sleep(250);
                    resourceManager.releaseMemory(name);
                    setState(VMState.RELEASING);
                    stats.recordWaitTime(System.currentTimeMillis() - memWaitStart);
                } else {
                    stats.recordTimeout();
                }

                // Request and use Network
                setState(VMState.REQUESTING_RESOURCE);
                long netWaitStart = System.currentTimeMillis();
                if (resourceManager.acquireNetwork(name)) {
                    setState(VMState.USING_RESOURCE);
                    Thread.sleep(500);
                    resourceManager.releaseNetwork(name);
                    setState(VMState.RELEASING);
                    stats.recordWaitTime(System.currentTimeMillis() - netWaitStart);
                } else {
                    stats.recordTimeout();
                }

                // Barrier synchronization
                setState(VMState.BARRIER_WAIT);
                logger.log(name, "All resources released. Waiting at barrier...", "BARRIER");
                clock.sync(name);
                setState(VMState.READY);
            }

            setState(VMState.SHUTDOWN);
            logger.log(name, "All cycles complete. Shutting down gracefully. [OK]", "BOOT");

        } catch (InterruptedException e) {
            logger.log(name, "Interrupted during execution!", "ERROR");
            setState(VMState.SHUTDOWN);
            Thread.currentThread().interrupt();
        } catch (BrokenBarrierException e) {
            logger.log(name, "Clock barrier broken - system error!", "ERROR");
            setState(VMState.SHUTDOWN);
        }
    }

    private void setState(VMState newState) {
        this.currentState = newState;
        stats.recordTaskCompleted();
    }

    public VMState getCurrentState() {
        return currentState;
    }

    public VMPriority getPriority() {
        return priority;
    }

    public VMStats getStats() {
        return stats;
    }

    public String getName() {
        return name;
    }

    public int getVMId() {
        return vmId;
    }
}