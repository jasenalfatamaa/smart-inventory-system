import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context';
import TransactionLogs from '../pages/TransactionLogs';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, describe } from 'vitest';

const MockApp = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AppProvider>{children}</AppProvider>
    </MemoryRouter>
);

describe('Transaction Logs', () => {
    test('renders seed transaction logs', () => {
        render(<MockApp><TransactionLogs /></MockApp>);
        expect(screen.getByText(/MacBook Pro/i)).toBeInTheDocument();
        expect(screen.getByText(/iPhone 15/i)).toBeInTheDocument();
        expect(screen.getAllByText(/IN/i).length).toBeGreaterThan(0);
    });
});
