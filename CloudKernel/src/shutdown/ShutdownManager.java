package shutdown;

import utils.GUILogger;
import utils.StatsCollector;

/**
 * Registers a JVM shutdown hook to print a graceful summary.
 */
public class ShutdownManager {
    private static StatsCollector statsCollector;

    /**
     * Creates and registers the shutdown hook.
     *
     * @param stats stats collector used for summary output
     */
    public ShutdownManager(StatsCollector stats) {
        ShutdownManager.statsCollector = stats;
        setupShutdownHook();
    }

    /** Registers the shutdown hook with the runtime. */
    private void setupShutdownHook() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println();
            GUILogger.section("INTERRUPTED - GRACEFUL SHUTDOWN");
            System.out.println(GUILogger.YELLOW + "Received shutdown signal..." + GUILogger.RESET);

            if (statsCollector != null) {
                statsCollector.printSummary();
            }

            System.out.println();
            System.out.println(GUILogger.GREEN + "CloudKernel shut down gracefully." + GUILogger.RESET);
            System.out.println();
        }));
    }
}
