#### userjs-tool.html

Interactive view, compare, and more for Firefox user.js (ghacksuserjs, pyllyukko, etc).

Display a Mozilla Firefox user.js settings file contents in your Firefox browser, with:
* highlighting, links, themes*, re-size, wrap, about:config links/regex/groups
* expanding sections, and "go to" section links (with compatible user.js projects)
* compare preferences in two user.js, in a table format with order/layout options and bold cell border around differences
* actions including: user-overrides.js* append* (with comment-out*), point and click overrides collector, skeleton, prefs.js cleaner*, group by values
* load/save, drag/drop, or copy/paste user.js files (can load from some on-line URLs too)
* functions for find (filter/list)/reset/set on about:config Web Console (Firefox/forks/Thunderbird/SeaMonkey)
* single .html file (HTML/CSS/JavaScript) with no external dependency
* open [userjs-tool.html on-line](https://icpantsparti.github.io/firefox-user.js-tool/userjs-tool.html) or save for off-line use

(*[ghacks-user.js](https://github.com/ghacksuserjs/ghacks-user.js) inspired.  Please visit them and read [ghacks-user.js wiki/info](https://github.com/ghacksuserjs/ghacks-user.js/wiki), they have nice scripts for append/clean/troubleshoot.)

This started as an over the top experiment for learning some HTML/CSS/JavaScript (first released 2019.01.02, compare added 2020.02.22).  This is a viewer/tool, and not an editor/installer.

Disclaimer: Use with care at your own risk, and verify any results

#### Open userjs-tool.html on-line
[https://icpantsparti.github.io/firefox-user.js-tool/userjs-tool.html](https://icpantsparti.github.io/firefox-user.js-tool/userjs-tool.html)

#### Live auto-load and view ghacks-user.js master (example)
[https://icpantsparti.github.io/firefox-user.js-tool/userjs-tool.html?action=view1&box=a&load1=https://raw.githubusercontent.com/ghacksuserjs/ghacks-user.js/master/user.js](https://icpantsparti.github.io/firefox-user.js-tool/userjs-tool.html?action=view1&box=a&load1=https://raw.githubusercontent.com/ghacksuserjs/ghacks-user.js/master/user.js)

#### Live auto-load and compare ghacks-user.js with pyllyukko-user.js (example)
(Note: pyllyukko-user.js has some [issues](https://github.com/privacytoolsIO/privacytools.io/issues/1240))

[https://icpantsparti.github.io/firefox-user.js-tool/userjs-tool.html?action=compare:1:4&box=a&load1=https://raw.githubusercontent.com/ghacksuserjs/ghacks-user.js/master/user.js&load4=https://raw.githubusercontent.com/pyllyukko/user.js/master/user.js](https://icpantsparti.github.io/firefox-user.js-tool/userjs-tool.html?action=compare:1:4&box=a&load1=https://raw.githubusercontent.com/ghacksuserjs/ghacks-user.js/master/user.js&load4=https://raw.githubusercontent.com/pyllyukko/user.js/master/user.js)

#### Version 2020.02.22 (alpha/experimental)
added user.js compare, improved file/URL loading, updated layout and more<br>
multi preference regex search [Groups] work in the newer about:config search box<br>
added functions for find (filter/list)/reset/set on about:config Web Console

#### How to save and open userjs-tool.html off-line
Open the raw text/html file in a browser tab ([direct link](https://raw.githubusercontent.com/icpantsparti/firefox-user.js-tool/master/userjs-tool.html)), right click within that page and "Save Page As...".  Open the saved userjs-tool.html file with your Firefox browser (you can drag and drop it from your Downloads folder into a new tab), bookmark it for easy access.  Remember to check here for updates.

#### userjs-tool-themes.css
This is an optional file for use with userjs-tool.html.  Use this file to override the default theme with your own colors or to add your own custom themes.

#### userjs-tool-aboutconfig-functions.js
This file is embeded in userjs-tool.html (view with the [a:c Functions] button).

#### Preview
![](/images/userjs-tool.png)
