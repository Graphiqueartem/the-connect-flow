# Multi-Build Setup Guide

This guide explains how to configure multiple builds with different AutoConvert API configurations.

## Overview

The application supports multiple AutoConvert API keys, allowing you to have different builds (production, staging, client-specific, etc.) that submit to different AutoConvert endpoints or accounts.

## Setup Instructions

### 1. Configure API Keys in Supabase

Add your AutoConvert API keys as Supabase secrets:

**Default key** (used if no specific ID is configured):
- Secret name: `AUTOCONVERT_API_KEY`
- Secret value: Your default AutoConvert API key

**Additional keys** (for different builds):
- Secret name: `AUTOCONVERT_API_KEY_1`
- Secret value: Your first alternative AutoConvert API key

- Secret name: `AUTOCONVERT_API_KEY_2`
- Secret value: Your second alternative AutoConvert API key

- Secret name: `AUTOCONVERT_API_KEY_3`
- Secret value: Your third alternative AutoConvert API key

... and so on for as many different configurations as you need.

**Where to add these:**
1. Go to Supabase Dashboard → Settings → Edge Functions
2. Add each secret with its name and value
3. Changes take effect immediately, no redeployment needed

🔗 [Manage Secrets in Supabase](https://supabase.com/dashboard/project/qtxtfxnnrbedssfyzeyx/settings/functions)

### 2. Configure Your Build

For each build, set the environment variable to specify which API key to use:

**In your `.env` file:**
```env
# Leave empty or omit for default AUTOCONVERT_API_KEY
VITE_AUTOCONVERT_API_KEY_ID=""

# Or specify "1" to use AUTOCONVERT_API_KEY_1
VITE_AUTOCONVERT_API_KEY_ID="1"

# Or specify "2" to use AUTOCONVERT_API_KEY_2
VITE_AUTOCONVERT_API_KEY_ID="2"
```

**In your hosting environment:**

Most hosting platforms allow you to set environment variables per deployment:

- **Netlify**: Site settings → Environment variables
- **Vercel**: Project settings → Environment Variables
- **AWS Amplify**: App settings → Environment variables
- **Custom hosting**: Set environment variables in your build script or hosting config

## Example Use Cases

### Use Case 1: Staging vs Production
```env
# Staging build (.env.staging)
VITE_AUTOCONVERT_API_KEY_ID="1"

# Production build (.env.production)
VITE_AUTOCONVERT_API_KEY_ID="2"
```

### Use Case 2: Multiple Clients
```env
# Client A build
VITE_AUTOCONVERT_API_KEY_ID="clienta"

# Client B build
VITE_AUTOCONVERT_API_KEY_ID="clientb"
```

Corresponding Supabase secrets:
- `AUTOCONVERT_API_KEY_clienta`
- `AUTOCONVERT_API_KEY_clientb`

### Use Case 3: Testing
```env
# Test build (uses sandbox API key)
VITE_AUTOCONVERT_API_KEY_ID="test"

# Production build (uses live API key)
VITE_AUTOCONVERT_API_KEY_ID=""  # Uses default
```

## How It Works

1. **Frontend**: The app reads `VITE_AUTOCONVERT_API_KEY_ID` from environment variables at build time
2. **Edge Function**: Receives the `apiKeyId` parameter and loads the corresponding secret:
   - If `apiKeyId` is empty/null → uses `AUTOCONVERT_API_KEY`
   - If `apiKeyId` is "1" → uses `AUTOCONVERT_API_KEY_1`
   - If `apiKeyId` is "2" → uses `AUTOCONVERT_API_KEY_2`
   - etc.
3. **API Submission**: The edge function submits to AutoConvert using the selected API key

## Benefits

✅ **No code changes** - Configure via environment variables only  
✅ **Secure** - API keys stored in Supabase secrets, never in code  
✅ **Flexible** - Support unlimited different configurations  
✅ **Post-deployment changes** - Update API keys in Supabase without rebuilding  
✅ **Build-specific** - Each build can use a different AutoConvert account/endpoint  

## Troubleshooting

**Problem**: Getting "API key not configured" error

**Solution**: Make sure you've added the corresponding secret in Supabase:
- If using `VITE_AUTOCONVERT_API_KEY_ID="1"`, you need `AUTOCONVERT_API_KEY_1` in Supabase
- If using default (empty), you need `AUTOCONVERT_API_KEY` in Supabase

**Check edge function logs**: [View logs](https://supabase.com/dashboard/project/qtxtfxnnrbedssfyzeyx/functions/submit-to-autoconvert/logs)

## Same Concept for Address Lookup API

The same pattern can be applied to the address lookup API if needed:
1. Add `GETADDRESS_API_KEY_1`, `GETADDRESS_API_KEY_2`, etc. in Supabase
2. Add `VITE_ADDRESS_API_KEY_ID` environment variable
3. Update the `address-lookup` edge function to support multiple keys

Would you like me to implement this for the address lookup API as well?
