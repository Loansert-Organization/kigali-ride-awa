
import React from 'react';
import { render, screen } from '@testing-library/react';
import PhoneInputOTP from '../PhoneInputOTP';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

describe('PhoneInputOTP', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders phone input form', () => {
    render(<PhoneInputOTP {...defaultProps} />);
    
    expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
    expect(screen.getByText('Send verification code')).toBeInTheDocument();
  });

  it('shows country selector', () => {
    render(<PhoneInputOTP {...defaultProps} />);
    
    expect(screen.getByText('+250')).toBeInTheDocument(); // Default Rwanda
  });

  it('handles cancel button', () => {
    render(<PhoneInputOTP {...defaultProps} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
