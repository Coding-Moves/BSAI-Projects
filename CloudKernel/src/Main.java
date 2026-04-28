import ui.CloudKernelGUI;

import javax.swing.SwingUtilities;

/**
 * Application entry point for CloudKernel.
 */
public class Main {

    /**
     * Starts the CloudKernel GUI on the Swing event dispatch thread.
     *
     * @param args command-line arguments (unused)
     */
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new CloudKernelGUI().setVisible(true));
    }
}