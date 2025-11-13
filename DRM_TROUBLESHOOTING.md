# Spotify Playback DRM Troubleshooting

## The Problem
Your browser is showing: `EMEError: No supported keysystem was found`

This means Chrome cannot access Widevine CDM (Content Decryption Module), which Spotify requires for playback.

## Solutions (Try in order)

### 1. Check Chrome's DRM Settings
1. Go to: `chrome://settings/content/protectedContent`
2. Ensure **both** these are enabled:
   - ✅ "Allow sites to play protected content"
   - ✅ "Allow identifiers for protected content"
3. Restart Chrome completely (quit and reopen)

### 2. Check Chrome Components
1. Go to: `chrome://components/`
2. Find "Widevine Content Decryption Module"
3. Click "Check for update"
4. Make sure status shows "Up to date" or "Component updated"
5. Restart Chrome

### 3. Disable Conflicting Extensions
Common extensions that block DRM:
- uBlock Origin (disable for 127.0.0.1)
- Privacy Badger
- Ghostery
- NoScript
- Any VPN extensions

**Disable these temporarily** to test if they're blocking DRM.

### 4. Clear Browser Data
1. Go to: `chrome://settings/clearBrowserData`
2. Select "Cookies and other site data"
3. Select "Cached images and files"
4. Click "Clear data"
5. Restart Chrome

### 5. Check if you're in Incognito Mode
- Incognito mode blocks DRM by default
- Use a regular Chrome window

### 6. macOS Specific: Check Security Settings
1. Go to System Preferences > Security & Privacy
2. Go to "Privacy" tab
3. Check "Microphone" - make sure Chrome is allowed (for Spotify)
4. Restart your Mac if you made changes

### 7. Last Resort: Reset Chrome
```bash
# Backup your data first!
# Then reset Chrome to defaults
```
Go to: `chrome://settings/reset`

### 8. Try Firefox or Edge
If Chrome still doesn't work, try Firefox:
```bash
# Firefox usually has better DRM support out of the box
open -a Firefox http://127.0.0.1:5173
```

## Verify It's Working
After trying the above:
1. Go to: `chrome://components/`
2. Widevine should show as "Up to date"
3. Refresh your Concert Time Machine app
4. Check console - the EME error should be gone

## Still Not Working?
Check Spotify account:
- Verify you have Spotify Premium (required)
- Try logging into spotify.com in the same browser
- Try playing a song there first

## Alternative: Use Spotify Desktop App
If web playback won't work, you can:
1. Open Spotify desktop app
2. In your web app, the deviceId will connect to your desktop app
3. Playback will work through the desktop app
