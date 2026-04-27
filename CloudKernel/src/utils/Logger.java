package utils;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

// Small utility for formatted console logging.
public class Logger {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public static final String RESET = "\u001B[0m";
    public static final String GREEN = "\u001B[32m";
    public static final String CYAN = "\u001B[36m";
    public static final String YELLOW = "\u001B[33m";
    public static final String RED = "\u001B[31m";
    public static final String BOLD = "\u001B[1m";

    private Logger() {
        // Prevent instantiation.
    }

    public static void log(String tag, String message, String color) {
        String timestamp = LocalTime.now().format(TIME_FORMAT);
        System.out.printf("%s[%s] %-12s%s %s%n",
                color, timestamp, "[" + tag + "]", RESET, message);
    }

    public static void separator() {
        System.out.println(BOLD + "-".repeat(65) + RESET);
    }

    public static void section(String title) {
        System.out.println();
        separator();
        System.out.println(BOLD + "  " + title + RESET);
        separator();
    }
}