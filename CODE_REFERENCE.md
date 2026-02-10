# Clickable Links - Code Reference Guide

## Quick Navigation

### File Locations & Key Functions

| File | Function/Section | Line | Description |
|------|------------------|------|-------------|
| `content.js` | `clickable_links()` | 3 | Main pattern application function |
| `content.js` | Email pattern | 6 | Converts email addresses to mailto links |
| `content.js` | Complete URL pattern | 10 | Handles http/https/ftp URLs |
| `content.js` | File URL pattern | 11 | Handles file:// protocol URLs |
| `content.js` | Domain pattern | 14 | Converts bare domains to http links |
| `content.js` | IPv4 pattern | 15 | Makes IP addresses clickable |
| `content.js` | Magnet pattern | 16 | Handles torrent magnet links |
| `content.js` | Storage access | 18 | Retrieves user preferences |
| `jquery.ba-replacetext.js` | `$.fn.replaceText` | 15 | jQuery plugin for safe text replacement |
| `jquery.ba-replacetext.js` | Element exclusions | 25 | Lists elements to skip processing |
| `options.js` | `saveOptions()` | 12 | Saves user settings to Chrome storage |
| `options.js` | `restoreOptions()` | 35 | Loads user settings on options page |

---

## Pattern Definitions

### 1. Email Address Pattern
**Location**: `content.js:6-8`
```javascript
$('body *').replaceText(
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})/gi,
    '<a'+targetStr+' href="mailto:$1">$1</a>'
);
```
**Matches**: `user@example.com`, `test.email+tag@domain.org`
**Creates**: `<a href="mailto:user@example.com">user@example.com</a>`

### 2. Complete URL Pattern (HTTP/HTTPS/FTP)
**Location**: `content.js:10-12`
```javascript
$('body *').replaceText(
    /((https?|ftp):\/\/[^\s\/$.?#,\(\)].[^\s,\)]*)/gi,
    '<a'+targetStr+' href="$1">$1</a>'
);
```
**Matches**: `https://example.com/page`, `ftp://files.server.com`
**Creates**: `<a href="https://example.com">https://example.com</a>`

### 3. File URL Pattern
**Location**: `content.js:11-12` (inline with complete URLs)
```javascript
$('body *').replaceText(
    /((file):\/{1,3}[^\s\/$.?#,\(\)].[^\s,]*)/gi,
    '<a'+targetStr+' href="$1">$1</a>'
);
```
**Matches**: `file:///C:/path/file.txt`, `file://server/share/file`
**Creates**: Local file links

### 4. Domain Name Pattern
**Location**: `content.js:14-16`
```javascript
$('body *').replaceText(
    /([^\s\/$.?#,\(\)]([^\s,]*)\.(com|be|co\.uk|net|org|edu|gov|ca|de|fr|us|ru|ch|nl|se|no|es|ly|br|co\.jp|pl|co|in|info|eu|io|ai|xyz)([^\s,\(\)]*)/gi,
    '<a'+targetStr+' href="http://$1">$1</a>'
);
```
**Matches**: `example.com`, `subdomain.site.org`, `domain.co.uk/path`
**Creates**: `<a href="http://example.com">example.com</a>`

### 5. IPv4 Address Pattern
**Location**: `content.js:15-16` (inline with domain pattern)
```javascript
$('body *').replaceText(
    /((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/gi,
    '<a'+targetStr+' href="http://$1">$1</a>'
);
```
**Matches**: `192.168.1.1`, `10.0.0.1`, `255.255.255.255`
**Creates**: `<a href="http://192.168.1.1">192.168.1.1</a>`

### 6. Magnet Link Pattern
**Location**: `content.js:16-18`
```javascript
$('body *').replaceText(
    /(magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}(?:&dn=.+)?(?:&tr=.+)?)/gi,
    '<a'+targetStr+' href="$1">$1</a>'
);
```
**Matches**: BitTorrent magnet URLs
**Creates**: Clickable torrent links

---

## jQuery Plugin Reference

### replaceText Function
**Location**: `jquery.ba-replacetext.js:15-66`

#### Function Signature
```javascript
$.fn.replaceText = function(search, replace, text_only) {
    // search: RegExp pattern to match
    // replace: Replacement string (can include $1, $2 for capture groups)
    // text_only: Boolean (unused parameter, kept for compatibility)
}
```

#### Key Variables
```javascript
var node = this.firstChild;              // Current DOM node
var val, new_val;                       // Text content before/after replacement
var remove = [];                        // Nodes to remove after processing
var exTags = ['a', 'head', ...];       // Excluded element types
```

#### Element Exclusion List
**Location**: `jquery.ba-replacetext.js:25-26`
```javascript
var exTags = [
    'a',        // Existing links
    'head',     // Document metadata
    'noscript', // Fallback content
    'option',   // Select options
    'script',   // JavaScript code
    'style',    // CSS code
    'title',    // Page title
    'textarea', // Multi-line input
    'pre',      // Preformatted text
    'xmp',      // Example text (deprecated)
    'input',    // Form inputs
    'code',     // Code snippets
    'iframe'    // Embedded content
];
```

