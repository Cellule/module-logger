"use strict";

exports.setDev = setDev;
// Initial value from environment
var isDev = process.env.NODE_ENV === "development";
Object.defineProperty(module.exports, "isDev", {
  get: function () {
    return isDev;
  }
});

function setDev(dev) {
  isDev = Boolean(dev);
}