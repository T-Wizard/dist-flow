import extend from 'extend';
import Actions from './selection-actions';

// TODO: fix
const eventUtils = {
  showLockedFeedback: () => {},
};

const DEFAULT_OPTIONS = {
  data: ['elemNo'],
  contexts: ['select'],
  startOnEmptySelection: true,
  style: {
    active: {
      strokeWidth: 2,
      stroke: '#333', // To make it consistent with other charts
    },
    inactive: {
      opacity: 0.3,
    },
  },
};

const ESCAPE = 27;
const ENTER = 13;
const SHIFT = 16;

/**
 * Create a new Selections handler
 *
 * @param {Object} options
 * @param {Object} options.model The backend model for the chart
 * @param {Object} options.chartInstance Picasso chart instance
 * @param {Object} options.selectionsApi Object selectionsApi
 * @returns {Object} The selections handler instance
 */
function Selections(options) {
  if (!options || !options.chartInstance || !options.selectionsApi) {
    throw Error('Selections-handler: Missing input');
  }
  const chartInstance = options.chartInstance;
  const selectionsApi = options.selectionsApi;
  const dataPaths = options.dataPaths || [''];
  const selectPaths = options.selectPaths;
  const lasso = options.lasso;

  let selectionContexts = [];
  const selectionsApiRestoreHelper = { propertiesToRestore: {} };
  let on = false;
  const actions = Actions(chartInstance, selectionsApi, selectPaths);

  // Not need for a function, so turned it into an object
  const fn = {};

  let lastShift = false;
  function shiftToggle(e) {
    if (e.keyCode === SHIFT && e.shiftKey !== lastShift) {
      lastShift = e.shiftKey;
      lasso.toggle();
    }
  }

  function confirmOrCancelSelection(event) {
    const key = event.keyCode;
    if (key === ESCAPE) {
      selectionsApi.cancel();
    } else if (key === ENTER) {
      selectionsApi.confirm();
    }
  }

  // If a single field in a single table is not locked, this function returns false
  function areAllFieldsLocked() {
    let dimFields = dataPaths.map((dataPath) =>
      chartInstance
        .dataset(dataPath)
        .fields()
        .filter((field) => field.type() === 'dimension')
    );

    // flattern list
    dimFields = [].concat.apply([], dimFields);

    return dimFields.length && dimFields.every((field) => field.raw().qLocked);
  }

  // If a single field in a single table is not locked, this function returns false
  function getFieldsLocked() {
    const lockedFields = [];
    let dimFields = dataPaths.map((dataPath) =>
      chartInstance
        .dataset(dataPath)
        .fields()
        .filter((field) => field.type() === 'dimension')
    );

    // flattern list
    dimFields = [].concat.apply([], dimFields);

    for (let i = 0; i < dimFields.length; i++) {
      if (dimFields[i].raw().qLocked) {
        lockedFields.push(dimFields[i].raw());
      }
    }
    return {
      fields: lockedFields,
      areAllFieldsLocked: lockedFields.length && lockedFields.length === dimFields.length,
    };
  }

  function isLassoDisabled() {
    return options.isLassoDisabled && options.isLassoDisabled();
  }

  selectionsApi.on('cleared', () => {
    selectionContexts.forEach((context) => {
      context.brush.clear();
      // Clear dependent components
      context.dependentComponents.forEach((comp) => {
        const instance = chartInstance.component(comp.id);
        if (instance) {
          instance.emit(comp.clear);
        }
      });
    });
  });

  // Setup a selection context
  /*
        builder - instance of chart-builder
        componentKeys = []
        options = {
            contexts: [],
            data: [],
            style: {}
        }
    */
  /**
   * Setup a selection context
   * @param {Object} options Selection context options
   * @returns {Object} The selections handler instance
   */
  fn.setUp = function (options) {
    fn.tearDown();

    const result = this.setUpBrush(options);

    if (on) {
      register();
    }

    return result;
  };
  fn.setUpBrush = function (options) {
    const opts = extend(true, {}, DEFAULT_OPTIONS, options);

    const selectionTrigger = {
      on: 'tap',
      action(e) {
        return e.ctrlKey || options.isSingleSelect ? 'set' : 'toggle';
      },
      contexts: opts.contexts,
      data: opts.data,
      globalPropagation: 'stop',
    };

    const selectionConsumer = {
      context: opts.contexts[0],
      data: opts.data,
      style: opts.style,
    };

    const context = createContext(opts, chartInstance);
    // Do this here instead of in register to be able to catch the consumer
    context.listeners.toggle = function (items) {
      if (!on) {
        return [];
      }
      const fieldsLocked = getFieldsLocked();
      if (opts.startOnEmptySelection && items.length === 0 && fieldsLocked.areAllFieldsLocked) {
        eventUtils.showLockedFeedback(fieldsLocked.fields);
        return [];
      }
      return actions.toggleValues(items, context.brush, opts.startOnEmptySelection);
    };

    // Add all three to cover tap, brush range and lasso
    context.brush.intercept('toggle-values', context.listeners.toggle);
    context.brush.intercept('add-values', context.listeners.toggle);
    context.brush.intercept('remove-values', context.listeners.toggle);
    context.brush.intercept('set-values', context.listeners.toggle);

    context.listeners.start = function () {
      if (selectionContexts.length > 1) {
        selectionContexts.forEach((c) => {
          if (c !== context) {
            c.brush.end();
          }
        });

        // something may still be needed but can not call selectionsApi.clear() that would cause a infinite loop
        // if (!selectionsApi.canClear || selectionsApi.canClear()) {
        //   selectionsApi.clear();
        // }
      }
    };

    selectionContexts.push(context);

    return { trigger: selectionTrigger, consume: selectionConsumer };
  };
  fn.setUpStart = function () {
    fn.tearDown();
  };
  fn.setUpDone = function () {
    if (on) {
      register();
    }
  };

  fn.tearDown = function () {
    if (on) {
      deregister();
    }
    selectionContexts.forEach((context) => {
      context.brush.removeInterceptor('toggle-values', context.listeners.toggle);
      context.brush.removeInterceptor('add-values', context.listeners.toggle);
      context.brush.removeInterceptor('remove-values', context.listeners.toggle);
      context.brush.removeInterceptor('set-values', context.listeners.toggle);
    });
    selectionContexts = [];
  };

  function register() {
    selectionContexts.forEach((context) => {
      context.listeners.update = function (added, removed) {
        // On tap end, picaso will run rendering in the same frame, and if this is a heavy job then long tap end will happen before tap end finish. This can trigger the radial context menu.
        // So we prevent long tap end here.
        if (!context.sleep) {
          actions.update(added, removed, context.brush);
        }
      };
      context.brush.on('update', context.listeners.update);
      context.brush.on('start', context.listeners.start);
    });
  }

  function deregister() {
    selectionContexts.forEach((context) => {
      context.brush.removeListener('update', context.listeners.update);
      context.brush.removeListener('start', context.listeners.start);
    });
  }

  fn.pauseEngineCalls = function (id) {
    selectionContexts.forEach((context) => {
      if (context.id === id) {
        context.sleep = true;
      }
    });
  };

  fn.resumeEngineCalls = function (id, run) {
    selectionContexts.forEach((context) => {
      if (context.id === id) {
        context.sleep = false;
        if (run) {
          context.listeners.update([], []);
        }
      }
    });
  };

  fn.addComponent = function (id, comp) {
    selectionContexts.forEach((context) => {
      if (context.id === id) {
        context.dependentComponents.push(comp);
      }
    });
  };

  fn.on = function () {
    if (on) {
      return;
    }
    on = true;

    register();

    document.addEventListener('keydown', shiftToggle);
    document.addEventListener('keyup', shiftToggle);

    const onDeactivated = () => {
      selectionContexts.forEach((context) => {
        context.brush.end();
      });
      document.removeEventListener('keyup', confirmOrCancelSelection);
      // TODO reset lasso on deselect
      // if (lasso.active()) {
      //   lasso.toggle();
      // }
    };
    selectionsApi.on('deactivated', onDeactivated);
    selectionsApiRestoreHelper.unbindDeactivated = () => {
      selectionsApi.removeListener('deactivated', onDeactivated);
    };

    const onActivated = () => {
      document.addEventListener('keyup', confirmOrCancelSelection);
    };
    selectionsApi.on('activated', onActivated);
    selectionsApiRestoreHelper.unbindActivated = () => {
      selectionsApi.removeListener('activated', onActivated);
    };
  };
  fn.isOn = () => on;
  fn.off = function () {
    if (!on) {
      return;
    }
    on = false;
    deregister();

    document.removeEventListener('keydown', shiftToggle);
    document.removeEventListener('keyup', shiftToggle);
    document.removeEventListener('keyup', confirmOrCancelSelection);

    selectionsApiRestoreHelper.unbindActivated();
    selectionsApiRestoreHelper.unbindDeactivated();
  };

  fn.lassoState = function () {
    return lasso.active() && !isLassoDisabled();
  };
  fn.allFieldsLocked = function () {
    return areAllFieldsLocked();
  };

  return fn;
}

class NoSelections {
  // eslint-disable-next-line class-methods-use-this
  isOn() {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  on() {
    console.warn('Can not turn on selections on this object');
  }

  // eslint-disable-next-line class-methods-use-this
  off() {}
}

export default {
  create(options) {
    if (!options.selectionsApi) {
      return new NoSelections();
    }
    return Selections(options);
  },
};

function createContext(options, chartInstance) {
  return {
    brush: chartInstance.brush(options.contexts[0]),
    listeners: {},
    dependentComponents: [],
    id: options.contexts[0],
  };
}
