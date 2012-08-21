(function ($) {

	$.mdbootstrap.bind ('build_menu', function () {
		$.mdbootstrap ('build_sub_nav');

		// apply the inverse style to the navbar
//		$("#md-menu").addClass ("navbar-inverse");
	});
  $(document).ready(function () {
    $(".nav li").mouseover(function() {  $(this).css('background-color','#eee'); });
    $(".nav li").mouseout (function() {  $(this).css('background-color',''); });

  });
})(jQuery)