---

## Storage & Options Reference

### User Setting Structure
```javascript
// Default setting object
{
    newTab: false  // Boolean: Open links in new tab
}
```

### Options Page Functions

#### Save Settings
**Location**: `options.js:12-32`
```javascript
const saveOptions = () => {
    chrome.permissions.request({
        permissions: ['storage']
    }, (granted) => {
        if (granted) {
            const newTab = document.getElementById('clickable-links-new-tab-toggle').checked;
            chrome.storage.sync.set({ newTab: newTab }, callback);
        } else {
            alert('Cannot store settings without storage permissions');
        }
    });
};
```

#### Restore Settings
**Location**: `options.js:35-48`
```javascript
const restoreOptions = () => {
    chrome.permissions.contains({
        permissions: ['tabs'],
        origins: ['<all_urls>']
    }, (result) => {
        if (result) {
            chrome.storage.sync.get({ newTab: false }, (items) => {
                document.getElementById('clickable-links-new-tab-toggle').checked = items.newTab;
            });
        }
    });
};
```

---

## Configuration Reference

### Manifest.json Key Sections
```json
{
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "exclude_matches": [
      "*://*.google.com/*",
      "*://*.bing.com/*",
      "*://twitter.com/*",
      "*://*.acidtests.org/*"
    ],
    "js": [
      "jquery.min.js",
      "jquery.ba-replacetext.js",
      "content.js"
    ]
  }],

  "optional_permissions": ["storage"],

  "options_ui": {
    "page": "options.html",
    "open_in_tab": false
  }
}
```

---

## Character Class Reference

### URL Pattern Character Classes

#### Start Character: `[^\s\/$.?#,\(\)]`
- `\s` - No whitespace (space, tab, newline)
- `\/` - No forward slash
- `$` - No dollar sign
- `.` - No period (at start)
- `?` - No question mark
- `#` - No hash/fragment
- `,` - No comma (**This causes the comma issue**)
- `\(` - No opening parenthesis
- `\)` - No closing parenthesis

#### Continuation Character: `[^\s,\)]*`
- `\s` - No whitespace
- `,` - No comma (**This also causes the comma issue**)
- `\)` - No closing parenthesis

---

## Common Modification Points

### 1. Adding New TLDs
**Location**: `content.js:14` - Domain pattern TLD list
```javascript
// Add new TLD to this list:
\.(com|net|org|NEW_TLD|...)
```

### 2. Modifying URL Stopping Characters
**Location**: `content.js:10` - Complete URL pattern
```javascript
// Current: stops at comma, parentheses
[^\s,\)]*

// Modify to change stopping behavior
```

### 3. Adding New Excluded Elements
**Location**: `jquery.ba-replacetext.js:25`
```javascript
var exTags = ['a', 'head', ..., 'NEW_TAG'];
```

### 4. Changing Target Window Behavior
**Location**: `content.js:4`
```javascript
var targetStr = newTab ? ' target="_blank"' : '';
// Modify this line to change link behavior
```

---

## Debug Points

### 1. Pattern Testing
Test individual patterns in browser console:
```javascript
// Test email pattern
var text = "Contact us at user@example.com";
var result = text.replace(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})/gi, '<a href="mailto:$1">$1</a>');
console.log(result);
```

### 2. Storage Testing
Check current settings:
```javascript
chrome.storage.sync.get(null, (data) => console.log(data));
```

### 3. Element Exclusion Testing
Check if element is excluded:
```javascript
var exTags = ['a', 'head', 'script', 'style', 'code', 'pre', 'textarea', 'input'];
var tagName = 'div'; // test tag
var isExcluded = exTags.indexOf(tagName.toLowerCase()) !== -1;
console.log('Excluded:', isExcluded);
```

---

## Performance Monitoring

### Execution Time Measurement
Add timing around main function:
```javascript
// In content.js, wrap clickable_links():
console.time('linkify');
clickable_links(newTab);
console.timeEnd('linkify');
```

### Pattern Performance Testing
Test individual pattern performance:
```javascript
// Test specific pattern speed
console.time('email-pattern');
$('body *').replaceText(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})/gi, '<a href="mailto:$1">$1</a>');
console.timeEnd('email-pattern');
```

---

## Extension File Sizes

| File | Approximate Size | Purpose |
|------|------------------|---------|
| `manifest.json` | < 1KB | Extension configuration |
| `content.js` | ~1KB | Main logic (22 lines) |
| `options.js` | ~2KB | Settings page (48 lines) |
| `options.html` | ~1KB | Settings UI |
| `jquery.ba-replacetext.js` | ~3KB | Text replacement plugin (66 lines) |
| `jquery.min.js` | ~94KB | jQuery library (cached) |
| `icon*.png` | ~10KB total | Extension icons |

**Total**: ~112KB (mostly cached jQuery library)