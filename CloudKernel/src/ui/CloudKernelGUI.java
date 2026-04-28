package ui;

import config.ConfigLoader;
import core.BootManager;
import core.ClockSynchronizer;
import entities.ResourceManager;
import entities.VMPriority;
import entities.VMState;
import entities.VMStats;
import entities.VirtualMachine;
import shutdown.ShutdownManager;
import utils.GUILogger;
import utils.StatsCollector;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.MatteBorder;
import java.awt.*;
import java.util.Arrays;
import java.util.HashSet;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Main Swing dashboard window for CloudKernel runtime monitoring.
 */
public class CloudKernelGUI extends JFrame {
    private static final Color BG_DARK = new Color(10, 14, 26);
    private static final Color BG_HEADER = new Color(12, 19, 32);
    private static final Color TEXT_PRIMARY = new Color(200, 216, 240);
    private static final Color ACCENT_CYAN = new Color(0, 212, 255);
    private static final Color ACCENT_GREEN = new Color(0, 255, 136);

    private static final Pattern VM_NAME_PATTERN = Pattern.compile("VM-(\\d+)");
    private static final Pattern CYCLE_PATTERN = Pattern.compile("Cycle (\\d+)");

    private final ConfigLoader config;
    private final StatsCollector statsCollector;
    private final GUILogger logger;
    private final BootManager bootManager;
    private final ClockSynchronizer clockSynchronizer;
    private final ResourceManager resourceManager;

    private final int numVMs;
    private final int numCycles;

    private final AtomicBoolean running = new AtomicBoolean(false);
    private final AtomicBoolean paused = new AtomicBoolean(false);

    private final JLabel clockLabel = new JLabel("00:00:00");
    private final JLabel onlineLabel = new JLabel("\u25cf SYSTEM OFFLINE");
    private final JPanel[] bootChips = new JPanel[4];
    private final JLabel latchLabel = new JLabel("LATCH: 4");

    private final Map<String, VMCard> vmCards = new LinkedHashMap<>();
    private final Set<Integer> barrierArrivals = ConcurrentHashMap.newKeySet();

    private ResourceMonitorPanel resourceMonitorPanel;
    private BarrierPanel barrierPanel;
    private LogPanel logPanel;
    private StatsBar statsBar;
    private ControlPanel controlPanel;
    private DashboardUpdater dashboardUpdater;

    private Timer clockTimer;
    private Timer onlinePulseTimer;
    private Timer refreshTimer;
    private Timer bootLatchTimer;

    /**
     * Creates and wires the complete dashboard UI and simulation observers.
     */
    public CloudKernelGUI() {
        this.config = new ConfigLoader();
        this.statsCollector = new StatsCollector();
        this.logger = new GUILogger();
        this.numVMs = config.getVMCount();
        this.numCycles = config.getCycleCount();

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
        setupLayout();
        setupTimers();
        registerLoggerListener();
    }

