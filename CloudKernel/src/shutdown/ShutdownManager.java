package shutdown;

import utils.GUILogger;
import utils.StatsCollector;

/**
 * Handles graceful shutdown on Ctrl+C (SIGINT).
 * Prints partial statistics if interrupted during execution.
 */
public class ShutdownManager {
    private static StatsCollector statsCollector;

    public ShutdownManager(StatsCollector stats) {
        ShutdownManager.statsCollector = stats;
        setupShutdownHook();
    }

    private void setupShutdownHook() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println();
            GUILogger.section("INTERRUPTED - GRACEFUL SHUTDOWN");
            System.out.println(GUILogger.YELLOW + "Received shutdown signal..." + GUILogger.RESET);

            if (statsCollector != null) {
                statsCollector.printSummary();
            }

            System.out.println();
            System.out.println(GUILogger.GREEN + "✓ CloudKernel shut down gracefully." + GUILogger.RESET);
            System.out.println();
        }));
    }
}
