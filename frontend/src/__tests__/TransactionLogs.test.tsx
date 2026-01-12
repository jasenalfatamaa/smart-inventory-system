import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../../context';
import TransactionLogs from '../../pages/TransactionLogs';
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
        expect(screen.getAllByText(/MacBook Pro/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/iPhone 15/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/IN/i).length).toBeGreaterThan(0);
    });
});
