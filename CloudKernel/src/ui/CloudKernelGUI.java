package ui;

import javax.swing.*;
import javax.swing.text.*;
import javax.swing.border.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.RoundRectangle2D;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

import config.ConfigLoader;
import core.*;
import entities.*;
import utils.GUILogger;
import utils.StatsCollector;
import shutdown.ShutdownManager;

/**
 * CloudKernel - Professional Cloud Hypervisor Monitoring Dashboard
 * Dark terminal theme with real-time visualization of VM execution and resource
 * management
 */
public class CloudKernelGUI extends JFrame {

    // Colors for dark terminal theme
    private static final Color BG_DARK = new Color(10, 14, 26);
    private static final Color BG_PANEL = new Color(30, 45, 69);
    private static final Color TEXT_PRIMARY = new Color(200, 216, 240);
    private static final Color TEXT_MUTED = new Color(130, 150, 180);
    private static final Color ACCENT_CYAN = new Color(0, 212, 255);
    private static final Color ACCENT_GREEN = new Color(0, 255, 136);
    private static final Color ACCENT_YELLOW = new Color(255, 191, 0);
    private static final Color ACCENT_PURPLE = new Color(200, 0, 255);
    private static final Color ACCENT_RED = new Color(255, 100, 100);

    private final ConfigLoader config;
    private final StatsCollector statsCollector;
    private final GUILogger logger;
    private final BootManager bootManager;
    private final ClockSynchronizer clockSynchronizer;
    private final ResourceManager resourceManager;
    private final int numVMs;
    private final int numCycles;

    private HeaderBar headerBar;
    private BootPanel bootPanel;
    private VMDashboardPanel vmDashboard;
    private ResourceMonitorPanel resourceMonitor;
    private BarrierPanel barrierPanel;
    private LogPanelComponent logPanel;
    private StatsBarPanel statsBar;
    private ControlPanelComponent controlPanel;

    private AtomicBoolean isRunning = new AtomicBoolean(false);
    private double speedMultiplier = 1.0;

    public CloudKernelGUI() {
        this.config = new ConfigLoader();
        this.statsCollector = new StatsCollector();
        this.logger = new GUILogger();
        this.numVMs = config.getVMCount();
        this.numCycles = config.getCycleCount();

        // Initialize core managers
        this.bootManager = new BootManager(logger);
        this.clockSynchronizer = new ClockSynchronizer(numVMs, logger, statsCollector);
        this.resourceManager = new ResourceManager(
                config.getCPUPermits(),
                config.getMemoryPermits(),
                config.getNetworkPermits(),
                config.getTimeoutDuration(),
                logger);

        new ShutdownManager(statsCollector);

        setupFrame();
        setupUI();
        setVisible(true);
    }

