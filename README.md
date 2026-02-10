# Clickable Links Chrome Extension

A Chrome extension that automatically converts unclickable text patterns (URLs, email addresses, IP addresses, and magnet links) into clickable hyperlinks on any webpage.

## Overview

**Clickable Links** is a lightweight Manifest V3 Chrome extension that enhances web browsing by making text-based links clickable. The extension runs on virtually all websites and intelligently converts various URL formats into proper hyperlinks without breaking existing page functionality.

## Key Features

- ✅ **Auto-linkifies 6 different URL patterns**
- ✅ **Respects existing links** (won't double-link)
- ✅ **User configurable** (open in new tab option)
- ✅ **Cross-device sync** via Chrome storage
- ✅ **Lightweight** (~137 lines of custom code)
- ✅ **Smart exclusions** (avoids conflicts with major sites)
- ✅ **Safe DOM manipulation** (preserves page structure)

## Supported Link Types

| Type | Example | Output |
|------|---------|---------|
| **Email** | `user@example.com` | `mailto:` link |
| **Complete URLs** | `https://example.com/page` | Direct link |
| **File URLs** | `file:///C:/path/file.txt` | Local file link |
| **Domain names** | `example.com` | `http://example.com` |
| **IP addresses** | `192.168.1.1` | `http://192.168.1.1` |
| **Magnet links** | `magnet:?xt=urn:btih:...` | Torrent link |

## Architecture

### File Structure
```
clickable/
├── manifest.json              # Extension configuration (MV3)
├── content.js                 # Main linkification logic
├── options.js                 # Options page functionality
├── options.html               # User settings interface
├── jquery.min.js              # jQuery library (v1.8.1)
├── jquery.ba-replacetext.js   # Custom text replacement plugin
└── icon*.png                  # Extension icons (16,32,48,128px)
```

### Core Components

1. **Content Script** (`content.js:3`)
   - Injected into all webpages except exclusions
   - Contains 6 regex patterns for different link types
   - Reads user preferences from Chrome storage

2. **Text Replacement Engine** (`jquery.ba-replacetext.js:15`)
   - jQuery plugin for safe DOM text replacement
   - Excludes already-linked content and code blocks
   - Handles HTML injection securely

3. **Options Interface** (`options.html`, `options.js`)
   - Simple checkbox for "open in new tab" setting
   - Stores preferences in Chrome sync storage
   - Handles permission requests gracefully

## Technical Implementation

### Manifest V3 Configuration
- **Permissions**: Optional storage permission only
- **Content Scripts**: Runs on `<all_urls>` with smart exclusions
- **Excluded Sites**: Google, Bing, Twitter, Acid Tests

### Pattern Recognition
The extension uses carefully crafted regex patterns:

```javascript
// Email addresses
/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})/gi

// Complete URLs (http, https, ftp)
/((https?|ftp):\/\/[^\s\/$.?#,\(\)].[^\s,\)]*)/gi

// Domain names with specific TLDs
/([^\s\/$.?#,\(\)]([^\s,]*)\.(com|net|org|...)/gi

// IPv4 addresses with validation
/((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}...)/gi
```

### Safety Measures

- **Excluded HTML elements**: `<a>`, `<script>`, `<style>`, `<code>`, `<pre>`, `<textarea>`, etc.
- **Double-linking prevention**: Won't process text inside existing links
- **Graceful fallbacks**: Works even if storage permission denied
- **DOM preservation**: Uses jQuery's safe text replacement methods

## Usage

### Installation
1. Load extension in Chrome (currently appears to be Web Store distributed)
2. Grant optional storage permission for settings sync
3. Extension automatically runs on all compatible websites

### Configuration
1. Right-click extension icon → "Options"
2. Toggle "Open links in new tab" as desired
3. Settings automatically sync across devices

### Exclusions
The extension automatically skips these sites to avoid conflicts:
- `*.google.com/*` - Google search and services
- `*.bing.com/*` - Microsoft Bing
- `twitter.com/*` - Twitter/X platform
- `*.acidtests.org/*` - Browser testing sites

## Example Transformation

**Original Text:**
```
Visit example.com or email support@example.com
Download from ftp://files.server.com
Connect to 192.168.1.1 for setup
```

**After Processing:**
```html
Visit <a href="http://example.com">example.com</a> or
email <a href="mailto:support@example.com">support@example.com</a>
Download from <a href="ftp://files.server.com">ftp://files.server.com</a>
Connect to <a href="http://192.168.1.1">192.168.1.1</a> for setup
```

## Development Notes

- **Dependencies**: jQuery 1.8.1, custom replaceText plugin
- **Code Quality**: Minimal, focused codebase with proper error handling
- **Performance**: Lightweight execution, cached jQuery library
- **Compatibility**: Manifest V3 compliant, modern Chrome versions

## File References

- Main logic: `content.js:3` - `clickable_links()` function
- Pattern definitions: `content.js:6-21` - Regex patterns for each link type
- Text replacement: `jquery.ba-replacetext.js:15` - `$.fn.replaceText` plugin
- Options handling: `options.js:12` - `saveOptions()` and `restoreOptions()`
- User interface: `options.html:8` - Settings checkbox

## Security & Privacy

- **Minimal permissions**: Only requests optional storage
- **No data collection**: Processes text locally in browser
- **No network requests**: Pure client-side functionality
- **Safe HTML injection**: Uses jQuery's secure DOM methods