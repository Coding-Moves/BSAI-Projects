package config;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Loads simulator configuration from config.properties.
 * Falls back to sane defaults when file loading fails.
 */
public class ConfigLoader {

    private static final String CONFIG_FILE = "config.properties";
    private final Properties properties;

    /**
     * Creates a loader and immediately reads configuration values.
     */
    public ConfigLoader() {
        properties = new Properties();
        loadConfig();
    }

    /**
     * Loads configuration from file or uses defaults.
     */
    private void loadConfig() {
        try (InputStream input = new FileInputStream(CONFIG_FILE)) {
            properties.load(input);
            System.out.println("[CONFIG] Loaded configuration from: " + CONFIG_FILE);
        } catch (FileNotFoundException e) {
            System.out.println("[CONFIG] config.properties not found. Using defaults.");
            loadDefaults();
        } catch (IOException e) {
            System.out.println("[CONFIG] Error reading config file: " + e.getMessage());
            loadDefaults();
        }
    }

    /**
     * Applies default values for all recognized properties.
     */
    private void loadDefaults() {
        properties.setProperty("vm.count", "5");
        properties.setProperty("cycle.count", "4");
        properties.setProperty("semaphore.cpu.permits", "3");
        properties.setProperty("semaphore.memory.permits", "2");
        properties.setProperty("semaphore.network.permits", "2");
        properties.setProperty("task.duration.min", "500");
        properties.setProperty("task.duration.max", "1500");
        properties.setProperty("timeout.duration", "2000");
        properties.setProperty("gui.enabled", "true");
        properties.setProperty("logging.level", "NORMAL");
        properties.setProperty("stats.enabled", "true");
    }

    /**
     * Reads an integer property.
     *
     * @param key          property name
     * @param defaultValue fallback value
     * @return parsed integer or fallback
     */
    public int getInt(String key, int defaultValue) {
        try {
            return Integer.parseInt(properties.getProperty(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            System.out.println("[CONFIG] Invalid integer for key: " + key + ", using default: " + defaultValue);
            return defaultValue;
        }
    }

    /**
     * Reads a long property.
     *
     * @param key          property name
     * @param defaultValue fallback value
     * @return parsed long or fallback
     */
    public long getLong(String key, long defaultValue) {
        try {
            return Long.parseLong(properties.getProperty(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            System.out.println("[CONFIG] Invalid long for key: " + key + ", using default: " + defaultValue);
            return defaultValue;
        }
    }

    /**
     * Reads a string property.
     *
     * @param key          property name
     * @param defaultValue fallback value
     * @return property value or fallback
     */
    public String getString(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    /**
     * Reads a boolean property.
     *
     * @param key          property name
     * @param defaultValue fallback value
     * @return parsed boolean or fallback
     */
    public boolean getBoolean(String key, boolean defaultValue) {
        String value = properties.getProperty(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(value);
    }

    /**
     * @return configured VM count
     */
    public int getVMCount() {
        return getInt("vm.count", 5);
    }

    /**
     * @return configured cycle count per VM
     */
    public int getCycleCount() {
        return getInt("cycle.count", 4);
    }

    /**
     * @return configured CPU permits
     */
    public int getCPUPermits() {
        return getInt("semaphore.cpu.permits", 3);
    }

    /**
     * @return configured memory permits
     */
    public int getMemoryPermits() {
        return getInt("semaphore.memory.permits", 2);
    }

    /**
     * @return configured network permits
     */
    public int getNetworkPermits() {
        return getInt("semaphore.network.permits", 2);
    }

    /**
     * @return minimum task duration in milliseconds
     */
    public int getTaskDurationMin() {
        return getInt("task.duration.min", 500);
    }

    /**
     * @return maximum task duration in milliseconds
     */
    public int getTaskDurationMax() {
        return getInt("task.duration.max", 1500);
    }

    /**
     * @return resource acquisition timeout in milliseconds
     */
    public long getTimeoutDuration() {
        return getLong("timeout.duration", 2000);
    }

    /**
     * @return true if GUI mode is enabled
     */
    public boolean isGUIEnabled() {
        return getBoolean("gui.enabled", true);
    }

    /**
     * @return configured logging level label
     */
    public String getLoggingLevel() {
        return getString("logging.level", "NORMAL");
    }

    /**
     * @return true if stats collection is enabled
     */
    public boolean isStatsEnabled() {
        return getBoolean("stats.enabled", true);
    }
}
