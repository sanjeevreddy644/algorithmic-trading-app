// jsdom has no ResizeObserver; Recharts' ResponsiveContainer needs one.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom lays nothing out, so every element measures 0px and ResponsiveContainer renders no chart.
HTMLElement.prototype.getBoundingClientRect = function () {
  return { x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 400, width: 800, height: 400, toJSON() {} };
};
