# ui/components/charts.py — Fixed Matplotlib charts embedded in PyQt5
# FIXES APPLIED:
#   1. GPABarChart   — ylim headroom so top labels not clipped; rotation_mode fix
#   2. SubjectRadar  — tick pad=8 so axis labels don't overlap polygon; title pad=20
#   3. GPADistChart  — ylim headroom; x-label rotation to prevent overlap
#   4. RiskPieChart  — pctdistance moved inward; legend replaces outer labels
#   5. SubjectBarChart — xlim=115 so end-of-bar score labels not clipped
#   6. BaseChart     — tight_layout replaces manual subplots_adjust (no more cropping)
#   7. NEW SemesterTrendChart added

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import numpy as np

ACCENT   = '#4F6EF7'
PURPLE   = '#7C3AED'
GREEN    = '#10B981'
ORANGE   = '#F59E0B'
RED      = '#EF4444'
GRAY     = '#E5E7EB'
TEXT     = '#111827'
SUBTEXT  = '#9CA3AF'
PALETTE  = [ACCENT, PURPLE, GREEN, ORANGE, RED, '#0EA5E9', '#EC4899']


def _style_ax(ax, title='', xlabel='', ylabel=''):
    ax.set_facecolor('#FAFAFA')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(GRAY)
    ax.spines['bottom'].set_color(GRAY)
    ax.tick_params(colors=SUBTEXT, labelsize=9)
    ax.xaxis.label.set_color(SUBTEXT)
    ax.yaxis.label.set_color(SUBTEXT)
    if title:
        ax.set_title(title, fontsize=12, fontweight='bold', color=TEXT, pad=10)
    if xlabel:
        ax.set_xlabel(xlabel, fontsize=9)
    if ylabel:
        ax.set_ylabel(ylabel, fontsize=9)


class BaseChart(FigureCanvas):
    def __init__(self, figsize=(5, 3), dpi=100):
        self.fig = Figure(figsize=figsize, dpi=dpi, facecolor='#FFFFFF')
        super().__init__(self.fig)
        # FIX: tight_layout auto-handles all margins — replaces broken manual subplots_adjust
        self.fig.set_tight_layout({'pad': 1.4, 'w_pad': 0.8, 'h_pad': 0.8})


class GPABarChart(BaseChart):
    def __init__(self, names, gpas, figsize=(7, 3)):
        super().__init__(figsize)
        ax = self.fig.add_subplot(111)
        colors = [GREEN if g >= 3.5 else (ACCENT if g >= 3.0 else (ORANGE if g >= 2.5 else RED))
                  for g in gpas]
        bars = ax.bar(range(len(names)), gpas, color=colors, width=0.6, zorder=2)
        ax.set_xticks(range(len(names)))
        # FIX: rotation_mode='anchor' stops labels drifting under the wrong bar
        ax.set_xticklabels(names, rotation=40, ha='right', fontsize=8,
                           rotation_mode='anchor')
        # FIX: extra ylim so bar-top labels (e.g. "3.74") are not clipped
        ax.set_ylim(0, 4.6)
        ax.axhline(y=3.0, color=SUBTEXT, linestyle='--', linewidth=0.8, alpha=0.6)
        ax.set_yticks([0, 1, 2, 3, 4])
        for bar, gpa in zip(bars, gpas):
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.07,
                    f'{gpa:.2f}',
                    ha='center', va='bottom', fontsize=7.5,
                    color=TEXT, fontweight='600')
        ax.grid(axis='y', color=GRAY, linewidth=0.6, zorder=1)
        _style_ax(ax, 'GPA by Student', ylabel='GPA')
        self.draw()


class SubjectRadarChart(BaseChart):
    def __init__(self, labels, values, figsize=(4, 4)):
        super().__init__(figsize)
        N = len(labels)
        angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
        values_plot = list(values) + [values[0]]
        angles_plot  = angles + angles[:1]
        ax = self.fig.add_subplot(111, polar=True)
        ax.set_facecolor('#FAFAFA')
        ax.plot(angles_plot, values_plot, color=ACCENT, linewidth=2, linestyle='solid')
        ax.fill(angles_plot, values_plot, color=ACCENT, alpha=0.15)
        ax.set_xticks(angles)
        ax.set_xticklabels(labels, fontsize=9, color=TEXT)
        # FIX: pad=8 pushes axis labels outward so they don't overlap the chart polygon
        ax.tick_params(axis='x', pad=8)
        ax.set_ylim(0, 100)
        ax.set_yticks([25, 50, 75, 100])
        ax.set_yticklabels(['25', '50', '75', '100'], fontsize=7, color=SUBTEXT)
        ax.grid(color=GRAY, linewidth=0.7)
        # FIX: pad=20 so title doesn't sit on top of the uppermost label
        ax.set_title('Subject Performance', fontsize=11, fontweight='bold',
                     color=TEXT, pad=20)
        self.draw()


