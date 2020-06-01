/**
 * @name supportedLanguagesService
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 06/05/2019
 * @copyright Binary Ltd
 */

angular.module("binary").service("supportedLanguagesService", function() {
    this.supportedLanguages = ["en"];

    this.setSupportedLanguages = langs => this.supportedLanguages = langs;
});
