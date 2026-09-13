import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import StrategyForm from "../components/StrategyForm";
import BacktestReport from "../components/BacktestReport";
import PnlChart from "../components/PnlChart";

describe("Batch 6 frontend components", () => {
  it("submits strategy parameters from the form", () => {
    const onSave = vi.fn();
    render(<StrategyForm onSave={onSave} />);
    fireEvent.change(screen.getByLabelText(/ATR minimum/i), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: /save strategy/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ atrMin: 1 }));
  });

  it("renders backtest summary metrics", () => {
    render(<BacktestReport report={{ metrics: { totalReturn: 4.2, profitFactor: 1.6, sharpe: 1.1, maxDrawdown: 2.3, calmar: 1.8, winLossRatio: 1.4 } }} />);
    expect(screen.getByText("Total return")).toBeInTheDocument();
    expect(screen.getByText("4.20")).toBeInTheDocument();
  });

  it("mounts the P&L chart with equity data", () => {
    const { container } = render(<PnlChart data={[{ label: "09:15", equity: 100000 }, { label: "09:20", equity: 100100 }]} />);
    expect(container.querySelector(".recharts-wrapper")).toBeTruthy();
  });
});
