/**
 * ruler
 * A SceneGraphNode representing ruler and zoom position for a given backbone
 *
 * @extends SceneGraphNodeBase
 */

import {SceneGraphNodeBase} from '../node/SceneGraphNodeBase';
import {Bounds} from '../../model/Bounds';
import {translateScale} from '../../util/CanvasUtil';

export class Ruler extends SceneGraphNodeBase {

  /**
   * Constructor
   * @param parent - parent scene graph node
   * @param bioMap - map data
   */

  constructor({parent, bioMap}) {
    super({parent});
    let config = bioMap.config;
    this.config = config;
    this.mapCoordinates = bioMap.view;
    this.offset = this.mapCoordinates.base.start * -1;
    this.pixelScaleFactor = this.mapCoordinates.pixelScaleFactor;
    this.fillColor = config.rulerColor;
    this.textFace = config.rulerLabelFace;
    this.textSize = config.rulerLabelSize;
    this.textColor = config.rulerLabelColor;
    this.rulerPrecision = config.rulerPrecision;
    this.invert = config.invert;

    const b = this.parent.backbone.bounds;
    this.bounds = new Bounds({
      allowSubpixel: false,
      top: 0,
      left: b.left - config.rulerWidth - config.rulerSpacing, //arbitrary spacing to look goo
      width: config.rulerWidth,
      height: b.height
    });
  }

  /**
   * Draw ruler and zoom bar
   * @param ctx - linked canvas2D context
   */

  draw(ctx) {
    let vStart = this.invert ? this.mapCoordinates.visible.stop : this.mapCoordinates.visible.start;
    let vStop = this.invert ? this.mapCoordinates.visible.start : this.mapCoordinates.visible.stop;
    let start = translateScale(vStart, this.mapCoordinates.base, this.mapCoordinates.base, this.invert) * this.pixelScaleFactor;
    let stop = translateScale(vStop, this.mapCoordinates.base, this.mapCoordinates.base, this.invert) * this.pixelScaleFactor;
    let text = [this.mapCoordinates.base.start.toFixed(this.rulerPrecision), this.mapCoordinates.base.stop.toFixed(this.rulerPrecision)];

    this.textWidth = ctx.measureText(text[0]).width > ctx.measureText(text[1]).width ? ctx.measureText(text[0]).width : ctx.measureText(text[1]).width;

    let gb = this.globalBounds || {};
    // draw baseline labels
    ctx.font = `${this.textSize}px ${this.textFace}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = this.textColor;
    if (this.invert) {
      ctx.fillText(text[1], gb.left - ctx.measureText(text[1]).width - (gb.width / 2), Math.floor(gb.top - this.textSize / 2));
      ctx.fillText(text[0], gb.left - ctx.measureText(text[0]).width - (gb.width / 2), Math.floor(gb.bottom + this.textSize));
    } else {
      ctx.fillText(text[0], gb.left - ctx.measureText(text[0]).width - (gb.width / 2), Math.floor(gb.top - this.textSize / 2));
      ctx.fillText(text[1], gb.left - ctx.measureText(text[1]).width - (gb.width / 2), Math.floor(gb.bottom + this.textSize));
    }
    // Draw zoom position labels
    text = [this.mapCoordinates.visible.start.toFixed(this.rulerPrecision), this.mapCoordinates.visible.stop.toFixed(this.rulerPrecision)];
    if (this.invert) {
      ctx.fillText(text[1], gb.left + this.config.rulerWidth + this.config.rulerSpacing, Math.floor(gb.top - this.textSize / 2));
      ctx.fillText(text[0], gb.left + this.config.rulerWidth + this.config.rulerSpacing, (gb.bottom + this.textSize));
    } else {
      ctx.fillText(text[0], gb.left + this.config.rulerWidth + this.config.rulerSpacing, Math.floor(gb.top - this.textSize / 2));
      ctx.fillText(text[1], gb.left + this.config.rulerWidth + this.config.rulerSpacing, (gb.bottom + this.textSize));
    }

    //Draw baseline ruler
    ctx.beginPath();
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'black';
    // noinspection JSSuspiciousNameCombination
    ctx.moveTo(Math.floor(gb.left + gb.width / 2), Math.floor(gb.top));
    // noinspection JSSuspiciousNameCombination
    ctx.lineTo(Math.floor(gb.left + gb.width / 2), Math.floor(gb.bottom));
    ctx.stroke();

    // Draw "zoom box"
    ctx.fillStyle = this.fillColor;//'aqua';
    let height = stop - start > 1 ? stop - start : 1.0;
    // noinspection JSSuspiciousNameCombination
    ctx.fillRect(
      Math.floor(gb.left),
      Math.floor(start + gb.top),
      Math.floor(gb.width),
      Math.floor(height)
    );
    ////debugging rectangle to test group bounds
    //ctx.fillStyle = 'red';
    //ctx.fillRect(
    //  Math.floor(gb.left),
    //  Math.floor(gb.top),
    //  Math.floor(gb.width),
    //  Math.floor(gb.height)
    //);

    this.children.forEach(child => child.draw(ctx));
  }

  /**
   * Return the ruler as data for an scenegraph visibility check. (Ruler by definition is
   * always visible, and does own logic for the position bar)
   * @returns {{data: Ruler}}
   */

  get visible() {
    return {data: this};
  }
}
