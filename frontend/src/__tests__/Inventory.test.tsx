import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context';
import Inventory from '../pages/Inventory';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, describe } from 'vitest';

const MockApp = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <AppProvider>{children}</AppProvider>
    </MemoryRouter>
);

describe('Inventory Management', () => {
    test('renders initial products', () => {
        render(<MockApp><Inventory /></MockApp>);
        expect(screen.getByText(/MacBook Pro M3/i)).toBeInTheDocument();
    });

    test('filters products by search term', async () => {
        render(<MockApp><Inventory /></MockApp>);
        const searchInput = screen.getByPlaceholderText(/Search products/i);

        fireEvent.change(searchInput, { target: { value: 'iPhone' } });

        expect(screen.getByText(/iPhone 15/i)).toBeInTheDocument();
        expect(screen.queryByText(/MacBook Pro/i)).not.toBeInTheDocument();
    });

    test('opens add product modal', () => {
        render(<MockApp><Inventory /></MockApp>);
        const addBtn = screen.getByText(/Add Product/i);
        fireEvent.click(addBtn);
        expect(screen.getByText(/Add New Product/i)).toBeInTheDocument();
    });
});
