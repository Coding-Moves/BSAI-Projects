package ui;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

/**
 * Visualizes CyclicBarrier arrivals and cycle transitions.
 */
public class BarrierPanel extends JPanel {
    private static final Color BG_PANEL = new Color(16, 24, 38);
    private static final Color TEXT_PRIMARY = new Color(200, 216, 240);
    private static final Color ACCENT_PURPLE = new Color(180, 80, 255);
    private static final Color ACCENT_GREEN = new Color(0, 255, 136);
    private static final Color ACCENT_CYAN = new Color(0, 212, 255);

    private final JLabel cycleLabel;
    private final JLabel arrivedLabel;
    private final JLabel[] dots;
    private final Timer flashTimer;

    /**
     * Creates the barrier panel.
     *
     * @param vmCount number of VM participants
     */
    public BarrierPanel(int vmCount) {
        setLayout(new BorderLayout(0, 8));
        setBackground(BG_PANEL);
        setBorder(new EmptyBorder(8, 10, 8, 10));

        JLabel title = new JLabel("CYCLIC BARRIER - Global Clock Sync");
        title.setForeground(ACCENT_PURPLE);
        title.setFont(CloudKernelGUI.uiFont(Font.BOLD, 12));
        add(title, BorderLayout.NORTH);

        JPanel center = new JPanel(new BorderLayout());
        center.setOpaque(false);

        JPanel dotsRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        dotsRow.setOpaque(false);
        dots = new JLabel[vmCount];
        for (int i = 0; i < vmCount; i++) {
            JLabel dot = new JLabel("\u25cf VM-" + (i + 1));
            dot.setFont(CloudKernelGUI.getSymbolFont(Font.BOLD, 11));
            dot.setForeground(new Color(92, 99, 116));
            dots[i] = dot;
            dotsRow.add(dot);
        }

        center.add(dotsRow, BorderLayout.CENTER);

        JPanel infoRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 18, 0));
        infoRow.setOpaque(false);
        cycleLabel = new JLabel("CYCLE: 0");
        cycleLabel.setForeground(TEXT_PRIMARY);
        cycleLabel.setFont(CloudKernelGUI.uiFont(Font.BOLD, 11));
        arrivedLabel = new JLabel("Arrived: 0 / " + vmCount);
        arrivedLabel.setForeground(ACCENT_CYAN);
        arrivedLabel.setFont(CloudKernelGUI.uiFont(Font.PLAIN, 11));
        infoRow.add(cycleLabel);
        infoRow.add(arrivedLabel);

        center.add(infoRow, BorderLayout.SOUTH);
        add(center, BorderLayout.CENTER);

        flashTimer = new Timer(260, e -> resetAfterFlash());
        flashTimer.setRepeats(false);
    }

    /**
     * Marks one VM as arrived.
     *
     * @param vmId         VM id
     * @param arrivedCount arrived count
     * @param vmCount      total VM count
     */
    public void markArrived(int vmId, int arrivedCount, int vmCount) {
        if (vmId >= 1 && vmId <= dots.length) {
            dots[vmId - 1].setForeground(ACCENT_PURPLE);
        }
        arrivedLabel.setText("Arrived: " + arrivedCount + " / " + vmCount);
    }

    /**
     * Updates displayed cycle number.
     *
     * @param cycle cycle number
     */
    public void setCycle(int cycle) {
        cycleLabel.setText("CYCLE: " + cycle);
    }

    /**
     * Flashes all dots green and schedules state reset.
     *
     * @param vmCount total VM count
     */
    public void flashAllAndReset(int vmCount) {
        for (JLabel dot : dots) {
            dot.setForeground(ACCENT_GREEN);
        }
        arrivedLabel.setText("Arrived: " + vmCount + " / " + vmCount);
        flashTimer.restart();
    }

    /** Resets dot state after flash animation. */
    private void resetAfterFlash() {
        for (JLabel dot : dots) {
            dot.setForeground(new Color(92, 99, 116));
        }
        String text = arrivedLabel.getText();
        if (text.contains("/")) {
            String[] parts = text.split("/");
            arrivedLabel.setText("Arrived: 0 / " + parts[1].trim());
        }
    }
}
