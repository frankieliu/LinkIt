# Clickable Links - Architecture Flow Diagrams

## Table of Contents
1. [System Overview](#system-overview)
2. [Extension Injection Flow](#extension-injection-flow)
3. [Pattern Matching Process](#pattern-matching-process)
4. [DOM Manipulation Pipeline](#dom-manipulation-pipeline)
5. [User Settings Flow](#user-settings-flow)
6. [Error Handling & Fallbacks](#error-handling--fallbacks)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Chrome Browser Environment                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│  │   Web Page      │    │  Extension      │    │  Chrome Storage │       │
│  │                 │    │  Runtime        │    │                 │       │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │       │
│  │ │    DOM      │◄├────┤ │ content.js  │◄├────┤ │ {newTab:..} │ │       │
│  │ │  Text Nodes │ │    │ │             │ │    │ │             │ │       │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │       │
│  │        ▲        │    │        ▲        │    │                 │       │
│  │        │        │    │        │        │    └─────────────────┘       │
│  │        ▼        │    │        ▼        │                              │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    ┌─────────────────┐       │
│  │ │ <a> Links   │ │    │ │   jQuery    │ │    │  Options Page   │       │
│  │ │  Created    │ │    │ │  + Plugin   │ │    │                 │       │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ ┌─────────────┐ │       │
│  └─────────────────┘    └─────────────────┘    │ │ Checkbox UI │ │       │
│                                                │ │ Save/Load   │ │       │
│                                                │ └─────────────┘ │       │
│                                                └─────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Extension Injection Flow

### Phase 1: Page Load & Script Injection
```
Page Navigation/Load
        │
        ▼
┌──────────────────┐
│ Chrome Detects   │
│ URL Match        │──────┐ Excluded Sites:
│ <all_urls>       │      │ • *.google.com/*
└──────────────────┘      │ • *.bing.com/*
        │                 │ • twitter.com/*
        ▼                 │ • *.acidtests.org/*
┌──────────────────┐      │
│ Check Exclusions │──────┘
└──────────────────┘
        │
        ▼ (If not excluded)
┌──────────────────┐
│ Inject Content   │
│ Scripts in Order │
└──────────────────┘
        │
        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ 1. jquery.min.js │───▶│2.jquery.ba-      │───▶│ 3. content.js    │
│    (Library)     │    │  replacetext.js  │    │   (Main Logic)   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Phase 2: Storage Access & Pattern Execution
```
content.js Loaded
        │
        ▼
┌──────────────────┐
│ chrome.storage   │
│ .sync.get()      │
└──────────────────┘
        │
        ├──── Success ────┐
        │                 ▼
        │         ┌──────────────────┐
        │         │ data.newTab      │
        │         │ → targetStr      │
        │         └──────────────────┘
        │                 │
        │ ┌───────────────┘
        │ │
        ▼ ▼
┌──────────────────┐
│ clickable_links  │
│ (newTab)         │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ Execute 6 Regex  │
│ Patterns on DOM  │
└──────────────────┘
```

---

## Pattern Matching Process

### Sequential Pattern Application
```
┌─────────────────────────────────────────────────────────────────┐
│                    $('body *').replaceText()                    │
│                         Applied 6 Times                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   Pattern 1  │ │   Pattern 2  │ │   Pattern 3  │
        │    Email     │ │ Complete URL │ │  File URLs   │
        │              │ │              │ │              │
        │user@host.com │ │http://ex.com │ │file:///path  │
        └──────────────┘ └──────────────┘ └──────────────┘
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   Pattern 4  │ │   Pattern 5  │ │   Pattern 6  │
        │Domain Names  │ │ IPv4 Address │ │ Magnet Links │
        │              │ │              │ │              │
        │ example.com  │ │ 192.168.1.1  │ │magnet:?xt=.. │
        └──────────────┘ └──────────────┘ └──────────────┘
```

### Pattern Processing Detail
```
For Each Pattern:
        │
        ▼
┌──────────────────┐
│ Select All       │
│ $('body *')      │
│ Elements         │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ For Each Element │
│ Check Exclusions │
└──────────────────┘
        │
        ▼ (If not excluded)
┌──────────────────┐
│ Traverse Child   │
│ Text Nodes Only  │
│ (nodeType === 3) │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ Apply Regex      │
│ text.replace()   │
│ pattern → <a>    │
└──────────────────┘
```

---

## DOM Manipulation Pipeline

### Safe Text Replacement Algorithm
```
┌─────────────────────────────────────────────────────────────┐
│              jQuery replaceText Plugin Flow                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌──────────────────┐
                  │ this.each()      │
                  │ (All elements)   │
                  └──────────────────┘
                              │
                              ▼
                  ┌──────────────────┐      ┌──────────────────┐
                  │ Check Element    │ NO   │ Skip Element     │
                  │ Against exTags   │─────▶│ Return           │
                  └──────────────────┘      └──────────────────┘
                              │ YES
                              ▼
                  ┌──────────────────┐
                  │ node =           │
                  │ firstChild       │
                  └──────────────────┘
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │              While Loop                   │
        │            (node exists)                  │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼
                  ┌──────────────────┐      ┌──────────────────┐
                  │ nodeType === 3   │ NO   │ node =           │
                  │ (Text Node?)     │─────▶│ nextSibling      │
                  └──────────────────┘      └──────────────────┘
                              │ YES                   │
                              ▼                       │
                  ┌──────────────────┐                │
                  │ val = nodeValue  │                │
                  │ new_val =        │                │
                  │ val.replace()    │                │
                  └──────────────────┘                │
                              │                       │
                              ▼                       │
                  ┌──────────────────┐      ┌─────────┴────────┐
                  │ new_val !== val  │ NO   │ Continue Loop    │
                  │ (Changed?)       │─────▶│ nextSibling      │
                  └──────────────────┘      └──────────────────┘
                              │ YES
                              ▼
                  ┌──────────────────┐
                  │ Create New       │
                  │ Text Node with   │
                  │ HTML Links       │
                  └──────────────────┘
                              │
                              ▼
                  ┌──────────────────┐
                  │ Replace in DOM   │
                  │ parent.insertBef │
                  │ parent.removeChi │
                  └──────────────────┘
```

### Element Exclusion Logic
```
Element Processing Decision Tree:

Element Encountered
        │
        ▼
    ┌─────────┐
    │ tagName │
    └─────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  exTags = ['a', 'head', 'script', 'style', 'code',       │
│           'pre', 'textarea', 'input', 'noscript',        │
│           'option', 'title', 'xmp', 'iframe']            │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────┐      ┌──────────────────┐
│ tagName in       │ YES  │ SKIP: Return     │
│ exTags?          │─────▶│ without          │
└──────────────────┘      │ processing       │
        │ NO               └──────────────────┘
        ▼
┌──────────────────┐
│ PROCESS: Apply   │
│ text replacement │
│ to child nodes   │
└──────────────────┘

Examples:
• <a href="...">existing link</a>  → SKIP (prevents double-linking)
• <script>var url="..."</script>   → SKIP (prevents code corruption)
• <p>Visit example.com</p>         → PROCESS (safe text content)
• <input value="user@host.com">    → SKIP (form functionality)
```

---

## User Settings Flow

### Options Page Interaction
```
User Opens Options
        │
        ▼
┌──────────────────┐
│ options.html     │
│ Loads            │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ DOMContentLoaded │
│ Event Fired      │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ restoreOptions() │
│ Function Called  │
└──────────────────┘
        │
        ▼
┌──────────────────┐      ┌──────────────────┐
│ Check Storage    │ YES  │ chrome.storage   │
│ Permission?      │─────▶│ .sync.get()      │
└──────────────────┘      └──────────────────┘
        │ NO                        │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│ Use Default      │      │ Set Checkbox     │
│ (newTab: false)  │      │ State            │
└──────────────────┘      └──────────────────┘
```

### Save Settings Flow
```
User Clicks Save
        │
        ▼
┌──────────────────┐
│ saveOptions()    │
│ Function Called  │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ chrome.          │
│ permissions      │
│ .request()       │
└──────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
GRANTED   DENIED
   │         │
   ▼         ▼
┌─────────┐ ┌─────────┐
│ Get     │ │ Show    │
│ Checkbox│ │ Alert   │
│ Value   │ │ Error   │
└─────────┘ └─────────┘
   │
   ▼
┌─────────┐
│ chrome. │
│ storage │
│ .sync   │
│ .set()  │
└─────────┘
   │
   ▼
┌─────────┐
│ Show    │
│ "Saved" │
│ Message │
└─────────┘
```

---

## Error Handling & Fallbacks

### Content Script Error Handling
```
content.js Execution
        │
        ▼
┌──────────────────┐
│ Try Block:       │
│ Storage Access   │
└──────────────────┘
        │
   ┌────┴──────┐
   ▼           ▼
SUCCESS    EXCEPTION
   │           │
   ▼           ▼
┌─────────┐ ┌─────────┐
│ Use     │ │ Catch   │
│ Stored  │ │ Block:  │
│ Setting │ │ Use     │
└─────────┘ │ Default │
            └─────────┘
              │
              ▼
         ┌─────────┐
         │ newTab= │
         │ false   │
         └─────────┘
              │
      ┌───────┴───────┐
      ▼               ▼
┌─────────┐     ┌─────────┐
│ Both    │     │ Both    │
│ Paths   │────▶│ Execute │
│ Lead    │     │ Pattern │
│ Here    │     │ Matching│
└─────────┘     └─────────┘
```

### Options Page Error Handling
```
Permission Request Flow:

chrome.permissions.request()
        │
   ┌────┴────┐
   ▼         ▼
GRANTED   DENIED
   │         │
   ▼         ▼
┌─────────┐ ┌─────────────────┐
│ Normal  │ │ Alert:          │
│ Save    │ │ "Cannot store   │
│ Process │ │ settings..."    │
└─────────┘ └─────────────────┘
   │                 │
   ▼                 ▼
┌─────────┐ ┌─────────────────┐
│ Success │ │ User Must       │
│ Message │ │ Re-enable       │
│ "Saved" │ │ Permissions     │
└─────────┘ └─────────────────┘

Storage Access Failure:

chrome.storage.sync.get()
        │
   ┌────┴────┐
   ▼         ▼
SUCCESS   FAILURE
   │         │
   ▼         ▼
┌─────────┐ ┌─────────────────┐
│ Update  │ │ Use Default:    │
│ UI with │ │ newTab = false  │
│ Stored  │ │ (checkbox       │
│ Value   │ │ unchecked)      │
└─────────┘ └─────────────────┘
```

---

## Performance Optimization Points

### Execution Optimization Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Strategy                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Site-Level   │    │ DOM-Level    │    │ Regex-Level  │
│ Exclusion    │    │ Optimization │    │ Optimization │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Skip Heavy   │    │ Process Only │    │ Prevent      │
│ Sites:       │    │ Text Nodes   │    │ Catastrophic │
│ • Google     │    │ (nodeType=3) │    │ Backtracking │
│ • Bing       │    │              │    │              │
│ • Twitter    │    │ Skip Excluded│    │ Non-greedy   │
└──────────────┘    │ Elements     │    │ Patterns     │
                    └──────────────┘    └──────────────┘
```

---

## Data Flow Summary

### Complete Extension Data Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                        Extension Lifecycle                          │
└─────────────────────────────────────────────────────────────────────┘

1. Browser Navigation
        │
        ▼
2. URL Match Check (manifest.json)
        │
        ▼ (if not excluded)
3. Script Injection (jQuery → Plugin → content.js)
        │
        ▼
4. Storage Access (chrome.storage.sync.get)
        │
        ▼
5. Pattern Application (6 regex patterns × DOM elements)
        │
        ▼
6. Text Node Processing (jQuery replaceText plugin)
        │
        ▼
7. Link Creation (<a> tags with proper attributes)
        │
        ▼
8. User Interaction (clicks on converted links)

Configuration Flow (Parallel):
Options Page ←→ Chrome Storage ←→ Content Script
     ▲                              ▲
     │                              │
     └─── User Settings ────────────┘
```

This architecture ensures the extension is:
- **Fast**: Minimal processing overhead
- **Safe**: No XSS vulnerabilities
- **User-Friendly**: Configurable behavior
- **Reliable**: Graceful error handling
- **Maintainable**: Clear separation of concerns