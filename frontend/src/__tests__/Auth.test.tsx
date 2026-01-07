import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, useAuth } from '../context';
import Login from '../pages/Login';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, describe, vi } from 'vitest';

const MockApp = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AppProvider>{children}</AppProvider>
    </MemoryRouter>
);

describe('Authentication Flow', () => {
    test('renders login page', () => {
        render(<MockApp><Login /></MockApp>);
        expect(screen.getByText(/Smart Inventory System/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email or Username/i)).toBeInTheDocument();
    });

    test('successful login with superadmin', async () => {
        render(<MockApp><Login /></MockApp>);

        fireEvent.change(screen.getByPlaceholderText(/Email or Username/i), { target: { value: 'superadmin' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'superadmin123' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        // Login is successful, toast or navigation should happen. 
        // Since it's a mock provider, we check if the user is set in localStorage or UI changes.
        await waitFor(() => {
            expect(localStorage.getItem('inventory_user')).toContain('superadmin');
        });
    });

    test('shows error on invalid login', async () => {
        // Note: toast is used in context, might need mocking but basic check is if it doesn't log in
        render(<MockApp><Login /></MockApp>);

        fireEvent.change(screen.getByPlaceholderText(/Email or Username/i), { target: { value: 'wrong' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(localStorage.getItem('inventory_user')).toBeNull();
        });
    });
});
