package entities;

/**
 * Priority levels assigned to virtual machines.
 */
public enum VMPriority {
    LOW(1, "LOW", "\u001B[36m"), // Cyan
    MEDIUM(2, "MEDIUM", "\u001B[33m"), // Yellow
    HIGH(3, "HIGH", "\u001B[31m"); // Red

    private final int value;
    private final String label;
    private final String color;

    VMPriority(int value, String label, String color) {
        this.value = value;
        this.label = label;
        this.color = color;
    }

    /**
     * @return numeric priority value
     */
    public int getValue() {
        return value;
    }

    /**
     * @return display label
     */
    public String getLabel() {
        return label;
    }

    /**
     * @return ANSI color code for console output
     */
    public String getColor() {
        return color;
    }

    /**
     * Returns a random priority.
     *
     * @return randomly selected priority
     */
    public static VMPriority getRandomPriority() {
        int rand = (int) (Math.random() * 3);
        return values()[rand];
    }

    @Override
    public String toString() {
        return color + label + "\u001B[0m";
    }
}
