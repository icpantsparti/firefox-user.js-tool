// JavaScript functions for Mozilla Firefox/Thunderbird about:config
// user preferences and values: find (filter/list/save/defaults)/reset/set
//
// Name         : userjs-tool-aboutconfig-functions.js
// Project      : https://github.com/icpantsparti/firefox-user.js-tool
// Version      : 2021.03.11 (alpha/experimental)
// File/Update  : https://raw.githubusercontent.com/icpantsparti/firefox-user.js-tool/master/userjs-tool-aboutconfig-functions.js
// License (MIT): https://raw.githubusercontent.com/icpantsparti/firefox-user.js-tool/master/LICENSE
// Disclaimer   : Use with care at your own risk, and verify any results
//
// -------------------------------------------------------------------------------
// Paste the text from this file into the console to add the functions temporarily
// -------------------------------------------------------------------------------
// Firefox: open 'about:config' then Web Console (Ctrl+Shift+K)
// Android/Remote: 'about:debugging' on PC, 'about:config' on target device
// Thunderbird: Menu>Tools>Developer Tools>Error Console (Ctrl+Shift+J)
// Thunderbird/Other: Tools>Developer Tools>Content Frame Debugger>Tabs>Debug>Console
// Or load saved file in the console with:
// javascript:(()=>{with(document){let s=createElement('script');s.src='file:///YOURPATH/userjs-tool-aboutconfig-functions.js';head.appendChild(s)}})();
//
// -------
// Summary
// -------
// Function: ujtFindPref( { style:0, name:/.*/i, value:/.*/i, type:/[bis]/, locked:/[yn]/, modified:/[yn]/, asdefault:/[yn]/, nodefault:/[yn]/, fileout:false } );
// Function: ujtResetPref(pref);
// Function: ujtSetPref(pref, value);
// Alias   : user_pref = ujtSetPref;  // see notes
//
// --------------------
// ujtFindPref Examples
// --------------------
//   ujtFindPref();                        // show some usage info
//   ujtFindPref(2);                       // list all + save to file (spreadsheet style)
//   ujtFindPref({style:3,fileout:true});  // list all + save to file (user_pref+comments style)
//   ujtFindPref({modified:/y/});                // show modified
//   ujtFindPref({modified:/y/,asdefault:/y/});  // show modified=default
//   ujtFindPref({nodefault:/y/});               // show Trash Can Prefs eg hidden/invalid
//   ujtFindPref({locked:/y/});                  // show locked
//   ujtFindPref({value:/google/i});             // find value
//   ujtFindPref({modified:/y/,type:/b/,value:/^false$/i});  // show modified boolean false
//   ujtFindPref({style:3,name:/activity-stream/i});                     // part name
//   ujtFindPref({style:3,name:/^extensions\.pocket\.enabled$/i});       // whole name
//   ujtFindPref({style:3,name:/^(whole|start.*|.*middle.*|.*end)$/i});  // multi name
//
// -------------
// General Notes
// -------------
//   * on console right click results "Copy object" / left click expand/contract
//     (if results do not copy to clipboard try "Export visible messages to File",
//     or ujtFindPref has fileout:true to save results to a file)
//   * clear console/command history:  clear();  clearHistory();
//   * Thunderbird (console) open about:config: window.openDialog("about:config");
//   * if using remote debugging to access another device (eg Android):
//     PC: use 'about:debugging' (older Firefox was WebIDE/Scratchpad)
//     Target: 'about:config' open, "Remote debugging" enabled in Firefox settings
//             "USB debugging" enabled in Android Developer settings
//     re: https://github.com/arkenfox/user.js/wiki/1.6-Firefox-Android
//     also re arkenfox/user.js/wiki: unblock about:config in newer versions (FF71+?):
//     user_pref("general.aboutConfig.enable", true);
//   * functions might also work through Browser/Error Console (Ctrl+Shift+J)
//   * set 'user_pref' alias if you want to paste 'user.js' code to run a function
//     eg enter 'user_pref = ujtSetPref;' or 'user_pref = ujtResetPref;'
//   * distribution/policies.json can change preference default values (about:policies)
//   * hidden preferences only show if they have been created/modified (same as about:config)
//     examples: https://searchfox.org/mozilla-central/search?q=(extensions\.getAddons\.showPane|privacy\.resistFingerprinting\.letterboxing|ui\.prefersReducedMotion)&path=&case=false&regexp=true
//
// -----------------
// ujtFindPref Notes
// -----------------
//   * ujtFindPref( { style:0, name:/.*/i, value:/.*/i, type:/[bis]/, locked:/[yn]/, modified:/[yn]/, asdefault:/[yn]/, nodefault:/[yn]/, fileout:false } );
//   * style:
//       0=regex     (default) paste result into the about:config search box
//       1=bookmark  'about:config?filter=' (FF71+ copy, click, paste in search)
//       2=list+default        paste into a spreadsheet for sort/filter/search
//       3=user_pref+comments  user_pref("pref", value);  // locked  // modified  // nodefault
//       4=user_pref           user_pref("pref", value);
//       5=user_pref@default   user_pref("pref", valueDefault);
//   * type: b=boolean i=integer s=string
//   * locked/modified/asdefault/nodefault: y=yes n=no
//   * modified:/y/ - user set preferences (eg user.js/about:config/etc)
//     {modified:/y/,asdefault:/y/} - finds those user set to same as default
//   * asdefault:/y/ - if preference value is the same as the default value
//   * nodefault:/y/ - prefs with a trash can icon on about:config eg hidden/invalid
//   * fileout:true - save results to desktop userjs-tool-aboutconfig-YYYYMMDD-HHMMSS-SSS.txt
//   * return and newline characters in preference values are replaced as \r \n
//   * now using Services.prefs.getComplexValue to look up the value of
//     preferences which are initially read as "chrome:..."
//
// -----------------------------
// ujtSetPref/ujtResetPref Notes
// -----------------------------
//   * these were mainly intended for when injecting preferences to Android
//   * on desktop you would usually use user.js/profiles for preference control
//     (although ujtResetPref could be useful for batch clearing prefs)
//   * incorrect usage risks messing up your Firefox settings (if you are using
//     this on desktop: backup your Firefox profile, or 'prefs.js' at least,
//     and remember that user.js can override changes on Firefox restart)
//   * ujtSetPref outputs 'creating' to the console when the preference did
//     not already exist (these are either hidden preferences, or invalid)
//
// -------------------------------------------------
// Acknowledgments (this is based on info/code from)
// -------------------------------------------------
//   https://github.com/arkenfox/user.js
//     https://github.com/arkenfox/user.js/wiki/1.6-Firefox-Android
//     https://github.com/arkenfox/user.js/tree/master/scratchpad-scripts
//     https://github.com/arkenfox/user.js/blob/master/scratchpad-scripts/arkenfox-clear-removed.js
//     https://github.com/arkenfox/user.js/blob/master/scratchpad-scripts/troubleshooter.js
//   https://stackoverflow.com/questions/3796084/about-config-preferences-and-js
//   https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Services.jsm
//   http://www.openjs.com/articles/optional_function_arguments.php
//   https://dxr.mozilla.org/mozilla-central/source/modules/libpref/nsIPrefBranch.idl#31
//   https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Code_snippets/File_I_O
//   https://github.com/Theemim/GeckoPrefsExporter   (file out method)

