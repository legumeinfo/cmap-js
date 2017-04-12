/**
  * LayoutContainer
  * A mithril component to wrap the current layout component inside of a
  * clipping region, using: overflow: hidden in css.
  */
import m from 'mithril';
import PubSub from 'pubsub-js';
import Hammer from 'hammerjs';

import {HorizontalLayout} from './HorizontalLayout';
import {CircosLayout} from './CircosLayout';
import {layout as layoutMsg, reset} from '../../topics';
import {Bounds} from '../../util/Bounds';


export class LayoutContainer {

  // constructor() - prefer do not use in mithril components

  /* mitrhril component lifecycle functions */

  oninit(vnode) {
    this.state = vnode.attrs.state;
    PubSub.subscribe(layoutMsg, (msg, data) => this._onLayoutChange(msg, data));
    PubSub.subscribe(reset, (msg, data) => this._onReset(msg, data));
  }

  oncreate(vnode) {
    let el = vnode.dom; // this is the outer m('div') from view()
    this._setupEventHandlers(el);

    // use our dom element's width and height as basis for our layout
    let domRect = el.getBoundingClientRect();
    console.assert(domRect.width > 0, 'missing dom element width');
    console.assert(domRect.height > 0, 'missing dom element height');
    this._updateBounds(domRect);
  }

  onupdate(vnode) {
    let domRect = vnode.dom.getBoundingClientRect();
    console.assert(domRect.width > 0, 'missing width');
    console.assert(domRect.height > 0, 'missing height');
    this._updateBounds(domRect);
  }

  /* mithril component render callback */
  view() {
    let b = this.contentPaneBounds || {}; // relative bounds of the layout-content
    let scale = this.state.tools.zoomFactor;
    return m('div', { class: 'cmap-layout-viewport cmap-hbox'}, [
      m('div', {
        class: 'cmap-layout-content',
        style: `top: ${b.top}px;
                left: ${b.left}px;
                width: ${b.width}px;
                height: ${b.height}px;
                transform: scale(${scale}, ${scale})`
      }, [
        this.state.tools.layout === HorizontalLayout
        ?
        m(HorizontalLayout, {state: this.state})
        :
        m(CircosLayout, {state: this.state})
      ])
    ]);
  }

  /* private functions  */

  _setupEventHandlers(el) {
    // hammers for normalized mouse and touch gestures: zoom, pan, click
    let h = Hammer(el);
    h.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    h.get('pinch').set({ enable: true });
    h.on('panmove panend', (evt) => this._onPan(evt));
    h.on('pinchmove pinchend', (evt) => this._onZoom(evt));
  }

  /* dom event handlers */
  _onZoom(evt) {
    console.log('onZoom', evt);
    // FIXME: get distance of touch event
    let normalized = evt.deltaY / this.bounds.height;
    this.state.tools.zoomFactor += normalized;
    m.redraw();
  }

  _onPan(evt) {
    console.log('LayoutContainer -> onPan', evt);
    // hammer provides the delta x,y in a distance since the start of the
    // gesture so need to convert it to delta x,y for this event.
    if(evt.type === 'panend') {
      this.lastPanEvent = null;
      return;
    }
    let delta = {};
    if(this.lastPanEvent) {
      delta.x = -1 * (this.lastPanEvent.deltaX - evt.deltaX);
      delta.y = -1 * (this.lastPanEvent.deltaY - evt.deltaY);
    }
    else {
      delta.x = evt.deltaX;
      delta.y = evt.deltaY;
    }
    this.contentPaneBounds.left += delta.x;
    this.contentPaneBounds.top += delta.y;
    m.redraw();
    this.lastPanEvent = evt;
  }

  _onPinch() { // evt
    // TODO: handle type of event (e.g. pinch move, vs pinch in/out)
    // this.contentPaneBounds.left += evt.deltaX;
    // this.contentPaneBounds.top += evt.deltaY;
    // m.redraw();
  }

  /* pub/sub callbacks */

  _onReset() {
    this.contentPaneBounds = new Bounds({
      top: 0,
      left: 0,
      width: this.bounds.width,
      height: this.bounds.height
    });
    m.redraw();
  }

  _onLayoutChange() {
    m.redraw();
  }

  // here we capture the bounds of the outer dom element from view().
  // this is leveraging the html/css layouting to fill available space.
  _updateBounds(domRect) {
    let newBounds = new Bounds(domRect);
    let dirty = ! Bounds.equals(this.bounds, newBounds);
    this.bounds = newBounds;
    // create an initial bounds for the scrollable/zoomable content-pane
    if(! this.contentPaneBounds) {
      this.contentPaneBounds = {
        top: 0,
        left: 0,
        width: this.bounds.width,
        height: this.bounds.height
      };
    }
    // trigger a redraw so the child components see the new bounds of their
    // container in the dom.
    if(dirty) setTimeout(m.redraw);
  }
}