    /** Configures top-level frame properties. */
    private void setupFrame() {
        setTitle("CloudKernel — Cloud Hypervisor Monitor");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());
        setSize(1280, 800);
        setResizable(false);
        setLocationRelativeTo(null);
        getContentPane().setBackground(BG_DARK);
    }

    /** Builds and attaches all visual dashboard sections. */
    private void setupLayout() {
        JPanel topContainer = new JPanel();
        topContainer.setLayout(new BoxLayout(topContainer, BoxLayout.Y_AXIS));
        topContainer.setBackground(BG_DARK);
        topContainer.add(buildHeader());
        topContainer.add(buildBootPanel());
        add(topContainer, BorderLayout.NORTH);

        resourceMonitorPanel = new ResourceMonitorPanel(config.getCPUPermits(), config.getMemoryPermits(),
                config.getNetworkPermits());
        logPanel = new LogPanel();
        statsBar = new StatsBar();
        barrierPanel = new BarrierPanel(numVMs);

        JPanel vmDashboard = new JPanel(new GridLayout(1, numVMs, 8, 0));
        vmDashboard.setBackground(BG_DARK);
        vmDashboard.setBorder(new EmptyBorder(10, 10, 8, 10));
        for (int i = 1; i <= numVMs; i++) {
            VMCard card = new VMCard("VM-" + i);
            vmCards.put(card.getVmName(), card);
            vmDashboard.add(card);
        }

        dashboardUpdater = new DashboardUpdater(vmCards, resourceMonitorPanel, barrierPanel, statsBar);

        JPanel centerColumn = new JPanel(new BorderLayout(0, 8));
        centerColumn.setBackground(BG_DARK);
        centerColumn.add(vmDashboard, BorderLayout.CENTER);
        centerColumn.add(barrierPanel, BorderLayout.SOUTH);

        controlPanel = new ControlPanel(
                this::startSimulation,
                this::togglePause,
                this::resetDashboard,
                speed -> GUILogger
                        .boot("Simulation speed set to " + String.format("%.1fx", speed) + " (visual only)."));

        JPanel bottom = new JPanel(new BorderLayout());
        bottom.setBackground(BG_DARK);
        bottom.add(statsBar, BorderLayout.CENTER);
        bottom.add(controlPanel, BorderLayout.SOUTH);

        add(resourceMonitorPanel, BorderLayout.WEST);
        add(centerColumn, BorderLayout.CENTER);
        add(logPanel, BorderLayout.EAST);
        add(bottom, BorderLayout.SOUTH);

        resourceMonitorPanel.setPreferredSize(new Dimension(310, 0));
        logPanel.setPreferredSize(new Dimension(370, 0));
    }

    /**
     * Creates the top header bar.
     *
     * @return header panel
     */
    private JPanel buildHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(BG_HEADER);
        header.setPreferredSize(new Dimension(1280, 52));
        header.setBorder(new MatteBorder(0, 0, 1, 0, new Color(30, 45, 69)));

        JLabel title = new JLabel("\u2601 CLOUDKERNEL HYPERVISOR");
        title.setFont(getSymbolFont(Font.BOLD, 18));
        title.setForeground(ACCENT_CYAN);
        title.setBorder(new EmptyBorder(0, 12, 0, 0));
        header.add(title, BorderLayout.WEST);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 16, 14));
        right.setOpaque(false);

        clockLabel.setFont(uiFont(Font.PLAIN, 14));
        clockLabel.setForeground(TEXT_PRIMARY);

        onlineLabel.setFont(getSymbolFont(Font.BOLD, 13));
        onlineLabel.setForeground(new Color(90, 98, 112));

        right.add(clockLabel);
        right.add(onlineLabel);
        header.add(right, BorderLayout.EAST);

        return header;
    }

    /**
     * Creates the boot visualization panel.
     *
     * @return boot panel
     */
    private JPanel buildBootPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 8));
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(10, 12, 10, 12));

        JLabel title = new JLabel("BOOT MANAGER - CountDownLatch");
        title.setForeground(ACCENT_CYAN);
        title.setFont(uiFont(Font.BOLD, 13));
        panel.add(title, BorderLayout.NORTH);

        JPanel chipRow = new JPanel(new GridLayout(1, 4, 8, 0));
        chipRow.setOpaque(false);

        bootChips[0] = bootChip("Disk");
        bootChips[1] = bootChip("RAM");
        bootChips[2] = bootChip("Network Stack");
        bootChips[3] = bootChip("CPU Scheduler");

        for (JPanel chip : bootChips) {
            chipRow.add(chip);
        }

        panel.add(chipRow, BorderLayout.CENTER);

        latchLabel.setForeground(new Color(130, 150, 180));
        latchLabel.setFont(uiFont(Font.BOLD, 12));
        panel.add(latchLabel, BorderLayout.SOUTH);

        return panel;
    }

    /**
     * Creates one boot subsystem chip.
     *
     * @param name chip label
     * @return chip panel
     */
    private JPanel bootChip(String name) {
        JPanel chip = new JPanel(new BorderLayout());
        chip.setBackground(new Color(30, 45, 69));
        chip.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(42, 63, 98), 1),
                new EmptyBorder(7, 8, 7, 8)));

        JLabel label = new JLabel(name, SwingConstants.CENTER);
        label.setForeground(TEXT_PRIMARY);
        label.setFont(uiFont(Font.BOLD, 12));
        chip.add(label, BorderLayout.CENTER);

        return chip;
    }

    /** Initializes all Swing timers used by the dashboard. */
    private void setupTimers() {
        clockTimer = new Timer(1000,
                e -> clockLabel.setText(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"))));
        clockTimer.start();

        onlinePulseTimer = new Timer(500, e -> {
            if (running.get()) {
                Color current = onlineLabel.getForeground();
                onlineLabel.setForeground(current.equals(ACCENT_GREEN) ? new Color(80, 140, 92) : ACCENT_GREEN);
            }
        });

        refreshTimer = new Timer(220, e -> refreshPanels());

        bootLatchTimer = new Timer(150, e -> {
            long count = bootManager.getBootLatch().getCount();
            if (count == 0) {
                latchLabel.setText("LATCH: 0 (RELEASED)");
                bootLatchTimer.stop();
            } else {
                latchLabel.setText("LATCH: " + count);
            }
        });
    }

    /** Registers the logger listener that feeds the live log and visual updates. */
    private void registerLoggerListener() {
        GUILogger.addListener(entry -> SwingUtilities.invokeLater(() -> {
            logPanel.appendEntry(entry);
            processLogEvent(entry);
        }));
    }

    /**
     * Applies event-driven UI changes from one log entry.
     *
     * @param entry parsed logger entry
     */
    private void processLogEvent(GUILogger.LogEntry entry) {
        String message = entry.message;
        String category = entry.category.toUpperCase();
        String vmName = entry.vmName;

        if ("BOOT".equals(category) && "SYSTEM".equals(vmName)) {
            if (message.contains("Disk subsystem initialized")) {
                setBootChipReady(0);
            }
            if (message.contains("RAM subsystem initialized")) {
                setBootChipReady(1);
            }
            if (message.contains("Network Stack initialized")) {
                setBootChipReady(2);
            }
            if (message.contains("CPU Scheduler initialized")) {
                setBootChipReady(3);
            }
        }

        if (!vmCards.containsKey(vmName)) {
            if (message.contains("Global Clock Tick #")) {
                int cycle = extractLastNumber(message);
                barrierArrivals.clear();
                dashboardUpdater.updateBarrierCycle(cycle, numVMs);
            }
            return;
        }

        if (message.contains("Starting Cycle")) {
            Matcher cycleMatcher = CYCLE_PATTERN.matcher(message);
            if (cycleMatcher.find()) {
                int cycle = Integer.parseInt(cycleMatcher.group(1));
                int progress = (int) Math.round((cycle * 100.0) / Math.max(1, numCycles));
                vmCards.get(vmName).setCycleProgress(progress);
                dashboardUpdater.update(vmName, VMState.RUNNING);
            }
            return;
        }

        if (message.contains("Executing workload")) {
            dashboardUpdater.update(vmName, VMState.RUNNING);
            return;
        }

        if (message.contains("acquired")) {
            dashboardUpdater.update(vmName, VMState.USING_RESOURCE);
            return;
        }

        if (message.contains("released")) {
            dashboardUpdater.update(vmName, VMState.REQUESTING_RESOURCE);
            return;
        }

        if (message.contains("[TIMEOUT]")) {
            dashboardUpdater.update(vmName, VMState.TIMEOUT);
            return;
        }

        if ("BARRIER".equals(category)) {
            dashboardUpdater.update(vmName, VMState.BARRIER_WAIT);
            Integer vmId = extractVmId(vmName);
            if (vmId != null) {
                barrierArrivals.add(vmId);
                dashboardUpdater.updateBarrierArrivals(vmId, barrierArrivals.size(), numVMs);
            }
            return;
        }

        if (message.contains("Shutting down gracefully")) {
            dashboardUpdater.update(vmName, VMState.SHUTDOWN);
        }
    }

    /**
     * Marks one boot chip as initialized.
     *
     * @param index chip index
     */
    private void setBootChipReady(int index) {
        if (index < 0 || index >= bootChips.length) {
            return;
        }
        bootChips[index].setBackground(new Color(0, 255, 136));
        for (Component child : bootChips[index].getComponents()) {
            if (child instanceof JLabel) {
                child.setForeground(new Color(5, 18, 16));
            }
        }
        bootChips[index].repaint();
    }

    /** Refreshes all data-driven dashboard widgets. */
    private void refreshPanels() {
        dashboardUpdater.updateResourceSlots(
                resourceManager.getCPUHolders(),
                resourceManager.getMemoryHolders(),
                resourceManager.getNetworkHolders());

        dashboardUpdater.updateVMStats(statsCollector.getAllVMStats(), numCycles);
        dashboardUpdater.updateSystemStats(statsCollector);
    }

    /** Starts one simulation run if not already running. */
    private synchronized void startSimulation() {
        if (running.getAndSet(true)) {
            return;
        }

        controlPanel.setBootEnabled(false);
        controlPanel.setPauseEnabled(true);
        controlPanel.setResetEnabled(true);

        onlineLabel.setText("\u25cf SYSTEM ONLINE");
        onlineLabel.setForeground(ACCENT_GREEN);
        onlinePulseTimer.start();
        refreshTimer.start();
        bootLatchTimer.start();

        Thread simulation = new Thread(this::runSimulation, "CloudKernel-Simulation");
        simulation.start();
    }

    /** Toggles pause/resume UI mode for observer controls. */
    private void togglePause() {
        paused.set(!paused.get());
        if (paused.get()) {
            controlPanel.setPauseText("\u25b6 RESUME");
            GUILogger.boot("Pause requested from dashboard (observer mode). VM threads continue unchanged.");
        } else {
            controlPanel.setPauseText("|| PAUSE");
            GUILogger.boot("Dashboard resumed.");
        }
    }

    /** Resets dashboard visuals when simulation is not running. */
    private synchronized void resetDashboard() {
        if (running.get()) {
            GUILogger.boot("Reset requested while running. Observer mode keeps worker threads unchanged.");
            return;
        }

        for (int i = 0; i < bootChips.length; i++) {
            bootChips[i].setBackground(new Color(30, 45, 69));
            for (Component child : bootChips[i].getComponents()) {
                if (child instanceof JLabel) {
                    child.setForeground(TEXT_PRIMARY);
                }
            }
        }

        latchLabel.setText("LATCH: 4");
        barrierArrivals.clear();
        logPanel.clear();
        dashboardUpdater.reset();

        for (VMCard card : vmCards.values()) {
            card.setState(VMState.BOOTING);
            card.setTaskCount(0);
            card.setAvgWait(0);
            card.setCycleProgress(0);
            card.setResourceHold(false, false, false);
        }

        onlineLabel.setText("\u25cf SYSTEM OFFLINE");
        onlineLabel.setForeground(new Color(90, 98, 112));
        controlPanel.setPauseText("|| PAUSE");
        controlPanel.setBootEnabled(true);
    }

    /** Executes the full boot and VM simulation lifecycle. */
    private void runSimulation() {
        try {
            GUILogger.section("PHASE 1: SYSTEM BOOT [CountDownLatch]");
            bootManager.initDisk();
            bootManager.initRAM();
            bootManager.initNetworkStack();
            bootManager.initCPUScheduler();
            bootManager.awaitBootCompletion();

            GUILogger.section("PHASE 2: VM EXECUTION [CyclicBarrier + Semaphore]");
            GUILogger.boot("Launching " + numVMs + " VMs for " + numCycles + " cycles each...");

            Thread[] vmThreads = new Thread[numVMs];
            for (int i = 0; i < numVMs; i++) {
                int vmId = i + 1;
                String vmName = "VM-" + vmId;
                VMPriority priority = VMPriority.getRandomPriority();
                VMStats vmStats = statsCollector.getOrCreateVMStats(vmName);

                VMCard card = vmCards.get(vmName);
                if (card != null) {
                    SwingUtilities.invokeLater(() -> card.setPriority(priority));
                }

                int workDuration = 600 + (vmId * 200);
                VirtualMachine vm = new VirtualMachine(
                        vmName,
                        vmId,
                        numCycles,
                        clockSynchronizer,
                        resourceManager,
                        workDuration,
                        logger,
                        priority,
                        vmStats,
                        statsCollector);

                vmThreads[i] = new Thread(vm, vmName);
                vmThreads[i].start();
            }

            for (Thread vmThread : vmThreads) {
                vmThread.join();
            }

            GUILogger.section("PHASE 3: SYSTEM SHUTDOWN");
            GUILogger.boot("All VMs have completed execution. CloudKernel shutting down.");
            statsCollector.printSummary();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            GUILogger.boot("Simulation interrupted.");
        } finally {
            SwingUtilities.invokeLater(() -> {
                running.set(false);
                onlinePulseTimer.stop();
                refreshTimer.stop();
                onlineLabel.setText("\u25cf SYSTEM OFFLINE");
                onlineLabel.setForeground(new Color(90, 98, 112));
                controlPanel.setPauseEnabled(false);
                controlPanel.setBootEnabled(true);
            });
        }
    }

    /**
     * Parses VM id from a VM name string.
     *
     * @param vmName VM name
     * @return parsed id or null when missing
     */
    private Integer extractVmId(String vmName) {
        Matcher matcher = VM_NAME_PATTERN.matcher(vmName);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }

    /**
     * Extracts the trailing number from a message string.
     *
     * @param message source message
     * @return trailing number or zero
     */
    private int extractLastNumber(String message) {
        StringBuilder number = new StringBuilder();
        for (int i = message.length() - 1; i >= 0; i--) {
            char c = message.charAt(i);
            if (Character.isDigit(c)) {
                number.insert(0, c);
            } else if (number.length() > 0) {
                break;
            }
        }
        return number.length() == 0 ? 0 : Integer.parseInt(number.toString());
    }

    /**
     * Creates a UI font with project defaults.
     *
     * @param style font style
     * @param size  font size
     * @return configured font
     */
    public static Font uiFont(int style, int size) {
        return new Font(fontFamily(), style, size);
    }

    /**
     * Creates a font that is likely to render Unicode symbols consistently.
     *
     * @param style font style
     * @param size font size
     * @return resolved symbol font
     */
    public static Font getSymbolFont(int style, int size) {
        String[] candidates = {"Segoe UI Symbol", "DejaVu Sans", "Arial Unicode MS", "Symbola", "Dialog"};
        GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
        Set<String> available = new HashSet<>(Arrays.asList(ge.getAvailableFontFamilyNames()));
        for (String name : candidates) {
            if (available.contains(name)) {
                return new Font(name, style, size);
            }
        }
        return new Font("Dialog", style, size);
    }

    /**
     * Resolves the preferred monospace family available on the machine.
     *
     * @return resolved font family name
     */
    public static String fontFamily() {
        String[] available = GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames();
        for (String name : available) {
            if ("JetBrains Mono".equalsIgnoreCase(name)) {
                return "JetBrains Mono";
            }
        }
        return "Consolas";
    }

    /**
     * Formats uptime as mm:ss.
     *
     * @param uptimeMs uptime in milliseconds
     * @return formatted uptime
     */
    public static String formatUptime(long uptimeMs) {
        long totalSeconds = uptimeMs / 1000;
        long minutes = totalSeconds / 60;
        long seconds = totalSeconds % 60;
        return String.format("%02d:%02d", minutes, seconds);
    }
}
