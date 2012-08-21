(function ($) {

	$.mdbootstrap.bind ('build_menu', function () {
		$.mdbootstrap ('build_top_nav');

		// apply the inverse style to the navbar
		$("#md-menu").addClass ("navbar-inverse");
	});

})(jQuery)