if (typeof(Services) == "undefined") {
  console.log("// requires Services (eg about:config as active tab)");
}

// older versions of Firefox/forks/Thunderbird/SeaMonkey use ...CharPref
try {
  var ujtUseCharPref = !(typeof(Services.prefs.getStringPref) == "function");
}
catch(e) { }

var ujtFindPref = function(options) {
  var result = "";
  if (typeof options == "undefined") {
    options = { 'fileout': false };
    // if no options specified show some usage info
    result = "// usage:\n"
      + '// ujtFindPref( { style:0, name:/.*/i, value:/.*/i, type:/[bis]/, locked:/[yn]/, modified:/[yn]/, asdefault:/[yn]/, nodefault:/[yn]/, fileout:false } );\n'
      + '// style: 0=regex 1=bookmark 2=list+default 3=user_pref+comments 4=user_pref 5=user_pref@default\n'
      + '// b=boolean i=integer s=string y=yes n=no\n'
      + '// eg ujtFindPref(2); ujtFindPref({style:3,fileout:true}); ujtFindPref({modified:/y/}); ujtFindPref({nodefault:/y/});\n';
  }
  else {
    // function to get the default value of a preference
    var ujtGetPrefDefault = function(prefName) {
      var defaultValue;
      try {
        switch (Services.prefs.getDefaultBranch("").getPrefType(prefName)) {
          case 128:
            defaultValue = Services.prefs.getDefaultBranch("").getBoolPref(prefName).toString();
            break;
          case 64:
            defaultValue = Services.prefs.getDefaultBranch("").getIntPref(prefName).toString();
            break;
          case 32:
            defaultValue = ujtUseCharPref ? Services.prefs.getDefaultBranch("").getCharPref(prefName)
              : Services.prefs.getDefaultBranch("").getStringPref(prefName);
            break;
          default:
            return null;
        }
      }
      catch(e) {
        return null;
      }
      return defaultValue;
    }
    // prepare for options being a single regex/string/number
    var noArgsMatched = true, nameOnly = options, styleOnly = 3, fileOutEx = false;
    if (typeof options == "string") {
      nameOnly = new RegExp(options, "i");
      fileOutEx = true;
      options = {};
    }
    else if (typeof options == "number") {
      nameOnly = new RegExp(".*", "i");
      styleOnly = options;
      fileOutEx = true;
      options = {};
    }
    // enforce defaults for unspecified options
    var defaultArgs = { 'style': 0, 'name': /.*/, 'value': /.*/, 'type': /.*/, 'locked': /.*/,
      'modified': /.*/, 'asdefault': /.*/, 'nodefault': /.*/, 'fileout': false }
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
    // when options was a single regex/string/number
    if (noArgsMatched) {
      options["name"] = nameOnly;
      options["style"] = styleOnly;
      options["fileout"] = fileOutEx;
    }
    // begin forming result
    switch (options["style"]) {
      case 5:
        result = "// default values\n";
        break;
      case 4:
      case 3:
        break;
      case 2:
        result = "[PreferenceName]\t[Type]\t[Value]\t[Locked]\t[Modified]\t[SameAsDefault]\t[DefaultValue]\t[NoDefault]\n";
        break;
      case 1:
        result = 'about:config?filter=';
      default:
        result += '/^\\*$|^(';
    }
    // loop through all prefs
    var type, value, locked, modified, asDefault, noDefault, valueDefault;
    // same prefs: Services.prefs.getDefaultBranch("").getChildList("").sort()
    //             Services.prefs.getBranch("").getChildList("").sort()
    //             Services.prefs.getChildList("").sort()
    for (const prefName of Services.prefs.getChildList("").sort()) {
      // get pref info
      modified = (Services.prefs.prefHasUserValue(prefName) ? 'y' : 'n');
      locked = (Services.prefs.prefIsLocked(prefName) ? 'y' : 'n');
      switch (Services.prefs.getPrefType(prefName)) {
        case 128:
          type = "b";
          value = Services.prefs.getBoolPref(prefName).toString();
          valueDefault = ujtGetPrefDefault(prefName);
          break;
        case 64:
          type = "i";
          value = Services.prefs.getIntPref(prefName).toString();
          valueDefault = ujtGetPrefDefault(prefName);
          break;
        case 32:
          type = "s";
          value = ujtUseCharPref ? Services.prefs.getCharPref(prefName)
            : Services.prefs.getStringPref(prefName);
          valueDefault = ujtGetPrefDefault(prefName);
          // get the actual value when "chrome:..."
          try {
            if (modified == 'n' && /^chrome:\/\/.+\/locale\/.+\.properties/.test(value)) {
              value = Services.prefs.getComplexValue(prefName, Ci.nsIPrefLocalizedString).data;
            }
          }
          catch(e) { value = ""; }
          try {
            if (/^chrome:\/\/.+\/locale\/.+\.properties/.test(valueDefault)) {
              valueDefault = Services.prefs.getComplexValue(prefName, Ci.nsIPrefLocalizedString).data;
            }
          }
          catch(e) { valueDefault = ""; }
          break;
        default:
          value = null; type = null; locked = null; modified = null;
          asDefault = null; noDefault = null; valueDefault = null;
      }
      if (valueDefault === null) { noDefault = "y"; } else { noDefault = "n"; };
      if (value === valueDefault) { asDefault = "y"; } else { asDefault = "n"; };
      // add to result if matches options
      if ( (options["name"].test(prefName))
        && (options["value"].test(value))
        && (options["type"].test(type))
        && (options["locked"].test(locked))
        && (options["modified"].test(modified))
        && (options["asdefault"].test(asDefault))
        && (options["nodefault"].test(noDefault))
         )
      {
        // quote/escape string
        if ((type == "s") && (options["style"] == 5
          || options["style"] == 4 || options["style"] == 3))
        {
          value = '"' + value.replace(/(["\\])/g, '\\$1') + '"';
          if (valueDefault !== null) {
            valueDefault = '"' + valueDefault.replace(/(["\\])/g, '\\$1') + '"'
          }
        }
        if (valueDefault === null) { valueDefault = "null" }
        value = value.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        valueDefault = valueDefault.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        switch (options["style"]) {
          case 5: // 5=user_pref@default
            result += 'user_pref("' + prefName + '", ' + valueDefault + ");\n";
            break;
          case 4: // 4=user_pref
            result += 'user_pref("' + prefName + '", ' + value + ");\n";
            break;
          case 3: // 3=user_pref+comments
            result += 'user_pref("' + prefName + '", ' + value + ");"
              + locked.replace(/n/g, "").replace(/y/g, "  // locked")
              + modified.replace(/n/g, "").replace(/y/g, "  // modified");
            if (asDefault == "y" && modified == "y") { result += "=default" }
            result += noDefault.replace(/n/g, "").replace(/y/g, "  // nodefault") + "\n";
            break;
          case 2: // 2=list+default
            result += prefName + "\t" + type + "\t" + value + "\t" + locked + "\t"
              + modified + "\t" + asDefault + "\t" + valueDefault + "\t" + noDefault + "\n";
            break;
          default: // 0=regex / 1=bookmark
            result += prefName.replace(/([*.+])/g, "\\$1") + "|";
        }
      }
    } // (end of loop through all prefs)
    // finish forming result
    switch (options["style"]) {
      case 5:
      case 4:
      case 3:
      case 2: break;
      default:
        result = result.replace(/\|$/, '') + ')(;|$)|^$/i';
        // update about:config display (ignore errors for thunderbird/etc)
        try {
          // put result into the about:config search box and filter
          document.getElementById("about-config-search").value = result;
          filterPrefs({ shortString: true });
          // temporarily change about:config to compact size
          document.body.style.fontSize = '0.98em';
          for (var s of [ '#prefs', '#prefs *', '#prefs > tr', '#prefs > tr > td',
            '#prefs > tr > th', '#prefs button', '.add' ])
          {
            var o = document.querySelectorAll(s);
            for (var i = 0, j = o.length; i < j; i++) {
              if (s == '.add') {
                // hide the add (last line only showing the search criteria)
                o[i].style.display = 'none';
              }
              else {
                o[i].style.minHeight = "1.2em";
                o[i].style.height = "unset";
              }
            }
          }
        }
        catch(e) { }
    }
  }
  console.log(result);
  if (options["fileout"]) {
    // https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Code_snippets/File_I_O
    // https://github.com/Theemim/GeckoPrefsExporter
    try {
      // "CurWorkD" might be readonly program folder so use "Desk"
      var file = Services.dirsvc.get("Desk", Components.interfaces.nsIFile);
      var d = new Date();
      file.append("userjs-tool-aboutconfig-" + d.getFullYear()
        + ((d.getMonth()+1) < 10 ? "0" : "") + (d.getMonth()+1)
        + (d.getDate() < 10 ? "0" : "") + d.getDate()
        + "-" + (d.getHours() < 10 ? "0" : "") + d.getHours()
        + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes()
        + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds()
        + "-" + d.getMilliseconds() + ".txt"
      );
      console.log('// saving result to file: ' + file.path);
      var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                .createInstance(Components.interfaces.nsIFileOutputStream);
      foStream.init(file, 0x02 | 0x08 | 0x20, parseInt("0666", 8), 0);
      var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                                .createInstance(Components.interfaces.nsIConverterOutputStream);
      converter.init(foStream, "UTF-8", 0, 0);
      converter.writeString(result);
      converter.close();
    }
    catch(e) {
      console.log("// (ujtFindPref) file save error:\n"+e+"\n");
    }
  }
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
