/**
 * CMAP
 */

import m from 'mithril';

import {AppModel} from './../model/AppModel';
import {UI} from './UI';
import queryString from 'query-string';
/* istanbul ignore next: mithril-query does not work with m.mount, and dom id is hardcoded as well */
export class CMAP {

  /**
   *
   * @param configURL
   */

  load(configURL) {
    this.rootElement = document.getElementById('cmap-ui');
    this.appState = new AppModel({});
    this.UI = new UI(this.appState);
    m.mount(this.rootElement, this.UI);

    if (configURL === null) {
      configURL = 'cmap.json';
    }

    this.appState.status = 'loading configuration file...';
    this.appState.busy = true;

    m.request(configURL).then(config => {
      let numSources = config.sources.length;
      let plural = numSources > 1 ? 's' : '';

      this.appState.status = `loading ${numSources} data file${plural}...`;
      let viewOverride = queryString.parse(location.search);

      let promises = this.appState.load(config);
      Promise.all(promises).then(() => {
        if ('view' in viewOverride && viewOverride.view.length){
          let overrideInitialView = [];
          if( typeof viewOverride.view === 'string'){ viewOverride.view = [viewOverride.view];}
          viewOverride.view.forEach( (view) =>{
            const filter = this.appState.allMaps.filter( map => map.name == view);
            if(filter.length){
              overrideInitialView.push(filter[0]);
            }
          });
          this.appState.bioMaps = overrideInitialView;
        }
        this.appState.status = '';
        this.appState.busy = false;
      });
    }).catch(err => {
      // TODO: make a nice mithril component to display errors in the UI
      console.error(err);
      console.trace();
      alert(`While fetching cmap.json config file, ${err}`);
    });
  }
}
