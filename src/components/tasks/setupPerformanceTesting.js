let observingPerf = false;

const performanceMonitor = list => {
  const entries = list.getEntries();
  console.group("long task list:");
  console.count("number");
  entries.forEach(console.log);
  console.groupEnd();
};

const performanceObserver = new PerformanceObserver(performanceMonitor);

if (observingPerf) {
  performanceObserver.observe({
    entryTypes: ["longtask"]
  });
}

window.onunload = () => {
  window.localStorage.setItem("shut_down", new Date().toISOString());
};
