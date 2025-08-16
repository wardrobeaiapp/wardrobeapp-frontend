import React from 'react';
import { render, screen } from '@testing-library/react';
import FormField from '../FormField';

describe('FormField', () => {
  it('renders with label', () => {
    render(
      <FormField label="Test Label">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });
});
