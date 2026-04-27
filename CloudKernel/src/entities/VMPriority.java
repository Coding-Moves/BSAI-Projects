package entities;

/**
 * VM Priority levels for semaphore permit acquisition.
 * Higher priority VMs get preference when resources are limited.
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

    public int getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }

    public static VMPriority getRandomPriority() {
        int rand = (int) (Math.random() * 3);
        return values()[rand];
    }

    @Override
    public String toString() {
        return color + label + "\u001B[0m";
    }
}
