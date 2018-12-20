// https://stackoverflow.com/questions/45819164/how-make-select2-placeholder-for-search-input
(function($) {
    var Defaults = $.fn.select2.amd.require('select2/defaults');

    $.extend(Defaults.defaults, {
        searchInputPlaceholder: ''
    });

    var SearchDropdown = $.fn.select2.amd.require('select2/dropdown/search');

    var _renderSearchDropdown = SearchDropdown.prototype.render;

    SearchDropdown.prototype.render = function(decorated) {

        // invoke parent method
        var $rendered = _renderSearchDropdown.apply(this, Array.prototype.slice.apply(arguments));

        this.$search.attr('placeholder', this.options.get('searchInputPlaceholder'));

        return $rendered;
    };

})(window.jQuery);