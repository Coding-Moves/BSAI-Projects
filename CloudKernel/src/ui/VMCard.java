package ui;

import entities.VMPriority;
import entities.VMState;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;

/**
 * Visual card representation for a single VM.
 */
public class VMCard extends JPanel {
    private static final Color BG_CARD = new Color(16, 24, 38);
    private static final Color TEXT_PRIMARY = new Color(200, 216, 240);
    private static final Color TEXT_MUTED = new Color(130, 150, 180);
    private static final Color ACCENT_CYAN = new Color(0, 212, 255);
    private static final Color ACCENT_GREEN = new Color(0, 255, 136);
    private static final Color ACCENT_AMBER = new Color(255, 191, 0);
    private static final Color ACCENT_PURPLE = new Color(180, 80, 255);
    private static final Color ACCENT_RED = new Color(255, 90, 90);

    private final String vmName;
    private final JLabel nameLabel;
    private final JLabel priorityLabel;
    private final JLabel stateLabel;
    private final JProgressBar progressBar;
    private final JLabel cpuDot;
    private final JLabel memoryDot;
    private final JLabel networkDot;
    private final JLabel tasksLabel;
    private final JLabel waitLabel;

    private VMState state = VMState.BOOTING;

    /**
     * Creates a VM dashboard card.
     *
     * @param vmName VM name label
     */
    public VMCard(String vmName) {
        this.vmName = vmName;
        setLayout(new BorderLayout(0, 8));
        setBackground(BG_CARD);
        setBorder(new RoundedBorder(12, new Color(30, 45, 69)));
        setOpaque(true);

        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);
        top.setBorder(new EmptyBorder(8, 10, 0, 10));

        nameLabel = new JLabel(vmName);
        nameLabel.setFont(CloudKernelGUI.uiFont(Font.BOLD, 14));
        nameLabel.setForeground(Color.WHITE);
        top.add(nameLabel, BorderLayout.WEST);

        priorityLabel = new JLabel("LOW");
        priorityLabel.setFont(CloudKernelGUI.uiFont(Font.BOLD, 11));
        priorityLabel.setOpaque(true);
        priorityLabel.setBackground(new Color(0, 90, 120));
        priorityLabel.setForeground(Color.WHITE);
        priorityLabel.setBorder(new EmptyBorder(3, 8, 3, 8));
        top.add(priorityLabel, BorderLayout.EAST);

        add(top, BorderLayout.NORTH);

        JPanel center = new JPanel();
        center.setOpaque(false);
        center.setLayout(new BoxLayout(center, BoxLayout.Y_AXIS));
        center.setBorder(new EmptyBorder(0, 10, 6, 10));

        stateLabel = new JLabel(state.getLabel());
        stateLabel.setForeground(ACCENT_AMBER);
        stateLabel.setFont(CloudKernelGUI.uiFont(Font.BOLD, 11));
        stateLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        center.add(stateLabel);
        center.add(Box.createVerticalStrut(6));

