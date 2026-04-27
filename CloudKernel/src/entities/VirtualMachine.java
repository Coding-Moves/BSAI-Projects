package entities;

import core.ClockSynchronizer;
import core.NetworkPortManager;
import utils.Logger;
import java.util.concurrent.BrokenBarrierException;

// Represents one VM thread in the simulation.
public class VirtualMachine implements Runnable {

    private final String name;
    private final int cycles;
    private final ClockSynchronizer clock;
    private final NetworkPortManager networkManager;
    private final int workDuration;

    public VirtualMachine(String name, int cycles, ClockSynchronizer clock,
            NetworkPortManager networkManager, int workDuration) {
        this.name = name;
        this.cycles = cycles;
        this.clock = clock;
        this.networkManager = networkManager;
        this.workDuration = workDuration;
    }

    @Override
    public void run() {
        Logger.log(name, "Virtual Machine is ONLINE.", Logger.GREEN);

        try {
            for (int i = 1; i <= cycles; i++) {
                Logger.log(name, "Cycle " + i + " - executing workload...", Logger.CYAN);
                Thread.sleep(workDuration);

                networkManager.acquirePort(name);
                Thread.sleep(500);
                networkManager.releasePort(name);

                clock.sync(name);
            }

            Logger.log(name, "All cycles complete. Shutting down gracefully. [OK]", Logger.GREEN);

        } catch (InterruptedException e) {
            Logger.log(name, "Interrupted during execution!", Logger.RED);
            Thread.currentThread().interrupt();
        } catch (BrokenBarrierException e) {
            Logger.log(name, "Clock barrier broken - system error!", Logger.RED);
        }
    }
}