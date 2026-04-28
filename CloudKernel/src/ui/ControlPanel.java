package ui;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import java.awt.*;
import java.util.function.Consumer;

/**
 * Bottom control bar for simulation actions and speed configuration.
 */
public class ControlPanel extends JPanel {
    private static final Color BG_PANEL = new Color(12, 19, 32);
    private static final Color ACCENT_CYAN = new Color(0, 212, 255);
    private static final Color ACCENT_RED = new Color(255, 90, 90);

    private final JButton bootButton;
    private final JButton pauseButton;
    private final JButton resetButton;
    private final JSlider speedSlider;
    private final JLabel speedLabel;

    /**
     * Creates the control panel.
     *
     * @param onBoot         callback for boot button
     * @param onPause        callback for pause button
     * @param onReset        callback for reset button
     * @param onSpeedChanged callback for slider changes
     */
    public ControlPanel(Runnable onBoot, Runnable onPause, Runnable onReset, Consumer<Double> onSpeedChanged) {
        setLayout(new FlowLayout(FlowLayout.CENTER, 14, 10));
        setBackground(BG_PANEL);
        setBorder(new EmptyBorder(4, 8, 8, 8));

        bootButton = createButton("\u25b6 BOOT SYSTEM", ACCENT_CYAN);
        pauseButton = createButton("|| PAUSE", new Color(255, 191, 0));
        resetButton = createButton("\u21ba RESET", ACCENT_RED);

        bootButton.addActionListener(e -> onBoot.run());
        pauseButton.addActionListener(e -> onPause.run());
        resetButton.addActionListener(e -> onReset.run());

        add(bootButton);
        add(pauseButton);
        add(resetButton);

        JLabel sliderTitle = new JLabel("SIMULATION SPEED");
        sliderTitle.setForeground(new Color(200, 216, 240));
        sliderTitle.setFont(CloudKernelGUI.uiFont(Font.BOLD, 11));
        add(sliderTitle);

        speedLabel = new JLabel("1.0x");
        speedLabel.setForeground(Color.WHITE);
        speedLabel.setFont(CloudKernelGUI.uiFont(Font.BOLD, 12));

        speedSlider = new JSlider(50, 300, 100);
        speedSlider.setPreferredSize(new Dimension(170, 26));
        speedSlider.setBackground(BG_PANEL);
        speedSlider.setForeground(ACCENT_CYAN);
        speedSlider.addChangeListener(e -> {
            double value = speedSlider.getValue() / 100.0;
            speedLabel.setText(String.format("%.1fx", value));
            onSpeedChanged.accept(value);
        });
        add(speedSlider);
        add(speedLabel);
    }

    /**
     * Creates a styled dashboard button.
     *
     * @param text        button text
     * @param borderColor border color
     * @return styled button
     */
    private JButton createButton(String text, Color borderColor) {
        JButton button = new JButton(text);
        button.setFont(CloudKernelGUI.getSymbolFont(Font.BOLD, 12));
        button.setForeground(Color.WHITE);
        button.setBackground(new Color(20, 29, 45));
        button.setBorder(new LineBorder(borderColor, 2));
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(160, 34));

        button.addMouseListener(new java.awt.event.MouseAdapter() {
            @Override
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                button.setBackground(new Color(32, 42, 62));
            }

            @Override
            public void mouseExited(java.awt.event.MouseEvent evt) {
                button.setBackground(new Color(20, 29, 45));
            }
        });
        return button;
    }

    /**
     * Enables or disables the boot button.
     *
     * @param enabled true to enable
     */
    public void setBootEnabled(boolean enabled) {
        bootButton.setEnabled(enabled);
    }

    /**
     * Updates pause button text.
     *
     * @param text button text
     */
    public void setPauseText(String text) {
        pauseButton.setText(text);
    }

    /**
     * Enables or disables the pause button.
     *
     * @param enabled true to enable
     */
    public void setPauseEnabled(boolean enabled) {
        pauseButton.setEnabled(enabled);
    }

    /**
     * Enables or disables the reset button.
     *
     * @param enabled true to enable
     */
    public void setResetEnabled(boolean enabled) {
        resetButton.setEnabled(enabled);
    }
}
