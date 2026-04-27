import customtkinter as ctk
import tkinter as tk
from tkinter import filedialog, messagebox
import csv
import os
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

from dsa.array_list import ArrayList
from algorithms.trend_analysis import TrendAnalysis
from algorithms.moving_average import MovingAverage
from algorithms.max_profit import MaxProfit
from algorithms.local_high_low import LocalHighLow

class StockAnalyzerApp:
    def __init__(self, master):
        self.master = master
        master.title("Stocks Trend Analyzer")
        master.geometry("1100x720")
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        # Variables
        self.prices = ArrayList()
        self.dates = ArrayList()
        self.window_size = tk.IntVar(value=5)

        # ------------------ LAYOUT -------------------
        self.main_frame = ctk.CTkFrame(master)
        self.main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Left Control Panel
        self.left_panel = ctk.CTkFrame(self.main_frame, width=260)
        self.left_panel.pack(side="left", fill="y", padx=10, pady=10)

        # Right Chart Panel
        self.right_panel = ctk.CTkFrame(self.main_frame)
        self.right_panel.pack(side="right", fill="both", expand=True, padx=10, pady=10)

        # ------------------ LEFT PANEL UI -------------------
        ctk.CTkLabel(self.left_panel, text="Stocks Trend Analyzer", font=("Arial", 22)).pack(pady=15)

        ctk.CTkButton(self.left_panel, text="Load CSV", command=self.load_csv, width=220).pack(pady=10)

        ctk.CTkLabel(self.left_panel, text="Moving Average Window:", anchor="w").pack(pady=5)
        self.window_entry = ctk.CTkEntry(self.left_panel, textvariable=self.window_size, width=80)
        self.window_entry.pack(pady=5)

        ctk.CTkButton(self.left_panel, text="Analyze Trends", command=self.analyze, width=220).pack(pady=15)

        ctk.CTkButton(self.left_panel, text="Save Chart", command=self.save_chart, width=220).pack(pady=15)

        # Results Panel (Buy/Sell Info)
        ctk.CTkLabel(self.left_panel, text="Analysis Summary", font=("Arial", 18)).pack(pady=10)

        self.buy_label = ctk.CTkLabel(self.left_panel, text="Buy Day: -", font=("Arial", 14))
        self.buy_label.pack(pady=3)

        self.sell_label = ctk.CTkLabel(self.left_panel, text="Sell Day: -", font=("Arial", 14))
        self.sell_label.pack(pady=3)

        self.profit_label = ctk.CTkLabel(self.left_panel, text="Max Profit: -", font=("Arial", 14))
        self.profit_label.pack(pady=3)

        # ------------------ CHART AREA -------------------
        self.figure = plt.Figure(figsize=(7, 5), dpi=100)
        self.ax = self.figure.add_subplot(111)

        self.canvas = FigureCanvasTkAgg(self.figure, self.right_panel)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)

    # ------------------ FUNCTIONS -------------------

    def load_csv(self):
        file_path = filedialog.askopenfilename(filetypes=[("CSV Files", "*.csv")])
        if not file_path:
            return
        try:
            with open(file_path, "r") as csvfile:
                reader = csv.DictReader(csvfile)
                self.prices.clear()
                self.dates.clear()

                for row in reader:
                    self.dates.append(row["Date"])
                    self.prices.append(float(row["Close"]))

            messagebox.showinfo("Success", f"Loaded {self.prices.size()} records.")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to load CSV: {e}")

    def analyze(self):
        if self.prices.size() == 0:
            messagebox.showwarning("Warning", "Please load a CSV first.")
            return

        try:
            window = int(self.window_entry.get())
            if window < 1:
                raise ValueError
        except ValueError:
            messagebox.showwarning("Warning", "Window size must be positive.")
            return

        # Trend detection
        trend_module = TrendAnalysis(self.prices)
        trends = trend_module.detect_trends()

        # Moving Average
        ma_module = MovingAverage(window)
        moving_avg = ma_module.calculate(
            [self.prices.get(i) for i in range(self.prices.size())]
        )

        # Max Profit
        price_list = [self.prices.get(i) for i in range(self.prices.size())]
        max_profit_module = MaxProfit(price_list)
        buy_day, sell_day, profit = max_profit_module.best_interval()

        # Local Extremes
        lh_module = LocalHighLow(price_list)
        extremes = lh_module.find_local_extremes()

        # Plot
        self.ax.clear()
        x_vals = list(range(self.prices.size()))
        y_vals = price_list

        self.ax.plot(x_vals, y_vals, label="Close Price")
        self.ax.plot(x_vals, moving_avg, label=f"{window}-Day MA")

        # Buy/Sell Markers
        self.ax.scatter(buy_day, y_vals[buy_day], color="green", marker="^", s=100)
        self.ax.scatter(sell_day, y_vals[sell_day], color="red", marker="v", s=100)

        # High / Low Points
        for idx, kind, price in extremes:
            self.ax.scatter(idx, price, color="purple" if kind == "High" else "brown")

        self.ax.set_title("Stock Trend Analysis")
        self.ax.legend()
        self.canvas.draw()

        # Update Labels
        self.buy_label.configure(text=f"Buy Day: {buy_day}")
        self.sell_label.configure(text=f"Sell Day: {sell_day}")
        self.profit_label.configure(text=f"Max Profit: {profit:.2f}")

    def save_chart(self):
        project_dir = os.path.abspath(os.path.dirname(__file__))
        charts_dir = os.path.join(project_dir, "charts")
        os.makedirs(charts_dir, exist_ok=True)

        save_path = os.path.join(charts_dir, "generated_chart.png")
        self.figure.savefig(save_path)

        messagebox.showinfo("Saved", f"Chart saved to:\n{save_path}")


# ------------------ MAIN -------------------
if __name__ == "__main__":
    ctk.set_appearance_mode("dark")
    root = ctk.CTk()
    app = StockAnalyzerApp(root)
    root.mainloop()
