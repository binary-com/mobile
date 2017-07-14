/**
 * @name side-menu directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/08/2016
 * @copyright Binary Ltd
 * Application Side Menu
 */

(function() {
    angular.module("binary.share.components").directive("bgSideMenu", SideMenu);

    function SideMenu() {
        const directive = {
            link,
            templateUrl: "js/share/components/side-menu/side-menu.template.html",
            retrict    : "A",
            scope      : {}
        };

        function link() {}

        return directive;
    }
})();
