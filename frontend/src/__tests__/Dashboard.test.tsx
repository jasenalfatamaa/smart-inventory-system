import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../../context';
import Dashboard from '../../pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, describe, vi } from 'vitest';

// Mock Recharts because it's hard to test in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Area: () => null,
    defs: () => null,
    linearGradient: () => null,
    stop: () => null,
    BarChart: () => <div data-testid="bar-chart" />,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Cell: () => null,
    PieChart: () => <div data-testid="pie-chart" />,
    Pie: () => null,
}));

const MockApp = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AppProvider>{children}</AppProvider>
    </MemoryRouter>
);

describe('Dashboard Features', () => {
    test('renders dashboard statistics', () => {
        render(<MockApp><Dashboard /></MockApp>);
        expect(screen.getByText(/Total Products/i)).toBeInTheDocument();
        expect(screen.getByText(/Low Stock/i)).toBeInTheDocument();
        expect(screen.getByText(/Out of Stock/i)).toBeInTheDocument();
    });

    test('renders charts', () => {
        render(<MockApp><Dashboard /></MockApp>);
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        // bar-chart and pie-chart are not in current Dashboard.tsx, they were replaced by AreaChart
    });
});
