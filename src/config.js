// Initial value from environment
var isDev = (process.env.NODE_ENV === "development");
Object.defineProperty(module.exports, "isDev", {
  get: () => { return isDev; }
});

export function setDev(dev) {
  isDev = Boolean(dev);
}
