/**
  * FeatureMarker
  * A SceneGraphNode representing a feature on a Map with a line or hash mark.
  */
import {SceneGraphNodeBase} from '../node/SceneGraphNodeBase';
import {Bounds} from '../../model/Bounds';

export class FeatureMark extends SceneGraphNodeBase {

  constructor({parent, bioMap, featureModel}) {
    super({parent, tags: [featureModel.name]});
    this.model = featureModel;
    this.featureMap = bioMap;
    this.lineWidth = 1.0;
    this.pixelScaleFactor = this.featureMap.view.pixelScaleFactor;
    this.bounds = new Bounds({
      allowSubpixel: false,
      top: 0,
      left: 0,
      width: parent.bounds.width,
      height: this.lineWidth
    });
  }

  draw(ctx) {
    console.log('drawing');
    let y = this._translateScale(this.model.coordinates.start) * this.pixelScaleFactor;
    this.bounds.top = y;
    let gb = this.globalBounds || {};
    ctx.beginPath();
    ctx.lineWidth = this.lineWidth;
    ctx.moveTo(Math.floor(gb.left), Math.floor(gb.top));
    ctx.lineTo(Math.floor(gb.right), Math.floor(gb.top));
    ctx.stroke();
    // reset bounding box to fit the new stroke location/width
    // lineWidth adds equal percent of passed width above and below path
    this.bounds.top = Math.floor(y - this.lineWidth/2);
    this.bounds.bottom = Math.floor( y + this.lineWidth/2);
  }

  _translateScale(point){
    let coord = this.featureMap.view.base;
    let vis = this.featureMap.view.visible;
    return (coord.stop - coord.start)*(point-vis.start)/(vis.stop-vis.start)+coord.start;
  }
}
