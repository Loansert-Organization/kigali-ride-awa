import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import LocationInputBlock from '../LocationInputBlock';

// Mock Google Maps service
vi.mock('@/services/GoogleMapsService', () => ({
  googleMapsService: {
    getCurrentLocation: vi.fn(),
    geocodeLocation: vi.fn(),
  },
}));

// Mock LocationPicker
vi.mock('@/components/maps/LocationPicker', () => ({
  default: ({ onLocationSelect }: any) => (
    <div data-testid="location-picker">
      <button onClick={() => onLocationSelect({ lat: -1.9536, lng: 30.0606, address: 'Test Location' })}>
        Select Location
      </button>
    </div>
  ),
}));

describe('LocationInputBlock', () => {
  const defaultProps = {
    label: 'Pick-up Location',
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all required elements', () => {
    render(<LocationInputBlock {...defaultProps} />);

    expect(screen.getByText('Pick-up Location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use my location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pick on map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /type manually/i })).toBeInTheDocument();
  });

  it('should show manual input when type manually is clicked', async () => {
    const user = userEvent.setup();
    render(<LocationInputBlock {...defaultProps} />);

    const typeManuallyButton = screen.getByRole('button', { name: /type manually/i });
    await user.click(typeManuallyButton);

    expect(screen.getByPlaceholderText('Enter location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to options/i })).toBeInTheDocument();
  });

  it('should display selected value', () => {
    const props = {
      ...defaultProps,
      value: 'Kigali City Center',
    };
    render(<LocationInputBlock {...props} />);

    expect(screen.getByText('Kigali City Center')).toBeInTheDocument();
  });

  it('should call onChange when manual input changes', async () => {
    const user = userEvent.setup();
    render(<LocationInputBlock {...defaultProps} />);

    // Click type manually
    await user.click(screen.getByRole('button', { name: /type manually/i }));

    // Type in the input
    const input = screen.getByPlaceholderText('Enter location');
    await user.type(input, 'New Location');

    // onChange is called for each character, so check the last call
    expect(defaultProps.onChange).toHaveBeenLastCalledWith('New Location');
  });

  it('should render favorites when provided', () => {
    const favorites = [
      { id: '1', label: 'Home', address: '123 Main St' },
      { id: '2', label: 'Work', address: '456 Office Blvd' },
    ];

    render(<LocationInputBlock {...defaultProps} favorites={favorites} />);

    // Look for the emoji and text together
    expect(screen.getByText('⭐ Your Favorites')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });
}); 