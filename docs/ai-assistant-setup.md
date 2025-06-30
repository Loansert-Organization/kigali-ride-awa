# AI Trip Assistant Setup Guide

## Overview

The Kigali Ride AI Trip Assistant is a comprehensive AI-powered feature that helps users plan trips through natural language chat, proactive suggestions based on travel patterns, and multi-modal inputs (voice, image).

## Features

### 1. **Chat Interface**
- Natural language trip planning
- Voice input support with Whisper API
- Function calling for automatic trip draft creation
- Context-aware responses based on user location and history

### 2. **Proactive Suggestions**
- Learns from user travel patterns
- Suggests trips based on time of day and historical routes
- Smart notifications that don't interrupt user flow

### 3. **Multi-Modal Capabilities**
- **Voice**: Speech-to-text for hands-free input
- **Vision**: Analyze receipts, QR codes, or location images
- **Audio**: Text-to-speech for trip confirmations

### 4. **Embeddings & Similarity Search**
- Route similarity detection using OpenAI embeddings
- Pattern recognition for routine trips
- Personalized suggestions based on travel history

## Environment Setup

### 1. OpenAI API Key

Add to your `.env` file:
```bash
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ORG_ID=org-your-org-id  # Optional
```

### 2. Supabase Configuration

The AI features require these Supabase environment variables:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup

Run the migration to create AI-related tables:
```bash
supabase migration up
```

This creates:
- `user_trip_history` - Stores trip patterns for learning
- `ai_draft_trips` - Holds AI-generated trip suggestions
- `dialog_messages` - Chat conversation history
- `ai_threads` - OpenAI Assistant thread management
- `voice_transcriptions` - Voice input history

### 4. Edge Functions Deployment

Deploy the AI edge functions:

```bash
# Main AI agent
supabase functions deploy ai-trip-agent --no-verify-jwt

# Proactive suggestions cron job
supabase functions deploy ai-daily-suggest --no-verify-jwt
```

### 5. Cron Job Setup

Add to your `supabase/config.toml`:

```toml
[functions.ai-daily-suggest]
schedule = "*/15 * * * *"  # Every 15 minutes
```

## Usage

### Chat Interface

The AI chat is accessible via a floating action button (FAB) on all pages:

```typescript
import { ChatDrawer } from '@/features/ai-chat/ChatDrawer';

// In your layout component
<ChatDrawer />
```

### Draft Trip Banner

AI suggestions appear as dismissible banners:

```typescript
import { DraftTripBanner } from '@/features/ai-chat/DraftTripBanner';

// In your app root
<DraftTripBanner />
```

### Saving Trip History

When trips are created, save them for AI learning:

```typescript
import { useTripHistory } from '@/hooks/useTripHistory';

const { saveTripToHistory } = useTripHistory();

// After successful trip creation
await saveTripToHistory({
  role: 'driver',
  origin: { lat, lng, address },
  destination: { lat, lng, address },
  departureTime: new Date(),
  seats: 2,
  vehicleType: 'car',
  fareAmount: 1500
});
```

## API Endpoints

### Chat Endpoint
```
POST /functions/v1/ai-trip-agent
{
  "userId": "user-uuid",
  "message": "Take me to the airport at 5pm",
  "action": "chat"
}
```

### Voice Transcription
```
POST /functions/v1/ai-trip-agent
{
  "userId": "user-uuid",
  "action": "voice_to_text",
  "data": {
    "audioBase64": "base64-encoded-audio",
    "language": "en"
  }
}
```

### Image Analysis
```
POST /functions/v1/ai-trip-agent
{
  "userId": "user-uuid",
  "action": "analyze_image",
  "data": {
    "imageBase64": "base64-encoded-image",
    "prompt": "Extract the destination from this receipt"
  }
}
```

### Proactive Suggestions
```
POST /functions/v1/ai-trip-agent
{
  "userId": "user-uuid",
  "action": "generate_suggestions"
}
```

## OpenAI Features Used

| Feature | Purpose | Model |
|---------|---------|-------|
| Chat Completions | Conversational interface | gpt-4o-mini |
| Function Calling | Create trip drafts | Built into chat |
| Embeddings | Route similarity | text-embedding-3-small |
| Whisper | Voice transcription | whisper-1 |
| TTS | Audio confirmations | tts-1 |
| Vision | Image analysis | gpt-4o-mini |
| Moderation | Content filtering | text-moderation-latest |

## Best Practices

1. **Privacy**: User data is stored locally and only processed when explicitly requested
2. **Rate Limiting**: Implement client-side throttling for API calls
3. **Error Handling**: Graceful fallbacks when AI services are unavailable
4. **Cost Control**: Use gpt-4o-mini for most tasks, upgrade to gpt-4o only when needed
5. **Caching**: Cache embeddings and common responses to reduce API calls

## Monitoring

Monitor AI usage through:
1. Supabase Edge Function logs
2. OpenAI usage dashboard
3. Custom analytics events

## Troubleshooting

### Common Issues

1. **"Failed to get response"**
   - Check OpenAI API key in environment
   - Verify edge function is deployed
   - Check CORS settings

2. **Voice input not working**
   - Ensure HTTPS connection (required for getUserMedia)
   - Check microphone permissions
   - Verify browser compatibility

3. **No proactive suggestions**
   - Ensure user has trip history
   - Check cron job is running
   - Verify time patterns match

## Future Enhancements

1. **Multi-language Support**: Add French, Swahili support
2. **Group Trip Planning**: AI coordination for multiple passengers
3. **Price Negotiation**: AI-assisted fare suggestions
4. **Safety Features**: Route safety scoring using historical data
5. **Weather Integration**: Adjust suggestions based on weather

## Security Considerations

1. All API keys stored in environment variables
2. User data encrypted at rest in Supabase
3. RLS policies enforce data isolation
4. Content moderation prevents abuse
5. Rate limiting prevents API abuse

## Cost Estimation

Based on typical usage:
- Chat: ~$0.001 per conversation
- Embeddings: ~$0.0001 per route
- Voice: ~$0.006 per minute
- Total estimated: ~$0.10 per active user per month

## Support

For issues or questions:
1. Check Supabase Edge Function logs
2. Review OpenAI API error responses
3. Enable debug mode in development
4. Contact support with correlation IDs 