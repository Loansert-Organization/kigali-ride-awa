import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient } from '@/services/APIClient';

// Utility to mock fetch responses
function mockFetch(response: any, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
    statusText: ok ? 'OK' : 'Bad Request'
  }) as unknown as typeof fetch;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiClient.notifications.sendWhatsAppInvite', () => {
  it('returns WhatsApp URL when phone and message provided', async () => {
    const whatsappUrl = 'https://wa.me/250123456?text=hello';
    global.fetch = mockFetch({ success: true, whatsapp_url: whatsappUrl });

    const result = await apiClient.notifications.sendWhatsAppInvite('+250123456', 'hello');

    expect(global.fetch).toHaveBeenCalledOnce();
    // result may be returned directly or wrapped in data
    const url = (result as any).whatsapp_url || (result as any).data?.whatsapp_url;
    expect(url).toBe(whatsappUrl);
  });

  it('handles missing parameters gracefully', async () => {
    global.fetch = mockFetch({}, false);

    const result = await apiClient.notifications.sendWhatsAppInvite('', '');

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Bad Request');
  });
});
