/**
  * CorrespondenceMap
  * Mithril component representing correspondence lines between 2 or more
  * BioMaps with an html5 canvas element.
  */
import m from 'mithril';
import {mix} from '../../mixwith.js/src/mixwith';

import {Bounds} from '../util/Bounds';
import {SceneGraphNodeBase} from './SceneGraphNodeBase';
import {DrawLazilyMixin} from './DrawLazilyMixin';


export class CorrespondenceMap
       extends mix(SceneGraphNodeBase).with(DrawLazilyMixin)  {

  // constructor() - prefer do not use in mithril components

  /* define accessors for both bounds and domBounds; because this class is both
  /* a mithril component (has a view method()) and a scenegraph node (the root
  /* node for this canvas, we need to maintain both a domBounds and a bounds
  /* property. */
  get bounds() {
    return new Bounds({
      top: 0, left: 0,
      width: this.domBounds.width, height: this.domBounds.height
    });
  }
  set bounds(ignore) {} // we are the root of canvas scenegraph

  get domBounds() {
    return this._domBounds;
  }

  set domBounds(newBounds) {
    this.dirty = ! this._domBounds || ! this._domBounds.areaEquals(newBounds);
    this._domBounds = newBounds;
    // only perform layouting when the domBounds has changed in area.
    if(this.dirty) {
      this._layout();
    }
  }

  set bioMaps(maps) {
    this._bioMaps = maps;
  }
  get bioMaps() { return this._bioMaps; }

  // override the children prop. getter
  get children() {
    return this.correspondenceMarks;
  }
  set children(ignore) {} // we create own children in _layout


  /* mithril lifecycle callbacks */

  oncreate(vnode) {
    // note here we are not capturing bounds from the dom, rather, using the
    // bounds set by the layout manager class (HorizontalLayout or
    // CircosLayout).
    this.canvas = this.el = vnode.dom;
    this.context2d = this.canvas.getContext('2d');
  }

  onupdate() {
    this.drawLazily(this.bounds);
  }

  /* dom event handlers */


  _onTap(evt) {
    console.log('onTap', evt, evt.target === this.canvas);
  }

  /* mithril component render callback */
  view() {
    // note here we are not capturing bounds from the dom, rather, using the
    // bounds set by the layout manager class (HorizontalLayout or
    // CircosLayout).
    if(this.domBounds && ! this.domBounds.isEmptyArea) {
      this.lastDrawnMithrilBounds = this.domBounds;
    }

    let b = this.domBounds || {};
    return m('canvas', {
      class: 'cmap-canvas cmap-correspondence-map',
      style: `left: ${b.left}px; top: ${b.top}px;
              width: ${b.width}px; height: ${b.height}px;`,
      width: b.width,
      height: b.height
    });
  }

  _layout() {
//    console.log('CorrespondenceMap canvas layout');
    this.correspondenceMarks = [];
    // TODO: for each bioMap, create a CorrespondenceMark for each common feature
  }

  // draw canvas scenegraph nodes
  draw() {
    let ctx = this.context2d;
    if(! ctx) return;
    if(! this.domBounds) return;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let gb = this.globalBounds || {};
    ctx.save();
    ctx.translate(0.5, 0.5); // prevent subpixel rendering of 1px lines
    //this.children.map(child => child.draw(ctx));
    ctx.fillStyle = 'cyan';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(
      Math.floor(gb.left),
      Math.floor(gb.top),
      Math.floor(gb.width),
      Math.floor(gb.height)
    );
    ctx.restore();
    // store these bounds, for checking in drawLazily()
    this.lastDrawnCanvasBounds = this.bounds;
  }
}
