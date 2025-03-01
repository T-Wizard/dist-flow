/* eslint-disable import/no-unresolved, prefer-rest-params */
import distributionPlotColorBy from './distributionplot-color-by';
import CONSTANTS from './distributionplot-constants';
import CachedStackedApi from '../../../assets/objects/backend-api/cached-stacked-api';
import template from './distributionplot.ng.html';
import objectConversion from '../../../assets/objects/conversion/object-conversion';

const DATA_PATH = CONSTANTS.DATA_PATH;
const HYPERCUBE_DEF_PATH = CONSTANTS.HYPERCUBE_DEF_PATH;
const CustomAPI = CachedStackedApi.extend('DistributionPlotBackendAPI', {
  init() {
    this._super.apply(this, arguments);
    this.dataPath = `/${DATA_PATH}/${HYPERCUBE_DEF_PATH}`;
  },
});

export default {
  type: 'distributionPlot',
  BackendApi: CustomAPI,
  template,
  initialProperties: {
    sorting: {
      autoSort: true,
    },
    qHyperCubeDef: {
      qDimensions: [],
      qMeasures: [],
      qMode: 'K',
      qAlwaysFullyExpanded: true,
      qSuppressZero: false,
      qSuppressMissing: true,
    },
    dataPoint: {
      bubbleScales: 100, // This means 100% to make bubbles having full size as they are now
    },
  },
  importProperties(exportedFmt, initialProperties, definition) {
    const propTree = objectConversion.axisChart.importProperties.call(
      objectConversion,
      exportedFmt,
      initialProperties,
      definition
    );
    const props = propTree.qProperty;
    if (props[HYPERCUBE_DEF_PATH].qInterColumnSortOrder.length === 3) {
      props[HYPERCUBE_DEF_PATH].qInterColumnSortOrder = [1, 2, 0]; // Since the distribution plot does not allow re-ordering of sorting prioritizes we must set this manually on conversion
    }
    distributionPlotColorBy.importColors(props);

    return propTree;
  },
  exportProperties(propertyTree) {
    distributionPlotColorBy.exportColors(propertyTree.qProperty);
    return objectConversion.axisChart.exportProperties.call(objectConversion, propertyTree);
  },
};
