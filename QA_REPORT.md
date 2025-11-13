# QA Report - Concert Time Machine

**Date:** November 13, 2025  
**Tester:** AI Assistant  
**Environment:** Development (localhost:5173)

## Critical Issues 🔴

### 1. **ROUTING BROKEN - Concert Player Page Not Rendering**
**Severity:** CRITICAL  
**Status:** BROKEN

**Description:**
When clicking on any concert card (e.g., Nirvana MTV Unplugged), the URL correctly changes to `/concert/nirvana-mtv-unplugged-1993`, but the homepage content continues to display instead of the ConcertPlayer component.

**Steps to Reproduce:**
1. Navigate to homepage (`/`)
2. Click on any concert card (e.g., "Nirvana - MTV Unplugged")
3. Observe URL changes to `/concert/nirvana-mtv-unplugged-1993`
4. Observe homepage content still displays

**Expected Behavior:**
- ConcertPlayer component should render
- Should show concert details, setlist, and player controls

**Actual Behavior:**
- Homepage content continues to display
- No concert player UI appears

**Impact:**
- Users cannot access concert player pages
- Core functionality is completely broken
- App is unusable for its primary purpose

**Technical Details:**
- React Router routes are configured correctly in `App.tsx`
- Route path `/concert/:concertId` exists and points to ConcertPlayer
- Concert ID exists in data (`nirvana-mtv-unplugged-1993`)
- Issue appears to be with component rendering, not routing logic

---

### 2. **Spotify API 401 Errors - No Error Handling**
**Severity:** HIGH  
**Status:** BROKEN

**Description:**
The app makes hundreds of Spotify API calls with invalid/expired tokens, resulting in 401 Unauthorized errors. No error handling or user feedback is provided.

**Steps to Reproduce:**
1. Load app with invalid token in localStorage
2. Open browser console
3. Observe hundreds of 401 errors for:
   - `/v1/tracks/{trackId}` calls
   - `/v1/search?q={artist}&type=artist` calls

**Expected Behavior:**
- App should detect invalid token
- Should prompt user to re-authenticate
- Should gracefully handle API failures
- Should show user-friendly error messages

**Actual Behavior:**
- Hundreds of 401 errors flood console
- No user-facing error messages
- App continues to attempt API calls
- Images fail to load silently

**Impact:**
- Poor user experience
- Wasted API quota
- No feedback when authentication fails
- Images don't load but no indication why

**Affected Components:**
- `HomePage.tsx` - fetching album art and artist images
- `ConcertPlayer.tsx` - fetching album art
- `spotifyImages.ts` - image fetching utilities

---

## Major Issues 🟠

### 3. **Header Search Button - No Functionality**
**Severity:** MEDIUM  
**Status:** INCOMPLETE

**Description:**
The search button in the header (top right) has no onClick handler and does nothing when clicked.

**Steps to Reproduce:**
1. Click the search icon button in the header
2. Observe no action occurs

**Expected Behavior:**
- Should open search modal/dialog
- Should focus search input
- Should provide search functionality

**Actual Behavior:**
- Button is clickable but does nothing
- No visual feedback or action

**Location:**
- `src/components/Header.tsx` line 77-84

---

### 4. **setlist.fm Search Button Disabled State**
**Severity:** LOW  
**Status:** QUESTIONABLE UX

**Description:**
The search button in the setlist.fm search component is disabled when the input is empty. While this prevents empty searches, it may confuse users who expect to be able to click it.

**Steps to Reproduce:**
1. Navigate to homepage
2. Scroll to "Can't find what you're looking for?" section
3. Observe search button is disabled
4. Type in search box
5. Button remains disabled until text is entered

**Expected Behavior:**
- Button should be enabled but show validation message on click
- OR button should be enabled with placeholder text handling

**Actual Behavior:**
- Button is disabled when input is empty
- No indication why it's disabled

**Impact:**
- Minor UX confusion
- Users may not understand why they can't search

### 5. **thumbnails flashing**
**Severity:** MEDIUM  
**Status:** BAD UX

**Description:**
The thumbnails of the concerts flash on the navigation page. This is really annoying and distracting. Additionally, we should not be using stock photos for the thumbnails and should instead pull artist photos from Spotify.


---

## Working Features ✅

### 5. **Homepage Search Functionality**
**Status:** WORKING

**Description:**
The main search bar on the homepage correctly filters concerts by artist, venue, or concert name.

**Test Results:**
- ✅ Typing "Nirvana" filters to show only Nirvana concert
- ✅ Search results display correctly
- ✅ Clear search button works
- ✅ Search badges (Nirvana, Queen, The Beatles) work

---

### 6. **Decade Filter Buttons**
**Status:** WORKING (Visual Only - Not Tested Functionality)

**Description:**
Decade filter buttons are visible and appear to be functional. Visual feedback shows selected state.

**Note:** Full functionality not tested due to routing issue preventing navigation.

---

## Recommendations

### Immediate Fixes Required:
1. **Fix routing issue** - This is blocking all concert player functionality
2. **Add error handling** for Spotify API calls
3. **Implement token validation** and refresh logic
4. **Add user-facing error messages** for API failures

### Short-term Improvements:
1. **Implement header search functionality** or remove the button
2. **Improve setlist.fm search UX** - add placeholder text or enable button with validation
3. **Add loading states** for image fetching
4. **Add retry logic** for failed API calls

### Testing Notes:
- Testing was limited due to routing issue preventing access to concert player pages
- Could not test:
  - Concert player controls
  - Playback functionality
  - Setlist interaction
  - Audio effects
  - Player state management

---

## Summary

**Total Issues Found:** 4  
**Critical:** 1  
**High:** 1  
**Medium:** 1  
**Low:** 1

**Overall Status:** 🔴 **BROKEN** - Critical routing issue prevents core functionality

The app has a critical routing bug that prevents users from accessing concert player pages. Additionally, there are significant issues with error handling for Spotify API calls that result in poor user experience and wasted resources.

