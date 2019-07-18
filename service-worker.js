/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["css/ionic.app.css","0c967524a6780e8c2439a47d6748e896"],["css/ionic.app.min.css","03094f041b52adffb3f0ac9b75dd68d8"],["css/style.css","84a33cf00d95bc1e3617cc35262f7e94"],["index.html","db8bb15b8e6779af2b156247a83f1c31"],["js/main-min.js","e20cb7997925c10d0cd668819853a733"],["js/main.js","15b9cdf13a90e7bde06945e99d66f3dc"],["js/pages/account-categorisation/account-categorisation.template.html","8467a8d701b8cca7d7727bc727d5284a"],["js/pages/accounts-management/accounts-management.template.html","91dadfaffe4426d6532769ebc143ba12"],["js/pages/asset-index/asset-index.template.html","00b58075bd4bfccabe281e282f217260"],["js/pages/authentication/authentication.template.html","ea531de2932e13a6bc28eca2bb38ec00"],["js/pages/change-password/change-password.template.html","614e09d93031ad98af64139939c58043"],["js/pages/contact/contact.template.html","f65fa68cb0272a6e2374a8beda18d4f2"],["js/pages/financial-assessment/financial-assessment.template.html","b8b1fcb428a85c352cc47de272c13dfe"],["js/pages/home/home.template.html","4210d689230ce2f7d1b663697783f97d"],["js/pages/language/language.template.html","3c967d944c0beb003b6e47bc3a1e43c1"],["js/pages/limits/limits.template.html","414ab0e98f5e71bac2f413f77ba63217"],["js/pages/maltainvest-account-opening/maltainvest-account-opening.template.html","80bbe7f33697326e8ea4b940b8f62be0"],["js/pages/maltainvest-account-opening/tax-residence.modal.html","8dba1f1ae5f601d9eb553988c95fee18"],["js/pages/meta-trader/meta-trader.template.html","5029e3aa5e3cb67148d71ba50118efdd"],["js/pages/meta-trader/mt5-web.template.html","15e49d9ab6505bfbc19153e8191ff9c5"],["js/pages/notifications/notifications.template.html","9da5c0ba3393a3c4d16df38d7dd1341e"],["js/pages/profile/profile.template.html","0bd8a66f4a3000af1bc0f3da4ffc85d3"],["js/pages/profile/tax-residence.modal.html","2515b2be9f933e5d2ea9f5e10baf474f"],["js/pages/profit-table/profit-table.template.html","02e34f571ecfd1a33bcb960405af84f1"],["js/pages/real-account-opening/real-account-opening.template.html","e2690d4eadff570336f054236ec8bbb0"],["js/pages/redirect/redirect.template.html","e5c6438162490d808378564b29346e62"],["js/pages/resources/resources.template.html","a0fdacb93c3c9e754809aebcd0971c88"],["js/pages/self-exclusion/self-exclusion.template.html","c9bc080535d95b5577b3ea4ee5cb8d11"],["js/pages/set-currency/set-currency.template.html","b757cab726a9cfbf01182f2f97c51d26"],["js/pages/settings/settings.template.html","14a9074c61781bc3d07b060808dfec20"],["js/pages/sign-in/components/oauth/oauth.template.html","08b4539e944caca826bc7375c116942e"],["js/pages/sign-in/sign-in.template.html","f5b4bf67be22b9f5bc99e9070218a0bb"],["js/pages/statement/statement.template.html","ed2f5f2907a7704d49bf00e5dde5da65"],["js/pages/terms-and-conditions/terms-and-conditions.template.html","d074241e0ccf737c1ccf2b59c1da1258"],["js/pages/trade/components/chart/chart.template.html","e9481ed3dc972c2bcec42ca1c6db60bd"],["js/pages/trade/components/chart/digit-result.template.html","bb05d112afbbce563584fe3beaa1aa2b"],["js/pages/trade/components/chart/tick-result.template.html","0e0484bd584ea77067d4f22fd8d11e68"],["js/pages/trade/components/longcode/longcode.template.html","00fe87d35c5f637e76924125db53f8da"],["js/pages/trade/components/options/barrier.template.html","8d1915ed9db823a00c9b3c891d3e0f0b"],["js/pages/trade/components/options/digits.template.html","f2ffa3624c913265f7cc14bd8e412c7d"],["js/pages/trade/components/options/markets.template.html","8c7c369c9a1b8ea7c6caf901e7a479d3"],["js/pages/trade/components/options/options-modal.html","6c69fe7e060f346e12a5e15da55f3afa"],["js/pages/trade/components/options/options.template.html","94700e9e388b6d0ef40afdaba4c084b0"],["js/pages/trade/components/options/selected-tick.template.html","95ee6e5de1a04ba004e0bcc9dabb5c86"],["js/pages/trade/components/options/ticks.template.html","2dde4b59f7526cf5a0367ad0bc8f2bbd"],["js/pages/trade/components/options/trade-types.template.html","1ca4ace825c382abef0b92a418c9a820"],["js/pages/trade/components/options/underlyings.template.html","bd1243659640a9c319b7a1b92d2c4c46"],["js/pages/trade/components/payout/payout.template.html","acc454c0c47cd234180d69fb5bfeee08"],["js/pages/trade/components/purchase/contract-summary.template.html","af3c2228790b51cd242d9619a70ecb80"],["js/pages/trade/components/purchase/purchase.template.html","e24ccc15fbf4909851d5b15953639af3"],["js/pages/trade/trade.template.html","029129bd3a060ab42a95df489daf2f68"],["js/pages/trading-times/trading-times.template.html","44915d3b72f391e4ae75388d8a96d013"],["js/pages/transaction-detail/transaction-detail.template.html","d71ce491c14381e3efddd2607d1bf1c1"],["js/pages/update/update.template.html","235f8335a27bf231773014bf80a6aef8"],["js/share/components/accounts/accounts.template.html","026493f901612db9a6ea55506e6bb118"],["js/share/components/app-version/app-version.template.html","afc3355ea791ab4e4d9dc23b29eed6f1"],["js/share/components/balance/balance.template.html","11963307c48b75c484601512de9167d2"],["js/share/components/check-user-status/check-user-status.template.html","731a7fd34afa07022e4f720bb1af2cc5"],["js/share/components/connectivity/connection-lost.template.html","5e60d991e2bd57ab0d73a0c7e0b42bd9"],["js/share/components/connectivity/connectivity.template.html","18433f0c3a97d48a17ee0a6105a5efca"],["js/share/components/header/header.template.html","2f77a2fe64137a38484b8d87b157ca10"],["js/share/components/ios-pwa-prompt/ios-pwa-prompt.template.html","768ee76e7ec30b2e0a1922eb3554d4d1"],["js/share/components/language/language-list.template.html","3d6407b5200ebbf5526499d18b397d9e"],["js/share/components/language/language.template.html","b3ef6d22f0eddadd494c64c62847e6ac"],["js/share/components/logout/logout.template.html","85e4973345a75abc44e1768026737cbe"],["js/share/components/notification-icon/notification-icon.template.html","238e9d1273f4c4228ab562d231abb62f"],["js/share/components/reality-check/interval-popup.template.html","08a02ee283de72183b2650d988a6d5c9"],["js/share/components/reality-check/reality-check-result.template.html","6e4b0693548bccf1a7afe929395e34b6"],["js/share/components/reality-check/reality-check.template.html","b95f55257c9d1110ac7b5cd21d468106"],["js/share/components/service-outage/service-outage.template.html","de9b01c59071282e6d9c775be4e8ed0c"],["js/share/components/side-menu/side-menu.template.html","56c820b6f25ca21dc287d56fdf27b63d"],["js/share/components/spinner-logo/spinner-logo.template.html","1b643ddf6090b833186240cb84f4bbd7"],["js/share/templates/layout/main-layout.template.html","8a032eae0a17161f844f40c5367c2f87"],["js/share/templates/pep-information/pep-information.template.html","0b88a436f9945852e0d24045a4a5ecd8"],["js/share/templates/professional-client/professional-client-confirmation.template.html","8ff8b74957df8a6bf27ebe47f01d243f"],["js/share/templates/professional-client/professional-client-information.template.html","4f183623725a03c6309bf5ff349de974"],["js/share/templates/tax-information/tax-information.template.html","5aaa4098a8689fdda72dbaa82df2cd5f"],["redirect.html","2529888a289b891c21d24e1de6ebca9d"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function(originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function(originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







