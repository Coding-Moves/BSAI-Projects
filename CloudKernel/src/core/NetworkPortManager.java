package core;

import utils.Logger;
import java.util.concurrent.Semaphore;

// Manages limited network ports using a fair semaphore.
public class NetworkPortManager {

    private static final int TOTAL_PORTS = 2;
    private final Semaphore networkPorts = new Semaphore(TOTAL_PORTS, true);

    public void acquirePort(String vmName) throws InterruptedException {
        Logger.log(vmName,
                "Requesting Network Port... (available: " + networkPorts.availablePermits() + "/" + TOTAL_PORTS + ")",
                Logger.YELLOW);

        networkPorts.acquire();
        int inUse = TOTAL_PORTS - networkPorts.availablePermits();

        Logger.log(vmName,
                "Network Port GRANTED. (in use: " + inUse + "/" + TOTAL_PORTS + ") Transmitting data...",
                Logger.GREEN);
    }

    public void releasePort(String vmName) {
        networkPorts.release();
        Logger.log(vmName,
                "Network Port RELEASED. (available: " + networkPorts.availablePermits() + "/" + TOTAL_PORTS + ")",
                Logger.CYAN);
    }
}