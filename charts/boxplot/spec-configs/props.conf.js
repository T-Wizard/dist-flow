const path = require('path');

const packagePath = path.resolve(__dirname, '../package.json');
const pkg = require(packagePath); // eslint-disable-line

module.exports = {
  glob: [path.resolve(__dirname, '../src/object-properties.js')],
  package: packagePath,
  api: {
    stability: 'experimental',
    properties: {
      'x-qlik-visibility': 'private',
    },
    visibility: 'private',
    name: `${pkg.name}:properties`,
    version: pkg.version,
    description: 'Boxplot generic object definition',
  },
  output: {
    file: path.resolve(__dirname, '../api-specifications/properties.json'),
  },
  parse: {
    types: {
      HyperCubeDef: {},
      NxDimension: {},
      NxMeasure: {},
      NxInlineDimensionDef: {},
      NxInlineMeasureDef: {},
      NxAttrDimDef: {},
      NxAttrExprDef: {},
      StringExpression: {},
      ValueExpression: {},
    },
  },
};
