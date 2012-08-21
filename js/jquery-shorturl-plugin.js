(function($) {
    var options = {
        api_url: "http://127.0.0.1:8080/api/json/asynconeway/UrlShortener?callback=?",

    };

    $.get_short_url = function(longUrl, callback, local_options) {
        return;
        if (typeof options === 'object') {
            $.extend(options, local_options); // TODO extend default options
        }
        $.ajax({
            url: options.api_url,
            data: {
                "LongUrl": longUrl,
                "PreferedService": ""
            },
            dataType: "jsonp"
        }).done(callback);
    };
}(jQuery));