package config;

import java.io.*;
import java.util.*;

/**
 * Loads simulation configuration from config.properties file.
 * Falls back to defaults if file is missing.
 */
public class ConfigLoader {

    private static final String CONFIG_FILE = "config.properties";
    private Properties properties;

    public ConfigLoader() {
        properties = new Properties();
        loadConfig();
    }

    private void loadConfig() {
        try (InputStream input = new FileInputStream(CONFIG_FILE)) {
            properties.load(input);
            System.out.println("[CONFIG] Loaded configuration from: " + CONFIG_FILE);
        } catch (FileNotFoundException e) {
            System.out.println("[CONFIG] ⚠️ config.properties not found. Using defaults...");
            loadDefaults();
        } catch (IOException e) {
            System.out.println("[CONFIG] Error reading config file: " + e.getMessage());
            loadDefaults();
        }
    }

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

    public int getInt(String key, int defaultValue) {
        try {
            return Integer.parseInt(properties.getProperty(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            System.out.println("[CONFIG] Invalid integer for key: " + key + ", using default: " + defaultValue);
            return defaultValue;
        }
    }

    public long getLong(String key, long defaultValue) {
        try {
            return Long.parseLong(properties.getProperty(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            System.out.println("[CONFIG] Invalid long for key: " + key + ", using default: " + defaultValue);
            return defaultValue;
        }
    }

    public String getString(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        String value = properties.getProperty(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(value);
    }

    public int getVMCount() {
        return getInt("vm.count", 5);
    }

    public int getCycleCount() {
        return getInt("cycle.count", 4);
    }

    public int getCPUPermits() {
        return getInt("semaphore.cpu.permits", 3);
    }

    public int getMemoryPermits() {
        return getInt("semaphore.memory.permits", 2);
    }

    public int getNetworkPermits() {
        return getInt("semaphore.network.permits", 2);
    }

    public int getTaskDurationMin() {
        return getInt("task.duration.min", 500);
    }

    public int getTaskDurationMax() {
        return getInt("task.duration.max", 1500);
    }

    public long getTimeoutDuration() {
        return getLong("timeout.duration", 2000);
    }

    public boolean isGUIEnabled() {
        return getBoolean("gui.enabled", true);
    }

    public String getLoggingLevel() {
        return getString("logging.level", "NORMAL");
    }

    public boolean isStatsEnabled() {
        return getBoolean("stats.enabled", true);
    }
}
