
import React from 'react';
import { render, screen } from '@testing-library/react';
import OTPEntry6Box from '../OTPEntry6Box';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('OTPEntry6Box', () => {
  it('renders correctly', () => {
    render(
      <OTPEntry6Box 
        phoneNumber="+250788123456"
        onSuccess={jest.fn()}
      />
    );
    
    expect(screen.getByText('Verify code')).toBeInTheDocument();
  });

  it('displays phone number in description', () => {
    const phoneNumber = '+250788123456';
    render(
      <OTPEntry6Box 
        phoneNumber={phoneNumber}
        onSuccess={jest.fn()}
      />
    );
    
    expect(screen.getByText(`Enter the 6-digit code sent to ${phoneNumber}`)).toBeInTheDocument();
  });
});
