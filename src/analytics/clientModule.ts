import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {initAnalytics, onRouteChange} from './index';
import {installListeners} from './listeners';

/**
 * Docusaurus client module (registered in docusaurus.config.ts): starts analytics in the browser and reports every
 * route change. Everything it starts is inert until the visitor allows analytics.
 */
if (ExecutionEnvironment.canUseDOM) {
  initAnalytics();
  installListeners();
}

export function onRouteDidUpdate({location}: {location: {pathname: string}}): void {
  onRouteChange(location.pathname);
}
