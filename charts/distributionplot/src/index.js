import {
  useApp,
  useAppLayout,
  useConstraints,
  useEffect,
  useElement,
  useModel,
  usePromise,
  useSelections,
  useState,
  useStaleLayout,
} from '@nebula.js/stardust';
import $ from 'jquery';
import locale from '@qlik/common/locale';
import picassoSetup from '@qlik/common/picasso/picasso-setup';
import useLasso from '@qlik/common/nebula/use-lasso';
import useResize from '@qlik/common/nebula/resize';
import useEnvironment from '@qlik/common/nebula/use-environment';
import setupSnapshot from '@qlik/common/nebula/snapshot';

import properties from './object-properties';
import data from './distributionplot-data';
import ext from './ext';
import ChartView from './distributionplot-view';
import BackednAPi from './backend-api';

export default function supernova(env) {
  locale(env.translator);
  const picasso = picassoSetup();

  return {
    qae: {
      properties,
      data: data(env),
    },
    ext: ext(env),
    component() {
      const element = useElement();
      const environment = useEnvironment();
      const selections = useSelections();
      const layout = useStaleLayout();
      const model = useModel();
      const constraints = useConstraints();
      const lasso = useLasso();
      const app = useApp();
      const appLayout = useAppLayout();

      const [instance, setInstance] = useState();

      useEffect(() => {
        const $element = $(element);
        const backendApi = new BackednAPi(model);
        const selectionsApi = selections;
        const view = new ChartView({
          environment,
          lasso,
          flags: env.flags,
          picasso,
          $element,
          backendApi,
          selectionsApi,
        });
        view.app = app;
        setInstance(view);

        return () => {
          view.destroy();
        };
      }, []);

      const [, error] = usePromise(async () => {
        if (!instance) {
          return;
        }
        instance.appLayout = appLayout;
        instance.updateEnvironment(environment);
        instance.updateConstraints(constraints);

        const isSnapshot = !!layout.snapshotData;
        if (!isSnapshot) {
          const properties = await model.getEffectiveProperties();
          const updatingDerivedProperties = await instance.updateDerivedProperties(properties, layout);
          if (updatingDerivedProperties) {
            return;
          }
        }

        // TODO: confim selection if triggered from engine (another websocket to the same session (browser tab))

        await instance.updateData(layout);
        await instance.paint();
      }, [layout, instance, environment, appLayout]);
      if (error) {
        throw error;
      }

      useResize(instance);
      setupSnapshot(instance);
    },
  };
}
