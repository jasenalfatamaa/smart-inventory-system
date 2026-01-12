import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, useAuth } from '../../context';
import Login from '../../pages/Login';
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
        expect(screen.getByText(/Selamat Datang/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Masukkan kredensial Anda/i)).toBeInTheDocument();
    });

    test('successful login with superadmin', async () => {
        render(<MockApp><Login /></MockApp>);

        fireEvent.change(screen.getByPlaceholderText(/Masukkan kredensial Anda/i), { target: { value: 'superadmin' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'superadmin123' } });
        fireEvent.click(screen.getByRole('button', { name: /Masuk Sekarang/i }));

        // Login is successful, toast or navigation should happen. 
        // Since it's a mock provider, we check if the user is set in localStorage or UI changes.
        await waitFor(() => {
            expect(localStorage.getItem('inventory_user')).toContain('superadmin');
        });
    });

    test('shows error on invalid login', async () => {
        // Note: toast is used in context, might need mocking but basic check is if it doesn't log in
        render(<MockApp><Login /></MockApp>);

        fireEvent.change(screen.getByPlaceholderText(/Masukkan kredensial Anda/i), { target: { value: 'wrong' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /Masuk Sekarang/i }));

        await waitFor(() => {
            expect(localStorage.getItem('inventory_user')).toBeNull();
        });
    });
});
