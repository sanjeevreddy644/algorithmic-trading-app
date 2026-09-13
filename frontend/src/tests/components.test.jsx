import "@testing-library/jest-dom/vitest";
import { describe,it,expect } from "vitest";
import { render,screen } from "@testing-library/react";
import MetricCard from "../components/MetricCard"; import PositionsTable from "../components/PositionsTable";
describe("dashboard components",()=>{it("renders a metric",()=>{render(<MetricCard label="Daily P&L" value="₹100"/>);expect(screen.getByText("Daily P&L")).toBeInTheDocument();expect(screen.getByText("₹100")).toBeInTheDocument()});it("renders an empty positions state",()=>{render(<PositionsTable positions={[]}/>);expect(screen.getByText(/No open positions yet/i)).toBeInTheDocument()})});
