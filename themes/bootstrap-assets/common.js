(function($) {
    // call the gimmick 
    $.mdbootstrap = function (method){
        if ($.mdbootstrap.methods[method]) {
            return $.mdbootstrap.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jquery.mdbootstrap');
        }
    }
    // simple wrapper around $().bind
    $.mdbootstrap.events = [];
    $.mdbootstrap.bind =  function (ev, func) {
        $(document).bind (ev, func);
        $.mdbootstrap.events.push (ev);
    }
    $.mdbootstrap.trigger = function (ev) {
        $(document).trigger (ev);
    }

    // public API functions that are exposed
    function init () {

        create_page_skeleton();
        build_menu ();
        change_heading();
        replace_image_paragraphs();
        pull_right_bumper ();
        highlight_active_link ();

        // remove the margin for headings h1 and h2 that are the first
        // on page
        if (nav_style == "sub" || (nav_style == "top" && $("#md-title").text ().trim ().length === 0))
	        $(".md-first-heading").css ("margin-top", "0");
        
        // external content should run after gimmicks were run 
        $.md.bind ('md_gimmicks_complete', adjust_external_content);

    };
    $.md.bind ('md_ready', init);

    var nav_style;

    var methods = {
        build_top_nav: function () {
            // replace with the navbar skeleton
            if ($("#md-menu").length <= 0) {
                return;
            }
            nav_style = "top";
            var $menu_content = $("#md-menu").html ();

            $("#md-menu").addClass ("navbar navbar-fixed-top navbar");
            var menusrc =""; 
            menusrc += "<div class='navbar-inner'>";
            menusrc += "<div id='md-menu-inner' class='container'>";
            menusrc += "<ul id='md-menu-ul' class='nav'>";
            menusrc += $menu_content;
            menusrc += "</ul></div></div>";

            // put the new content in
            $("#md-menu").empty ();
            $("#md-menu").wrapInner ($(menusrc));


            // the menu should be the first element in the body
            $("#md-menu-container").prependTo ("body");

            // then comes md-title, and afterwards md-content
            // offset md-title to account for the fixed menu space
            // 50px is the menu width + 20px spacing until first text
            // or heading
            $("#md-body").css("margin-top", "70px");
        },
        build_sub_nav: function () {
            // replace with the navbar skeleton
            if ($("#md-menu").length <= 0) {
                return;
            }
            nav_style = "sub";
            var $menu_content = $("#md-menu").html ();

            var menusrc =""; 
            menusrc += "<div id='md-menu-inner' class='subnav'>";
            menusrc += "<ul id='md-menu-ul' class='nav nav-pills'>";
            menusrc += $menu_content;
            menusrc += "</ul></div>";
            $("#md-menu").empty();
            $("#md-menu").wrapInner($(menusrc));
            $("#md-menu").addClass ("span12 ");

            $("#md-menu-container").insertAfter ($("#md-title-container"));
        }
    };
    // register the public API functions
    $.mdbootstrap.methods = $.extend ({}, $.mdbootstrap.methods, methods);

    // private functions
    function build_menu () {
        // wrap the remaining links in <li>
        $('#md-menu a').wrap("<li />");

        // TODO use dividers in the navbar
        // remove p around the links in the menu
        $('#md-menu p').replaceWith(function() {
            return $(this).html();
        });

        // call the user specifed menu function
        if (jQuery.inArray ("build_menu", $.mdbootstrap.events) == -1 )
            methods.build_top_nav();
        else
            $.mdbootstrap.trigger ("build_menu");
    }


    function create_page_skeleton() {

        $("#md-title").wrap ("<div class='container' id='md-title-container'/>");
        $("#md-title").wrap ("<div class='row' id='md-title-row'/>");

        $("#md-menu").wrap ("<div class='container' id='md-menu-container'/>")
        $("#md-menu").wrap ("<div class='row' id='md-menu-row'/>");

        $("#md-content").wrap ("<div class='container' id='md-content-container'/>")
        $("#md-content").wrap ("<div class='row' id='md-content-row'/>");

        $("#md-body").wrap ("<div class='container' id='md-body-container'/>")
        $("#md-body").wrap ("<div class='row' id='md-body-row'/>");

        $("#md-content").addClass ("span10");
        $("#md-title").addClass ("span10");
    }
    function pull_right_bumper (){
 /*   	$("span.bumper").each (function () {
			$this = $(this);
			$this.prev().addClass ("pull-right");
		});*/
		$("span.bumper").addClass ("pull-right");
    }

    function change_heading() {

        // HEADING
        var jumbo = $("<div class='jumbotron page-header' />");
        var heading = $("<h1>");
        heading.text($("#md_title").text());
        jumbo.append(heading);
        $("#md-title").wrapInner(jumbo);
    }
    function highlight_active_link () {
    	// when no menu is used, return
    	if ($("#md-menu").find ("li").length == 0) return;

		// get the filename of the currently visited page
		var filename = $(window.location.href.split ("/")).last ()[0];

		if (filename.length === 0)
			filename = "index.txt";

		var selector = "li:has(a[href$='" + filename + "'])";
		$("#md-menu").find (selector).addClass ("active");
    }

    // replace all <p> around images with a <div class="thumbnail" >
    function replace_image_paragraphs() {

    	// only select those paragraphs that have images in them
        var $pars = $("p img").parents("p");
        $pars.each(function() {
        	var $p = $(this);
            var $images = $(this).find ("img")
	            .filter (function () {
	 	           // only select those images that have no parent anchor 
	            	return $(this).parents("a").length == 0
	            })
	            // add those anchors including images
	            .add ($(this).find ("a:has(img)"));

        	// create a new url group at the fron of the paragraph
        	$p.prepend ($("<ul class='thumbnails' />"));
	        // move the images to the newly created ul
	        $p.find ("ul").eq(0).append ($images);

	        // wrap each image with a <li> that limits their space
	        // the number of images in a paragraphs determines thei width / span
	        if ($p.hasClass ("md-floatenv")) {
	        	// float environments have smaller sizes for images
		        if ($images.length == 1) $images.wrap("<li class='span6' />");
	            else if ($images.length == 2) $images.wrap("<li class='span3' />");
	            else $images.wrap("<li class='span2' />") ;
	        } else {
	        	// non-float => images are on their own single paragraph, make em larger
	        	// but remember, our image resizing will make them only as large as they are
	        	// but do no upscaling
		        if ($images.length == 1) $images.wrap("<li class='span10' />");
	            else if ($images.length == 2) $images.wrap("<li class='span5' />");
	            else $images.wrap("<li class='span3' />") ;
	        }

            // finally, every img gets its own wrapping thumbnail div
            $images.wrap("<div class='thumbnail' />");
        });
    	// apply float to the ul thumbnails
    	$(".md-floatenv.md-float-left ul").addClass ("pull-left");
    	$(".md-floatenv.md-float-right ul").addClass ("pull-right");
    }

    function adjust_external_content() {
        // external content are usually iframes or divs that are integrated
        // by gimmicks
        // example: youtube iframes, google maps div canvas
        // all external content are in the md-external class

        $("iframe.md-external").not (".md-external-nowidth")
            .attr('width', "450")
            .css ('width', "450px");

        $("iframe.md-external").not (".md-external-noheight")
            .attr('height', "280")
            .css ('height', "280px");

        // make it appear like an image thumbnal
        $("iframe.md-external").addClass("thumbnail");

        //.wrap($("<ul class='thumbnails' />")).wrap($("<li class='span6' />"));
        $("div.md-external").not (".md-external-noheight")
            .css('height', "280px");
        $("div.md-external").not (".md-external-nowidth")
            .css('width', "450px");

        // // make it appear like an image thumbnal
        // $("div.md-external").addClass("thumbnail").wrap($("<ul class='thumbnails' />")).wrap($("<li class='span10' />"));

        // $("div.md-external-large").css('width', "700px")
    }

}(jQuery))
