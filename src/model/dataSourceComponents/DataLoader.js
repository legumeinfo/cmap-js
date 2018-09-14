/**
 * DataLoader - orchestrate loading of data from provided maps and views
 *
 * */
import {DataSourceModel} from './DataSourceModel';

export function loadDataSources(sources=[]){
  let maps = [];
  let promises = sources.map(config => {
    let dsm = new DataSourceModel(config);
      maps.push(dsm);
      return dsm.load();
  });
    // wait for all data sources are loaded, then set this.bioMaps with
    // only the maps named in initialView
    //
  return Promise.all(promises)
    .then(() =>{
      let am = maps.map(src => Object.values(src.bioMaps)).concatAll();
      return am;
    })
    .catch(error => {
      throw error;
    });
}




