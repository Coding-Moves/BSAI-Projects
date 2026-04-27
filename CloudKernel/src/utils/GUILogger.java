package utils;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;

/**
 * Enhanced logger that outputs to both console and GUI.
 * Supports colored terminal output and structured logging.
 */
public class GUILogger {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    // ANSI Color codes
    public static final String RESET = "\u001B[0m";
    public static final String BOLD = "\u001B[1m";
    public static final String RED = "\u001B[31m";
    public static final String GREEN = "\u001B[32m";
    public static final String YELLOW = "\u001B[33m";
    public static final String BLUE = "\u001B[34m";
    public static final String PURPLE = "\u001B[35m";
    public static final String CYAN = "\u001B[36m";
    public static final String WHITE = "\u001B[37m";

    // Log level constants
    public static final int VERBOSE = 0;
    public static final int NORMAL = 1;
    public static final int QUIET = 2;

    private static int logLevel = NORMAL;
    private static List<LogListener> listeners = new CopyOnWriteArrayList<>();

    public GUILogger() {
    }

    public static void setLogLevel(int level) {
        logLevel = level;
    }

    public static void addListener(LogListener listener) {
        listeners.add(listener);
    }

    public static void removeListener(LogListener listener) {
        listeners.remove(listener);
    }

    /**
     * Log a message with component tag, VM name, and category.
     * Format: [HH:MM:SS] [COMPONENT] VM-X → message
     */
    public static void log(String vmName, String message, String category) {
        if (logLevel > VERBOSE)
            return;

        String timestamp = LocalTime.now().format(TIME_FORMAT);
        String color = getCategoryColor(category);
        String logLine = String.format(
                "%s[%s] [%-8s] %s → %s%s",
                color, timestamp, category, vmName, message, RESET);

        // Print to console
        System.out.println(logLine);

        // Notify GUI listeners
        notifyListeners(new LogEntry(timestamp, category, vmName, message, color));
    }

    /**
     * Log a boot event.
     */
    public static void boot(String message) {
        if (logLevel > VERBOSE)
            return;

        String timestamp = LocalTime.now().format(TIME_FORMAT);
        String logLine = String.format(
                "%s[%s] [%-8s] %s%s",
                CYAN, timestamp, "BOOT", message, RESET);

        System.out.println(logLine);
        notifyListeners(new LogEntry(timestamp, "BOOT", "SYSTEM", message, CYAN));
    }

    /**
     * Log a cycle separator.
     */
    public static void cycleSeparator(int cycleNum) {
        if (logLevel > VERBOSE)
            return;

        System.out.println(BOLD + "═══════════════════════════════════════════════════════════" + RESET);
        System.out.println(BOLD + CYAN + "  CYCLE #" + cycleNum + " BEGINS" + RESET);
        System.out.println(BOLD + "═══════════════════════════════════════════════════════════" + RESET);
    }

    /**
     * Log cycle completion.
     */
    public static void cycleComplete(int cycleNum) {
        if (logLevel > VERBOSE)
            return;

        System.out.println(BOLD + CYAN + "  ✓ CYCLE #" + cycleNum + " COMPLETE" + RESET);
        System.out.println(BOLD + "═══════════════════════════════════════════════════════════" + RESET);
    }

    /**
     * Get color for log category.
     */
    private static String getCategoryColor(String category) {
        switch (category.toUpperCase()) {
            case "BOOT":
                return CYAN;
            case "CPU":
            case "NETWORK":
            case "MEMORY":
                return GREEN;
            case "WAITING":
                return YELLOW;
            case "BARRIER":
                return PURPLE;
            case "TIMEOUT":
            case "ERROR":
                return RED;
            default:
                return WHITE;
        }
    }

    private static void notifyListeners(LogEntry entry) {
        for (LogListener listener : listeners) {
            listener.onLogEntry(entry);
        }
    }

    /**
     * Represents a log entry for GUI consumption.
     */
    public static class LogEntry {
        public final String timestamp;
        public final String category;
        public final String vmName;
        public final String message;
        public final String color;

        public LogEntry(String timestamp, String category, String vmName, String message, String color) {
            this.timestamp = timestamp;
            this.category = category;
            this.vmName = vmName;
            this.message = message;
            this.color = color;
        }

        @Override
        public String toString() {
            return String.format("[%s] [%s] %s → %s", timestamp, category, vmName, message);
        }
    }

    /**
     * Interface for GUI to listen to log events.
     */
    public interface LogListener {
        void onLogEntry(LogEntry entry);
    }

    public static void separator() {
        if (logLevel > VERBOSE)
            return;
        System.out.println(BOLD + "─".repeat(65) + RESET);
    }

    public static void section(String title) {
        if (logLevel > VERBOSE)
            return;
        System.out.println();
        separator();
        System.out.println(BOLD + "  " + title + RESET);
        separator();
    }
}
