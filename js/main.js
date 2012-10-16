/* markdown.io assets (C) Timo Dörr
licensed under GNU AGPLv3
http://www.gnu.org/licenses/agpl-3.0.html
*/
(function($) {
    $.md = new Object ();
    
    var events = [];
    var hookable_events = new Array ("md_load","md_ready", "md_theme_complete", "md_gimmicks_complete", "md_complete");
    // simple wrapper around $().bind
    $.md.bind =  function (ev, func) {

        if ($.inArray (ev, hookable_events) == -1) {
            $.error ("Event " + ev + " not available ");
            return;
        }
        $(document).bind (ev, func);
        // keep track of pushed events
        events.push (ev);
    };
    $.md.trigger = function (ev) {
        if ($.inArray (ev, hookable_events) == -1) {
            $.error ("Event " + ev + " not available, can't trigger");
            return;
        }
        $(document).trigger (ev);	
    };	

    // adds a :icontains selector to jQuery that is case insensitive 	
    jQuery.expr[":"].icontains = jQuery.expr.createPseudo(function(arg) {
        return function(elem) {
            return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    // set the page title to the browser document title, optionally picking
    // the first h1 element as title if no title is given

    function set_page_title() {
        // check 
        var page_title;
        var $md_title = $("#md-title");
        if ($.trim($md_title.text()).length > 0) {
            // the page has a title set via _title parameter
            page_title = $md_title.text();
	        document.title = page_title;
        }
        else {
        	$md_title.hide ();
        }
    }
    function wrap_paragraph_text () {
	    // markdown gives us sometime paragraph that contain child tags (like img),
	    // but the containing text is not wrapped. Make sure to wrap the text in the 
	    // paragraph into a <div>

		// this also moves ANY child tags to the front of the paragraph!
		$("#md-content p").each (function () {
			var $p = $(this);
			// nothing to do for paragraphs without text
			if ($.trim($p.text ()).length == 0) {
				// make sure no whitespace are in the p and then exit
				//$p.text ('');
				return;
			}
			// children elements of the p
    		var $children = $p.contents ().filter (function () {
    			var $child =  $(this);
    			// we extract images and hyperlinks with images out of the paragraph	
    			if (this.tagName === "A" && $child.find("img").length > 0)
    				return true;
    			if (this.tagName === "IMG")
    				return true;
    			// else
    			return false;
    		});
    		var float_class = get_float_class ($p);

    		$p.wrapInner ("<div class='md-text' />");
    		
    		// if there are no children, we are done
    		if ($children.length == 0) {
    			return;
    		}
    		// move the children out of the wrapped div into the original p
    		$children.prependTo ($p);

    		// at this point, we now have a paragraph that holds text AND images
    		// we mark that paragraph to be a floating environment 
    		// TODO determine floatenv left/right
    		$p.addClass ("md-floatenv").addClass (float_class);
		});
	}
	function remove_breaks (){
		// since we use non-markdown-standard line wrapping, we get lots of 
		// <br> elements we don't want.

        // remove linebreaks from the menu
    	$("#md-menu br").remove ();

    	// remove a leading <br> from floatclasses, that happen to
    	// get insertet after an image 
    	$(".md-floatenv").find (".md-text").each (function () {
    		$first = $(this).find ("*").eq (0);
    		if ($first.is ('br'))
    			$first.remove ();
    	});

    	// remove any breaks from image groups
    	$(".md-image-group").find ("br").remove ();
	}
	function get_float_class (par) {
		$p = $(par);
		var float_class = "";

		// reduce content of the paragraph to images
		var non_text_contents = $p.contents ().filter (function () {
			if (this.tagName == "IMG" || this.tagName == "IFRAME")
				return true;
			else if (this.tagName == "A")
				return $(this).find("img").length > 0;
			else {
				return $.trim($(this).text ()).length > 0;
			}
		});
		// check the first element - if its an image or a link with image, we go left
		var elem = non_text_contents[0];
		if (elem !== undefined && elem !== null) {
			if (elem.tagName == "IMG" || elem.tagName == "IFRAME")
				float_class ="md-float-left";
			else if (elem.tagName == "A" && $(elem).find("img").length > 0)
				float_class = "md-float-left";
			else
				float_class = "md-float-right";
		}
		return float_class;
	}
    // images are put in the same image group as long as there is
    // not separating paragraph between them
    function group_images() {
        $par = $("p img").parents("p");
        // add an .md-image-group class to the p
        $par.addClass('md-image-group');
    }

    function add_inpage_anchors ()
    {
    	// adds a page inline anchor to each h1,h2,h3,h4,h5,h6 element
    	// which can be accessed by the headings text (with spaces)
    	// and heading text where spaces are replaced by underscores
    	$("h1,h2,h3,h4,h5,h6").each (function () {
    		var $heading = $(this);
    		var name = $.trim ($heading.text ());
    		var $anchor1 = $("<a />").attr ('name', name).addClass("md-inpage-anchor md-inpage-anchor-space");
    		$heading.wrap ($anchor1);
    		// replace spaces with underscores and add that anchor, too
    		name = name.replace (/ /g, "_");
    		var $anchor2 = $("<a />").attr ('name', name).addClass ("md-inpage-anchor md-inpage-anchor-underscore");
    		$heading.wrap ($anchor2);
    	});
    }
    function process_previews () {
    	// if we had a preview, we need to process it
    	$(".md-preview-begin").each (function () {
    		$this = $(this);
    		$href = $this.attr ("data-href");
    		var $elems = $this.nextUntil (".md-preview-end");
    		var last_text = $elems.find (".md-text").last ();
    		$elems.find(".md-text").last ().append ($("<a>...Read more</a>").attr ('href', $href));
    		$preview_div = $("<div />").addClass ("md-preview").append ($elems);
    		// TODO localized versions
    		$this.replaceWith ($preview_div);
    	});	
    }
    function mark_first_heading () {
        // TODO replace, maybe css selector magic?
        // if the page starts with a heading first or second degree,
        // mark this heading to be the first one
        var first_elem = $("#md-content").find("p, h1, h2").eq(0);
        if (first_elem.length == 0) return;

        if (first_elem[0].tagName === "H1" || first_elem[0].tagName === "H2") {
        	$(first_elem).addClass ("md-first-heading");
        }
    }
    function jump_to_anchor () {
    	// browser behave differently when using a link with a hashtag #
    	// Safari waits until JS is finished and then jumps, others dont.
    	// so we explicitly jump to the hash once the page load has finished
    	var hash = window.location.hash.substring (1, window.location.hash.length).toLowerCase ();
    	console.log ("start");
    	if (hash !== undefined && hash !== null && hash.length > 0) {
    		// find the anchor for that hash
    		var do_break = false;
    		$("a.md-inpage-anchor").each (function () {
    			$this = $(this);
    			var name = $this.attr('name').toLowerCase ();
    			if ($this.attr('name').toLowerCase () == hash.toLowerCase () && !do_break) {
    				this.scrollIntoView (true);
    				//window.location.hash = "#" + $this.attr ('name');
    				do_break = true;
    				return;
    			}
    		});
    	}
    }

    // call the gimmicks on document ready
    $("document").ready(function() {

        // CORE JS TRANSFORMATION - executed before every gimmick or theme script
        $.md.trigger ("md_load");

        set_page_title();
        wrap_paragraph_text ();
        group_images();
        process_previews ();
        add_inpage_anchors ();

        remove_breaks ();
        mark_first_heading ();

        $.md.trigger ("md_ready");

        // trigger our themeing
        // TODO put that away
        $.md.trigger ("md_theme_complete");

        $.gimmicks ();
        // CALL GIMMICKS THAT ARE NOT TRIGGERED BY gimmick:FUNC() link
        $.gimmicks('colorbox');
        $.gimmicks('youtube');
        $.gimmicks('alerts');

        $.md.trigger ("md_gimmicks_complete");

        // activate syntax highlighting on <pre><code> blocks
        // via highlight.js
        /*$('pre code').each(function(i, e) {
            hljs.highlightBlock(e)
        }); */
        $.md.trigger ('md_complete');

        $("html").removeClass ("md-hidden-load");

        // jump to an anchor if necessary
        jump_to_anchor ();
    });
}(jQuery));
