package ui;

import utils.GUILogger;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.text.SimpleAttributeSet;
import javax.swing.text.StyleConstants;
import javax.swing.text.StyledDocument;
import java.awt.*;

/**
 * Styled live log panel for categorized simulation events.
 */
public class LogPanel extends JPanel {
    private static final Color BG_PANEL = new Color(16, 24, 38);
    private static final Color BG_LOG = new Color(11, 18, 30);
    private static final Color TEXT_PRIMARY = new Color(200, 216, 240);
    private static final Color ACCENT_CYAN = new Color(0, 212, 255);

    private final JTextPane textPane;

    /** Creates the log panel UI. */
    public LogPanel() {
        setLayout(new BorderLayout(0, 8));
        setBackground(BG_PANEL);
        setBorder(new EmptyBorder(8, 10, 8, 10));

        JLabel title = new JLabel("LIVE LOG PANEL");
        title.setForeground(ACCENT_CYAN);
        title.setFont(CloudKernelGUI.uiFont(Font.BOLD, 12));
        add(title, BorderLayout.NORTH);

        textPane = new JTextPane();
        textPane.setEditable(false);
        textPane.setBackground(BG_LOG);
        textPane.setForeground(TEXT_PRIMARY);
        textPane.setFont(CloudKernelGUI.uiFont(Font.PLAIN, 11));

        JScrollPane scrollPane = new JScrollPane(textPane);
        add(scrollPane, BorderLayout.CENTER);
    }

    /**
     * Appends one entry and auto-scrolls to bottom.
     *
     * @param entry log entry
     */
    public void appendEntry(GUILogger.LogEntry entry) {
        StyledDocument doc = textPane.getStyledDocument();
        SimpleAttributeSet attrs = new SimpleAttributeSet();
        StyleConstants.setForeground(attrs, colorForCategory(entry.category));
        StyleConstants.setFontFamily(attrs, CloudKernelGUI.fontFamily());
        StyleConstants.setFontSize(attrs, 11);

        String line = String.format("[%s] [%s] %s -> %s%n", entry.timestamp, entry.category, entry.vmName,
                entry.message);
        try {
            doc.insertString(doc.getLength(), line, attrs);
            textPane.setCaretPosition(doc.getLength());
        } catch (Exception ignored) {
        }
    }

    /** Clears all log content. */
    public void clear() {
        textPane.setText("");
    }

    /**
     * Maps category to display color.
     *
     * @param category log category
     * @return display color
     */
    private Color colorForCategory(String category) {
        String upper = category.toUpperCase();
        if ("BOOT".equals(upper)) {
            return new Color(0, 212, 255);
        }
        if ("NETWORK".equals(upper) || "CPU".equals(upper) || "MEMORY".equals(upper)) {
            return new Color(0, 255, 136);
        }
        if ("WAITING".equals(upper)) {
            return new Color(255, 191, 0);
        }
        if ("BARRIER".equals(upper)) {
            return new Color(180, 80, 255);
        }
        if ("TIMEOUT".equals(upper) || "ERROR".equals(upper)) {
            return new Color(255, 90, 90);
        }
        return TEXT_PRIMARY;
    }
}
