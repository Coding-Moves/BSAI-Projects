package utils;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Logger that writes to terminal output and GUI listeners simultaneously.
 */
public class GUILogger {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss.S");

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
    private static final List<LogListener> listeners = new CopyOnWriteArrayList<>();

    /** Creates a logger instance. */
    public GUILogger() {
    }

    /**
     * Sets logger verbosity.
     *
     * @param level one of VERBOSE, NORMAL, QUIET
     */
    public static void setLogLevel(int level) {
        logLevel = level;
    }

    /**
     * Registers a GUI log listener.
     *
     * @param listener listener to register
     */
    public static void addListener(LogListener listener) {
        listeners.add(listener);
    }

    /**
     * Removes a GUI log listener.
     *
     * @param listener listener to remove
     */
    public static void removeListener(LogListener listener) {
        listeners.remove(listener);
    }

    /**
     * Logs a categorized VM message.
     *
     * @param vmName   VM name or source actor
     * @param message  event message
     * @param category message category
     */
    public static void log(String vmName, String message, String category) {
        if (logLevel == QUIET)
            return;

        String timestamp = LocalTime.now().format(TIME_FORMAT);
        String color = getCategoryColor(category);
        String logLine = String.format(
            "%s[%s] [%-8s] %s -> %s%s",
                color, timestamp, category, vmName, message, RESET);

        // Print to console
        System.out.println(logLine);

        // Notify GUI listeners
        notifyListeners(new LogEntry(timestamp, category, vmName, message, color));
    }

    /**
     * Logs a system boot event.
     *
     * @param message event message
     */
    public static void boot(String message) {
        if (logLevel == QUIET)
            return;

        String timestamp = LocalTime.now().format(TIME_FORMAT);
        String logLine = String.format(
                "%s[%s] [%-8s] %s%s",
                CYAN, timestamp, "BOOT", message, RESET);

        System.out.println(logLine);
        notifyListeners(new LogEntry(timestamp, "BOOT", "SYSTEM", message, CYAN));
    }

    /**
     * Logs a cycle separator block.
     *
     * @param cycleNum cycle number
     */
    public static void cycleSeparator(int cycleNum) {
        if (logLevel == QUIET)
            return;

        System.out.println(BOLD + "═══════════════════════════════════════════════════════════" + RESET);
        System.out.println(BOLD + CYAN + "  CYCLE #" + cycleNum + " BEGINS" + RESET);
        System.out.println(BOLD + "═══════════════════════════════════════════════════════════" + RESET);
    }

    /**
     * Logs cycle completion.
     *
     * @param cycleNum cycle number
     */
    public static void cycleComplete(int cycleNum) {
        if (logLevel == QUIET)
            return;

        System.out.println(BOLD + CYAN + "  CYCLE #" + cycleNum + " COMPLETE" + RESET);
        System.out.println(BOLD + "═══════════════════════════════════════════════════════════" + RESET);
    }

    /**
     * Returns ANSI color based on message category.
     *
     * @param category event category
     * @return ANSI color code
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

    /**
     * Emits a log entry to all listeners.
     *
     * @param entry formatted log entry
     */
    private static void notifyListeners(LogEntry entry) {
        for (LogListener listener : listeners) {
            listener.onLogEntry(entry);
        }
    }

    /**
     * Immutable GUI log entry payload.
     */
    public static class LogEntry {
        public final String timestamp;
        public final String category;
        public final String vmName;
        public final String message;
        public final String color;

        /**
         * Creates an immutable log entry payload.
         *
         * @param timestamp event timestamp
         * @param category  category tag
         * @param vmName    source VM or component
         * @param message   message body
         * @param color     ANSI color used for console output
         */
        public LogEntry(String timestamp, String category, String vmName, String message, String color) {
            this.timestamp = timestamp;
            this.category = category;
            this.vmName = vmName;
            this.message = message;
            this.color = color;
        }

        /**
         * @return formatted display text
         */
        @Override
        public String toString() {
            return String.format("[%s] [%s] %s -> %s", timestamp, category, vmName, message);
        }
    }

    /**
     * Listener contract for GUI log streams.
     */
    public interface LogListener {
        /**
         * Receives one emitted log entry.
         *
         * @param entry log entry
         */
        void onLogEntry(LogEntry entry);
    }

    /** Writes a visual separator to terminal output. */
    public static void separator() {
        if (logLevel == QUIET)
            return;
        System.out.println(BOLD + "─".repeat(65) + RESET);
    }

    /**
     * Writes a section heading to terminal output.
     *
     * @param title heading text
     */
    public static void section(String title) {
        if (logLevel == QUIET)
            return;
        System.out.println();
        separator();
        System.out.println(BOLD + "  " + title + RESET);
        separator();
    }
}
