$(window).on('load', function() {
    var pathName = location.pathname;
    var pathParts = pathName.split("/");
    var lastPart = pathParts[pathParts.length-1];
    $("li.active").removeClass("active");
    var li = $('a[href="' + lastPart + '"]').parent();
    li.addClass("active");
    // $(".dropdown-toggle").dropdown('toggle');
    // li.parent().dropdown('toggle');
    var dropdowns = li.parents('a[class="dropdown-toggle"]');
    if (dropdowns) {
        dropdowns.first().dropdown('toggle');
    }
});

