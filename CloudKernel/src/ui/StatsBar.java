package ui;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Bottom statistics row that displays live aggregate metrics.
 */
public class StatsBar extends JPanel {
    private static final Color BG_BAR = new Color(12, 19, 32);
    private static final Color BG_CARD = new Color(16, 24, 38);
    private static final Color TEXT_MUTED = new Color(130, 150, 180);

    private final Map<String, JLabel> valueLabels = new LinkedHashMap<>();

    /** Creates the stats bar with all predefined stat cards. */
    public StatsBar() {
        setLayout(new GridLayout(1, 6, 8, 0));
        setBackground(BG_BAR);
        setBorder(new EmptyBorder(6, 8, 6, 8));
        setPreferredSize(new Dimension(0, 78));

        addStat("Total Cycles");
        addStat("Network Ops");
        addStat("CPU Ops");
        addStat("Timeouts");
        addStat("Contentions");
        addStat("Uptime");
    }

    /**
     * Adds one metric card.
     *
     * @param name metric name
     */
    private void addStat(String name) {
        JPanel card = new JPanel(new GridLayout(2, 1));
        card.setBackground(BG_CARD);
        card.setBorder(new LineBorder(new Color(30, 45, 69), 1));

        JLabel top = new JLabel(name, SwingConstants.CENTER);
        top.setFont(CloudKernelGUI.uiFont(Font.PLAIN, 10));
        top.setForeground(TEXT_MUTED);

        JLabel value = new JLabel("0", SwingConstants.CENTER);
        value.setFont(CloudKernelGUI.uiFont(Font.BOLD, 18));
        value.setForeground(Color.WHITE);

        valueLabels.put(name, value);
        card.add(top);
        card.add(value);
        add(card);
    }

    /**
     * Sets one metric value.
     *
     * @param name  metric name
     * @param value formatted metric value
     */
    public void setValue(String name, String value) {
        JLabel label = valueLabels.get(name);
        if (label != null) {
            label.setText(value);
        }
    }

    /** Resets all metric cards to startup values. */
    public void reset() {
        setValue("Total Cycles", "0");
        setValue("Network Ops", "0");
        setValue("CPU Ops", "0");
        setValue("Timeouts", "0");
        setValue("Contentions", "0");
        setValue("Uptime", "00:00");
    }
}
