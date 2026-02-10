/*
 * jQuery replaceText plugin - Text replacement utility
 * Safely replaces text content in DOM nodes while preserving HTML structure
 */
(function($){
  '$:nomunge'; // Used by YUI compressor.
  
  $.fn.replaceText = function( search, replace, text_only ) {
    return this.each(function(){
      var node = this.firstChild,
        val,
        new_val,
        
        // Elements to be removed at the end.
        remove = [];
      
      // Exclude some tags
      var exTags=['a', 'head', 'noscript', 'option', 'script', 'style', 'title', 'textarea', 'pre', 'xmp', 'input', 'code', 'iframe'];
      
      if ( node && $.inArray(this.nodeName.toLowerCase(), exTags) == -1) { // Laurent: exclude some tags

        // Loop over all childNodes.
        do {
          
          // Only process text nodes.
          if ( node.nodeType === 3) {
            
            // The original node value.
            val = node.nodeValue;
            
            // The new value.
            new_val = val.replace( search, replace );

            // Only replace text if the new value is actually different!
            if ( new_val !== val) {
              new_val = new_val.replace('.">', '">') // Hack to make remove the last dot from URLs (which I can't seem to remove from the regex, e.g. http://test.co.uk/test.html. OK)
              if ( !text_only && /</.test( new_val ) ) {

                // The new value contains HTML, set it in a slower but far more
                // robust way.
                $(node).before( new_val );
                
                // Don't remove the node yet, or the loop will lose its place.
                remove.push( node );
              } else {
                // The new value contains no HTML, so it can be set in this
                // very fast, simple way.
                node.nodeValue = new_val;
              }
            }
          }
          
        } while ( node = node.nextSibling );
      }
      
      // Time to remove those elements!
      remove.length && $(remove).remove();
    });
  };  
  
})(jQuery);