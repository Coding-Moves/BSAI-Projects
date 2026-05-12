package ui;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Displays live semaphore slot occupancy for CPU, memory, and network
 * resources.
 */
public class ResourceMonitorPanel extends JPanel {
    private static final Color BG_PANEL = new Color(16, 24, 38);
    private static final Color TEXT_PRIMARY = new Color(200, 216, 240);
    private static final Color TEXT_MUTED = new Color(130, 150, 180);
    private static final Color ACCENT_CYAN = new Color(0, 212, 255);
    private static final Color ACCENT_GREEN = new Color(0, 255, 136);

    private final List<JLabel> cpuSlots = new ArrayList<>();
    private final List<JLabel> memorySlots = new ArrayList<>();
    private final List<JLabel> networkSlots = new ArrayList<>();

    /**
     * Creates the resource monitor panel.
     *
     * @param cpuPermits     CPU permit count
     * @param memoryPermits  memory permit count
     * @param networkPermits network permit count
     */
    public ResourceMonitorPanel(int cpuPermits, int memoryPermits, int networkPermits) {
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setBackground(BG_PANEL);
        setBorder(new EmptyBorder(10, 10, 10, 10));

        JLabel title = new JLabel("RESOURCE MONITOR");
        title.setForeground(ACCENT_CYAN);
        title.setFont(CloudKernelGUI.uiFont(Font.BOLD, 13));
        title.setAlignmentX(Component.LEFT_ALIGNMENT);
        add(title);
        add(Box.createVerticalStrut(10));

        add(createSection("CPU Cores - Semaphore (" + cpuPermits + " permits)", cpuPermits, cpuSlots));
        add(Box.createVerticalStrut(8));
        add(createSection("Memory Blocks - Semaphore (" + memoryPermits + " permits)", memoryPermits, memorySlots));
        add(Box.createVerticalStrut(8));
        add(createSection("Network Ports - Semaphore (" + networkPermits + " permits)", networkPermits, networkSlots));
    }

    /**
     * Builds one resource section row.
     *
     * @param titleText section title
     * @param count     number of slots
     * @param targets   backing labels list
     * @return section panel
     */
    private JPanel createSection(String titleText, int count, List<JLabel> targets) {
        JPanel section = new JPanel();
        section.setLayout(new BoxLayout(section, BoxLayout.Y_AXIS));
        section.setOpaque(false);
        section.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel title = new JLabel(titleText);
        title.setForeground(TEXT_PRIMARY);
        title.setFont(CloudKernelGUI.uiFont(Font.PLAIN, 11));
        title.setAlignmentX(Component.LEFT_ALIGNMENT);
        section.add(title);
        section.add(Box.createVerticalStrut(5));

        JPanel row = new JPanel(new GridLayout(1, count, 6, 0));
        row.setOpaque(false);

        for (int i = 0; i < count; i++) {
            JLabel slot = new JLabel("FREE", SwingConstants.CENTER);
            slot.setOpaque(true);
            slot.setBackground(new Color(25, 35, 52));
            slot.setForeground(TEXT_MUTED);
            slot.setFont(CloudKernelGUI.uiFont(Font.BOLD, 10));
            slot.setBorder(new LineBorder(new Color(42, 63, 98), 1));
            targets.add(slot);
            row.add(slot);
        }

        section.add(row);
        return section;
    }

    /**
     * Updates CPU slot labels.
     *
     * @param holders current holder list
     */
    public void updateCPU(List<String> holders) {
        updateSlots(cpuSlots, holders);
    }

    /**
     * Updates memory slot labels.
     *
     * @param holders current holder list
     */
    public void updateMemory(List<String> holders) {
        updateSlots(memorySlots, holders);
    }

    /**
     * Updates network slot labels.
     *
     * @param holders current holder list
     */
    public void updateNetwork(List<String> holders) {
        updateSlots(networkSlots, holders);
    }

    /**
     * Applies holder labels to a slot collection.
     *
     * @param slots   visual slots
     * @param holders holder names
     */
    private void updateSlots(List<JLabel> slots, List<String> holders) {
        for (int i = 0; i < slots.size(); i++) {
            JLabel slot = slots.get(i);
            if (i < holders.size()) {
                slot.setText(holders.get(i));
                slot.setForeground(ACCENT_GREEN);
                slot.setBackground(new Color(18, 62, 46));
            } else {
                slot.setText("FREE");
                slot.setForeground(TEXT_MUTED);
                slot.setBackground(new Color(25, 35, 52));
            }
        }
    }
}
