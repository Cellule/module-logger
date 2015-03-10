"use strict";

exports.getNow = getNow;
var printf = require("util").format;

var config = require("./config");

function localISOString(d) {
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }
  return printf("%d-%s-%s %s:%s:%s", d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate()), pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()));
}

function getNow() {
  var now = new Date();
  var nowISOString;
  if (config.isDev) {
    // ISO-like date, but do as if current timezone was UTC.
    nowISOString = localISOString(now);
  } else {
    // Return UTC date and time unless in development.
    nowISOString = now.toISOString().replace(/T/, " ").replace(/\..+/, "");
  }
  return nowISOString;
}