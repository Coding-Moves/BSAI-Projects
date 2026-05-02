package entities;

/**
 * Defines VM lifecycle states used by the simulator and dashboard.
 */
public enum VMState {
    BOOTING("BOOTING", "\u001B[33m"), // Yellow
    READY("READY", "\u001B[32m"), // Green
    RUNNING("RUNNING", "\u001B[36m"), // Cyan
    REQUESTING_RESOURCE("REQUESTING", "\u001B[33m"), // Yellow
    USING_RESOURCE("USING", "\u001B[32m"), // Green
    RELEASING("RELEASING", "\u001B[34m"), // Blue
    BARRIER_WAIT("BARRIER WAIT", "\u001B[35m"), // Purple
    TIMEOUT("TIMEOUT", "\u001B[31m"), // Red
    SHUTDOWN("SHUTDOWN", "\u001B[37m"); // White

    private final String label;
    private final String color;

    VMState(String label, String color) {
        this.label = label;
        this.color = color;
    }

    /**
     * @return display label for the state
     */
    public String getLabel() {
        return label;
    }

    /**
     * @return ANSI color code used for console rendering
     */
    public String getColor() {
        return color;
    }

    @Override
    public String toString() {
        return color + label + "\u001B[0m";
    }
}
