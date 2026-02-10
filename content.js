console.log('🚀 LinkIt: Script loading started...');

// Immediately test if we can define functions
try {
	console.log('🔧 LinkIt: Attempting to define test functions...');

	// Define test functions immediately to ensure they're available
	window.testClickableLinks = function() {
		console.log('✅ testClickableLinks function called!');

		// Test the specific GitHub URL
		var testText = '🔗 Comparison URL: https://funbench.siri.apple.com/compare/scenario/call_mcdonalds_local_contact_vs_business_displayForward?runs=gepa_datagen_multi_scenario_20251215_221046,gepa_datagen_multi_scenario_20251215_221734';
		var pattern = /((https?|ftp):\/\/[^\s\/$.?#\(\)].(?:[^\s\(\),]|,(?!\s))*)/gi;

		console.log('Test text:', testText);
		console.log('Pattern:', pattern.source);

		var match = pattern.exec(testText);
		if (match) {
			console.log('✅ Pattern matched:', match[1]);
			console.log('Full match:', match[0]);
		} else {
			console.log('❌ No match found');
		}
	};

	// Debug function to inspect page content
	window.inspectPageContent = function() {
		console.log('✅ inspectPageContent function called!');
		console.log('=== PAGE CONTENT INSPECTION ===');

		// Look for any existing links
		var existingLinks = document.querySelectorAll('a[href*="funbench"]');
		console.log('Existing funbench links found:', existingLinks.length);
		existingLinks.forEach(function(link, i) {
			console.log('Link', i + ':', link.href, link.textContent.substring(0, 100));
		});

		// Look for any https URLs in general
		var allText = document.body.textContent || document.body.innerText || '';
		var urlMatches = allText.match(/https?:\/\/[^\s]+/g) || [];
		console.log('All URLs found in page text:', urlMatches.length);
		urlMatches.forEach(function(url, i) {
			console.log('URL', i + ':', url.substring(0, 100));
		});

		// Look at table cells specifically
		var tableCells = document.querySelectorAll('td');
		console.log('Table cells found:', tableCells.length);
		var cellsWithFunbench = [];
		tableCells.forEach(function(cell, i) {
			if (cell.textContent.includes('funbench')) {
				cellsWithFunbench.push({
					index: i,
					className: cell.className,
					textContent: cell.textContent.substring(0, 200),
					innerHTML: cell.innerHTML.substring(0, 200)
				});
			}
		});
		console.log('Table cells containing "funbench":', cellsWithFunbench.length);
		cellsWithFunbench.forEach(function(cell) {
			console.log('Cell:', cell);
		});
	};

	console.log('✅ LinkIt: Test functions defined successfully!');
	console.log('   - window.testClickableLinks:', typeof window.testClickableLinks);
	console.log('   - window.inspectPageContent:', typeof window.inspectPageContent);

} catch (error) {
	console.error('❌ LinkIt: Error defining functions:', error);
}

// Test if we're in a restricted environment
try {
	console.log('🌐 Environment test - hostname:', window.location.hostname);
	console.log('🌐 Environment test - can access document:', !!document.body);
	console.log('🌐 Environment test - can access window:', !!window);
} catch (error) {
	console.error('❌ Environment access error:', error);
}

console.log('🚀 LinkIt: Basic setup complete, continuing with main code...');

function isProblematicEnvironment() {
	// Detect GitHub raw pages and other sandboxed environments
	try {
		var hostname = window.location.hostname;
		var isRawGitHub = hostname.includes('raw.github');
		var isRawGitHubUser = hostname.includes('raw.githubusercontent');
		var hasSandboxIframe = document.querySelector('iframe[sandbox]') !== null;
		var isInSandboxFrame = window.frameElement && window.frameElement.hasAttribute('sandbox');

		console.log('LinkIt: Environment check:', {
			hostname: hostname,
			isRawGitHub: isRawGitHub,
			isRawGitHubUser: isRawGitHubUser,
			hasSandboxIframe: hasSandboxIframe,
			isInSandboxFrame: isInSandboxFrame
		});

		return (
			isRawGitHub ||
			isRawGitHubUser ||
			hasSandboxIframe ||
			isInSandboxFrame
		);
	} catch (e) {
		console.log('LinkIt: Environment check failed:', e);
		return false;
	}
}

function vanillaReplaceText(targetElement, newTab) {
	var targetStr = newTab ? ' target="_blank"' : '';
	console.log('LinkIt: Using vanilla JS text replacement, targetElement:', targetElement ? 'specific element' : 'document body');

	// Elements to exclude (same as jQuery plugin, but modify for GitHub)
	var exTags = ['a', 'head', 'noscript', 'option', 'script', 'style', 'title', 'textarea', 'xmp', 'input', 'code', 'iframe'];

	// Special handling for GitHub raw pages - allow processing <pre> tags
	var isGitHubRaw = window.location.hostname.includes('raw.github') || window.location.hostname.includes('raw.githubusercontent');
	if (!isGitHubRaw) {
		exTags.push('pre'); // Only exclude <pre> on non-GitHub pages
	} else {
		console.log('LinkIt: GitHub raw page detected, allowing <pre> tag processing');
	}

	// Single comprehensive URL pattern to avoid overlapping matches
	var urlPattern = /((https?|ftp):\/\/[^\s\/$.?#\(\)][^\s\(\)]*(?:[^\s\(\),]|,(?!\s)))/gi;
	var emailPattern = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})/gi;
	var domainPattern = /(([^\s\/$.?#\(\)](?:[^\s,]|,(?!\s))*)\.(com|be|co\.uk|net|org|edu|gov|ca|de|fr|us|ru|ch|nl|se|no|es|ly|br|co\.jp|pl|co|in|info|eu|io|ai|xyz)(?:[^\s\(\),]|,(?!\s))*)/gi;

	var processedNodes = 0;
	var linksCreated = 0;

	function processElement(element) {
		if (!element || !element.nodeName) return;

		// Skip excluded tags
		if (exTags.indexOf(element.nodeName.toLowerCase()) !== -1) {
			return;
		}

		processedNodes++;

		// Process child nodes - convert to array to avoid live collection issues
		var childNodes = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			childNodes.push(element.childNodes[i]);
		}

		childNodes.forEach(function(node) {
			try {
				if (node.nodeType === 3) { // Text node
					processTextNode(node);
				} else if (node.nodeType === 1) { // Element node
					processElement(node);
				}
			} catch (e) {
				console.log('LinkIt: Error processing node:', e);
			}
		});
	}

	function processTextNode(textNode) {
		if (!textNode || !textNode.nodeValue) return;

		var originalText = textNode.nodeValue;
		var hasChanges = false;

		// Log text nodes that might contain URLs
		if (originalText.includes('http') || originalText.includes('www.') || originalText.includes('@')) {
			console.log('LinkIt: Processing text with potential URLs:', JSON.stringify(originalText.substring(0, 150)));
		}

		// Process URLs first (highest priority)
		var newText = originalText.replace(urlPattern, function(match) {
			console.log('LinkIt: Found complete URL:', match);
			hasChanges = true;
			return '<a' + targetStr + ' href="' + match + '">' + match + '</a>';
		});

		// Process emails (if no URLs were found in this position)
		if (newText === originalText) {
			newText = originalText.replace(emailPattern, function(match) {
				console.log('LinkIt: Found email:', match);
				hasChanges = true;
				return '<a' + targetStr + ' href="mailto:' + match + '">' + match + '</a>';
			});
		}

		// Process domain names (if no URLs or emails were found)
		if (newText === originalText) {
			newText = originalText.replace(domainPattern, function(match) {
				// Skip if it looks like it's already part of a URL
				if (originalText.indexOf('http://' + match) !== -1 || originalText.indexOf('https://' + match) !== -1) {
					return match;
				}
				console.log('LinkIt: Found domain:', match);
				hasChanges = true;
				return '<a' + targetStr + ' href="http://' + match + '">' + match + '</a>';
			});
		}

		// If we made changes, replace the text node with HTML
		if (hasChanges && newText !== originalText) {
			console.log('LinkIt: Replacing text node with HTML');
			linksCreated++;

			try {
				var parent = textNode.parentNode;
				if (parent) {
					// Create a temporary div to parse the HTML safely
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = newText;

					// Create document fragment from the parsed content
					var fragment = document.createDocumentFragment();
					while (tempDiv.firstChild) {
						fragment.appendChild(tempDiv.firstChild);
					}

					// Replace the text node with the fragment
					parent.insertBefore(fragment, textNode);
					parent.removeChild(textNode);
					console.log('LinkIt: Successfully replaced text node');
				}
			} catch (e) {
				console.log('LinkIt: Error replacing text node:', e);
			}
		}
	}

	// Start processing from target element or document body
	var startElement = targetElement || document.body;
	if (startElement) {
		console.log('LinkIt: Starting vanilla JS processing from:', startElement.tagName || 'document.body');
		processElement(startElement);
		console.log('LinkIt: Vanilla JS complete. Processed', processedNodes, 'elements, created', linksCreated, 'links');
	} else {
		console.log('LinkIt: No start element found');
	}
}

function clickable_links(newTab, targetElement) {
	console.log('LinkIt: Processing', targetElement ? 'new element' : 'full page', 'newTab:', newTab);

	// Always try vanilla JS first in potentially problematic environments
	if (isProblematicEnvironment()) {
		console.log('LinkIt: Detected problematic environment, using vanilla JS');
		vanillaReplaceText(targetElement, newTab);
		return;
	}

	// Check if jQuery is available and working
	var useVanillaJS = false;
	try {
		if (typeof $ === 'undefined' || typeof $.fn === 'undefined' || typeof $.fn.replaceText === 'undefined') {
			useVanillaJS = true;
			console.log('LinkIt: jQuery or replaceText not available, using vanilla JS');
		} else {
			// Test jQuery with a simple operation
			var testResult = $('body').length;
			if (typeof testResult === 'undefined') {
				throw new Error('jQuery test failed');
			}
		}
	} catch (e) {
		useVanillaJS = true;
		console.log('LinkIt: jQuery failed, switching to vanilla JS:', e.message);
	}

	if (useVanillaJS) {
		// Use vanilla JavaScript fallback
		vanillaReplaceText(targetElement, newTab);
	} else {
		// Use jQuery method
		try {
			var targetStr = newTab ? ' target="_blank"' : '';
			var selector = targetElement ? $(targetElement) : $('body *');

			selector.replaceText( /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})/gi, '<a'+targetStr+' href="mailto:$1">$1</a>' ); // valid email addresses
			selector.replaceText( /((https?|ftp):\/\/[^\s\/$.?#\(\)].(?:[^\s\(\),]|,(?!\s))*)/gi, '<a'+targetStr+' href="$1">$1</a>' ); // complete urls
			selector.replaceText( /((file):\/{1,3}[^\s\/$.?#\(\)].(?:[^\s,]|,(?!\s))*)/gi, '<a'+targetStr+' href="$1">$1</a>' ); // complete local file urls
			selector.replaceText( /(([^\s\/$.?#\(\)](?:[^\s,]|,(?!\s))*)\.(com|be|co\.uk|net|org|edu|gov|ca|de|fr|us|ru|ch|nl|se|no|es|ly|br|co\.jp|pl|co|in|info|eu|io|ai|xyz)((?:[^\s\(\),]|,(?!\s))*))/gi, '<a'+targetStr+' href="http://$1">$1</a>' ); // incomplete urls
			selector.replaceText( /((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/gi, '<a'+targetStr+' href="http://$1">$1</a>' ); // ip addresses
			selector.replaceText(/(magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}(?:&dn=.+)?(?:&tr=.+)?)/gi, '<a'+targetStr+' href="$1">$1</a>'); // magnet urls
		} catch (e) {
			console.log('LinkIt: jQuery execution failed, falling back to vanilla JS:', e.message);
			vanillaReplaceText(targetElement, newTab);
		}
	}
}

function setupDynamicContentObserver(newTab) {
	let processingTimeout = null;
	let pendingNodes = [];

	console.log('LinkIt: Setting up MutationObserver');

	// Create observer to watch for dynamically added content (like GitHub tables)
	const observer = new MutationObserver(function(mutations) {
		console.log('LinkIt: MutationObserver detected', mutations.length, 'mutations');

		mutations.forEach(function(mutation) {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(function(node) {
					// Only process element nodes, not text nodes
					if (node.nodeType === 1) {
						console.log('LinkIt: Found new element:', node.tagName, node.className);
						pendingNodes.push(node);
					}
				});
			}
		});

		// Throttle processing to avoid excessive calls during rapid DOM changes
		if (processingTimeout) {
			clearTimeout(processingTimeout);
		}

		processingTimeout = setTimeout(function() {
			console.log('LinkIt: Processing', pendingNodes.length, 'pending nodes');
			// Process all pending nodes
			pendingNodes.forEach(function(node) {
				clickable_links(newTab, node);
			});
			pendingNodes = [];
		}, 100); // Wait 100ms after last change before processing
	});

	// Start observing the document body for added child elements and subtree changes
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});

	console.log('LinkIt: MutationObserver started');

	// Return observer so we can disconnect it if needed
	return observer;
}

let newTab = false;
let observer = null;

function initializeExtension(useNewTab) {
	console.log('LinkIt: Initializing extension, newTab:', useNewTab);

	// Run initial linkification on existing content
	clickable_links(useNewTab);

	// Set up observer to handle dynamically added content (like GitHub)
	if (observer) {
		observer.disconnect(); // Clean up previous observer if any
		console.log('LinkIt: Disconnected previous observer');
	}
	observer = setupDynamicContentObserver(useNewTab);
}

// Global error handler to catch jQuery failures
window.addEventListener('error', function(event) {
	if (event.filename && event.filename.includes('content.js') &&
		(event.message.includes('Cannot read properties of undefined') ||
		 event.message.includes('jQuery') ||
		 event.message.includes('$'))) {
		console.log('LinkIt: Caught jQuery error, suppressing:', event.message);
		event.preventDefault();
		return true;
	}
});

try {
	console.log('LinkIt: Content script starting...');

	// Check if chrome.storage is available (might not be in sandboxed environments)
	if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
		// Retrieve the value of the 'newTab' key from storage
		chrome.storage.sync.get('newTab', function(data) {
			if (Object.keys(data).length > 0 && data.hasOwnProperty('newTab')) {
				newTab = data.newTab;
			}
			console.log('LinkIt: Retrieved settings from storage, newTab:', newTab);
			initializeExtension(newTab);
		});
	} else {
		console.log('LinkIt: Chrome storage not available, using defaults');
		initializeExtension(newTab);
	}
} catch (e) {
	console.log('LinkIt: Storage access failed, using defaults:', e);
	initializeExtension(newTab);
}