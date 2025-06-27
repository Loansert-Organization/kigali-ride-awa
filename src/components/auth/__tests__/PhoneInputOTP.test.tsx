import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneInputOTP from '../PhoneInputOTP';
import { toast } from '@/hooks/use-toast';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock OTPEntry6Box component
vi.mock('../OTPEntry6Box', () => ({
  default: ({ phoneNumber, onComplete, onSuccess, onCancel }: any) => (
    <div data-testid="otp-entry">
      <p>OTP Entry for {phoneNumber}</p>
      <button onClick={() => onComplete?.('123456')}>Complete</button>
      <button onClick={onSuccess}>Success</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('PhoneInputOTP', () => {
  const mockOnChange = vi.fn();
  const mockOnOTPSent = vi.fn();
  const mockOnOTPVerified = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default Rwanda country', () => {
    render(<PhoneInputOTP />);
    
    expect(screen.getByText('🇷🇼')).toBeInTheDocument();
    expect(screen.getByText('+250')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••• ••• •••')).toBeInTheDocument();
  });

  it('formats phone number as user types', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('••• ••• •••');
    await user.type(input, '788123456');
    
    expect(input).toHaveValue('788 123 456');
    expect(mockOnChange).toHaveBeenLastCalledWith('+250788123456');
  });

  it('validates phone number length', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP />);
    
    const input = screen.getByPlaceholderText('••• ••• •••');
    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    
    // Button should be disabled with incomplete number
    await user.type(input, '78812');
    expect(sendButton).toBeDisabled();
    
    // Button should be enabled with complete number
    await user.type(input, '3456');
    expect(sendButton).toBeEnabled();
  });

  it('shows error toast for invalid phone number', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP />);
    
    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendButton);
    
    expect(toast).toHaveBeenCalledWith({
      title: "Invalid phone number",
      description: "Please enter a valid phone number",
      variant: "destructive",
    });
  });

  it('changes country when selected from dropdown', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP />);
    
    // Open dropdown
    const countryButton = screen.getByRole('button', { name: /250/i });
    await user.click(countryButton);
    
    // Select Kenya
    const kenyaOption = screen.getByText('Kenya');
    await user.click(kenyaOption);
    
    expect(screen.getByText('🇰🇪')).toBeInTheDocument();
    expect(screen.getByText('+254')).toBeInTheDocument();
  });

  it('sends OTP and shows OTPEntry6Box', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP onOTPSent={mockOnOTPSent} />);
    
    const input = screen.getByPlaceholderText('••• ••• •••');
    await user.type(input, '788123456');
    
    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnOTPSent).toHaveBeenCalledWith('+250788123456');
      expect(screen.getByTestId('otp-entry')).toBeInTheDocument();
      expect(screen.getByText('OTP Entry for +250 788 123 456')).toBeInTheDocument();
    });
  });

  it('handles OTP verification', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP onOTPVerified={mockOnOTPVerified} />);
    
    // Send OTP first
    const input = screen.getByPlaceholderText('••• ••• •••');
    await user.type(input, '788123456');
    
    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendButton);
    
    // Complete OTP
    await waitFor(() => {
      const completeButton = screen.getByText('Complete');
      fireEvent.click(completeButton);
    });
    
    expect(mockOnOTPVerified).toHaveBeenCalledWith('+250788123456', '123456');
  });

  it('allows changing number after OTP sent', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP />);
    
    // Send OTP
    const input = screen.getByPlaceholderText('••• ••• •••');
    await user.type(input, '788123456');
    
    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendButton);
    
    // Click change number
    await waitFor(async () => {
      const changeButton = screen.getByText('Change number');
      await user.click(changeButton);
    });
    
    // Should be back to phone input
    expect(screen.getByPlaceholderText('••• ••• •••')).toBeInTheDocument();
  });

  it('handles cancel callback', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state when sending OTP', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP />);
    
    const input = screen.getByPlaceholderText('••• ••• •••');
    await user.type(input, '788123456');
    
    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendButton);
    
    // Should show loading state briefly
    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });

  it('shows check icon for valid phone number', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP />);
    
    const input = screen.getByPlaceholderText('••• ••• •••');
    await user.type(input, '788123456');
    
    const checkIcon = document.querySelector('.text-green-500');
    expect(checkIcon).toBeInTheDocument();
  });

  it('handles paste event correctly', async () => {
    const user = userEvent.setup();
    render(<PhoneInputOTP onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('••• ••• •••') as HTMLInputElement;
    
    // Simulate paste
    await user.click(input);
    await user.paste('788123456');
    
    expect(input.value).toBe('788 123 456');
    expect(mockOnChange).toHaveBeenCalledWith('+250788123456');
  });
}); 