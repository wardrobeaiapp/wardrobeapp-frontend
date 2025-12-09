# Deployment Guide

## Problem Solved

The app was experiencing 404 errors on the hosted version because the backend API routes weren't being served. This happened because:

1. **Localhost**: React app proxy setting routes API requests to Express server at `localhost:5000`
2. **Production**: Backend server wasn't deployed, causing 404 errors and HTML responses instead of JSON

## Solution Implemented

### 1. Netlify Functions Setup
- Created `netlify.toml` configuration for Netlify deployment
- Converted server API routes to Netlify Functions (serverless)
- Added proper CORS headers and request handling

### 2. Environment-Aware API Configuration
- Created `src/config/api.ts` for environment-specific API configuration
- Updated components to use centralized API configuration
- Supports both development (proxy) and production (serverless functions)

### 3. Files Added/Modified

**New Files:**
- `netlify.toml` - Netlify deployment configuration
- `netlify/functions/waitlist.js` - Serverless waitlist API function
- `netlify/functions/package.json` - Function dependencies
- `src/config/api.ts` - API configuration
- `deploy.md` - This deployment guide

**Modified Files:**
- `src/pages/Demo/steps/WaitlistStep.tsx` - Updated to use API configuration

## Deployment Steps

### For Netlify:

1. **Environment Variables**: Set these in Netlify dashboard:
   ```
   EMAIL_OCTOPUS_API_KEY=your_api_key_here
   EMAIL_OCTOPUS_LIST_ID=your_list_id_here
   ```

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Functions directory: `netlify/functions`

3. **Deploy**: 
   ```bash
   # If using Netlify CLI
   netlify deploy --prod
   
   # Or push to connected Git repository
   git add .
   git commit -m "Fix deployment: Add Netlify Functions support"
   git push origin main
   ```

### For Vercel:

1. Create `vercel.json`:
   ```json
   {
     "functions": {
       "api/waitlist.js": {
         "runtime": "@vercel/node"
       }
     },
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. Move functions to `api/` directory and deploy.

## Testing

After deployment:

1. **Test waitlist functionality**: Go to demo page → waitlist step → try submitting email
2. **Check browser network tab**: Should see successful API calls (200 status)
3. **Verify Email Octopus**: Check if emails are being added to your list
4. **Test error handling**: Try invalid emails, duplicate emails

## Troubleshooting

**Still getting 404s?**
- Check that environment variables are set in hosting dashboard
- Verify functions directory is correctly configured
- Check build logs for any errors

**Getting CORS errors?**
- Verify CORS headers are set in Netlify function
- Check if hosting platform requires additional CORS configuration

**Function timeout errors?**
- Check function logs in hosting dashboard
- Verify Email Octopus API credentials are correct
- Test Email Octopus API directly

## Next Steps

For other API endpoints that need similar treatment:
1. Create corresponding serverless functions in `netlify/functions/`
2. Update their imports in components to use `getApiUrl(API_ENDPOINTS.ENDPOINT_NAME)`
3. Add endpoint to `API_ENDPOINTS` object in `src/config/api.ts`
