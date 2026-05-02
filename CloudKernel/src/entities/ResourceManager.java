package entities;

import utils.GUILogger;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages shared CPU, memory, and network resources using fair semaphores.
 */
public class ResourceManager {
    private final Semaphore cpuSemaphore;
    private final Semaphore memorySemaphore;
    private final Semaphore networkSemaphore;
    private final int cpuPermits;
    private final int memoryPermits;
    private final int networkPermits;

    private final Map<String, String> cpuHolders = new ConcurrentHashMap<>();
    private final Map<String, String> memoryHolders = new ConcurrentHashMap<>();
    private final Map<String, String> networkHolders = new ConcurrentHashMap<>();

    private final GUILogger logger;
    private final long timeout;

    /**
     * Creates a resource manager.
     *
     * @param cpuPermits     total CPU permits
     * @param memoryPermits  total memory permits
     * @param networkPermits total network permits
     * @param timeout        resource acquisition timeout in milliseconds
     * @param logger         logger for resource events
     */
    public ResourceManager(int cpuPermits, int memoryPermits, int networkPermits, long timeout, GUILogger logger) {
        this.cpuSemaphore = new Semaphore(cpuPermits, true);
        this.memorySemaphore = new Semaphore(memoryPermits, true);
        this.networkSemaphore = new Semaphore(networkPermits, true);
        this.cpuPermits = cpuPermits;
        this.memoryPermits = memoryPermits;
        this.networkPermits = networkPermits;
        this.timeout = timeout;
        this.logger = logger;
    }

    /**
     * Attempts to acquire a CPU permit.
     *
     * @param vmName VM requesting the permit
     * @return true if permit acquired, false on timeout
     * @throws InterruptedException if interrupted while waiting
     */
    public boolean acquireCPU(String vmName) throws InterruptedException {
        if (cpuSemaphore.tryAcquire(timeout, TimeUnit.MILLISECONDS)) {
            String coreId = "CPU-" + (cpuPermits - cpuSemaphore.availablePermits());
            cpuHolders.put(coreId, vmName);
            logger.log(vmName,
                    "acquired CPU core. (available: " + cpuSemaphore.availablePermits() + "/" + cpuPermits + ")",
                    "CPU");
            return true;
        } else {
            logger.log(vmName, "[TIMEOUT] Could not acquire CPU core within " + timeout + "ms", "TIMEOUT");
            return false;
        }
    }

    /**
     * Releases a CPU permit for the specified VM.
     *
     * @param vmName VM releasing the permit
     */
    public void releaseCPU(String vmName) {
        cpuSemaphore.release();
        cpuHolders.values().remove(vmName);
        logger.log(vmName,
                "released CPU core. (available: " + cpuSemaphore.availablePermits() + "/" + cpuPermits + ")",
                "CPU");
    }

    /**
     * Attempts to acquire a memory permit.
     *
     * @param vmName VM requesting the permit
     * @return true if permit acquired, false on timeout
     * @throws InterruptedException if interrupted while waiting
     */
    public boolean acquireMemory(String vmName) throws InterruptedException {
        if (memorySemaphore.tryAcquire(timeout, TimeUnit.MILLISECONDS)) {
            String memId = "MEM-" + (memoryPermits - memorySemaphore.availablePermits());
            memoryHolders.put(memId, vmName);
            logger.log(vmName,
                    "acquired Memory block. (available: " + memorySemaphore.availablePermits() + "/"
                            + memoryPermits + ")",
                    "MEMORY");
            return true;
        } else {
            logger.log(vmName, "[TIMEOUT] Could not acquire Memory block within " + timeout + "ms", "TIMEOUT");
            return false;
        }
    }

    /**
     * Releases a memory permit for the specified VM.
     *
     * @param vmName VM releasing the permit
     */
    public void releaseMemory(String vmName) {
        memorySemaphore.release();
        memoryHolders.values().remove(vmName);
        logger.log(vmName,
                "released Memory block. (available: " + memorySemaphore.availablePermits() + "/" + memoryPermits
                        + ")",
                "MEMORY");
    }

    /**
     * Attempts to acquire a network permit.
     *
     * @param vmName VM requesting the permit
     * @return true if permit acquired, false on timeout
     * @throws InterruptedException if interrupted while waiting
     */
    public boolean acquireNetwork(String vmName) throws InterruptedException {
        if (networkSemaphore.tryAcquire(timeout, TimeUnit.MILLISECONDS)) {
            String portId = "PORT-" + (networkPermits - networkSemaphore.availablePermits());
            networkHolders.put(portId, vmName);
            logger.log(vmName,
                    "acquired Network port. (available: " + networkSemaphore.availablePermits() + "/"
                            + networkPermits + ")",
                    "NETWORK");
            return true;
        } else {
            logger.log(vmName, "[TIMEOUT] Could not acquire Network port within " + timeout + "ms", "TIMEOUT");
            return false;
        }
    }

    /**
     * Releases a network permit for the specified VM.
     *
     * @param vmName VM releasing the permit
     */
    public void releaseNetwork(String vmName) {
        networkSemaphore.release();
        networkHolders.values().remove(vmName);
        logger.log(vmName,
                "released Network port. (available: " + networkSemaphore.availablePermits() + "/" + networkPermits
                        + ")",
                "NETWORK");
    }

    /**
     * @return available CPU permits
     */
    public int getCPUAvailable() {
        return cpuSemaphore.availablePermits();
    }

    /**
     * @return available memory permits
     */
    public int getMemoryAvailable() {
        return memorySemaphore.availablePermits();
    }

    /**
     * @return available network permits
     */
    public int getNetworkAvailable() {
        return networkSemaphore.availablePermits();
    }

    /**
     * @return map of CPU slot holders
     */
    public Map<String, String> getCPUHolders() {
        return cpuHolders;
    }

    /**
     * @return map of memory slot holders
     */
    public Map<String, String> getMemoryHolders() {
        return memoryHolders;
    }

    /**
     * @return map of network slot holders
     */
    public Map<String, String> getNetworkHolders() {
        return networkHolders;
    }
}
