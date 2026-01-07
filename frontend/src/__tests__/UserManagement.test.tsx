import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context';
import UserManagement from '../pages/UserManagement';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, describe } from 'vitest';

const MockApp = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AppProvider>{children}</AppProvider>
    </MemoryRouter>
);

describe('User Management', () => {
    test('renders user list for super admin', () => {
        // Note: In context.tsx, the default mock user is null, but we can test if it renders the list of INITIAL_USERS
        render(<MockApp><UserManagement /></MockApp>);
        expect(screen.getByText(/Super Admin/i)).toBeInTheDocument();
        expect(screen.getByText(/Admin Gudang/i)).toBeInTheDocument();
    });

    test('contains add user button', () => {
        render(<MockApp><UserManagement /></MockApp>);
        expect(screen.getByText(/Add User/i)).toBeInTheDocument();
    });
});
