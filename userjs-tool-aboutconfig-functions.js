// JavaScript functions for Mozilla Firefox/Thunderbird about:config
// find (filter/list)/reset/set user preferences and values
//
// Name         : userjs-tool-aboutconfig-functions.js
// Project      : https://github.com/icpantsparti/firefox-user.js-tool
// Version      : 2020.09.15 (alpha/experimental)
// File         : https://raw.githubusercontent.com/icpantsparti/firefox-user.js-tool/master/userjs-tool-aboutconfig-functions.js
// License (MIT): https://raw.githubusercontent.com/icpantsparti/firefox-user.js-tool/master/LICENSE
// Disclaimer   : Use with care at your own risk, and verify any results
//
// Paste this text into the console to add the functions:
// Firefox: open 'about:config' then Web Console (Ctrl+Shift+K)
// Android/Remote: 'about:debugging' on PC, 'about:config' on target device
// Thunderbird: Tools>Developer Tools>Content Frame Debugger>Tabs>Debug>Console
//
// Function     : ujtFindPref( { style:0, modified:/[yn]/, locked:/[yn]/, type:/[bis]/, name:/.*/i, value:/.*/i } );
// Function     : ujtResetPref(pref);
// Function     : ujtSetPref(pref, value);
// Alias        : user_pref = ujtSetPref;  // see notes
//
// Examples ujtFindPref:
//   ujtFindPref();                       // show usage info
//   ujtFindPref({style:3});              // list all (user_pref style)
//   ujtFindPref({style:2});              // list all (for spreadsheet)
//   ujtFindPref({modified:/y/});         // find modified (for about:config search box)
//   ujtFindPref({locked:/y/});           // find locked (for about:config search box)
//   ujtFindPref({value:/google/i});      // find value (for about:config search box)
//   ujtFindPref({style:3,name:/activity-stream/i});                    // part name
//   ujtFindPref({style:3,name:/^extensions\.pocket\.enabled$/i});      // whole name
//   ujtFindPref({style:3,name:/^(whole|start.*|.*middle.*|.*end)$/i}); // multi name
//   ujtFindPref({modified:/y/,type:/b/,value:/^false$/i}); // find modified boolean false
//
// General Notes:
//   * on console right click results "Copy object" / left click expand/contract
//   * clear console/command history:  clear();  clearHistory();
//   * Thunderbird console to open about:config: window.openDialog("about:config");
//   * if using remote debugging to access another device (eg Android):
//     PC: use 'about:debugging' (older Firefox was WebIDE/Scratchpad)
//     Target: 'about:config' open, "Remote debugging" enabled in Firefox settings
//             "USB debugging" enabled in Android Developer settings
//     re: https://github.com/arkenfox/user.js/wiki/1.6-Firefox-Android
//     also re arkenfox/user.js/wiki: unblock about:config in newer versions (FF71+?):
//     user_pref("general.aboutConfig.enable", true);
//   * set 'user_pref' alias if you want to paste 'user.js' code to run a function
//     eg enter 'user_pref = ujtSetPref;' or 'user_pref = ujtResetPref;'
//   * also works through Browser/Error Console (Ctrl+Shift+J)
//
// ujtFindPref Notes:
//   * style:
//       0=regex     paste result into the about:config search box (default)
//       1=bookmark  'about:config?filter=' (FF71+ copy, click, paste in search)
//       2=list                paste into a spreadsheet for sort/filter/search
//       3=user_pref+comments  user_pref("pref", value);  // locked  // modified
//       4=user_pref           user_pref("pref", value);
//   * modified/locked: y=yes n=no // type: b=boolean i=integer s=string
//   * returns and newlines in preference values are replaced as \r \n
//   * some prefs show "chrome:..." and not the value, refer to about:config
//     (find the prefs affected with: ujtFindPref({'value':/^chrome:/i});)
//   * some prefs show as modified instead of default (same with about:config)
//     they have been user set somewhere to same as default (perhaps user.js)
//   * hidden prefs only show up if they were created (same with about:config)
//
// ujtSetPref/ujtResetPref Notes:
//   * this is mainly intended for when injecting preferences to Android
//   * on desktop you would usually use user.js/profiles for preference control
//     (although ujtResetPref could be useful for batch clearing prefs)
//   * incorrect usage risks messing up your Firefox settings (if you are using
//     this on desktop: backup your Firefox profile, or 'prefs.js' at least,
//     and remember that user.js can override changes on Firefox restart)
//   * ujtSetPref outputs 'creating' to the console when the preference did
//     not already exist (these are either hidden preferences, or invalid)
//
// Acknowledgments (this is based on info/code from):
//   https://github.com/arkenfox/user.js
//     https://github.com/arkenfox/user.js/tree/master/scratchpad-scripts
//       https://github.com/arkenfox/user.js/blob/master/scratchpad-scripts/arkenfox-clear-removed.js
//       https://github.com/arkenfox/user.js/blob/master/scratchpad-scripts/troubleshooter.js
//     https://github.com/arkenfox/user.js/wiki/1.6-Firefox-Android
//   https://stackoverflow.com/questions/3796084/about-config-preferences-and-js
//   https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Services.jsm
//   http://www.openjs.com/articles/optional_function_arguments.php
//   https://dxr.mozilla.org/mozilla-central/source/modules/libpref/nsIPrefBranch.idl#31

if (typeof(Services) == "undefined") {
  console.log("// requires Services (eg about:config as active tab)");
}
// older versions of Firefox/forks/Thunderbird/SeaMonkey use ...CharPref
var ujtUseCharPref = !(typeof(Services.prefs.getStringPref) == "function");

