import extend from 'extend';
import { getValue } from 'qlik-chart-modules';
// import defaultProperties from '../../../assets/client/property-panel/default-properties';
import waterfallUtils from './waterfallchart-utils';

function colorIsNotAuto(data) {
  return !data.color.auto;
}

export default function propertyDefinition(env) {
  const { flags, translator } = env;
  const data = {
    uses: 'data',
    addTranslation: 'Properties.AddData',
    items: {
      measures: {
        disabledRef: '',
        items: {
          numberFormatting: {
            show: false,
          },
          valueType: {
            type: 'string',
            component: 'dropdown',
            ref: 'qDef.valueType',
            translation: 'properties.waterfall.measureOperation',
            options: [
              {
                value: waterfallUtils.valueTypes.NORMAL,
                translation: 'properties.waterfall.measureOperation.add',
              },
              {
                value: waterfallUtils.valueTypes.INVERSE,
                translation: 'properties.waterfall.measureOperation.subtract',
              },
              {
                value: waterfallUtils.valueTypes.SUBTOTAL,
                translation: 'properties.waterfall.measureOperation.subtotal',
              },
            ],
            defaultValue: waterfallUtils.valueTypes.NORMAL,
          },
          subTotal: {
            ref: 'qDef.subtotal.enable',
            type: 'boolean',
            defaultValue: false,
            translation: 'properties.waterfall.measureOperation.subtotal',
            show(data) {
              return data.qDef.valueType !== waterfallUtils.valueTypes.SUBTOTAL;
            },
          },
          subTotalLabel: {
            translation: 'properties.waterfall.subtotalLabel',
            component: 'string',
            expression: 'optional',
            ref: 'qDef.subtotal.label',
            defaultValue() {
              return translator.get('properties.waterfall.measureOperation.subtotal');
            },
            show(data) {
              return (
                data.qDef.valueType !== waterfallUtils.valueTypes.SUBTOTAL &&
                data.qDef.subtotal &&
                data.qDef.subtotal.enable
              );
            },
          },
        },
      },
    },
  };

  const presentation = {
    type: 'items',
    translation: 'properties.presentation',
    grouped: true,
    items: {
      gridLines: {
        type: 'items',
        snapshot: {
          tid: 'property-gridLines',
        },
        items: {
          showGridLines: {
            ref: 'gridlines.auto',
            type: 'boolean',
            translation: 'properties.gridLine.spacing',
            component: 'switch',
            defaultValue: true,
            options: [
              {
                value: true,
                translation: 'Common.Auto',
              },
              {
                value: false,
                translation: 'Common.Custom',
              },
            ],
          },
          gridSpacing: {
            ref: 'gridlines.spacing',
            type: 'number',
            component: 'dropdown',
            defaultValue: 2,
            options: [
              {
                value: 0,
                translation: 'properties.gridLine.noLines',
              },
              {
                value: 2,
                translation: 'properties.gridLine.medium',
              },
              {
                value: 3,
                translation: 'properties.gridLine.narrow',
              },
            ],
            show(data) {
              return data.gridlines && !data.gridlines.auto;
            },
          },
        },
      },
      showLabels: {
        ref: 'dataPoint.showLabels',
        type: 'boolean',
        translation: 'properties.dataPoints.labelmode',
        component: 'switch',
        defaultValue: true,
        options: [
          {
            value: true,
            translation: 'Common.Auto',
          },
          {
            value: false,
            translation: 'properties.off',
          },
        ],
        snapshot: {
          tid: 'property-dataPoints',
        },
      },
    },
  };

  const colors = {
    translation: 'properties.colorsAndLegend',
    type: 'items',
    grouped: true,
    items: {
      colors: {
        type: 'items',
        items: {
          autoColor: {
            ref: 'color.auto',
            type: 'boolean',
            translation: 'properties.colors',
            component: 'switch',
            defaultValue: true,
            options: [
              {
                value: true,
                translation: 'Common.Auto',
              },
              {
                value: false,
                translation: 'Common.Custom',
              },
            ],
          },
          positiveValueColor: {
            ref: 'color.positiveValue.paletteColor',
            translation: 'properties.waterfall.color.positiveValueColor',
            type: 'object',
            component: 'color-picker',
            dualOutput: true,
            defaultValue: { index: 6, color: null },
            show: colorIsNotAuto,
          },
          negativeValueColor: {
            ref: 'color.negativeValue.paletteColor',
            translation: 'properties.waterfall.color.negativeValueColor',
            type: 'object',
            component: 'color-picker',
            dualOutput: true,
            defaultValue: { index: -1, color: '#cc6677' },
            show: colorIsNotAuto,
          },
          subtotalColor: {
            ref: 'color.subtotal.paletteColor',
            translation: 'properties.waterfall.color.subtotalColor',
            type: 'object',
            component: 'color-picker',
            dualOutput: true,
            defaultValue: { index: -1, color: '#c3c3c3' },
            show: colorIsNotAuto,
          },
        },
      },
      legend: {
        type: 'items',
        items: {
          show: {
            ref: 'legend.show',
            type: 'boolean',
            translation: 'properties.legend.show',
            component: 'switch',
            defaultValue: true,
            options: [
              {
                value: true,
                translation: 'Common.Auto',
              },
              {
                value: false,
                translation: 'properties.off',
              },
            ],
          },
          dock: {
            type: 'string',
            component: 'dropdown',
            ref: 'legend.dock',
            translation: 'properties.legend.position',
            options: [
              {
                value: 'auto',
                translation: 'Common.Auto',
              },
              {
                value: 'right',
                translation: 'properties.dock.right',
              },
              {
                value: 'bottom',
                translation: 'Common.Bottom',
              },
              {
                value: 'left',
                translation: 'properties.dock.left',
              },
              {
                value: 'top',
                translation: 'Common.Top',
              },
            ],
            defaultValue: 'auto',
            show(data) {
              return getValue(data, 'legend.show', true);
            },
          },
        },
      },
    },
  };

  const measureAxis = {
    uses: 'axis.picasso.measureAxis',
    label: translator.get('properties.yAxis'),
    items: {
      axis: {
        items: {
          show: {
            translation: 'properties.labels',
            defaultValue: 'labels',
            options: [
              {
                value: 'labels',
                translation: 'properties.labels',
              },
              {
                value: 'none',
                translation: 'Common.None',
              },
              null,
              null,
            ],
          },
        },
      },
    },
  };

  const dimensionAxis = {
    uses: 'axis.picasso.dimensionAxis',
    items: {
      othersGroup: {
        items: {
          show: {
            translation: 'properties.labels',
            defaultValue: 'labels',
            options: [
              {
                value: 'labels',
                translation: 'properties.labels',
              },
              {
                value: 'none',
                translation: 'Common.None',
              },
              null,
              null,
            ],
          },
          label: {
            options: flags.isEnabled('SENSECLIENT_LAYERED_LABELS')
              ? [
                  {
                    value: 'auto',
                    translation: 'Common.Auto',
                  },
                  {
                    value: 'horizontal',
                    translation: 'Common.Horizontal',
                  },
                  {
                    value: 'tilted',
                    translation: 'properties.labels.tilted',
                  },
                  {
                    value: 'layered',
                    translation: 'properties.labels.layered',
                  },
                ]
              : undefined,
          },
        },
      },
    },
  };

  const settings = {
    uses: 'settings',
    items: {
      presentation,
      colors,
      measureAxis,
      dimensionAxis,
    },
  };

  const addons = {
    type: 'items',
    component: 'expandable-items',
    translation: 'properties.addons',
    items: {
      dataHandling: {
        uses: 'dataHandling',
        items: {
          suppressZero: null,
          calcCond: {
            uses: 'calcCond',
          },
        },
      },
      refLines: {
        uses: 'reflines',
        items: {
          colorBackground: {
            show: false,
          },
        },
      },
    },
  };
  const numberFormatting = {
    translation: 'properties.numberFormatting',
    type: 'items',
    globalChange(data) {
      data.qHyperCubeDef.qMeasures.forEach((measure) => {
        measure.qDef.numFormatFromTemplate = data.qDef.numFormatFromTemplate;
        measure.qDef.qNumFormat = extend(true, {}, data.qDef.qNumFormat);
      });
    },
    items: {
      numberFormatting: {
        uses: 'measures.items.numberFormatting',
        items: { numberFormattingType: undefined },
      },
    },
  };

  return {
    type: 'items',
    component: 'accordion',
    items: {
      data,
      numberFormatting,
      addons,
      settings,
    },
  };
}