    private void setupFrame() {
        setTitle("CloudKernel — Cloud Hypervisor Monitor");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1280, 800);
        setLocationRelativeTo(null);
        setResizable(false);
        getContentPane().setBackground(BG_DARK);
        setFont(new Font("Monospaced", Font.PLAIN, 12));
    }

    private void setupUI() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(BG_DARK);

        // Header bar
        headerBar = new HeaderBar();
        mainPanel.add(headerBar, BorderLayout.NORTH);

        // Boot panel
        bootPanel = new BootPanel();
        mainPanel.add(bootPanel, BorderLayout.PAGE_START);

        // Center: VM Dashboard
        vmDashboard = new VMDashboardPanel(numVMs);
        mainPanel.add(vmDashboard, BorderLayout.CENTER);

        // Bottom: Barrier + Stats
        JPanel bottomPanel = new JPanel(new BorderLayout());
        bottomPanel.setBackground(BG_DARK);
        bottomPanel.setBorder(new EmptyBorder(5, 5, 5, 5));

        barrierPanel = new BarrierPanel(numVMs);
        bottomPanel.add(barrierPanel, BorderLayout.WEST);

        statsBar = new StatsBarPanel();
        bottomPanel.add(statsBar, BorderLayout.CENTER);

        mainPanel.add(bottomPanel, BorderLayout.PAGE_END);

        // Right side: Resources + Log
        JPanel rightPanel = new JPanel(new BorderLayout());
        rightPanel.setBackground(BG_DARK);

        resourceMonitor = new ResourceMonitorPanel();
        logPanel = new LogPanelComponent();

        JSplitPane rightSplit = new JSplitPane(JSplitPane.VERTICAL_SPLIT, resourceMonitor, logPanel);
        rightSplit.setDividerLocation(150);
        rightPanel.add(rightSplit, BorderLayout.CENTER);

        // Add right panel to main layout
        JSplitPane mainSplit = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, mainPanel, rightPanel);
        mainSplit.setDividerLocation(900);
        mainSplit.setBackground(BG_DARK);

        setContentPane(mainSplit);

        // Setup control panel in a dialog
        controlPanel = new ControlPanelComponent();
    }

    public void startSimulation(double speed) {
        if (isRunning.getAndSet(true))
            return;

        speedMultiplier = speed;
        new Thread(this::runSimulation).start();
    }

    private void runSimulation() {
        try {
            // Boot phase
            GUILogger.section("PHASE 1: SYSTEM BOOT [CountDownLatch]");
            bootManager.initDisk();
            bootManager.initRAM();
            bootManager.initNetworkStack();
            bootManager.initCPUScheduler();
            bootManager.awaitBootCompletion();

            headerBar.setSystemOnline(true);
            bootPanel.setAllReady();
            Thread.sleep(500);

            // VM execution phase
            GUILogger.section("PHASE 2: VM EXECUTION [CyclicBarrier + Semaphore]");
            GUILogger.boot("Launching " + numVMs + " VMs for " + numCycles + " cycles each...");

            Thread[] vmThreads = new Thread[numVMs];
            for (int i = 0; i < numVMs; i++) {
                final int vmId = i + 1;
                VMPriority priority = VMPriority.getRandomPriority();
                VMStats vmStats = statsCollector.getOrCreateVMStats("VM-" + vmId);

                int workDuration = 600 + (vmId * 200);
                VirtualMachine vm = new VirtualMachine(
                        "VM-" + vmId, vmId, numCycles, clockSynchronizer,
                        resourceManager, workDuration, logger, priority, vmStats, statsCollector);

                vmThreads[i] = new Thread(vm, "VM-" + vmId);
                vmThreads[i].start();
                vmDashboard.setVMCreated(vmId, priority);
            }

            for (Thread t : vmThreads) {
                t.join();
            }

            Thread.sleep(300);
            GUILogger.section("PHASE 3: SYSTEM SHUTDOWN");
            GUILogger.boot("✓ All VMs have completed execution. CloudKernel shutting down.");
            statsCollector.printSummary();

            isRunning.set(false);
            headerBar.setSystemOnline(false);

        } catch (Exception e) {
            GUILogger.boot("Error during simulation: " + e.getMessage());
            isRunning.set(false);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(CloudKernelGUI::new);
    }

    // ============== Inner GUI Component Classes ==============

    private class HeaderBar extends JPanel {
        private JLabel timeLabel;
        private JLabel onlineIndicator;
        private javax.swing.Timer clockTimer;

        HeaderBar() {
            setLayout(new BorderLayout());
            setBackground(BG_PANEL);
            setBorder(new MatteBorder(0, 0, 2, 0, new Color(30, 45, 69)));
            setPreferredSize(new Dimension(0, 50));

            // Title
            JLabel titleLabel = new JLabel("☁ CLOUDKERNEL HYPERVISOR");
            titleLabel.setFont(new Font("Monospaced", Font.BOLD, 16));
            titleLabel.setForeground(ACCENT_CYAN);
            add(titleLabel, BorderLayout.WEST);

            // Right side
            JPanel rightPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 20, 12));
            rightPanel.setBackground(BG_PANEL);

            // Clock
            timeLabel = new JLabel("00:00:00");
            timeLabel.setFont(new Font("Monospaced", Font.PLAIN, 12));
            timeLabel.setForeground(TEXT_PRIMARY);
            rightPanel.add(timeLabel);

            // Online indicator
            onlineIndicator = new JLabel("● OFFLINE");
            onlineIndicator.setFont(new Font("Monospaced", Font.BOLD, 12));
            onlineIndicator.setForeground(new Color(100, 100, 100));
            rightPanel.add(onlineIndicator);

            add(rightPanel, BorderLayout.EAST);

            // Update clock
            clockTimer = new javax.swing.Timer(1000, e -> updateClock());
            clockTimer.start();
        }

        private void updateClock() {
            timeLabel.setText(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        }

        private void setSystemOnline(boolean online) {
            if (online) {
                onlineIndicator.setText("● ONLINE");
                onlineIndicator.setForeground(ACCENT_GREEN);
            } else {
                onlineIndicator.setText("● OFFLINE");
                onlineIndicator.setForeground(new Color(100, 100, 100));
            }
        }
    }

    private class BootPanel extends JPanel {
        BootPanel() {
            setLayout(new GridLayout(1, 1, 10, 0));
            setBackground(BG_DARK);
            setBorder(new EmptyBorder(10, 10, 5, 10));
            setPreferredSize(new Dimension(0, 80));

            // Title
            JLabel titleLabel = new JLabel("BOOT MANAGER — CountDownLatch(4)");
            titleLabel.setFont(new Font("Monospaced", Font.BOLD, 11));
            titleLabel.setForeground(ACCENT_CYAN);

            JPanel container = new JPanel(new BorderLayout());
            container.setBackground(BG_DARK);
            container.add(titleLabel, BorderLayout.NORTH);

            JPanel chipsPanel = new JPanel(new GridLayout(1, 4, 10, 0));
            chipsPanel.setBackground(BG_DARK);
            chipsPanel.add(new BootChip("Disk"));
            chipsPanel.add(new BootChip("RAM"));
            chipsPanel.add(new BootChip("Network"));
            chipsPanel.add(new BootChip("CPU"));

            container.add(chipsPanel, BorderLayout.CENTER);
            add(container);
        }

        void setAllReady() {
            for (Component comp : getComponents()) {
                if (comp instanceof JPanel) {
                    for (Component subcomp : ((JPanel) comp).getComponents()) {
                        if (subcomp instanceof BootChip) {
                            ((BootChip) subcomp).setReady(true);
                        }
                    }
                }
            }
        }

        private class BootChip extends JPanel {
            private String name;
            private boolean ready = false;

            BootChip(String name) {
                this.name = name;
                setPreferredSize(new Dimension(60, 60));
                setBackground(BG_PANEL);
                setBorder(new RoundedBorder(5, BG_PANEL));
            }

            void setReady(boolean ready) {
                this.ready = ready;
                repaint();
            }

            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g;
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                // Status circle
                Color color = ready ? ACCENT_GREEN : new Color(80, 80, 80);
                g2.setColor(color);
                g2.fillOval(10, 10, 40, 40);

                // Label
                g2.setColor(TEXT_PRIMARY);
                g2.setFont(new Font("Monospaced", Font.BOLD, 9));
                FontMetrics fm = g2.getFontMetrics();
                int x = (getWidth() - fm.stringWidth(name)) / 2;
                g2.drawString(name, x, 65);
            }
        }
    }

    private class VMDashboardPanel extends JPanel {
        private java.util.List<VMCard> vmCards = new ArrayList<>();

        VMDashboardPanel(int numVMs) {
            setLayout(new GridLayout(1, numVMs, 10, 0));
            setBackground(BG_DARK);
            setBorder(new EmptyBorder(10, 10, 10, 10));

            for (int i = 1; i <= numVMs; i++) {
                VMCard card = new VMCard("VM-" + i);
                vmCards.add(card);
                add(card);
            }
        }

        void setVMCreated(int vmId, VMPriority priority) {
            if (vmId <= vmCards.size()) {
                vmCards.get(vmId - 1).setPriority(priority);
            }
        }
    }

    private class VMCard extends JPanel {
        private String vmName;
        private VMPriority priority;
        private VMState state = VMState.BOOTING;
        private int taskCount = 0;
        private int cycleProgress = 0;

        VMCard(String vmName) {
            this.vmName = vmName;
            setBackground(BG_PANEL);
            setBorder(new RoundedBorder(5, BG_PANEL));
        }

        void setPriority(VMPriority priority) {
            this.priority = priority;
        }

        void setState(VMState newState) {
            this.state = newState;
            repaint();
        }

        void setTaskCount(int count) {
            this.taskCount = count;
            repaint();
        }

        void setCycleProgress(int progress) {
            this.cycleProgress = Math.min(100, progress);
            repaint();
        }

        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g;
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            int y = 10;

            // VM Name
            g2.setColor(TEXT_PRIMARY);
            g2.setFont(new Font("Monospaced", Font.BOLD, 11));
            g2.drawString(vmName, 10, y + 15);

            y += 25;

            // Priority badge
            if (priority != null) {
                Color priorityColor = priority == VMPriority.HIGH ? ACCENT_RED
                        : priority == VMPriority.MEDIUM ? ACCENT_YELLOW : ACCENT_CYAN;
                g2.setColor(priorityColor);
                g2.setFont(new Font("Monospaced", Font.BOLD, 9));
                g2.drawString(priority.getLabel(), 10, y + 10);
            }

            y += 15;

            // State
            if (state != null) {
                Color stateColor = getStateColor(state);
                g2.setColor(stateColor);
                g2.fillRect(10, y, getWidth() - 20, 20);
                g2.setColor(BG_PANEL);
                g2.setFont(new Font("Monospaced", Font.PLAIN, 9));
                g2.drawString(state.getLabel(), 15, y + 15);
            }

            y += 25;

            // Progress bar
            g2.setColor(new Color(50, 50, 50));
            g2.fillRect(10, y, getWidth() - 20, 8);
            g2.setColor(ACCENT_CYAN);
            g2.fillRect(10, y, (getWidth() - 20) * cycleProgress / 100, 8);

            y += 15;

            // Stats
            g2.setColor(TEXT_MUTED);
            g2.setFont(new Font("Monospaced", Font.PLAIN, 8));
            g2.drawString("Tasks: " + taskCount, 10, y + 10);
            g2.drawString("Progress: " + cycleProgress + "%", 10, getHeight() - 5);
        }

        private Color getStateColor(VMState state) {
            switch (state) {
                case RUNNING:
                    return ACCENT_CYAN;
                case USING_RESOURCE:
                    return ACCENT_GREEN;
                case BARRIER_WAIT:
                    return ACCENT_PURPLE;
                case TIMEOUT:
                    return ACCENT_RED;
                default:
                    return TEXT_MUTED;
            }
        }
    }

    private class ResourceMonitorPanel extends JPanel {
        ResourceMonitorPanel() {
            setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
            setBackground(BG_DARK);
            setBorder(new EmptyBorder(10, 10, 10, 10));

            JLabel title = new JLabel("RESOURCE MONITOR");
            title.setFont(new Font("Monospaced", Font.BOLD, 11));
            title.setForeground(ACCENT_CYAN);
            add(title);

            add(Box.createVerticalStrut(5));

            add(new ResourceSection("CPU Cores", config.getCPUPermits()));
            add(Box.createVerticalStrut(5));
            add(new ResourceSection("Memory Blocks", config.getMemoryPermits()));
            add(Box.createVerticalStrut(5));
            add(new ResourceSection("Network Ports", config.getNetworkPermits()));
        }

        private class ResourceSection extends JPanel {
            int permits;

            ResourceSection(String name, int permits) {
                this.permits = permits;
                setLayout(new BoxLayout(this, BoxLayout.X_AXIS));
                setBackground(BG_DARK);

                JLabel label = new JLabel(name);
                label.setFont(new Font("Monospaced", Font.PLAIN, 9));
                label.setForeground(TEXT_MUTED);
                add(label);
                add(Box.createHorizontalStrut(5));

                for (int i = 0; i < permits; i++) {
                    add(new ResourceSlot());
                }
            }
        }

        private class ResourceSlot extends JPanel {
            boolean inUse = false;

            ResourceSlot() {
                setPreferredSize(new Dimension(20, 20));
                setMaximumSize(new Dimension(20, 20));
                setBackground(BG_PANEL);
            }

            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g;
                Color color = inUse ? ACCENT_GREEN : new Color(60, 60, 60);
                g2.setColor(color);
                g2.fillRect(2, 2, getWidth() - 4, getHeight() - 4);
            }
        }
    }

    private class BarrierPanel extends JPanel {
        private boolean[] vmWaiting;
        int cycleNum = 0;

        BarrierPanel(int numVMs) {
            this.vmWaiting = new boolean[numVMs + 1];
            setBackground(BG_DARK);
            setPreferredSize(new Dimension(250, 80));
            setBorder(new EmptyBorder(5, 10, 5, 10));
        }

        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g;

            // Title
            g2.setColor(ACCENT_PURPLE);
            g2.setFont(new Font("Monospaced", Font.BOLD, 11));
            g2.drawString("CYCLIC BARRIER — Global Clock Sync", 0, 15);

            // Cycle number
            g2.setColor(TEXT_PRIMARY);
            g2.setFont(new Font("Monospaced", Font.PLAIN, 10));
            g2.drawString("Cycle #" + cycleNum, 0, 35);

            // VM dots
            int x = 0;
            for (int i = 1; i < vmWaiting.length; i++) {
                Color color = vmWaiting[i] ? ACCENT_PURPLE : new Color(80, 80, 80);
                g2.setColor(color);
                g2.fillOval(x, 40, 12, 12);
                g2.setColor(TEXT_MUTED);
                g2.setFont(new Font("Monospaced", Font.PLAIN, 8));
                g2.drawString("V" + i, x, 65);
                x += 20;
            }
        }
    }

    private class LogPanelComponent extends JPanel {
        private JTextPane textPane;
        private DefaultListModel<String> logModel;

        LogPanelComponent() {
            setLayout(new BorderLayout());
            setBackground(BG_DARK);
            setBorder(new EmptyBorder(5, 5, 5, 5));

            JLabel title = new JLabel("LIVE EVENT LOG");
            title.setFont(new Font("Monospaced", Font.BOLD, 11));
            title.setForeground(ACCENT_CYAN);
            add(title, BorderLayout.NORTH);

            textPane = new JTextPane();
            textPane.setBackground(new Color(20, 20, 40));
            textPane.setForeground(TEXT_PRIMARY);
            textPane.setFont(new Font("Monospaced", Font.PLAIN, 9));
            textPane.setEditable(false);

            JScrollPane scrollPane = new JScrollPane(textPane);
            scrollPane.setBackground(BG_DARK);
            add(scrollPane, BorderLayout.CENTER);

            // Register log listener
            GUILogger.addListener(entry -> addLogEntry(entry));
        }

        private void addLogEntry(GUILogger.LogEntry entry) {
            SwingUtilities.invokeLater(() -> {
                try {
                    StyledDocument doc = textPane.getStyledDocument();
                    SimpleAttributeSet attrs = new SimpleAttributeSet();

                    StyleConstants.setForeground(attrs, getColorForCategory(entry.category));
                    StyleConstants.setFontFamily(attrs, "Monospaced");
                    StyleConstants.setFontSize(attrs, 9);

                    doc.insertString(doc.getLength(),
                            "[" + entry.timestamp + "] [" + entry.category + "] " + entry.vmName + " → " + entry.message
                                    + "\n",
                            attrs);

                    textPane.setCaretPosition(doc.getLength());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        private Color getColorForCategory(String category) {
            switch (category.toUpperCase()) {
                case "BOOT":
                    return ACCENT_CYAN;
                case "CPU":
                case "MEMORY":
                case "NETWORK":
                    return ACCENT_GREEN;
                case "WAITING":
                    return ACCENT_YELLOW;
                case "BARRIER":
                    return ACCENT_PURPLE;
                case "TIMEOUT":
                case "ERROR":
                    return ACCENT_RED;
                default:
                    return TEXT_PRIMARY;
            }
        }
    }

    private class StatsBarPanel extends JPanel {
        StatsBarPanel() {
            setLayout(new GridLayout(1, 6, 10, 0));
            setBackground(BG_DARK);
            setBorder(new EmptyBorder(5, 5, 5, 5));
            setPreferredSize(new Dimension(0, 60));

            add(new StatCard("Cycles", "0"));
            add(new StatCard("CPU Ops", "0"));
            add(new StatCard("Net Ops", "0"));
            add(new StatCard("Mem Ops", "0"));
            add(new StatCard("Contentions", "0"));
            add(new StatCard("Timeouts", "0"));
        }

        private class StatCard extends JPanel {
            String label, value;

            StatCard(String label, String value) {
                this.label = label;
                this.value = value;
                setBackground(BG_PANEL);
                setBorder(new RoundedBorder(3, BG_PANEL));
            }

            void setValue(String value) {
                this.value = value;
                repaint();
            }

            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g;

                g2.setColor(TEXT_MUTED);
                g2.setFont(new Font("Monospaced", Font.PLAIN, 8));
                FontMetrics fm = g2.getFontMetrics();
                g2.drawString(label, (getWidth() - fm.stringWidth(label)) / 2, 15);

                g2.setColor(TEXT_PRIMARY);
                g2.setFont(new Font("Monospaced", Font.BOLD, 14));
                fm = g2.getFontMetrics();
                g2.drawString(value, (getWidth() - fm.stringWidth(value)) / 2, 35);
            }
        }
    }

    private class ControlPanelComponent extends JPanel {
        ControlPanelComponent() {
            setLayout(new FlowLayout(FlowLayout.CENTER, 20, 10));
            setBackground(BG_DARK);

            JButton bootButton = new JButton("▶ BOOT SYSTEM");
            bootButton.setFont(new Font("Monospaced", Font.BOLD, 12));
            bootButton.setForeground(BG_DARK);
            bootButton.setBackground(ACCENT_GREEN);
            bootButton.setFocusPainted(false);
            bootButton.setPreferredSize(new Dimension(150, 40));
            bootButton.addActionListener(e -> CloudKernelGUI.this.startSimulation(1.0));

            JButton resetButton = new JButton("↺ RESET");
            resetButton.setFont(new Font("Monospaced", Font.BOLD, 12));
            resetButton.setForeground(BG_DARK);
            resetButton.setBackground(ACCENT_RED);
            resetButton.setFocusPainted(false);
            resetButton.setPreferredSize(new Dimension(120, 40));

            add(bootButton);
            add(resetButton);
        }
    }

    private static class RoundedBorder extends AbstractBorder {
        private int radius;
        private Color color;

        RoundedBorder(int radius, Color color) {
            this.radius = radius;
            this.color = color;
        }

        @Override
        public void paintBorder(Component c, Graphics g, int x, int y, int width, int height) {
            Graphics2D g2 = (Graphics2D) g;
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setColor(color);
            g2.setStroke(new BasicStroke(1));
            g2.drawRoundRect(x, y, width - 1, height - 1, radius, radius);
        }

        @Override
        public Insets getBorderInsets(Component c) {
            return new Insets(2, 2, 2, 2);
        }
    }
}
