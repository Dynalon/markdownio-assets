(function($) {
    var methods = {
        init: function() {
            return ret = this.each(function() {
                $this = $(this);

                // init bootsrap's toggle
                if (!$this.hasClass('tiggle')) {
                    return;
                }

                $this.prepend('<i />');
                $this.data('enabled', !$this.hasClass('disabled'));

                $this.click(methods.toggle);
                methods.update.apply($this, arguments);
            });
        },
        update: function() {
            return this.each(function() {
                var $this = $(this);
                // remove the classes
                $this.removeClass('enabled disabled');
                $this.removeClass('btn-danger btn-success');

                var enabled = $this.data('enabled');

                if (enabled) {
                    $this.children('i').removeClass().addClass('icon-ok');
                    $this.addClass('btn-success');

                } else {
                    $this.children('i').removeClass().addClass('icon-remove');
                    $this.addClass('btn-danger')
                }
            });
        },
        toggle: function() {
            var $this = $(this);
            $this.data('enabled', !$this.data('enabled'));
            methods.update.apply($this, arguments);
        }
    };

    $.fn.tiggle = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('method ' + method + ' does not exist on jquery.tooltip');
        }
    };
}(jQuery));