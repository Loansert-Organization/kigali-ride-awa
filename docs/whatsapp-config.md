
# WhatsApp Cloud API Configuration

## Current Settings (Updated: June 26, 2025)

### Phone Number ID
- **Current Value**: `396791596844039`
- **Used in**: All WhatsApp Cloud API endpoint calls
- **API Endpoint**: `https://graph.facebook.com/v19.0/396791596844039/messages`

### Template Name
- **Current Template**: `autho_rw`
- **Language Code**: `en` (English)
- **Used for**: Authentication OTP messages
- **Parameters**: 1 text parameter (OTP code)

### Template Configuration
The `autho_rw` template should be configured in the WhatsApp Business Manager with:
- **Category**: Authentication
- **Language**: English
- **Body**: Contains a placeholder for the OTP code
- **Components**: Body with one text parameter

### Files Updated
1. `supabase/functions/send-whatsapp-template/index.ts` - Main OTP sending function
2. `supabase/functions/queue-worker/index.ts` - Background notification handler
3. `supabase/functions/send-wa-code/index.ts` - Alternative OTP sending function
4. `src/components/auth/WhatsAppOTPFlow.tsx` - Frontend OTP flow component
5. `src/components/profile/WhatsAppOTPBlock.tsx` - Profile WhatsApp status block

### Environment Variables Required
- `WHATSAPP_API_TOKEN` - WhatsApp Business API access token
- Phone Number ID is now hardcoded as `396791596844039`

### Testing
To test the WhatsApp integration:
1. Ensure the `autho_rw` template is approved in WhatsApp Business Manager
2. Test with a verified phone number
3. Check edge function logs for detailed API responses
4. Verify OTP delivery and verification flow

### Fallback Behavior
If the template message fails, the system falls back to sending a plain text message with the same OTP code.

### Debugging
- All API calls are logged with full request/response details
- Phone Number ID and template name are logged for verification
- Error messages include specific WhatsApp API error codes and messages