        progressBar = new JProgressBar(0, 100);
        progressBar.setValue(0);
        progressBar.setStringPainted(false);
        progressBar.setBackground(new Color(28, 38, 56));
        progressBar.setForeground(ACCENT_CYAN);
        progressBar.setBorder(new LineBorder(new Color(42, 63, 98), 1));
        progressBar.setPreferredSize(new Dimension(190, 10));
        progressBar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 10));
        progressBar.setAlignmentX(Component.LEFT_ALIGNMENT);
        center.add(progressBar);
        center.add(Box.createVerticalStrut(8));

        JPanel resources = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        resources.setOpaque(false);
        resources.setAlignmentX(Component.LEFT_ALIGNMENT);

        cpuDot = createDot("CPU");
        memoryDot = createDot("MEM");
        networkDot = createDot("NET");

        resources.add(cpuDot);
        resources.add(memoryDot);
        resources.add(networkDot);
        center.add(resources);
        center.add(Box.createVerticalStrut(8));

        tasksLabel = new JLabel("Tasks: 0");
        tasksLabel.setFont(CloudKernelGUI.uiFont(Font.PLAIN, 11));
        tasksLabel.setForeground(TEXT_MUTED);
        tasksLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        center.add(tasksLabel);

        waitLabel = new JLabel("Avg Wait: 0ms");
        waitLabel.setFont(CloudKernelGUI.uiFont(Font.PLAIN, 11));
        waitLabel.setForeground(TEXT_MUTED);
        waitLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        center.add(waitLabel);

        add(center, BorderLayout.CENTER);
    }

    /**
     * Creates a resource indicator label.
     *
     * @param text dot text
     * @return configured label
     */
    private JLabel createDot(String text) {
        JLabel dot = new JLabel("\u25cf " + text);
        dot.setForeground(new Color(75, 86, 105));
        dot.setFont(CloudKernelGUI.getSymbolFont(Font.BOLD, 10));
        return dot;
    }

    /** @return VM name bound to the card */
    public String getVmName() {
        return vmName;
    }

    /**
     * Updates displayed priority badge.
     *
     * @param priority VM priority
     */
    public void setPriority(VMPriority priority) {
        String label = priority.getLabel();
        priorityLabel.setText(label);
        if (priority == VMPriority.HIGH) {
            priorityLabel.setBackground(new Color(130, 30, 30));
        } else if (priority == VMPriority.MEDIUM) {
            priorityLabel.setBackground(new Color(135, 92, 0));
        } else {
            priorityLabel.setBackground(new Color(0, 90, 120));
        }
    }

    /**
     * Updates state text and border color.
     *
     * @param newState next VM state
     */
    public void setState(VMState newState) {
        this.state = newState;
        stateLabel.setText(newState.getLabel());

        Color stateColor = colorForState(newState);
        stateLabel.setForeground(stateColor);
        setBorder(new RoundedBorder(12, borderForState(newState)));
    }

    /**
     * Sets cycle progress as a percentage.
     *
     * @param progressPercent progress value in [0, 100]
     */
    public void setCycleProgress(int progressPercent) {
        progressBar.setValue(Math.max(0, Math.min(progressPercent, 100)));
    }

    /**
     * Sets completed task count text.
     *
     * @param tasks task count
     */
    public void setTaskCount(int tasks) {
        tasksLabel.setText("Tasks: " + tasks);
    }

    /**
     * Sets average wait-time text.
     *
     * @param waitMs average wait in milliseconds
     */
    public void setAvgWait(long waitMs) {
        waitLabel.setText("Avg Wait: " + waitMs + "ms");
    }

    /**
     * Updates resource hold indicators.
     *
     * @param cpu     whether CPU is currently held
     * @param memory  whether memory is currently held
     * @param network whether network is currently held
     */
    public void setResourceHold(boolean cpu, boolean memory, boolean network) {
        cpuDot.setForeground(cpu ? ACCENT_GREEN : new Color(75, 86, 105));
        memoryDot.setForeground(memory ? ACCENT_GREEN : new Color(75, 86, 105));
        networkDot.setForeground(network ? ACCENT_GREEN : new Color(75, 86, 105));
    }

    /**
     * Returns text color for a VM state.
     *
     * @param vmState VM state
     * @return mapped state color
     */
    private Color colorForState(VMState vmState) {
        if (vmState == VMState.RUNNING) {
            return ACCENT_CYAN;
        }
        if (vmState == VMState.USING_RESOURCE) {
            return ACCENT_GREEN;
        }
        if (vmState == VMState.BARRIER_WAIT) {
            return ACCENT_PURPLE;
        }
        if (vmState == VMState.TIMEOUT) {
            return ACCENT_RED;
        }
        if (vmState == VMState.REQUESTING_RESOURCE) {
            return ACCENT_AMBER;
        }
        return TEXT_PRIMARY;
    }

    /**
     * Returns border color for a VM state.
     *
     * @param vmState VM state
     * @return mapped border color
     */
    private Color borderForState(VMState vmState) {
        if (vmState == VMState.RUNNING) {
            return ACCENT_CYAN;
        }
        if (vmState == VMState.USING_RESOURCE) {
            return ACCENT_GREEN;
        }
        if (vmState == VMState.BARRIER_WAIT) {
            return ACCENT_PURPLE;
        }
        if (vmState == VMState.TIMEOUT) {
            return ACCENT_RED;
        }
        if (vmState == VMState.REQUESTING_RESOURCE) {
            return ACCENT_AMBER;
        }
        return new Color(30, 45, 69);
    }

    /** Rounded border painter for card emphasis. */
    private static class RoundedBorder extends EmptyBorder {
        private final int radius;
        private final Color color;

        /**
         * Creates a rounded border.
         *
         * @param radius corner radius
         * @param color  border color
         */
        RoundedBorder(int radius, Color color) {
            super(2, 2, 2, 2);
            this.radius = radius;
            this.color = color;
        }

        /**
         * Paints the rounded card border.
         */
        @Override
        public void paintBorder(Component c, Graphics g, int x, int y, int width, int height) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setColor(color);
            g2.setStroke(new BasicStroke(1.5f));
            g2.drawRoundRect(x, y, width - 1, height - 1, radius, radius);
            g2.dispose();
        }
    }
}
