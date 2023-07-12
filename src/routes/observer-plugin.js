export default function createObserverPlugin(callback) {
    let executed = false;
  
    return {
      id: 'observer-plugin',
      afterDraw: (chart) => {
        if (!executed) {
          executed = true;
          callback().then(() => {
            chart.update();
          });
        }
      },
    };
  }