
import React from 'react';
import { render, screen } from '@testing-library/react';
import LocationInputBlock from '../LocationInputBlock';

describe('LocationInputBlock', () => {
  const defaultProps = {
    title: 'Pickup Location',
    value: '',
    onChange: jest.fn(),
  };

  it('renders with title', () => {
    render(<LocationInputBlock {...defaultProps} />);
    
    expect(screen.getByText('Pickup Location')).toBeInTheDocument();
  });

  it('renders location input', () => {
    render(<LocationInputBlock {...defaultProps} />);
    
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
  });

  it('shows current location button', () => {
    render(<LocationInputBlock {...defaultProps} />);
    
    expect(screen.getByText('Use Current Location')).toBeInTheDocument();
  });
});
