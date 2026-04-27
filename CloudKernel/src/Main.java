import ui.CloudKernelGUI;
import javax.swing.SwingUtilities;

// Entry point for the CloudKernel Hypervisor Simulator GUI.
// This now launches a Java Swing GUI instead of console output.
public class Main {

    public static void main(String[] args) {
        // Launch the GUI on the Event Dispatch Thread
        SwingUtilities.invokeLater(CloudKernelGUI::new);
    }
}