"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
function getComponents(opts) {
    if (opts === void 0) { opts = {}; }
    var names = new WeakMap();
    var observers = [];
    var lastEvent = [];
    var lastCustomEvent = {
        byY: [],
        byCenter: [],
        byName: {}
    };
    var io = typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(function (event) {
            var screenHeight = window.innerHeight;
            var partialInfos = (lastEvent = lastEvent
                .filter(function (lastEntry) {
                for (var _i = 0, event_1 = event; _i < event_1.length; _i++) {
                    var entry = event_1[_i];
                    if (lastEntry.target === entry.target) {
                        return false;
                    }
                }
                return true;
            })
                .map(function (entry, i) {
                var boundingClientRect = entry.target.getBoundingClientRect();
                return {
                    name: entry.name,
                    target: entry.target,
                    visibility: entry.visibility,
                    top: boundingClientRect.top,
                    center: boundingClientRect.top + boundingClientRect.height / 2,
                    bottom: boundingClientRect.top + boundingClientRect.height,
                    boundingClientRect: boundingClientRect
                };
            })
                .concat(event.map(function (entry, i) {
                var boundingClientRect = entry.boundingClientRect;
                return {
                    name: names.get(entry.target),
                    target: entry.target,
                    visibility: entry.intersectionRatio,
                    top: boundingClientRect.top,
                    center: boundingClientRect.top + boundingClientRect.height / 2,
                    bottom: boundingClientRect.top + boundingClientRect.height,
                    boundingClientRect: boundingClientRect
                };
            })));
            var mins = partialInfos.reduce(function (r, i) { return ({
                top: r.top.value > Math.abs(i.top)
                    ? { name: i.name, value: Math.abs(i.top) }
                    : r.top,
                center: r.center.value > Math.abs(window.innerHeight / 2 - i.center)
                    ? {
                        name: i.name,
                        value: Math.abs(window.innerHeight / 2 - i.center)
                    }
                    : r.center,
                bottom: r.bottom.value > Math.abs(window.innerHeight - i.bottom)
                    ? {
                        name: i.name,
                        value: Math.abs(window.innerHeight - i.bottom)
                    }
                    : r.bottom
            }); }, {
                top: { name: null, value: Number.POSITIVE_INFINITY },
                center: { name: null, value: Number.POSITIVE_INFINITY },
                bottom: { name: null, value: Number.POSITIVE_INFINITY }
            });
            var infos = partialInfos.map(function (pInfo) { return (__assign({}, pInfo, { isTopClosest: pInfo.name === mins.top.name, isCenterClosest: pInfo.name === mins.center.name, isBottomClosest: pInfo.name === mins.bottom.name })); });
            var uniqNamesInfosById = infos.reduce(function (r, i) {
                return (__assign({}, r, (_a = {}, _a[i.name] = i, _a)));
                var _a;
            }, {});
            var uniqNamesInfos = Object.keys(uniqNamesInfosById).map(function (key) { return uniqNamesInfosById[key]; });
            observers.forEach(function (o) {
                o.setState({
                    event: (lastCustomEvent = {
                        byY: uniqNamesInfos.slice().sort(function (a, b) {
                            return a.boundingClientRect.top - b.boundingClientRect.top;
                        }),
                        byCenter: uniqNamesInfos.slice().sort(function (a, b) { return a.center - b.center; }),
                        byName: uniqNamesInfosById
                    })
                });
            });
        }, __assign({ threshold: Array.from(new Array(10), function (_, i) { return i / 10; }) }, opts))
        : null;
    var Section = /** @class */ (function (_super) {
        __extends(Section, _super);
        function Section() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.element = null;
            _this.handleRootRef = function (ref) {
                _this.observe(ReactDOM.findDOMNode(ref));
                _this.props.children.props.ref && _this.props.children.props.ref(ref);
            };
            return _this;
        }
        Section.prototype.componentWillUnmount = function () {
            if (!io) {
                return;
            }
            io.unobserve(this.element);
            this.element = null;
        };
        Section.prototype.observe = function (element) {
            if (!io) {
                return;
            }
            this.unobserve();
            if (!element) {
                return;
            }
            this.element = element;
            io.observe(this.element);
            names.set(element, this.props.name);
        };
        Section.prototype.unobserve = function () {
            if (!io) {
                return;
            }
            if (this.element === null) {
                return;
            }
            io.unobserve(this.element);
            this.element = null;
        };
        Section.prototype.render = function () {
            return React.cloneElement(this.props.children, {
                ref: this.handleRootRef
            });
        };
        return Section;
    }(React.Component));
    var RemoteObserver = /** @class */ (function (_super) {
        __extends(RemoteObserver, _super);
        function RemoteObserver(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                event: lastCustomEvent
            };
            observers.push(_this);
            return _this;
        }
        RemoteObserver.prototype.componentWillUnmount = function () {
            observers.splice(observers.indexOf(this), 1);
        };
        RemoteObserver.prototype.render = function () {
            return this.props.children(this.state.event);
        };
        return RemoteObserver;
    }(React.Component));
    return { Section: Section, RemoteObserver: RemoteObserver };
}
exports.default = getComponents;
//# sourceMappingURL=index.js.map