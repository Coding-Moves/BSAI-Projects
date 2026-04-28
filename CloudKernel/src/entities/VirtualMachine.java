package entities;

import core.ClockSynchronizer;
import utils.GUILogger;
import utils.StatsCollector;

import java.util.concurrent.BrokenBarrierException;

/**
 * Represents a virtual machine worker in the simulation.
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

    /**
     * Creates a virtual machine runnable.
     *
     * @param name            VM name
     * @param vmId            VM numeric identifier
     * @param cycles          number of cycles to execute
     * @param clock           cycle synchronizer
     * @param resourceManager shared resource manager
     * @param workDuration    simulated workload duration in milliseconds
     * @param logger          logger for runtime events
     * @param priority        assigned VM priority
     * @param stats           per-VM statistics collector
     * @param statsCollector  global statistics collector
     */
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

    /**
     * Executes the VM lifecycle across all configured cycles.
     */
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
                    stats.recordCPUUse();
                    stats.recordWaitTime(System.currentTimeMillis() - cpuWaitStart);
                } else {
                    stats.recordTimeout();
                    statsCollector.recordTimeout();
                }

                // Request and use Memory
                setState(VMState.REQUESTING_RESOURCE);
                long memWaitStart = System.currentTimeMillis();
                if (resourceManager.acquireMemory(name)) {
                    setState(VMState.USING_RESOURCE);
                    Thread.sleep(250);
                    resourceManager.releaseMemory(name);
                    setState(VMState.RELEASING);
                    stats.recordMemoryUse();
                    stats.recordWaitTime(System.currentTimeMillis() - memWaitStart);
                } else {
                    stats.recordTimeout();
                    statsCollector.recordTimeout();
                }

                // Request and use Network
                setState(VMState.REQUESTING_RESOURCE);
                long netWaitStart = System.currentTimeMillis();
                if (resourceManager.acquireNetwork(name)) {
                    setState(VMState.USING_RESOURCE);
                    Thread.sleep(500);
                    resourceManager.releaseNetwork(name);
                    setState(VMState.RELEASING);
                    stats.recordNetworkUse();
                    stats.recordWaitTime(System.currentTimeMillis() - netWaitStart);
                } else {
                    stats.recordTimeout();
                    statsCollector.recordTimeout();
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

    /**
     * Updates the current VM state.
     *
     * @param newState next state
     */
    private void setState(VMState newState) {
        this.currentState = newState;
    }

    /**
     * @return current VM state
     */
    public VMState getCurrentState() {
        return currentState;
    }

    /**
     * @return assigned VM priority
     */
    public VMPriority getPriority() {
        return priority;
    }

    /**
     * @return per-VM statistics object
     */
    public VMStats getStats() {
        return stats;
    }

    /**
     * @return VM display name
     */
    public String getName() {
        return name;
    }

    /**
     * @return numeric VM identifier
     */
    public int getVMId() {
        return vmId;
    }
}