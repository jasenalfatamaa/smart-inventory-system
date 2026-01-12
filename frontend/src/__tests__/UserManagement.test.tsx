import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../../context';
import UserManagement from '../../pages/UserManagement';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, describe } from 'vitest';

const MockApp = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AppProvider>{children}</AppProvider>
    </MemoryRouter>
);

describe('User Management', () => {
    test('renders user list for super admin', () => {
        render(<MockApp><UserManagement /></MockApp>);
        expect(screen.getAllByText(/Super Admin/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Admin Gudang/i).length).toBeGreaterThan(0);
    });

    test('contains add user button', () => {
        render(<MockApp><UserManagement /></MockApp>);
        expect(screen.getByText(/Add User/i)).toBeInTheDocument();
    });
});
