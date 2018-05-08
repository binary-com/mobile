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

var precacheConfig = [["css/ionic.app.css","fd9796956f1729791113d4487169949f"],["css/ionic.app.min.css","0958b08b87bc2ccb25bb1701548e4b60"],["css/style.css","84a33cf00d95bc1e3617cc35262f7e94"],["index.html","db8bb15b8e6779af2b156247a83f1c31"],["js/main-min.js","b78b71757edee492a64ee88b87a932bb"],["js/main.js","2cba991169af758fb75d34b5e4a647e4"],["js/pages/accounts-management/accounts-management.template.html","28b9859222066e15f81af8f7281ff07c"],["js/pages/asset-index/asset-index.template.html","50e42a73bcd9283753f6e3c8ba4a665c"],["js/pages/authentication/authentication.template.html","ea531de2932e13a6bc28eca2bb38ec00"],["js/pages/change-password/change-password.template.html","1d5cab95076ccd642056d1a94bcf2267"],["js/pages/contact/contact.template.html","f034d5b4865ff7b5ebbc1acfb35f1341"],["js/pages/financial-assessment/financial-assessment.template.html","fd13ae329e4a544eb3e3990cfc77b0cb"],["js/pages/home/home.template.html","4210d689230ce2f7d1b663697783f97d"],["js/pages/language/language.template.html","3c967d944c0beb003b6e47bc3a1e43c1"],["js/pages/limits/limits.template.html","9bde0f1520552942bc6117c0bdf61114"],["js/pages/maltainvest-account-opening/maltainvest-account-opening.template.html","c47c3f4229492070fb356e6fafac6dac"],["js/pages/maltainvest-account-opening/tax-residence.modal.html","8dba1f1ae5f601d9eb553988c95fee18"],["js/pages/meta-trader/meta-trader.template.html","f87b84a01781c24a2c081365968c1a71"],["js/pages/meta-trader/mt5-web.template.html","15e49d9ab6505bfbc19153e8191ff9c5"],["js/pages/notifications/notifications.template.html","9da5c0ba3393a3c4d16df38d7dd1341e"],["js/pages/profile/profile.template.html","a67bb7a08c86921309fcc58609b198b5"],["js/pages/profile/tax-residence.modal.html","2515b2be9f933e5d2ea9f5e10baf474f"],["js/pages/profit-table/profit-table.template.html","bbd490abbcc4535612ec5aff633ae08b"],["js/pages/real-account-opening/real-account-opening.template.html","a66681ea17528a16fc753ec3ed5d3d7d"],["js/pages/redirect/redirect.template.html","e5c6438162490d808378564b29346e62"],["js/pages/resources/resources.template.html","a0fdacb93c3c9e754809aebcd0971c88"],["js/pages/self-exclusion/self-exclusion.template.html","25ddbbb88a3a45227fab377ce5f9bdf0"],["js/pages/set-currency/set-currency.template.html","b900dda012e9ca4c883e5db6d6d1f514"],["js/pages/settings/settings.template.html","9c5150ad45c012f67ce5598e969727f3"],["js/pages/sign-in/components/oauth/oauth.template.html","a2a8a7355d26f11a1ff0234866c95455"],["js/pages/sign-in/sign-in.template.html","59f560227486ad6254ae4a1051854ee3"],["js/pages/statement/statement.template.html","ed2f5f2907a7704d49bf00e5dde5da65"],["js/pages/terms-and-conditions/terms-and-conditions.template.html","9fa9dde686e08051a7593e79782b5f40"],["js/pages/trade/components/chart/chart.template.html","e9481ed3dc972c2bcec42ca1c6db60bd"],["js/pages/trade/components/chart/digit-result.template.html","bb05d112afbbce563584fe3beaa1aa2b"],["js/pages/trade/components/longcode/longcode.template.html","00fe87d35c5f637e76924125db53f8da"],["js/pages/trade/components/options/barrier.template.html","8d1915ed9db823a00c9b3c891d3e0f0b"],["js/pages/trade/components/options/digits.template.html","f2ffa3624c913265f7cc14bd8e412c7d"],["js/pages/trade/components/options/markets.template.html","8c7c369c9a1b8ea7c6caf901e7a479d3"],["js/pages/trade/components/options/options-modal.html","f2e200ad27971e558a1776a5e1b6a99d"],["js/pages/trade/components/options/options.template.html","83b286ffdffee174b36a36fb033f0f34"],["js/pages/trade/components/options/ticks.template.html","2dde4b59f7526cf5a0367ad0bc8f2bbd"],["js/pages/trade/components/options/trade-types.template.html","1ca4ace825c382abef0b92a418c9a820"],["js/pages/trade/components/options/underlyings.template.html","bd1243659640a9c319b7a1b92d2c4c46"],["js/pages/trade/components/payout/payout.template.html","f805f421d33d690b1820d14810d8ba27"],["js/pages/trade/components/purchase/contract-summary.template.html","018c3d38b000a52ee714d7e5f6dbfb15"],["js/pages/trade/components/purchase/purchase.template.html","b5bb341cd02dfe3c91e6c12abcef6b4d"],["js/pages/trade/trade.template.html","cd3036671648114daed36301d0188f56"],["js/pages/trading-times/trading-times.template.html","2ac5bb303f6e1c31c01930c5dec49de7"],["js/pages/transaction-detail/transaction-detail.template.html","b97707385acb53067ef5c5729f2c303c"],["js/pages/update/update.template.html","fa853bf45c4e03118e4f1e10f4435afd"],["js/share/components/accounts/accounts.template.html","026493f901612db9a6ea55506e6bb118"],["js/share/components/app-version/app-version.template.html","afc3355ea791ab4e4d9dc23b29eed6f1"],["js/share/components/balance/balance.template.html","11963307c48b75c484601512de9167d2"],["js/share/components/check-user-status/check-user-status.template.html","731a7fd34afa07022e4f720bb1af2cc5"],["js/share/components/connectivity/connection-lost.template.html","d6570da2bde99a9db344e56a70822b93"],["js/share/components/connectivity/connectivity.template.html","18433f0c3a97d48a17ee0a6105a5efca"],["js/share/components/header/header.template.html","796e6a094e3ec26f2d92e816901a1dae"],["js/share/components/ios-pwa-prompt/ios-pwa-prompt.template.html","768ee76e7ec30b2e0a1922eb3554d4d1"],["js/share/components/language/language-list.template.html","3d6407b5200ebbf5526499d18b397d9e"],["js/share/components/language/language.template.html","b3ef6d22f0eddadd494c64c62847e6ac"],["js/share/components/logout/logout.template.html","85e4973345a75abc44e1768026737cbe"],["js/share/components/notification-icon/notification-icon.template.html","238e9d1273f4c4228ab562d231abb62f"],["js/share/components/reality-check/interval-popup.template.html","9f9da565bdcc97d128d1c3ce02fc7cd3"],["js/share/components/reality-check/reality-check-result.template.html","c01d2ed4a40455a008003872dc77a53e"],["js/share/components/reality-check/reality-check.template.html","b95f55257c9d1110ac7b5cd21d468106"],["js/share/components/service-outage/service-outage.template.html","de9b01c59071282e6d9c775be4e8ed0c"],["js/share/components/side-menu/side-menu.template.html","56c820b6f25ca21dc287d56fdf27b63d"],["js/share/components/spinner-logo/spinner-logo.template.html","1b643ddf6090b833186240cb84f4bbd7"],["js/share/templates/layout/main-layout.template.html","d7fcb75e9b7acaae065a82cd57ae1862"],["js/share/templates/select-country/select-country.template.html","7e5c379f3d338ecbab3009ceaa29e696"],["redirect.html","2529888a289b891c21d24e1de6ebca9d"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function (originalResponse) {
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

var createCacheKey = function (originalUrl, paramName, paramValue,
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

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
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

var stripIgnoredUrlParameters = function (originalUrl,
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







