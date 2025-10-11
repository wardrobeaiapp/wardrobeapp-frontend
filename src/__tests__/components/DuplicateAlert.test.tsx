/**
 * Component tests for duplicate alert functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component - replace with your actual component path
const DuplicateAlert: React.FC<{ duplicates: string[]; onDismiss: () => void }> = ({ duplicates, onDismiss }) => {
  if (duplicates.length === 0) return null;
  
  return (
    <div data-testid="duplicate-alert" role="alert">
      <h3>Duplicate Items Detected</h3>
      <p>You already have {duplicates.length} similar items:</p>
      <ul>
        {duplicates.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
};

describe('DuplicateAlert Component', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  it('renders duplicate alert with multiple items', () => {
    const duplicates = ['White T-Shirt', 'White T-shirt'];
    
    render(
      <DuplicateAlert 
        duplicates={duplicates} 
        onDismiss={mockOnDismiss} 
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Duplicate Items Detected')).toBeInTheDocument();
    expect(screen.getByText('You already have 2 similar items:')).toBeInTheDocument();
    expect(screen.getByText('White T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('White T-shirt')).toBeInTheDocument();
  });

  it('does not render when no duplicates exist', () => {
    render(
      <DuplicateAlert 
        duplicates={[]} 
        onDismiss={mockOnDismiss} 
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const duplicates = ['White T-Shirt'];
    
    render(
      <DuplicateAlert 
        duplicates={duplicates} 
        onDismiss={mockOnDismiss} 
      />
    );

    fireEvent.click(screen.getByText('Dismiss'));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('handles single duplicate item correctly', () => {
    const duplicates = ['Black T-shirt'];
    
    render(
      <DuplicateAlert 
        duplicates={duplicates} 
        onDismiss={mockOnDismiss} 
      />
    );

    expect(screen.getByText('You already have 1 similar items:')).toBeInTheDocument();
    expect(screen.getByText('Black T-shirt')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    const duplicates = ['White T-Shirt'];
    
    render(
      <DuplicateAlert 
        duplicates={duplicates} 
        onDismiss={mockOnDismiss} 
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-testid', 'duplicate-alert');
  });
});