class GPADistChart(BaseChart):
    def __init__(self, bins_dict, figsize=(4, 3)):
        super().__init__(figsize)
        ax = self.fig.add_subplot(111)
        labels = list(bins_dict.keys())
        vals   = list(bins_dict.values())
        colors_list = [RED, ORANGE, ACCENT, GREEN, '#059669'][:len(labels)]
        bars = ax.bar(range(len(labels)), vals, color=colors_list, width=0.55, zorder=2)
        ax.set_xticks(range(len(labels)))
        # FIX: rotate range labels so "2.0-2.5", "3.5-4.0" don't overlap each other
        ax.set_xticklabels(labels, fontsize=8, rotation=20, ha='right',
                           rotation_mode='anchor')
        max_v = max(vals) if vals else 1
        # FIX: +2.5 headroom so count labels above bars clear the top spine
        ax.set_ylim(0, max_v + 2.5)
        ax.set_yticks(range(0, int(max_v) + 3, max(1, (int(max_v) + 2) // 5)))
        for bar, v in zip(bars, vals):
            if v > 0:
                ax.text(bar.get_x() + bar.get_width() / 2,
                        bar.get_height() + 0.15,
                        str(v), ha='center', va='bottom',
                        fontsize=9, color=TEXT, fontweight='600')
        ax.grid(axis='y', color=GRAY, linewidth=0.6, zorder=1)
        _style_ax(ax, 'GPA Distribution', ylabel='Students')
        self.draw()


class RiskPieChart(BaseChart):
    def __init__(self, risk_dict, figsize=(4, 3)):
        super().__init__(figsize)
        ax = self.fig.add_subplot(111)
        labels = [k for k, v in risk_dict.items() if v > 0]
        vals   = [v for v in risk_dict.values() if v > 0]
        if not vals:
            ax.text(0.5, 0.5, 'No data available', ha='center', va='center',
                    transform=ax.transAxes, color=SUBTEXT, fontsize=11)
            self.draw()
            return
        colors_map  = {'Low': GREEN, 'Medium': ORANGE, 'High': RED}
        colors_list = [colors_map.get(l, ACCENT) for l in labels]
        # FIX: pctdistance=0.62 pulls % labels inside wedges; labels=None prevents
        #      outer text labels being clipped at figure boundary
        wedges, texts, autotexts = ax.pie(
            vals, labels=None,
            colors=colors_list,
            autopct='%1.0f%%',
            startangle=140,
            pctdistance=0.62,
            wedgeprops=dict(width=0.55, edgecolor='white', linewidth=2))
        for at in autotexts:
            at.set_fontsize(9)
            at.set_color('white')
            at.set_fontweight('bold')
        # FIX: legend below chart replaces outer labels that were getting cut off
        legend_patches = [
            mpatches.Patch(color=colors_map.get(l, ACCENT), label=f'{l}  ({v})')
            for l, v in zip(labels, vals)
        ]
        ax.legend(handles=legend_patches, loc='lower center',
                  bbox_to_anchor=(0.5, -0.10), ncol=len(labels),
                  fontsize=8, frameon=False)
        ax.set_title('Risk Level Breakdown', fontsize=11, fontweight='bold',
                     color=TEXT, pad=8)
        self.draw()


class SubjectBarChart(BaseChart):
    def __init__(self, labels, values, figsize=(5, 3)):
        super().__init__(figsize)
        ax = self.fig.add_subplot(111)
        colors_list = [ACCENT, PURPLE, GREEN, ORANGE][:len(labels)]
        bars = ax.barh(range(len(labels)), values,
                       color=colors_list, height=0.5, zorder=2)
        ax.set_yticks(range(len(labels)))
        ax.set_yticklabels(labels, fontsize=9)
        # FIX: xlim=115 gives room for "99.9" labels that used to be clipped at 105
        ax.set_xlim(0, 115)
        for bar, v in zip(bars, values):
            ax.text(v + 1.5,
                    bar.get_y() + bar.get_height() / 2,
                    f'{v:.1f}',
                    va='center', fontsize=9, color=TEXT, fontweight='600')
        ax.axvline(x=75, color=SUBTEXT, linestyle='--', linewidth=0.8, alpha=0.5)
        ax.grid(axis='x', color=GRAY, linewidth=0.6, zorder=1)
        _style_ax(ax, 'Average Scores by Subject', xlabel='Score / 100')
        self.draw()


class SemesterTrendChart(BaseChart):
    """NEW — Line chart: actual GPA per semester + dashed prediction line."""
    def __init__(self, semesters, actual_gpas, predicted_gpa=None, figsize=(6, 3)):
        super().__init__(figsize)
        ax = self.fig.add_subplot(111)
        ax.plot(semesters, actual_gpas, color=ACCENT, linewidth=2.5,
                marker='o', markersize=6, label='Actual GPA', zorder=3)
        if predicted_gpa is not None:
            pred_x = [semesters[-1], semesters[-1] + 1]
            pred_y = [actual_gpas[-1], predicted_gpa]
            ax.plot(pred_x, pred_y, color=GREEN, linewidth=2,
                    linestyle='--', marker='D', markersize=6,
                    label=f'Predicted: {predicted_gpa:.2f}', zorder=3)
            ax.annotate(f'  {predicted_gpa:.2f}',
                        xy=(pred_x[-1], pred_y[-1]),
                        fontsize=9, color=GREEN, fontweight='bold')
        ax.set_ylim(1.5, 4.3)
        all_x = semesters + ([semesters[-1] + 1] if predicted_gpa else [])
        ax.set_xticks(all_x)
        ax.set_xticklabels([f'Sem {x}' for x in all_x], fontsize=8)
        ax.axhline(y=3.0, color=SUBTEXT, linestyle=':', linewidth=0.9, alpha=0.7)
        ax.legend(fontsize=9, frameon=False)
        ax.grid(axis='y', color=GRAY, linewidth=0.6, zorder=1)
        _style_ax(ax, 'GPA Semester Trend', xlabel='Semester', ylabel='GPA')
        self.draw()
