package entities;

import utils.GUILogger;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages multiple shared resources (CPU cores, Memory blocks, Network ports).
 * Each resource is controlled by a Semaphore with fair access policy.
 */
public class ResourceManager {
    private final Semaphore cpuSemaphore;
    private final Semaphore memorySemaphore;
    private final Semaphore networkSemaphore;

    private final Map<String, String> cpuHolders = new ConcurrentHashMap<>();
    private final Map<String, String> memoryHolders = new ConcurrentHashMap<>();
    private final Map<String, String> networkHolders = new ConcurrentHashMap<>();

    private final GUILogger logger;
    private final long timeout;

    /**
     * Create resource manager with specified semaphore permits.
     */
    public ResourceManager(int cpuPermits, int memoryPermits, int networkPermits, long timeout, GUILogger logger) {
        this.cpuSemaphore = new Semaphore(cpuPermits, true);
        this.memorySemaphore = new Semaphore(memoryPermits, true);
        this.networkSemaphore = new Semaphore(networkPermits, true);
        this.timeout = timeout;
        this.logger = logger;
    }

    /**
     * Try to acquire CPU core with timeout.
     */
    public boolean acquireCPU(String vmName) throws InterruptedException {
        if (cpuSemaphore.tryAcquire(timeout, TimeUnit.MILLISECONDS)) {
            String coreId = "CPU-" + (3 - cpuSemaphore.availablePermits());
            cpuHolders.put(coreId, vmName);
            logger.log(vmName, "acquired CPU core. (available: " + cpuSemaphore.availablePermits() + "/3)", "CPU");
            return true;
        } else {
            logger.log(vmName, "[TIMEOUT] Could not acquire CPU core within " + timeout + "ms", "TIMEOUT");
            return false;
        }
    }

    /**
     * Release CPU core.
     */
    public void releaseCPU(String vmName) {
        cpuSemaphore.release();
        cpuHolders.values().remove(vmName);
        logger.log(vmName, "released CPU core. (available: " + cpuSemaphore.availablePermits() + "/3)", "CPU");
    }

    /**
     * Try to acquire Memory block with timeout.
     */
    public boolean acquireMemory(String vmName) throws InterruptedException {
        if (memorySemaphore.tryAcquire(timeout, TimeUnit.MILLISECONDS)) {
            String memId = "MEM-" + (2 - memorySemaphore.availablePermits());
            memoryHolders.put(memId, vmName);
            logger.log(vmName, "acquired Memory block. (available: " + memorySemaphore.availablePermits() + "/2)",
                    "MEMORY");
            return true;
        } else {
            logger.log(vmName, "[TIMEOUT] Could not acquire Memory block within " + timeout + "ms", "TIMEOUT");
            return false;
        }
    }

    /**
     * Release Memory block.
     */
    public void releaseMemory(String vmName) {
        memorySemaphore.release();
        memoryHolders.values().remove(vmName);
        logger.log(vmName, "released Memory block. (available: " + memorySemaphore.availablePermits() + "/2)",
                "MEMORY");
    }

    /**
     * Try to acquire Network port with timeout.
     */
    public boolean acquireNetwork(String vmName) throws InterruptedException {
        if (networkSemaphore.tryAcquire(timeout, TimeUnit.MILLISECONDS)) {
            String portId = "PORT-" + (2 - networkSemaphore.availablePermits());
            networkHolders.put(portId, vmName);
            logger.log(vmName, "acquired Network port. (available: " + networkSemaphore.availablePermits() + "/2)",
                    "NETWORK");
            return true;
        } else {
            logger.log(vmName, "[TIMEOUT] Could not acquire Network port within " + timeout + "ms", "TIMEOUT");
            return false;
        }
    }

    /**
     * Release Network port.
     */
    public void releaseNetwork(String vmName) {
        networkSemaphore.release();
        networkHolders.values().remove(vmName);
        logger.log(vmName, "released Network port. (available: " + networkSemaphore.availablePermits() + "/2)",
                "NETWORK");
    }

    // Getters for GUI
    public int getCPUAvailable() {
        return cpuSemaphore.availablePermits();
    }

    public int getMemoryAvailable() {
        return memorySemaphore.availablePermits();
    }

    public int getNetworkAvailable() {
        return networkSemaphore.availablePermits();
    }

    public Map<String, String> getCPUHolders() {
        return cpuHolders;
    }

    public Map<String, String> getMemoryHolders() {
        return memoryHolders;
    }

    public Map<String, String> getNetworkHolders() {
        return networkHolders;
    }
}
