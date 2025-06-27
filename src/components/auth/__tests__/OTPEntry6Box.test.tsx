import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OTPEntry6Box from '../OTPEntry6Box';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('OTPEntry6Box', () => {
  const mockOnChange = vi.fn();
  const mockOnComplete = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 6 input boxes by default', () => {
    render(<OTPEntry6Box />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
    
    inputs.forEach((input, index) => {
      expect(input).toHaveAttribute('aria-label', `Digit ${index + 1} of 6`);
    });
  });

  it('auto-focuses first input on mount', () => {
    render(<OTPEntry6Box autoFocus />);
    
    const firstInput = screen.getAllByRole('textbox')[0];
    expect(document.activeElement).toBe(firstInput);
  });

  it('accepts only numeric input', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box onChange={mockOnChange} />);
    
    const firstInput = screen.getAllByRole('textbox')[0];
    
    // Type letters - should not accept
    await user.type(firstInput, 'abc');
    expect(firstInput).toHaveValue('');
    
    // Type numbers - should accept
    await user.type(firstInput, '1');
    expect(firstInput).toHaveValue('1');
    expect(mockOnChange).toHaveBeenCalledWith('1');
  });

  it('auto-advances to next input on digit entry', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box />);
    
    const inputs = screen.getAllByRole('textbox');
    
    await user.type(inputs[0], '1');
    expect(document.activeElement).toBe(inputs[1]);
    
    await user.type(inputs[1], '2');
    expect(document.activeElement).toBe(inputs[2]);
  });

  it('handles backspace to go to previous input', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Type in first two inputs
    await user.type(inputs[0], '1');
    await user.type(inputs[1], '2');
    
    // Backspace from third input (empty) should go to second
    await user.click(inputs[2]);
    await user.keyboard('{Backspace}');
    expect(document.activeElement).toBe(inputs[1]);
    expect(inputs[1]).toHaveValue('');
  });

  it('handles paste event correctly', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box onChange={mockOnChange} onComplete={mockOnComplete} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Paste full OTP
    await user.click(inputs[0]);
    await user.paste('123456');
    
    // Check all inputs are filled
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('5');
    expect(inputs[5]).toHaveValue('6');
    
    expect(mockOnChange).toHaveBeenCalledWith('123456');
    expect(mockOnComplete).toHaveBeenCalledWith('123456');
  });

  it('handles partial paste correctly', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Paste partial OTP
    await user.click(inputs[0]);
    await user.paste('123');
    
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('');
    
    // Focus should be on the next empty input
    expect(document.activeElement).toBe(inputs[3]);
  });

  it('calls onComplete when all digits are entered', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box onComplete={mockOnComplete} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Type all digits
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], String(i + 1));
    }
    
    expect(mockOnComplete).toHaveBeenCalledWith('123456');
  });

  it('handles arrow key navigation', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Start at second input
    await user.click(inputs[1]);
    
    // Arrow left
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(inputs[0]);
    
    // Arrow right
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('shows error state when error prop is true', () => {
    render(<OTPEntry6Box error errorMessage="Invalid code" />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveClass('border-destructive');
    });
    
    expect(screen.getByText('Invalid code')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<OTPEntry6Box loading />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
    
    expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled();
  });

  it('handles Enter key to submit', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box onComplete={mockOnComplete} value="123456" />);
    
    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[5]);
    await user.keyboard('{Enter}');
    
    expect(mockOnComplete).toHaveBeenCalledWith('123456');
  });

  it('disables verify button when incomplete', () => {
    render(<OTPEntry6Box value="123" />);
    
    const verifyButton = screen.getByRole('button', { name: /verify code/i });
    expect(verifyButton).toBeDisabled();
  });

  it('enables verify button when complete', () => {
    render(<OTPEntry6Box value="123456" />);
    
    const verifyButton = screen.getByRole('button', { name: /verify code/i });
    expect(verifyButton).toBeEnabled();
  });

  it('handles cancel callback', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows phone number when provided', () => {
    render(<OTPEntry6Box phoneNumber="+250788123456" />);
    
    expect(screen.getByText('Enter the 6-digit code sent to +250788123456')).toBeInTheDocument();
  });

  it('handles custom length', () => {
    render(<OTPEntry6Box length={4} />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('shows success toast on verification', async () => {
    const user = userEvent.setup();
    render(<OTPEntry6Box onSuccess={mockOnSuccess} />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Enter complete OTP
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], '1');
    }
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Verification successful",
        description: "Your phone number has been verified",
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('clears inputs on verification failure', async () => {
    const user = userEvent.setup();
    
    // Mock failed verification
    vi.spyOn(global, 'Promise').mockImplementationOnce(() => 
      Promise.reject(new Error('Invalid OTP'))
    );
    
    render(<OTPEntry6Box />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // Enter OTP
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], '1');
    }
    
    await waitFor(() => {
      // All inputs should be cleared
      inputs.forEach(input => {
        expect(input).toHaveValue('');
      });
      
      // Focus should be back on first input
      expect(document.activeElement).toBe(inputs[0]);
    });
  });
}); 