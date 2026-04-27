package core;

import utils.GUILogger;
import java.util.concurrent.Semaphore;

/**
 * Manages limited network ports using a fair semaphore.
 * Ensures only a limited number of VMs can access the network simultaneously.
 */
public class NetworkPortManager {

    private static final int TOTAL_PORTS = 2;
    private final Semaphore networkPorts = new Semaphore(TOTAL_PORTS, true);
    private final GUILogger logger;

    public NetworkPortManager(GUILogger logger) {
        this.logger = logger;
    }

    public void acquirePort(String vmName) throws InterruptedException {
        logger.log(vmName,
                "Requesting Network Port... (available: " + networkPorts.availablePermits() + "/" + TOTAL_PORTS + ")",
                "NETWORK");

        networkPorts.acquire();
        int inUse = TOTAL_PORTS - networkPorts.availablePermits();

        logger.log(vmName,
                "Network Port GRANTED. (in use: " + inUse + "/" + TOTAL_PORTS + ") Transmitting data...",
                "NETWORK");
    }

    public void releasePort(String vmName) {
        networkPorts.release();
        logger.log(vmName,
                "Network Port RELEASED. (available: " + networkPorts.availablePermits() + "/" + TOTAL_PORTS + ")",
                "NETWORK");
    }

    public Semaphore getNetworkPorts() {
        return networkPorts;
    }
}