var ujtFindPref = function(options) {
  var result = "";
  if (typeof options == "undefined") {
    // if no options specified show some info
    result = "// usage:\n"
      + '// ujtFindPref( { style:0, modified:/[yn]/, locked:/[yn]/, type:/[bis]/, name:/.*/i, value:/.*/i } );\n'
      + '//   style: 0=regex 1=bookmark 2=list 3=user_pref+comments 4=user_pref\n'
      + '//   modified/locked: y=yes n=no // type: b=boolean i=integer s=string\n'
      + '// ujtFindPref({modified:/y/});  // find modified (for about:config search box)\n'
      + '// ujtFindPref({style:2});       // list all (for spreadsheet)\n'
      + '// ujtFindPref({style:3});       // list all (user_pref style)\n';
  }
  else {
    // prepare for options being a single regex/string
    var noArgsMatched = true, nameOnly = options;
    if (typeof options == "string") {
      nameOnly = new RegExp(options, "i");
      options = {};
    }
    // enforce defaults for unspecified options
    var defaultArgs = { 'style': 0, 'modified': /.*/, 'locked': /.*/,
      'type': /.*/, 'name': /.*/, 'value': /.*/ }
    for(var i in defaultArgs) {
      if (typeof options[i] == "undefined") {
        options[i] = defaultArgs[i];
      }
      else if (typeof options[i] == "string") {
        options[i] = new RegExp(options[i], "i");
        noArgsMatched = false;
      }
      else {
        noArgsMatched = false;
      }
    }
    // when options was a single regex/string
    if (noArgsMatched) {
      options["style"] = 3;
      options["name"] = nameOnly;
    }
    // begin forming result
    switch (options["style"]) {
      case 4:
      case 3:
        break;
      case 2:
        result = "[Modified]\t[Locked]\t[Type]\t[Preference Name]\t[Value]\n";
        break;
      case 1:
        result = 'about:config?filter=';
      default:
        result += '/^\\*$|^(';
    }
    // loop through all prefs
    var modified, locked, type, value;
    for (const prefName of Services.prefs.getChildList("").sort()) {
      // get pref info
      modified = (Services.prefs.prefHasUserValue(prefName) ? 'y' : 'n');
      locked = (Services.prefs.prefIsLocked(prefName) ? 'y' : 'n');
      switch (Services.prefs.getPrefType(prefName)) {
        case 128:
          type = "b";
          value = Services.prefs.getBoolPref(prefName).toString();
          break;
        case 64:
          type = "i";
          value = Services.prefs.getIntPref(prefName).toString();
          break;
        case 32:
          type = "s";
          value = ujtUseCharPref ? Services.prefs.getCharPref(prefName)
            : Services.prefs.getStringPref(prefName);
          break;
        default:
          modified = null; locked = null; type = null; value = null;
      }
      // add to result if matches options
      if ( (options["name"].test(prefName))
        && (options["modified"].test(modified))
        && (options["locked"].test(locked))
        && (options["type"].test(type))
        && (options["value"].test(value)) )
      {
        // quote/escape string
        if ((type == "s") && (options["style"] == 4 || options["style"] == 3)) {
          value = '"' + value.replace(/(["\\])/g, '\\$1') + '"';
        }
        value = value.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        switch (options["style"]) {
          case 4: // 4=user_pref
            result += 'user_pref("' + prefName + '", ' + value + ");\n";
            break;
          case 3: // 3=user_pref+comments
            result += 'user_pref("' + prefName + '", ' + value + ");"
              + locked.replace(/y/g, "  // locked").replace(/n/g, "")
              + modified.replace(/y/g, "  // modified").replace(/n/g, "")
              + "\n";
            break;
          case 2: // 2=list
            result += modified + "\t" + locked + "\t"
              + type + "\t" + prefName + "\t" + value + "\n";
            break;
          default: // 0=regex / 1=bookmark
            result += prefName.replace(/([*.+])/g, "\\$1") + "|";
        }
      }
    } // (end of loop through all prefs)
    // finish forming result
    switch (options["style"]) {
      case 4:
      case 3:
      case 2: break;
      default: result = result.replace(/\|$/, '') + ')(;|$)|^$/i';
    }
  }
  console.log(result);
}

var ujtSetPref = function(pref, value) {
  try {
    if (Services.prefs.getPrefType(pref) == 0) {
      console.log("// (ujtSetPref) creating: " + pref + "\n");
    }
    switch (typeof value) {
      case "boolean":
        Services.prefs.setBoolPref(pref, value);
        break;
      case "number":
        Services.prefs.setIntPref(pref, value);
        break;
      case "string":
        if (ujtUseCharPref) { Services.prefs.setCharPref(pref, value) }
        else { Services.prefs.setStringPref(pref, value) }
        break;
    }
  }
  catch(e) {
    console.log("// (ujtSetPref) error: " + e + " pref: "
      + pref + " value: " + value + "\n");
  }
}

var ujtResetPref = function(pref) {
  try {
    if (Services.prefs.prefHasUserValue(pref)) {
      Services.prefs.clearUserPref(pref);
      if (Services.prefs.prefHasUserValue(pref)) {
        console.log("// (ujtResetPref) failed: " + pref + "\n");
      }
    }
  }
  catch(e) {
    console.log("// (ujtResetPref) error: " + e + " pref: " + pref + "\n");
  }
}

// set user_pref alias to function required (then you can paste/run user.js)
var user_pref = ujtSetPref;
// var user_pref = ujtResetPref;

/* end of userjs-tool-aboutconfig-functions.js */
