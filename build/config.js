"use strict";

exports.setDev = setDev;
// Initial value from environment
var isDev = exports.isDev = process.env.NODE_ENV === "development";

function setDev(dev) {
  isDev = exports.isDev = Boolean(dev);
}