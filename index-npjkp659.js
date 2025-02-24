var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/graphology-utils/defaults.js
var require_defaults = __commonJS((exports, module) => {
  function isLeaf(o) {
    return !o || typeof o !== "object" || typeof o === "function" || Array.isArray(o) || o instanceof Set || o instanceof Map || o instanceof RegExp || o instanceof Date;
  }
  function resolveDefaults(target, defaults) {
    target = target || {};
    var output = {};
    for (var k in defaults) {
      var existing = target[k];
      var def = defaults[k];
      if (!isLeaf(def)) {
        output[k] = resolveDefaults(existing, def);
        continue;
      }
      if (existing === undefined) {
        output[k] = def;
      } else {
        output[k] = existing;
      }
    }
    return output;
  }
  module.exports = resolveDefaults;
});

// node_modules/graphology-utils/is-graph.js
var require_is_graph = __commonJS((exports, module) => {
  module.exports = function isGraph(value) {
    return value !== null && typeof value === "object" && typeof value.addUndirectedEdgeWithKey === "function" && typeof value.dropNode === "function" && typeof value.multi === "boolean";
  };
});

// node_modules/graphology-layout/circular.js
var require_circular = __commonJS((exports, module) => {
  var resolveDefaults = require_defaults();
  var isGraph = require_is_graph();
  var DEFAULTS = {
    dimensions: ["x", "y"],
    center: 0.5,
    scale: 1
  };
  function genericCircularLayout(assign, graph, options) {
    if (!isGraph(graph))
      throw new Error("graphology-layout/random: the given graph is not a valid graphology instance.");
    options = resolveDefaults(options, DEFAULTS);
    var dimensions = options.dimensions;
    if (!Array.isArray(dimensions) || dimensions.length !== 2)
      throw new Error("graphology-layout/random: given dimensions are invalid.");
    var center = options.center;
    var scale = options.scale;
    var tau = Math.PI * 2;
    var offset = (center - 0.5) * scale;
    var l = graph.order;
    var x = dimensions[0];
    var y = dimensions[1];
    function assignPosition(i2, target) {
      target[x] = scale * Math.cos(i2 * tau / l) + offset;
      target[y] = scale * Math.sin(i2 * tau / l) + offset;
      return target;
    }
    var i = 0;
    if (!assign) {
      var positions = {};
      graph.forEachNode(function(node) {
        positions[node] = assignPosition(i++, {});
      });
      return positions;
    }
    graph.updateEachNodeAttributes(function(_, attr) {
      assignPosition(i++, attr);
      return attr;
    }, {
      attributes: dimensions
    });
  }
  var circularLayout = genericCircularLayout.bind(null, false);
  circularLayout.assign = genericCircularLayout.bind(null, true);
  module.exports = circularLayout;
});

// node_modules/graphology-utils/getters.js
var require_getters = __commonJS((exports) => {
  function coerceWeight(value) {
    if (typeof value !== "number" || isNaN(value))
      return 1;
    return value;
  }
  function createNodeValueGetter(nameOrFunction, defaultValue) {
    var getter = {};
    var coerceToDefault = function(v) {
      if (typeof v === "undefined")
        return defaultValue;
      return v;
    };
    if (typeof defaultValue === "function")
      coerceToDefault = defaultValue;
    var get = function(attributes) {
      return coerceToDefault(attributes[nameOrFunction]);
    };
    var returnDefault = function() {
      return coerceToDefault(undefined);
    };
    if (typeof nameOrFunction === "string") {
      getter.fromAttributes = get;
      getter.fromGraph = function(graph, node) {
        return get(graph.getNodeAttributes(node));
      };
      getter.fromEntry = function(node, attributes) {
        return get(attributes);
      };
    } else if (typeof nameOrFunction === "function") {
      getter.fromAttributes = function() {
        throw new Error("graphology-utils/getters/createNodeValueGetter: irrelevant usage.");
      };
      getter.fromGraph = function(graph, node) {
        return coerceToDefault(nameOrFunction(node, graph.getNodeAttributes(node)));
      };
      getter.fromEntry = function(node, attributes) {
        return coerceToDefault(nameOrFunction(node, attributes));
      };
    } else {
      getter.fromAttributes = returnDefault;
      getter.fromGraph = returnDefault;
      getter.fromEntry = returnDefault;
    }
    return getter;
  }
  function createEdgeValueGetter(nameOrFunction, defaultValue) {
    var getter = {};
    var coerceToDefault = function(v) {
      if (typeof v === "undefined")
        return defaultValue;
      return v;
    };
    if (typeof defaultValue === "function")
      coerceToDefault = defaultValue;
    var get = function(attributes) {
      return coerceToDefault(attributes[nameOrFunction]);
    };
    var returnDefault = function() {
      return coerceToDefault(undefined);
    };
    if (typeof nameOrFunction === "string") {
      getter.fromAttributes = get;
      getter.fromGraph = function(graph, edge) {
        return get(graph.getEdgeAttributes(edge));
      };
      getter.fromEntry = function(edge, attributes) {
        return get(attributes);
      };
      getter.fromPartialEntry = getter.fromEntry;
      getter.fromMinimalEntry = getter.fromEntry;
    } else if (typeof nameOrFunction === "function") {
      getter.fromAttributes = function() {
        throw new Error("graphology-utils/getters/createEdgeValueGetter: irrelevant usage.");
      };
      getter.fromGraph = function(graph, edge) {
        var extremities = graph.extremities(edge);
        return coerceToDefault(nameOrFunction(edge, graph.getEdgeAttributes(edge), extremities[0], extremities[1], graph.getNodeAttributes(extremities[0]), graph.getNodeAttributes(extremities[1]), graph.isUndirected(edge)));
      };
      getter.fromEntry = function(e, a, s, t, sa, ta, u) {
        return coerceToDefault(nameOrFunction(e, a, s, t, sa, ta, u));
      };
      getter.fromPartialEntry = function(e, a, s, t) {
        return coerceToDefault(nameOrFunction(e, a, s, t));
      };
      getter.fromMinimalEntry = function(e, a) {
        return coerceToDefault(nameOrFunction(e, a));
      };
    } else {
      getter.fromAttributes = returnDefault;
      getter.fromGraph = returnDefault;
      getter.fromEntry = returnDefault;
      getter.fromMinimalEntry = returnDefault;
    }
    return getter;
  }
  exports.createNodeValueGetter = createNodeValueGetter;
  exports.createEdgeValueGetter = createEdgeValueGetter;
  exports.createEdgeWeightGetter = function(name) {
    return createEdgeValueGetter(name, coerceWeight);
  };
});

// node_modules/graphology-layout-force/iterate.js
var require_iterate = __commonJS((exports, module) => {
  var {
    createNodeValueGetter,
    createEdgeValueGetter
  } = require_getters();
  module.exports = function iterate(graph, nodeStates, params) {
    const { nodeXAttribute: xKey, nodeYAttribute: yKey } = params;
    const { attraction, repulsion, gravity, inertia, maxMove } = params.settings;
    let { shouldSkipNode, shouldSkipEdge, isNodeFixed } = params;
    isNodeFixed = createNodeValueGetter(isNodeFixed);
    shouldSkipNode = createNodeValueGetter(shouldSkipNode, false);
    shouldSkipEdge = createEdgeValueGetter(shouldSkipEdge, false);
    const nodes = graph.filterNodes((n, attr) => {
      return !shouldSkipNode.fromEntry(n, attr);
    });
    const adjustedOrder = nodes.length;
    for (let i = 0;i < adjustedOrder; i++) {
      const n = nodes[i];
      const attr = graph.getNodeAttributes(n);
      const nodeState = nodeStates[n];
      if (!nodeState)
        nodeStates[n] = {
          dx: 0,
          dy: 0,
          x: attr[xKey] || 0,
          y: attr[yKey] || 0
        };
      else
        nodeStates[n] = {
          dx: nodeState.dx * inertia,
          dy: nodeState.dy * inertia,
          x: attr[xKey] || 0,
          y: attr[yKey] || 0
        };
    }
    if (repulsion)
      for (let i = 0;i < adjustedOrder; i++) {
        const n1 = nodes[i];
        const n1State = nodeStates[n1];
        for (let j = i + 1;j < adjustedOrder; j++) {
          const n2 = nodes[j];
          const n2State = nodeStates[n2];
          const dx = n2State.x - n1State.x;
          const dy = n2State.y - n1State.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulsionX = repulsion / distance * dx;
          const repulsionY = repulsion / distance * dy;
          n1State.dx -= repulsionX;
          n1State.dy -= repulsionY;
          n2State.dx += repulsionX;
          n2State.dy += repulsionY;
        }
      }
    if (attraction)
      graph.forEachEdge((edge, attr, source, target, sourceAttr, targetAttr, undirected) => {
        if (source === target)
          return;
        if (shouldSkipNode.fromEntry(source, sourceAttr) || shouldSkipNode.fromEntry(target, targetAttr))
          return;
        if (shouldSkipEdge.fromEntry(edge, attr, source, target, sourceAttr, targetAttr, undirected))
          return;
        const n1State = nodeStates[source];
        const n2State = nodeStates[target];
        const dx = n2State.x - n1State.x;
        const dy = n2State.y - n1State.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const attractionX = attraction * distance * dx;
        const attractionY = attraction * distance * dy;
        n1State.dx += attractionX;
        n1State.dy += attractionY;
        n2State.dx -= attractionX;
        n2State.dy -= attractionY;
      });
    if (gravity)
      for (let i = 0;i < adjustedOrder; i++) {
        const n = nodes[i];
        const nodeState = nodeStates[n];
        const { x, y } = nodeState;
        const distance = Math.sqrt(x * x + y * y) || 1;
        nodeStates[n].dx -= x * gravity * distance;
        nodeStates[n].dy -= y * gravity * distance;
      }
    const converged = false;
    for (let i = 0;i < adjustedOrder; i++) {
      const n = nodes[i];
      const nodeState = nodeStates[n];
      const distance = Math.sqrt(nodeState.dx * nodeState.dx + nodeState.dy * nodeState.dy);
      if (distance > maxMove) {
        nodeState.dx *= maxMove / distance;
        nodeState.dy *= maxMove / distance;
      }
      if (!isNodeFixed.fromGraph(graph, n)) {
        nodeState.x += nodeState.dx;
        nodeState.y += nodeState.dy;
        nodeState.fixed = false;
      } else {
        nodeState.fixed = true;
      }
    }
    return { converged };
  };
});

// node_modules/graphology-layout-force/helpers.js
var require_helpers = __commonJS((exports) => {
  exports.assignLayoutChanges = function(graph, nodeStates, params) {
    const { nodeXAttribute: x, nodeYAttribute: y } = params;
    graph.updateEachNodeAttributes((n, attr) => {
      const state = nodeStates[n];
      if (!state || state.fixed)
        return attr;
      attr[x] = state.x;
      attr[y] = state.y;
      return attr;
    }, { attributes: ["x", "y"] });
  };
  exports.collectLayoutChanges = function(nodeStates) {
    const mapping = {};
    for (const n in nodeStates) {
      const state = nodeStates[n];
      mapping[n] = { x: state.x, y: state.y };
    }
    return mapping;
  };
});

// node_modules/graphology-layout-force/defaults.js
var require_defaults2 = __commonJS((exports, module) => {
  module.exports = {
    nodeXAttribute: "x",
    nodeYAttribute: "y",
    isNodeFixed: "fixed",
    shouldSkipNode: null,
    shouldSkipEdge: null,
    settings: {
      attraction: 0.0005,
      repulsion: 0.1,
      gravity: 0.0001,
      inertia: 0.6,
      maxMove: 200
    }
  };
});

// node_modules/graphology-layout-force/worker.js
var require_worker = __commonJS((exports, module) => {
  var isGraph = require_is_graph();
  var resolveDefaults = require_defaults();
  var iterate = require_iterate();
  var helpers = require_helpers();
  var DEFAULTS = require_defaults2();
  function ForceSupervisor(graph, params) {
    if (!isGraph(graph))
      throw new Error("graphology-layout-force/worker: the given graph is not a valid graphology instance.");
    params = resolveDefaults(params, DEFAULTS);
    this.callbacks = {};
    if (params.onConverged)
      this.callbacks.onConverged = params.onConverged;
    this.graph = graph;
    this.params = params;
    this.nodeStates = {};
    this.frameID = null;
    this.running = false;
    this.killed = false;
  }
  ForceSupervisor.prototype.isRunning = function() {
    return this.running;
  };
  ForceSupervisor.prototype.runFrame = function() {
    let { converged } = iterate(this.graph, this.nodeStates, this.params);
    helpers.assignLayoutChanges(this.graph, this.nodeStates, this.params);
    converged = false;
    if (converged) {
      if (this.callbacks.onConverged)
        this.callbacks.onConverged();
      this.stop();
    } else {
      this.frameID = window.requestAnimationFrame(() => this.runFrame());
    }
  };
  ForceSupervisor.prototype.stop = function() {
    this.running = false;
    if (this.frameID !== null) {
      window.cancelAnimationFrame(this.frameID);
      this.frameID = null;
    }
    return this;
  };
  ForceSupervisor.prototype.start = function() {
    if (this.killed)
      throw new Error("graphology-layout-force/worker.start: layout was killed.");
    if (this.running)
      return;
    this.running = true;
    this.runFrame();
  };
  ForceSupervisor.prototype.kill = function() {
    this.stop();
    delete this.nodeStates;
    this.killed = true;
  };
  module.exports = ForceSupervisor;
});
// scripts/data/reformatted.json
var reformatted_default = {
  nodes: [{ id: "Almond" }, { id: "Anchovy" }, { id: "Anise" }, { id: "Apple" }, { id: "Apricot" }, { id: "Asparagus" }, { id: "Avocado" }, { id: "Bacon" }, { id: "Banana" }, { id: "Basil" }, { id: "Beef" }, { id: "Beet" }, { id: "Bell Pepper" }, { id: "Black Currant" }, { id: "Black Pudding" }, { id: "Blackberry" }, { id: "Blue Cheese" }, { id: "Blueberry" }, { id: "Broccoli" }, { id: "Butternut Squash" }, { id: "Cabbage" }, { id: "Caper" }, { id: "Cardamom" }, { id: "Carrot" }, { id: "Cauliflower" }, { id: "Caviar" }, { id: "Celery" }, { id: "Cherry" }, { id: "Chestnut" }, { id: "Chicken" }, { id: "Chili" }, { id: "Chocolate" }, { id: "Cilantro" }, { id: "Cinnamon" }, { id: "Clove" }, { id: "Coconut" }, { id: "Coffee" }, { id: "Coriander Seed" }, { id: "Cucumber" }, { id: "Cumin" }, { id: "Dill" }, { id: "Egg" }, { id: "Eggplant" }, { id: "Fig" }, { id: "Garlic" }, { id: "Ginger" }, { id: "Globe Artichoke" }, { id: "Goat Cheese" }, { id: "Grape" }, { id: "Grapefruit" }, { id: "Hard Cheese" }, { id: "Hazelnut" }, { id: "Horseradish" }, { id: "Juniper" }, { id: "Lamb" }, { id: "Lemon" }, { id: "Lime" }, { id: "Liver" }, { id: "Mango" }, { id: "Melon" }, { id: "Mint" }, { id: "Mushroom" }, { id: "Nutmeg" }, { id: "Oily Fish" }, { id: "Olive" }, { id: "Onion" }, { id: "Orange" }, { id: "Oyster" }, { id: "Parsley" }, { id: "Parsnip" }, { id: "Pea" }, { id: "Peach" }, { id: "Peanut" }, { id: "Pear" }, { id: "Pineapple" }, { id: "Pork" }, { id: "Potato" }, { id: "Prosciutto" }, { id: "Raspberry" }, { id: "Rhubarb" }, { id: "Rose" }, { id: "Rosemary" }, { id: "Rutabaga" }, { id: "Saffron" }, { id: "Sage" }, { id: "Shellfish" }, { id: "Smoked Fish" }, { id: "Soft Cheese" }, { id: "Strawberry" }, { id: "Thyme" }, { id: "Tomato" }, { id: "Truffle" }, { id: "Vanilla" }, { id: "Walnut" }, { id: "Washed-rind Cheese" }, { id: "Watercress" }, { id: "Watermelon" }, { id: "White Chocolate" }, { id: "White Fish" }],
  links: [{ source: "Almond", target: "Anise", value: 1 }, { source: "Almond", target: "Apple", value: 1 }, { source: "Almond", target: "Apricot", value: 1 }, { source: "Almond", target: "Asparagus", value: 1 }, { source: "Almond", target: "Banana", value: 1 }, { source: "Almond", target: "Blackberry", value: 1 }, { source: "Almond", target: "Black Currant", value: 1 }, { source: "Almond", target: "Blueberry", value: 1 }, { source: "Almond", target: "Butternut Squash", value: 1 }, { source: "Almond", target: "Cardamom", value: 1 }, { source: "Almond", target: "Cauliflower", value: 1 }, { source: "Almond", target: "Cherry", value: 1 }, { source: "Almond", target: "Chicken", value: 1 }, { source: "Almond", target: "Chili", value: 1 }, { source: "Almond", target: "Chocolate", value: 1 }, { source: "Almond", target: "Cinnamon", value: 1 }, { source: "Almond", target: "Coconut", value: 1 }, { source: "Almond", target: "Coffee", value: 1 }, { source: "Almond", target: "Fig", value: 1 }, { source: "Almond", target: "Garlic", value: 1 }, { source: "Almond", target: "Ginger", value: 1 }, { source: "Almond", target: "Grape", value: 1 }, { source: "Almond", target: "Hard Cheese", value: 1 }, { source: "Almond", target: "Hazelnut", value: 1 }, { source: "Almond", target: "Lamb", value: 1 }, { source: "Almond", target: "Lemon", value: 1 }, { source: "Almond", target: "Melon", value: 1 }, { source: "Almond", target: "Oily Fish", value: 1 }, { source: "Almond", target: "Olive", value: 1 }, { source: "Almond", target: "Orange", value: 1 }, { source: "Almond", target: "Peach", value: 1 }, { source: "Almond", target: "Pear", value: 1 }, { source: "Almond", target: "Raspberry", value: 1 }, { source: "Almond", target: "Rhubarb", value: 1 }, { source: "Almond", target: "Rose", value: 1 }, { source: "Almond", target: "Rosemary", value: 1 }, { source: "Almond", target: "Saffron", value: 1 }, { source: "Almond", target: "Shellfish", value: 1 }, { source: "Almond", target: "Strawberry", value: 1 }, { source: "Almond", target: "White Chocolate", value: 1 }, { source: "Anchovy", target: "Beef", value: 1 }, { source: "Anchovy", target: "Beet", value: 1 }, { source: "Anchovy", target: "Broccoli", value: 1 }, { source: "Anchovy", target: "Caper", value: 1 }, { source: "Anchovy", target: "Cauliflower", value: 1 }, { source: "Anchovy", target: "Chili", value: 1 }, { source: "Anchovy", target: "Coconut", value: 1 }, { source: "Anchovy", target: "Egg", value: 1 }, { source: "Anchovy", target: "Garlic", value: 1 }, { source: "Anchovy", target: "Hard Cheese", value: 1 }, { source: "Anchovy", target: "Lamb", value: 1 }, { source: "Anchovy", target: "Lemon", value: 1 }, { source: "Anchovy", target: "Lime", value: 1 }, { source: "Anchovy", target: "Olive", value: 1 }, { source: "Anchovy", target: "Onion", value: 1 }, { source: "Anchovy", target: "Pineapple", value: 1 }, { source: "Anchovy", target: "Potato", value: 1 }, { source: "Anchovy", target: "Rosemary", value: 1 }, { source: "Anchovy", target: "Sage", value: 1 }, { source: "Anchovy", target: "Soft Cheese", value: 1 }, { source: "Anchovy", target: "Tomato", value: 1 }, { source: "Anchovy", target: "Watercress", value: 1 }, { source: "Anchovy", target: "White Fish", value: 1 }, { source: "Anise", target: "Almond", value: 1 }, { source: "Anise", target: "Apple", value: 1 }, { source: "Anise", target: "Asparagus", value: 1 }, { source: "Anise", target: "Bacon", value: 1 }, { source: "Anise", target: "Banana", value: 1 }, { source: "Anise", target: "Basil", value: 1 }, { source: "Anise", target: "Beef", value: 1 }, { source: "Anise", target: "Black Currant", value: 1 }, { source: "Anise", target: "Carrot", value: 1 }, { source: "Anise", target: "Chicken", value: 1 }, { source: "Anise", target: "Chili", value: 1 }, { source: "Anise", target: "Chocolate", value: 1 }, { source: "Anise", target: "Cinnamon", value: 1 }, { source: "Anise", target: "Coconut", value: 1 }, { source: "Anise", target: "Cucumber", value: 1 }, { source: "Anise", target: "Egg", value: 1 }, { source: "Anise", target: "Fig", value: 1 }, { source: "Anise", target: "Goat Cheese", value: 1 }, { source: "Anise", target: "Grape", value: 1 }, { source: "Anise", target: "Hard Cheese", value: 1 }, { source: "Anise", target: "Lamb", value: 1 }, { source: "Anise", target: "Lemon", value: 1 }, { source: "Anise", target: "Melon", value: 1 }, { source: "Anise", target: "Mint", value: 1 }, { source: "Anise", target: "Mushroom", value: 1 }, { source: "Anise", target: "Oily Fish", value: 1 }, { source: "Anise", target: "Olive", value: 1 }, { source: "Anise", target: "Orange", value: 1 }, { source: "Anise", target: "Oyster", value: 1 }, { source: "Anise", target: "Parsnip", value: 1 }, { source: "Anise", target: "Pea", value: 1 }, { source: "Anise", target: "Pear", value: 1 }, { source: "Anise", target: "Pineapple", value: 1 }, { source: "Anise", target: "Pork", value: 1 }, { source: "Anise", target: "Rhubarb", value: 1 }, { source: "Anise", target: "Rutabaga", value: 1 }, { source: "Anise", target: "Saffron", value: 1 }, { source: "Anise", target: "Shellfish", value: 1 }, { source: "Anise", target: "Strawberry", value: 1 }, { source: "Anise", target: "Tomato", value: 1 }, { source: "Anise", target: "Vanilla", value: 1 }, { source: "Anise", target: "Walnut", value: 1 }, { source: "Anise", target: "Washed-rind Cheese", value: 1 }, { source: "Anise", target: "White Fish", value: 1 }, { source: "Apple", target: "Almond", value: 1 }, { source: "Apple", target: "Anise", value: 1 }, { source: "Apple", target: "Bacon", value: 1 }, { source: "Apple", target: "Beet", value: 1 }, { source: "Apple", target: "Black Pudding", value: 1 }, { source: "Apple", target: "Blackberry", value: 1 }, { source: "Apple", target: "Blueberry", value: 1 }, { source: "Apple", target: "Butternut Squash", value: 1 }, { source: "Apple", target: "Cabbage", value: 1 }, { source: "Apple", target: "Carrot", value: 1 }, { source: "Apple", target: "Celery", value: 1 }, { source: "Apple", target: "Cinnamon", value: 1 }, { source: "Apple", target: "Clove", value: 1 }, { source: "Apple", target: "Coriander Seed", value: 1 }, { source: "Apple", target: "Hard Cheese", value: 1 }, { source: "Apple", target: "Hazelnut", value: 1 }, { source: "Apple", target: "Horseradish", value: 1 }, { source: "Apple", target: "Liver", value: 1 }, { source: "Apple", target: "Mango", value: 1 }, { source: "Apple", target: "Nutmeg", value: 1 }, { source: "Apple", target: "Orange", value: 1 }, { source: "Apple", target: "Peanut", value: 1 }, { source: "Apple", target: "Pear", value: 1 }, { source: "Apple", target: "Pineapple", value: 1 }, { source: "Apple", target: "Pork", value: 1 }, { source: "Apple", target: "Rose", value: 1 }, { source: "Apple", target: "Sage", value: 1 }, { source: "Apple", target: "Shellfish", value: 1 }, { source: "Apple", target: "Soft Cheese", value: 1 }, { source: "Apple", target: "Vanilla", value: 1 }, { source: "Apple", target: "Walnut", value: 1 }, { source: "Apple", target: "Washed-rind Cheese", value: 1 }, { source: "Apricot", target: "Almond", value: 1 }, { source: "Apricot", target: "Cardamom", value: 1 }, { source: "Apricot", target: "Chocolate", value: 1 }, { source: "Apricot", target: "Cinnamon", value: 1 }, { source: "Apricot", target: "Cumin", value: 1 }, { source: "Apricot", target: "Ginger", value: 1 }, { source: "Apricot", target: "Goat Cheese", value: 1 }, { source: "Apricot", target: "Hard Cheese", value: 1 }, { source: "Apricot", target: "Lamb", value: 1 }, { source: "Apricot", target: "Mango", value: 1 }, { source: "Apricot", target: "Mushroom", value: 1 }, { source: "Apricot", target: "Orange", value: 1 }, { source: "Apricot", target: "Peach", value: 1 }, { source: "Apricot", target: "Pork", value: 1 }, { source: "Apricot", target: "Raspberry", value: 1 }, { source: "Apricot", target: "Rose", value: 1 }, { source: "Apricot", target: "Rosemary", value: 1 }, { source: "Apricot", target: "Vanilla", value: 1 }, { source: "Asparagus", target: "Almond", value: 1 }, { source: "Asparagus", target: "Anise", value: 1 }, { source: "Asparagus", target: "Egg", value: 1 }, { source: "Asparagus", target: "Hard Cheese", value: 1 }, { source: "Asparagus", target: "Lemon", value: 1 }, { source: "Asparagus", target: "Mint", value: 1 }, { source: "Asparagus", target: "Mushroom", value: 1 }, { source: "Asparagus", target: "Oily Fish", value: 1 }, { source: "Asparagus", target: "Orange", value: 1 }, { source: "Asparagus", target: "Pea", value: 1 }, { source: "Asparagus", target: "Peanut", value: 1 }, { source: "Asparagus", target: "Potato", value: 1 }, { source: "Asparagus", target: "Prosciutto", value: 1 }, { source: "Asparagus", target: "Shellfish", value: 1 }, { source: "Asparagus", target: "Truffle", value: 1 }, { source: "Asparagus", target: "White Fish", value: 1 }, { source: "Avocado", target: "Bacon", value: 1 }, { source: "Avocado", target: "Blue Cheese", value: 1 }, { source: "Avocado", target: "Chicken", value: 1 }, { source: "Avocado", target: "Chili", value: 1 }, { source: "Avocado", target: "Chocolate", value: 1 }, { source: "Avocado", target: "Cilantro", value: 1 }, { source: "Avocado", target: "Coffee", value: 1 }, { source: "Avocado", target: "Cucumber", value: 1 }, { source: "Avocado", target: "Dill", value: 1 }, { source: "Avocado", target: "Grape", value: 1 }, { source: "Avocado", target: "Grapefruit", value: 1 }, { source: "Avocado", target: "Hazelnut", value: 1 }, { source: "Avocado", target: "Lime", value: 1 }, { source: "Avocado", target: "Mango", value: 1 }, { source: "Avocado", target: "Mint", value: 1 }, { source: "Avocado", target: "Nutmeg", value: 1 }, { source: "Avocado", target: "Oily Fish", value: 1 }, { source: "Avocado", target: "Pineapple", value: 1 }, { source: "Avocado", target: "Shellfish", value: 1 }, { source: "Avocado", target: "Soft Cheese", value: 1 }, { source: "Avocado", target: "Strawberry", value: 1 }, { source: "Avocado", target: "Tomato", value: 1 }, { source: "Bacon", target: "Anise", value: 1 }, { source: "Bacon", target: "Apple", value: 1 }, { source: "Bacon", target: "Avocado", value: 1 }, { source: "Bacon", target: "Banana", value: 1 }, { source: "Bacon", target: "Beef", value: 1 }, { source: "Bacon", target: "Bell Pepper", value: 1 }, { source: "Bacon", target: "Black Pudding", value: 1 }, { source: "Bacon", target: "Blue Cheese", value: 1 }, { source: "Bacon", target: "Broccoli", value: 1 }, { source: "Bacon", target: "Butternut Squash", value: 1 }, { source: "Bacon", target: "Cabbage", value: 1 }, { source: "Bacon", target: "Cardamom", value: 1 }, { source: "Bacon", target: "Chicken", value: 1 }, { source: "Bacon", target: "Chili", value: 1 }, { source: "Bacon", target: "Chocolate", value: 1 }, { source: "Bacon", target: "Clove", value: 1 }, { source: "Bacon", target: "Egg", value: 1 }, { source: "Bacon", target: "Globe Artichoke", value: 1 }, { source: "Bacon", target: "Hard Cheese", value: 1 }, { source: "Bacon", target: "Horseradish", value: 1 }, { source: "Bacon", target: "Liver", value: 1 }, { source: "Bacon", target: "Mushroom", value: 1 }, { source: "Bacon", target: "Onion", value: 1 }, { source: "Bacon", target: "Orange", value: 1 }, { source: "Bacon", target: "Oyster", value: 1 }, { source: "Bacon", target: "Parsley", value: 1 }, { source: "Bacon", target: "Parsnip", value: 1 }, { source: "Bacon", target: "Pea", value: 1 }, { source: "Bacon", target: "Pineapple", value: 1 }, { source: "Bacon", target: "Pork", value: 1 }, { source: "Bacon", target: "Potato", value: 1 }, { source: "Bacon", target: "Sage", value: 1 }, { source: "Bacon", target: "Shellfish", value: 1 }, { source: "Bacon", target: "Thyme", value: 1 }, { source: "Bacon", target: "Tomato", value: 1 }, { source: "Bacon", target: "Truffle", value: 1 }, { source: "Bacon", target: "Washed-rind Cheese", value: 1 }, { source: "Bacon", target: "White Fish", value: 1 }, { source: "Banana", target: "Almond", value: 1 }, { source: "Banana", target: "Anise", value: 1 }, { source: "Banana", target: "Bacon", value: 1 }, { source: "Banana", target: "Cardamom", value: 1 }, { source: "Banana", target: "Caviar", value: 1 }, { source: "Banana", target: "Cherry", value: 1 }, { source: "Banana", target: "Chicken", value: 1 }, { source: "Banana", target: "Chocolate", value: 1 }, { source: "Banana", target: "Cinnamon", value: 1 }, { source: "Banana", target: "Coconut", value: 1 }, { source: "Banana", target: "Coffee", value: 1 }, { source: "Banana", target: "Egg", value: 1 }, { source: "Banana", target: "Hard Cheese", value: 1 }, { source: "Banana", target: "Hazelnut", value: 1 }, { source: "Banana", target: "Parsnip", value: 1 }, { source: "Banana", target: "Peanut", value: 1 }, { source: "Banana", target: "Pear", value: 1 }, { source: "Banana", target: "Pineapple", value: 1 }, { source: "Banana", target: "Vanilla", value: 1 }, { source: "Banana", target: "Walnut", value: 1 }, { source: "Basil", target: "Anise", value: 1 }, { source: "Basil", target: "Chicken", value: 1 }, { source: "Basil", target: "Clove", value: 1 }, { source: "Basil", target: "Coconut", value: 1 }, { source: "Basil", target: "Egg", value: 1 }, { source: "Basil", target: "Garlic", value: 1 }, { source: "Basil", target: "Goat Cheese", value: 1 }, { source: "Basil", target: "Hard Cheese", value: 1 }, { source: "Basil", target: "Lemon", value: 1 }, { source: "Basil", target: "Lime", value: 1 }, { source: "Basil", target: "Mint", value: 1 }, { source: "Basil", target: "Raspberry", value: 1 }, { source: "Basil", target: "Shellfish", value: 1 }, { source: "Basil", target: "Soft Cheese", value: 1 }, { source: "Basil", target: "Tomato", value: 1 }, { source: "Basil", target: "Walnut", value: 1 }, { source: "Beef", target: "Anchovy", value: 1 }, { source: "Beef", target: "Anise", value: 1 }, { source: "Beef", target: "Bacon", value: 1 }, { source: "Beef", target: "Beet", value: 1 }, { source: "Beef", target: "Bell Pepper", value: 1 }, { source: "Beef", target: "Blackberry", value: 1 }, { source: "Beef", target: "Blue Cheese", value: 1 }, { source: "Beef", target: "Broccoli", value: 1 }, { source: "Beef", target: "Cabbage", value: 1 }, { source: "Beef", target: "Caper", value: 1 }, { source: "Beef", target: "Carrot", value: 1 }, { source: "Beef", target: "Celery", value: 1 }, { source: "Beef", target: "Chili", value: 1 }, { source: "Beef", target: "Cinnamon", value: 1 }, { source: "Beef", target: "Clove", value: 1 }, { source: "Beef", target: "Coconut", value: 1 }, { source: "Beef", target: "Coffee", value: 1 }, { source: "Beef", target: "Dill", value: 1 }, { source: "Beef", target: "Egg", value: 1 }, { source: "Beef", target: "Garlic", value: 1 }, { source: "Beef", target: "Ginger", value: 1 }, { source: "Beef", target: "Hard Cheese", value: 1 }, { source: "Beef", target: "Horseradish", value: 1 }, { source: "Beef", target: "Juniper", value: 1 }, { source: "Beef", target: "Lemon", value: 1 }, { source: "Beef", target: "Lime", value: 1 }, { source: "Beef", target: "Liver", value: 1 }, { source: "Beef", target: "Mint", value: 1 }, { source: "Beef", target: "Mushroom", value: 1 }, { source: "Beef", target: "Oily Fish", value: 1 }, { source: "Beef", target: "Olive", value: 1 }, { source: "Beef", target: "Onion", value: 1 }, { source: "Beef", target: "Orange", value: 1 }, { source: "Beef", target: "Oyster", value: 1 }, { source: "Beef", target: "Parsley", value: 1 }, { source: "Beef", target: "Parsnip", value: 1 }, { source: "Beef", target: "Pea", value: 1 }, { source: "Beef", target: "Peanut", value: 1 }, { source: "Beef", target: "Pear", value: 1 }, { source: "Beef", target: "Pork", value: 1 }, { source: "Beef", target: "Potato", value: 1 }, { source: "Beef", target: "Rutabaga", value: 1 }, { source: "Beef", target: "Shellfish", value: 1 }, { source: "Beef", target: "Thyme", value: 1 }, { source: "Beef", target: "Tomato", value: 1 }, { source: "Beef", target: "Truffle", value: 1 }, { source: "Beef", target: "Walnut", value: 1 }, { source: "Beef", target: "Watercress", value: 1 }, { source: "Beet", target: "Anchovy", value: 1 }, { source: "Beet", target: "Apple", value: 1 }, { source: "Beet", target: "Beef", value: 1 }, { source: "Beet", target: "Caper", value: 1 }, { source: "Beet", target: "Chocolate", value: 1 }, { source: "Beet", target: "Coconut", value: 1 }, { source: "Beet", target: "Cumin", value: 1 }, { source: "Beet", target: "Dill", value: 1 }, { source: "Beet", target: "Egg", value: 1 }, { source: "Beet", target: "Goat Cheese", value: 1 }, { source: "Beet", target: "Horseradish", value: 1 }, { source: "Beet", target: "Liver", value: 1 }, { source: "Beet", target: "Oily Fish", value: 1 }, { source: "Beet", target: "Onion", value: 1 }, { source: "Beet", target: "Orange", value: 1 }, { source: "Beet", target: "Pork", value: 1 }, { source: "Beet", target: "Potato", value: 1 }, { source: "Beet", target: "Walnut", value: 1 }, { source: "Beet", target: "Watercress", value: 1 }, { source: "Bell Pepper", target: "Bacon", value: 1 }, { source: "Bell Pepper", target: "Beef", value: 1 }, { source: "Bell Pepper", target: "Chicken", value: 1 }, { source: "Bell Pepper", target: "Chili", value: 1 }, { source: "Bell Pepper", target: "Egg", value: 1 }, { source: "Bell Pepper", target: "Eggplant", value: 1 }, { source: "Bell Pepper", target: "Olive", value: 1 }, { source: "Bell Pepper", target: "Onion", value: 1 }, { source: "Bell Pepper", target: "Shellfish", value: 1 }, { source: "Bell Pepper", target: "Soft Cheese", value: 1 }, { source: "Bell Pepper", target: "Tomato", value: 1 }, { source: "Black Currant", target: "Almond", value: 1 }, { source: "Black Currant", target: "Anise", value: 1 }, { source: "Black Currant", target: "Chocolate", value: 1 }, { source: "Black Currant", target: "Coffee", value: 1 }, { source: "Black Currant", target: "Juniper", value: 1 }, { source: "Black Currant", target: "Mint", value: 1 }, { source: "Black Currant", target: "Peanut", value: 1 }, { source: "Black Currant", target: "Soft Cheese", value: 1 }, { source: "Black Pudding", target: "Apple", value: 1 }, { source: "Black Pudding", target: "Bacon", value: 1 }, { source: "Black Pudding", target: "Chocolate", value: 1 }, { source: "Black Pudding", target: "Egg", value: 1 }, { source: "Black Pudding", target: "Lamb", value: 1 }, { source: "Black Pudding", target: "Liver", value: 1 }, { source: "Black Pudding", target: "Mint", value: 1 }, { source: "Black Pudding", target: "Onion", value: 1 }, { source: "Black Pudding", target: "Pork", value: 1 }, { source: "Black Pudding", target: "Potato", value: 1 }, { source: "Black Pudding", target: "Rhubarb", value: 1 }, { source: "Black Pudding", target: "Shellfish", value: 1 }, { source: "Blackberry", target: "Almond", value: 1 }, { source: "Blackberry", target: "Apple", value: 1 }, { source: "Blackberry", target: "Beef", value: 1 }, { source: "Blackberry", target: "Goat Cheese", value: 1 }, { source: "Blackberry", target: "Peach", value: 1 }, { source: "Blackberry", target: "Raspberry", value: 1 }, { source: "Blackberry", target: "Vanilla", value: 1 }, { source: "Blackberry", target: "White Chocolate", value: 1 }, { source: "Blue Cheese", target: "Avocado", value: 1 }, { source: "Blue Cheese", target: "Bacon", value: 1 }, { source: "Blue Cheese", target: "Beef", value: 1 }, { source: "Blue Cheese", target: "Blueberry", value: 1 }, { source: "Blue Cheese", target: "Broccoli", value: 1 }, { source: "Blue Cheese", target: "Butternut Squash", value: 1 }, { source: "Blue Cheese", target: "Cabbage", value: 1 }, { source: "Blue Cheese", target: "Celery", value: 1 }, { source: "Blue Cheese", target: "Chicken", value: 1 }, { source: "Blue Cheese", target: "Fig", value: 1 }, { source: "Blue Cheese", target: "Grape", value: 1 }, { source: "Blue Cheese", target: "Grapefruit", value: 1 }, { source: "Blue Cheese", target: "Mushroom", value: 1 }, { source: "Blue Cheese", target: "Peach", value: 1 }, { source: "Blue Cheese", target: "Pear", value: 1 }, { source: "Blue Cheese", target: "Pineapple", value: 1 }, { source: "Blue Cheese", target: "Sage", value: 1 }, { source: "Blue Cheese", target: "Truffle", value: 1 }, { source: "Blue Cheese", target: "Walnut", value: 1 }, { source: "Blue Cheese", target: "Watercress", value: 1 }, { source: "Blueberry", target: "Almond", value: 1 }, { source: "Blueberry", target: "Apple", value: 1 }, { source: "Blueberry", target: "Blue Cheese", value: 1 }, { source: "Blueberry", target: "Cinnamon", value: 1 }, { source: "Blueberry", target: "Coriander Seed", value: 1 }, { source: "Blueberry", target: "Lemon", value: 1 }, { source: "Blueberry", target: "Mushroom", value: 1 }, { source: "Blueberry", target: "Peach", value: 1 }, { source: "Blueberry", target: "Vanilla", value: 1 }, { source: "Broccoli", target: "Anchovy", value: 1 }, { source: "Broccoli", target: "Bacon", value: 1 }, { source: "Broccoli", target: "Beef", value: 1 }, { source: "Broccoli", target: "Blue Cheese", value: 1 }, { source: "Broccoli", target: "Cauliflower", value: 1 }, { source: "Broccoli", target: "Chili", value: 1 }, { source: "Broccoli", target: "Garlic", value: 1 }, { source: "Broccoli", target: "Hard Cheese", value: 1 }, { source: "Broccoli", target: "Lemon", value: 1 }, { source: "Broccoli", target: "Peanut", value: 1 }, { source: "Broccoli", target: "Pork", value: 1 }, { source: "Broccoli", target: "Walnut", value: 1 }, { source: "Butternut Squash", target: "Almond", value: 1 }, { source: "Butternut Squash", target: "Apple", value: 1 }, { source: "Butternut Squash", target: "Bacon", value: 1 }, { source: "Butternut Squash", target: "Blue Cheese", value: 1 }, { source: "Butternut Squash", target: "Chestnut", value: 1 }, { source: "Butternut Squash", target: "Chili", value: 1 }, { source: "Butternut Squash", target: "Cinnamon", value: 1 }, { source: "Butternut Squash", target: "Ginger", value: 1 }, { source: "Butternut Squash", target: "Goat Cheese", value: 1 }, { source: "Butternut Squash", target: "Lime", value: 1 }, { source: "Butternut Squash", target: "Mushroom", value: 1 }, { source: "Butternut Squash", target: "Nutmeg", value: 1 }, { source: "Butternut Squash", target: "Pork", value: 1 }, { source: "Butternut Squash", target: "Rosemary", value: 1 }, { source: "Butternut Squash", target: "Sage", value: 1 }, { source: "Butternut Squash", target: "Shellfish", value: 1 }, { source: "Cabbage", target: "Apple", value: 1 }, { source: "Cabbage", target: "Bacon", value: 1 }, { source: "Cabbage", target: "Beef", value: 1 }, { source: "Cabbage", target: "Blue Cheese", value: 1 }, { source: "Cabbage", target: "Carrot", value: 1 }, { source: "Cabbage", target: "Chestnut", value: 1 }, { source: "Cabbage", target: "Chicken", value: 1 }, { source: "Cabbage", target: "Chili", value: 1 }, { source: "Cabbage", target: "Egg", value: 1 }, { source: "Cabbage", target: "Garlic", value: 1 }, { source: "Cabbage", target: "Ginger", value: 1 }, { source: "Cabbage", target: "Juniper", value: 1 }, { source: "Cabbage", target: "Lamb", value: 1 }, { source: "Cabbage", target: "Nutmeg", value: 1 }, { source: "Cabbage", target: "Onion", value: 1 }, { source: "Cabbage", target: "Pork", value: 1 }, { source: "Cabbage", target: "Potato", value: 1 }, { source: "Cabbage", target: "Shellfish", value: 1 }, { source: "Cabbage", target: "Smoked Fish", value: 1 }, { source: "Cabbage", target: "Truffle", value: 1 }, { source: "Caper", target: "Anchovy", value: 1 }, { source: "Caper", target: "Beef", value: 1 }, { source: "Caper", target: "Beet", value: 1 }, { source: "Caper", target: "Cauliflower", value: 1 }, { source: "Caper", target: "Cucumber", value: 1 }, { source: "Caper", target: "Goat Cheese", value: 1 }, { source: "Caper", target: "Lamb", value: 1 }, { source: "Caper", target: "Lemon", value: 1 }, { source: "Caper", target: "Oily Fish", value: 1 }, { source: "Caper", target: "Olive", value: 1 }, { source: "Caper", target: "Parsley", value: 1 }, { source: "Caper", target: "Potato", value: 1 }, { source: "Caper", target: "Shellfish", value: 1 }, { source: "Caper", target: "Smoked Fish", value: 1 }, { source: "Caper", target: "Soft Cheese", value: 1 }, { source: "Caper", target: "Tomato", value: 1 }, { source: "Caper", target: "White Fish", value: 1 }, { source: "Cardamom", target: "Almond", value: 1 }, { source: "Cardamom", target: "Apricot", value: 1 }, { source: "Cardamom", target: "Bacon", value: 1 }, { source: "Cardamom", target: "Banana", value: 1 }, { source: "Cardamom", target: "Carrot", value: 1 }, { source: "Cardamom", target: "Chocolate", value: 1 }, { source: "Cardamom", target: "Cinnamon", value: 1 }, { source: "Cardamom", target: "Coconut", value: 1 }, { source: "Cardamom", target: "Coffee", value: 1 }, { source: "Cardamom", target: "Coriander Seed", value: 1 }, { source: "Cardamom", target: "Ginger", value: 1 }, { source: "Cardamom", target: "Lamb", value: 1 }, { source: "Cardamom", target: "Mango", value: 1 }, { source: "Cardamom", target: "Pear", value: 1 }, { source: "Cardamom", target: "Rose", value: 1 }, { source: "Cardamom", target: "Saffron", value: 1 }, { source: "Cardamom", target: "Vanilla", value: 1 }, { source: "Cardamom", target: "White Chocolate", value: 1 }, { source: "Carrot", target: "Anise", value: 1 }, { source: "Carrot", target: "Apple", value: 1 }, { source: "Carrot", target: "Beef", value: 1 }, { source: "Carrot", target: "Cabbage", value: 1 }, { source: "Carrot", target: "Cardamom", value: 1 }, { source: "Carrot", target: "Celery", value: 1 }, { source: "Carrot", target: "Cinnamon", value: 1 }, { source: "Carrot", target: "Coconut", value: 1 }, { source: "Carrot", target: "Cucumber", value: 1 }, { source: "Carrot", target: "Cumin", value: 1 }, { source: "Carrot", target: "Hazelnut", value: 1 }, { source: "Carrot", target: "Olive", value: 1 }, { source: "Carrot", target: "Onion", value: 1 }, { source: "Carrot", target: "Orange", value: 1 }, { source: "Carrot", target: "Parsley", value: 1 }, { source: "Carrot", target: "Peanut", value: 1 }, { source: "Carrot", target: "Rutabaga", value: 1 }, { source: "Carrot", target: "Walnut", value: 1 }, { source: "Cauliflower", target: "Almond", value: 1 }, { source: "Cauliflower", target: "Anchovy", value: 1 }, { source: "Cauliflower", target: "Broccoli", value: 1 }, { source: "Cauliflower", target: "Caper", value: 1 }, { source: "Cauliflower", target: "Caviar", value: 1 }, { source: "Cauliflower", target: "Chili", value: 1 }, { source: "Cauliflower", target: "Chocolate", value: 1 }, { source: "Cauliflower", target: "Cumin", value: 1 }, { source: "Cauliflower", target: "Garlic", value: 1 }, { source: "Cauliflower", target: "Hard Cheese", value: 1 }, { source: "Cauliflower", target: "Nutmeg", value: 1 }, { source: "Cauliflower", target: "Potato", value: 1 }, { source: "Cauliflower", target: "Saffron", value: 1 }, { source: "Cauliflower", target: "Shellfish", value: 1 }, { source: "Cauliflower", target: "Truffle", value: 1 }, { source: "Cauliflower", target: "Walnut", value: 1 }, { source: "Caviar", target: "Banana", value: 1 }, { source: "Caviar", target: "Cauliflower", value: 1 }, { source: "Caviar", target: "Chicken", value: 1 }, { source: "Caviar", target: "Egg", value: 1 }, { source: "Caviar", target: "Hazelnut", value: 1 }, { source: "Caviar", target: "Lemon", value: 1 }, { source: "Caviar", target: "Oyster", value: 1 }, { source: "Caviar", target: "Potato", value: 1 }, { source: "Caviar", target: "Smoked Fish", value: 1 }, { source: "Caviar", target: "Soft Cheese", value: 1 }, { source: "Caviar", target: "White Chocolate", value: 1 }, { source: "Celery", target: "Apple", value: 1 }, { source: "Celery", target: "Beef", value: 1 }, { source: "Celery", target: "Blue Cheese", value: 1 }, { source: "Celery", target: "Carrot", value: 1 }, { source: "Celery", target: "Chestnut", value: 1 }, { source: "Celery", target: "Chicken", value: 1 }, { source: "Celery", target: "Egg", value: 1 }, { source: "Celery", target: "Horseradish", value: 1 }, { source: "Celery", target: "Lamb", value: 1 }, { source: "Celery", target: "Nutmeg", value: 1 }, { source: "Celery", target: "Onion", value: 1 }, { source: "Celery", target: "Oyster", value: 1 }, { source: "Celery", target: "Peanut", value: 1 }, { source: "Celery", target: "Pork", value: 1 }, { source: "Celery", target: "Potato", value: 1 }, { source: "Celery", target: "Prosciutto", value: 1 }, { source: "Celery", target: "Shellfish", value: 1 }, { source: "Celery", target: "Soft Cheese", value: 1 }, { source: "Celery", target: "Truffle", value: 1 }, { source: "Celery", target: "Walnut", value: 1 }, { source: "Celery", target: "White Fish", value: 1 }, { source: "Cherry", target: "Almond", value: 1 }, { source: "Cherry", target: "Banana", value: 1 }, { source: "Cherry", target: "Chocolate", value: 1 }, { source: "Cherry", target: "Cinnamon", value: 1 }, { source: "Cherry", target: "Coconut", value: 1 }, { source: "Cherry", target: "Coffee", value: 1 }, { source: "Cherry", target: "Goat Cheese", value: 1 }, { source: "Cherry", target: "Hazelnut", value: 1 }, { source: "Cherry", target: "Lamb", value: 1 }, { source: "Cherry", target: "Peach", value: 1 }, { source: "Cherry", target: "Smoked Fish", value: 1 }, { source: "Cherry", target: "Vanilla", value: 1 }, { source: "Cherry", target: "Walnut", value: 1 }, { source: "Chestnut", target: "Butternut Squash", value: 1 }, { source: "Chestnut", target: "Cabbage", value: 1 }, { source: "Chestnut", target: "Celery", value: 1 }, { source: "Chestnut", target: "Chicken", value: 1 }, { source: "Chestnut", target: "Chocolate", value: 1 }, { source: "Chestnut", target: "Lamb", value: 1 }, { source: "Chestnut", target: "Mushroom", value: 1 }, { source: "Chestnut", target: "Pear", value: 1 }, { source: "Chestnut", target: "Pork", value: 1 }, { source: "Chestnut", target: "Prosciutto", value: 1 }, { source: "Chestnut", target: "Rosemary", value: 1 }, { source: "Chestnut", target: "Vanilla", value: 1 }, { source: "Chicken", target: "Almond", value: 1 }, { source: "Chicken", target: "Anise", value: 1 }, { source: "Chicken", target: "Avocado", value: 1 }, { source: "Chicken", target: "Bacon", value: 1 }, { source: "Chicken", target: "Banana", value: 1 }, { source: "Chicken", target: "Basil", value: 1 }, { source: "Chicken", target: "Bell Pepper", value: 1 }, { source: "Chicken", target: "Blue Cheese", value: 1 }, { source: "Chicken", target: "Cabbage", value: 1 }, { source: "Chicken", target: "Caviar", value: 1 }, { source: "Chicken", target: "Celery", value: 1 }, { source: "Chicken", target: "Chestnut", value: 1 }, { source: "Chicken", target: "Chili", value: 1 }, { source: "Chicken", target: "Cilantro", value: 1 }, { source: "Chicken", target: "Coconut", value: 1 }, { source: "Chicken", target: "Egg", value: 1 }, { source: "Chicken", target: "Garlic", value: 1 }, { source: "Chicken", target: "Grape", value: 1 }, { source: "Chicken", target: "Hard Cheese", value: 1 }, { source: "Chicken", target: "Hazelnut", value: 1 }, { source: "Chicken", target: "Lemon", value: 1 }, { source: "Chicken", target: "Lime", value: 1 }, { source: "Chicken", target: "Mushroom", value: 1 }, { source: "Chicken", target: "Onion", value: 1 }, { source: "Chicken", target: "Oyster", value: 1 }, { source: "Chicken", target: "Parsnip", value: 1 }, { source: "Chicken", target: "Pea", value: 1 }, { source: "Chicken", target: "Peanut", value: 1 }, { source: "Chicken", target: "Pear", value: 1 }, { source: "Chicken", target: "Potato", value: 1 }, { source: "Chicken", target: "Rose", value: 1 }, { source: "Chicken", target: "Saffron", value: 1 }, { source: "Chicken", target: "Sage", value: 1 }, { source: "Chicken", target: "Shellfish", value: 1 }, { source: "Chicken", target: "Thyme", value: 1 }, { source: "Chicken", target: "Tomato", value: 1 }, { source: "Chicken", target: "Truffle", value: 1 }, { source: "Chicken", target: "Walnut", value: 1 }, { source: "Chicken", target: "Watercress", value: 1 }, { source: "Chili", target: "Almond", value: 1 }, { source: "Chili", target: "Anchovy", value: 1 }, { source: "Chili", target: "Anise", value: 1 }, { source: "Chili", target: "Avocado", value: 1 }, { source: "Chili", target: "Bacon", value: 1 }, { source: "Chili", target: "Beef", value: 1 }, { source: "Chili", target: "Bell Pepper", value: 1 }, { source: "Chili", target: "Broccoli", value: 1 }, { source: "Chili", target: "Butternut Squash", value: 1 }, { source: "Chili", target: "Cabbage", value: 1 }, { source: "Chili", target: "Cauliflower", value: 1 }, { source: "Chili", target: "Chicken", value: 1 }, { source: "Chili", target: "Chocolate", value: 1 }, { source: "Chili", target: "Cilantro", value: 1 }, { source: "Chili", target: "Coconut", value: 1 }, { source: "Chili", target: "Egg", value: 1 }, { source: "Chili", target: "Eggplant", value: 1 }, { source: "Chili", target: "Garlic", value: 1 }, { source: "Chili", target: "Ginger", value: 1 }, { source: "Chili", target: "Goat Cheese", value: 1 }, { source: "Chili", target: "Hard Cheese", value: 1 }, { source: "Chili", target: "Lemon", value: 1 }, { source: "Chili", target: "Lime", value: 1 }, { source: "Chili", target: "Liver", value: 1 }, { source: "Chili", target: "Mango", value: 1 }, { source: "Chili", target: "Mint", value: 1 }, { source: "Chili", target: "Oily Fish", value: 1 }, { source: "Chili", target: "Olive", value: 1 }, { source: "Chili", target: "Orange", value: 1 }, { source: "Chili", target: "Oyster", value: 1 }, { source: "Chili", target: "Peanut", value: 1 }, { source: "Chili", target: "Pineapple", value: 1 }, { source: "Chili", target: "Pork", value: 1 }, { source: "Chili", target: "Potato", value: 1 }, { source: "Chili", target: "Shellfish", value: 1 }, { source: "Chili", target: "Tomato", value: 1 }, { source: "Chili", target: "Walnut", value: 1 }, { source: "Chili", target: "Watermelon", value: 1 }, { source: "Chocolate", target: "Almond", value: 1 }, { source: "Chocolate", target: "Anise", value: 1 }, { source: "Chocolate", target: "Apricot", value: 1 }, { source: "Chocolate", target: "Avocado", value: 1 }, { source: "Chocolate", target: "Bacon", value: 1 }, { source: "Chocolate", target: "Banana", value: 1 }, { source: "Chocolate", target: "Beet", value: 1 }, { source: "Chocolate", target: "Black Currant", value: 1 }, { source: "Chocolate", target: "Black Pudding", value: 1 }, { source: "Chocolate", target: "Cardamom", value: 1 }, { source: "Chocolate", target: "Cauliflower", value: 1 }, { source: "Chocolate", target: "Cherry", value: 1 }, { source: "Chocolate", target: "Chestnut", value: 1 }, { source: "Chocolate", target: "Chili", value: 1 }, { source: "Chocolate", target: "Cinnamon", value: 1 }, { source: "Chocolate", target: "Coconut", value: 1 }, { source: "Chocolate", target: "Coffee", value: 1 }, { source: "Chocolate", target: "Fig", value: 1 }, { source: "Chocolate", target: "Ginger", value: 1 }, { source: "Chocolate", target: "Goat Cheese", value: 1 }, { source: "Chocolate", target: "Hazelnut", value: 1 }, { source: "Chocolate", target: "Lemon", value: 1 }, { source: "Chocolate", target: "Lime", value: 1 }, { source: "Chocolate", target: "Mint", value: 1 }, { source: "Chocolate", target: "Nutmeg", value: 1 }, { source: "Chocolate", target: "Orange", value: 1 }, { source: "Chocolate", target: "Peanut", value: 1 }, { source: "Chocolate", target: "Pear", value: 1 }, { source: "Chocolate", target: "Pineapple", value: 1 }, { source: "Chocolate", target: "Raspberry", value: 1 }, { source: "Chocolate", target: "Rose", value: 1 }, { source: "Chocolate", target: "Rosemary", value: 1 }, { source: "Chocolate", target: "Strawberry", value: 1 }, { source: "Chocolate", target: "Thyme", value: 1 }, { source: "Chocolate", target: "Tomato", value: 1 }, { source: "Chocolate", target: "Vanilla", value: 1 }, { source: "Chocolate", target: "Walnut", value: 1 }, { source: "Chocolate", target: "Watermelon", value: 1 }, { source: "Chocolate", target: "White Chocolate", value: 1 }, { source: "Cilantro", target: "Avocado", value: 1 }, { source: "Cilantro", target: "Chicken", value: 1 }, { source: "Cilantro", target: "Chili", value: 1 }, { source: "Cilantro", target: "Coconut", value: 1 }, { source: "Cilantro", target: "Coriander Seed", value: 1 }, { source: "Cilantro", target: "Cumin", value: 1 }, { source: "Cilantro", target: "Garlic", value: 1 }, { source: "Cilantro", target: "Goat Cheese", value: 1 }, { source: "Cilantro", target: "Lamb", value: 1 }, { source: "Cilantro", target: "Lemon", value: 1 }, { source: "Cilantro", target: "Lime", value: 1 }, { source: "Cilantro", target: "Mango", value: 1 }, { source: "Cilantro", target: "Mint", value: 1 }, { source: "Cilantro", target: "Orange", value: 1 }, { source: "Cilantro", target: "Parsley", value: 1 }, { source: "Cilantro", target: "Peanut", value: 1 }, { source: "Cilantro", target: "Pineapple", value: 1 }, { source: "Cilantro", target: "Pork", value: 1 }, { source: "Cilantro", target: "Potato", value: 1 }, { source: "Cilantro", target: "Shellfish", value: 1 }, { source: "Cilantro", target: "Tomato", value: 1 }, { source: "Cilantro", target: "Watermelon", value: 1 }, { source: "Cilantro", target: "White Fish", value: 1 }, { source: "Cinnamon", target: "Almond", value: 1 }, { source: "Cinnamon", target: "Anise", value: 1 }, { source: "Cinnamon", target: "Apple", value: 1 }, { source: "Cinnamon", target: "Apricot", value: 1 }, { source: "Cinnamon", target: "Banana", value: 1 }, { source: "Cinnamon", target: "Beef", value: 1 }, { source: "Cinnamon", target: "Blueberry", value: 1 }, { source: "Cinnamon", target: "Butternut Squash", value: 1 }, { source: "Cinnamon", target: "Cardamom", value: 1 }, { source: "Cinnamon", target: "Carrot", value: 1 }, { source: "Cinnamon", target: "Cherry", value: 1 }, { source: "Cinnamon", target: "Chocolate", value: 1 }, { source: "Cinnamon", target: "Clove", value: 1 }, { source: "Cinnamon", target: "Coconut", value: 1 }, { source: "Cinnamon", target: "Coffee", value: 1 }, { source: "Cinnamon", target: "Fig", value: 1 }, { source: "Cinnamon", target: "Ginger", value: 1 }, { source: "Cinnamon", target: "Grapefruit", value: 1 }, { source: "Cinnamon", target: "Lamb", value: 1 }, { source: "Cinnamon", target: "Lime", value: 1 }, { source: "Cinnamon", target: "Mint", value: 1 }, { source: "Cinnamon", target: "Orange", value: 1 }, { source: "Cinnamon", target: "Peanut", value: 1 }, { source: "Cinnamon", target: "Pear", value: 1 }, { source: "Cinnamon", target: "Pineapple", value: 1 }, { source: "Cinnamon", target: "Pork", value: 1 }, { source: "Cinnamon", target: "Soft Cheese", value: 1 }, { source: "Cinnamon", target: "Strawberry", value: 1 }, { source: "Cinnamon", target: "Thyme", value: 1 }, { source: "Cinnamon", target: "Tomato", value: 1 }, { source: "Cinnamon", target: "Walnut", value: 1 }, { source: "Cinnamon", target: "Watermelon", value: 1 }, { source: "Clove", target: "Apple", value: 1 }, { source: "Clove", target: "Bacon", value: 1 }, { source: "Clove", target: "Basil", value: 1 }, { source: "Clove", target: "Beef", value: 1 }, { source: "Clove", target: "Cinnamon", value: 1 }, { source: "Clove", target: "Coffee", value: 1 }, { source: "Clove", target: "Ginger", value: 1 }, { source: "Clove", target: "Hard Cheese", value: 1 }, { source: "Clove", target: "Onion", value: 1 }, { source: "Clove", target: "Orange", value: 1 }, { source: "Clove", target: "Peach", value: 1 }, { source: "Clove", target: "Pork", value: 1 }, { source: "Clove", target: "Tomato", value: 1 }, { source: "Clove", target: "Vanilla", value: 1 }, { source: "Coconut", target: "Almond", value: 1 }, { source: "Coconut", target: "Anchovy", value: 1 }, { source: "Coconut", target: "Anise", value: 1 }, { source: "Coconut", target: "Banana", value: 1 }, { source: "Coconut", target: "Basil", value: 1 }, { source: "Coconut", target: "Beef", value: 1 }, { source: "Coconut", target: "Beet", value: 1 }, { source: "Coconut", target: "Cardamom", value: 1 }, { source: "Coconut", target: "Carrot", value: 1 }, { source: "Coconut", target: "Cherry", value: 1 }, { source: "Coconut", target: "Chicken", value: 1 }, { source: "Coconut", target: "Chili", value: 1 }, { source: "Coconut", target: "Chocolate", value: 1 }, { source: "Coconut", target: "Cilantro", value: 1 }, { source: "Coconut", target: "Cinnamon", value: 1 }, { source: "Coconut", target: "Dill", value: 1 }, { source: "Coconut", target: "Egg", value: 1 }, { source: "Coconut", target: "Lemon", value: 1 }, { source: "Coconut", target: "Lime", value: 1 }, { source: "Coconut", target: "Mango", value: 1 }, { source: "Coconut", target: "Peanut", value: 1 }, { source: "Coconut", target: "Pineapple", value: 1 }, { source: "Coconut", target: "Pork", value: 1 }, { source: "Coconut", target: "Raspberry", value: 1 }, { source: "Coconut", target: "Shellfish", value: 1 }, { source: "Coconut", target: "Smoked Fish", value: 1 }, { source: "Coconut", target: "Strawberry", value: 1 }, { source: "Coconut", target: "Vanilla", value: 1 }, { source: "Coconut", target: "White Chocolate", value: 1 }, { source: "Coconut", target: "White Fish", value: 1 }, { source: "Coffee", target: "Almond", value: 1 }, { source: "Coffee", target: "Avocado", value: 1 }, { source: "Coffee", target: "Banana", value: 1 }, { source: "Coffee", target: "Beef", value: 1 }, { source: "Coffee", target: "Black Currant", value: 1 }, { source: "Coffee", target: "Cardamom", value: 1 }, { source: "Coffee", target: "Cherry", value: 1 }, { source: "Coffee", target: "Chocolate", value: 1 }, { source: "Coffee", target: "Cinnamon", value: 1 }, { source: "Coffee", target: "Clove", value: 1 }, { source: "Coffee", target: "Coriander Seed", value: 1 }, { source: "Coffee", target: "Ginger", value: 1 }, { source: "Coffee", target: "Goat Cheese", value: 1 }, { source: "Coffee", target: "Hazelnut", value: 1 }, { source: "Coffee", target: "Orange", value: 1 }, { source: "Coffee", target: "Rose", value: 1 }, { source: "Coffee", target: "Vanilla", value: 1 }, { source: "Coffee", target: "Walnut", value: 1 }, { source: "Coffee", target: "White Chocolate", value: 1 }, { source: "Coriander Seed", target: "Apple", value: 1 }, { source: "Coriander Seed", target: "Blueberry", value: 1 }, { source: "Coriander Seed", target: "Cardamom", value: 1 }, { source: "Coriander Seed", target: "Cilantro", value: 1 }, { source: "Coriander Seed", target: "Coffee", value: 1 }, { source: "Coriander Seed", target: "Cumin", value: 1 }, { source: "Coriander Seed", target: "Garlic", value: 1 }, { source: "Coriander Seed", target: "Goat Cheese", value: 1 }, { source: "Coriander Seed", target: "Lemon", value: 1 }, { source: "Coriander Seed", target: "Olive", value: 1 }, { source: "Coriander Seed", target: "Orange", value: 1 }, { source: "Coriander Seed", target: "Pork", value: 1 }, { source: "Cucumber", target: "Anise", value: 1 }, { source: "Cucumber", target: "Avocado", value: 1 }, { source: "Cucumber", target: "Caper", value: 1 }, { source: "Cucumber", target: "Carrot", value: 1 }, { source: "Cucumber", target: "Cumin", value: 1 }, { source: "Cucumber", target: "Dill", value: 1 }, { source: "Cucumber", target: "Garlic", value: 1 }, { source: "Cucumber", target: "Goat Cheese", value: 1 }, { source: "Cucumber", target: "Melon", value: 1 }, { source: "Cucumber", target: "Mint", value: 1 }, { source: "Cucumber", target: "Oily Fish", value: 1 }, { source: "Cucumber", target: "Onion", value: 1 }, { source: "Cucumber", target: "Peanut", value: 1 }, { source: "Cucumber", target: "Pork", value: 1 }, { source: "Cucumber", target: "Rhubarb", value: 1 }, { source: "Cucumber", target: "Rose", value: 1 }, { source: "Cucumber", target: "Shellfish", value: 1 }, { source: "Cucumber", target: "Strawberry", value: 1 }, { source: "Cucumber", target: "Tomato", value: 1 }, { source: "Cucumber", target: "Watermelon", value: 1 }, { source: "Cucumber", target: "White Fish", value: 1 }, { source: "Cumin", target: "Apricot", value: 1 }, { source: "Cumin", target: "Beet", value: 1 }, { source: "Cumin", target: "Carrot", value: 1 }, { source: "Cumin", target: "Cauliflower", value: 1 }, { source: "Cumin", target: "Cilantro", value: 1 }, { source: "Cumin", target: "Coriander Seed", value: 1 }, { source: "Cumin", target: "Cucumber", value: 1 }, { source: "Cumin", target: "Egg", value: 1 }, { source: "Cumin", target: "Lamb", value: 1 }, { source: "Cumin", target: "Lemon", value: 1 }, { source: "Cumin", target: "Lime", value: 1 }, { source: "Cumin", target: "Mango", value: 1 }, { source: "Cumin", target: "Mint", value: 1 }, { source: "Cumin", target: "Oily Fish", value: 1 }, { source: "Cumin", target: "Pork", value: 1 }, { source: "Cumin", target: "Potato", value: 1 }, { source: "Cumin", target: "Shellfish", value: 1 }, { source: "Cumin", target: "Washed-rind Cheese", value: 1 }, { source: "Dill", target: "Avocado", value: 1 }, { source: "Dill", target: "Beef", value: 1 }, { source: "Dill", target: "Beet", value: 1 }, { source: "Dill", target: "Coconut", value: 1 }, { source: "Dill", target: "Cucumber", value: 1 }, { source: "Dill", target: "Egg", value: 1 }, { source: "Dill", target: "Lamb", value: 1 }, { source: "Dill", target: "Lemon", value: 1 }, { source: "Dill", target: "Mint", value: 1 }, { source: "Dill", target: "Mushroom", value: 1 }, { source: "Dill", target: "Oily Fish", value: 1 }, { source: "Dill", target: "Pea", value: 1 }, { source: "Dill", target: "Pork", value: 1 }, { source: "Dill", target: "Potato", value: 1 }, { source: "Dill", target: "Shellfish", value: 1 }, { source: "Dill", target: "Smoked Fish", value: 1 }, { source: "Dill", target: "White Fish", value: 1 }, { source: "Egg", target: "Anchovy", value: 1 }, { source: "Egg", target: "Anise", value: 1 }, { source: "Egg", target: "Asparagus", value: 1 }, { source: "Egg", target: "Bacon", value: 1 }, { source: "Egg", target: "Banana", value: 1 }, { source: "Egg", target: "Basil", value: 1 }, { source: "Egg", target: "Beef", value: 1 }, { source: "Egg", target: "Beet", value: 1 }, { source: "Egg", target: "Bell Pepper", value: 1 }, { source: "Egg", target: "Black Pudding", value: 1 }, { source: "Egg", target: "Cabbage", value: 1 }, { source: "Egg", target: "Caviar", value: 1 }, { source: "Egg", target: "Celery", value: 1 }, { source: "Egg", target: "Chicken", value: 1 }, { source: "Egg", target: "Chili", value: 1 }, { source: "Egg", target: "Coconut", value: 1 }, { source: "Egg", target: "Cumin", value: 1 }, { source: "Egg", target: "Dill", value: 1 }, { source: "Egg", target: "Ginger", value: 1 }, { source: "Egg", target: "Lemon", value: 1 }, { source: "Egg", target: "Mushroom", value: 1 }, { source: "Egg", target: "Nutmeg", value: 1 }, { source: "Egg", target: "Oily Fish", value: 1 }, { source: "Egg", target: "Onion", value: 1 }, { source: "Egg", target: "Oyster", value: 1 }, { source: "Egg", target: "Parsley", value: 1 }, { source: "Egg", target: "Pea", value: 1 }, { source: "Egg", target: "Pork", value: 1 }, { source: "Egg", target: "Potato", value: 1 }, { source: "Egg", target: "Prosciutto", value: 1 }, { source: "Egg", target: "Sage", value: 1 }, { source: "Egg", target: "Shellfish", value: 1 }, { source: "Egg", target: "Smoked Fish", value: 1 }, { source: "Egg", target: "Tomato", value: 1 }, { source: "Egg", target: "Truffle", value: 1 }, { source: "Egg", target: "Vanilla", value: 1 }, { source: "Egg", target: "Watercress", value: 1 }, { source: "Eggplant", target: "Bell Pepper", value: 1 }, { source: "Eggplant", target: "Chili", value: 1 }, { source: "Eggplant", target: "Garlic", value: 1 }, { source: "Eggplant", target: "Ginger", value: 1 }, { source: "Eggplant", target: "Lamb", value: 1 }, { source: "Eggplant", target: "Nutmeg", value: 1 }, { source: "Eggplant", target: "Prosciutto", value: 1 }, { source: "Eggplant", target: "Soft Cheese", value: 1 }, { source: "Eggplant", target: "Tomato", value: 1 }, { source: "Eggplant", target: "Walnut", value: 1 }, { source: "Fig", target: "Almond", value: 1 }, { source: "Fig", target: "Anise", value: 1 }, { source: "Fig", target: "Blue Cheese", value: 1 }, { source: "Fig", target: "Chocolate", value: 1 }, { source: "Fig", target: "Cinnamon", value: 1 }, { source: "Fig", target: "Goat Cheese", value: 1 }, { source: "Fig", target: "Hard Cheese", value: 1 }, { source: "Fig", target: "Hazelnut", value: 1 }, { source: "Fig", target: "Liver", value: 1 }, { source: "Fig", target: "Mint", value: 1 }, { source: "Fig", target: "Orange", value: 1 }, { source: "Fig", target: "Prosciutto", value: 1 }, { source: "Fig", target: "Raspberry", value: 1 }, { source: "Fig", target: "Soft Cheese", value: 1 }, { source: "Fig", target: "Vanilla", value: 1 }, { source: "Fig", target: "Walnut", value: 1 }, { source: "Garlic", target: "Almond", value: 1 }, { source: "Garlic", target: "Anchovy", value: 1 }, { source: "Garlic", target: "Basil", value: 1 }, { source: "Garlic", target: "Beef", value: 1 }, { source: "Garlic", target: "Broccoli", value: 1 }, { source: "Garlic", target: "Cabbage", value: 1 }, { source: "Garlic", target: "Cauliflower", value: 1 }, { source: "Garlic", target: "Chicken", value: 1 }, { source: "Garlic", target: "Chili", value: 1 }, { source: "Garlic", target: "Cilantro", value: 1 }, { source: "Garlic", target: "Coriander Seed", value: 1 }, { source: "Garlic", target: "Cucumber", value: 1 }, { source: "Garlic", target: "Eggplant", value: 1 }, { source: "Garlic", target: "Ginger", value: 1 }, { source: "Garlic", target: "Goat Cheese", value: 1 }, { source: "Garlic", target: "Hazelnut", value: 1 }, { source: "Garlic", target: "Lamb", value: 1 }, { source: "Garlic", target: "Liver", value: 1 }, { source: "Garlic", target: "Mint", value: 1 }, { source: "Garlic", target: "Mushroom", value: 1 }, { source: "Garlic", target: "Olive", value: 1 }, { source: "Garlic", target: "Onion", value: 1 }, { source: "Garlic", target: "Parsley", value: 1 }, { source: "Garlic", target: "Pork", value: 1 }, { source: "Garlic", target: "Potato", value: 1 }, { source: "Garlic", target: "Rosemary", value: 1 }, { source: "Garlic", target: "Shellfish", value: 1 }, { source: "Garlic", target: "Soft Cheese", value: 1 }, { source: "Garlic", target: "Thyme", value: 1 }, { source: "Garlic", target: "Tomato", value: 1 }, { source: "Garlic", target: "Truffle", value: 1 }, { source: "Garlic", target: "Walnut", value: 1 }, { source: "Garlic", target: "Washed-rind Cheese", value: 1 }, { source: "Garlic", target: "White Fish", value: 1 }, { source: "Ginger", target: "Almond", value: 1 }, { source: "Ginger", target: "Apricot", value: 1 }, { source: "Ginger", target: "Beef", value: 1 }, { source: "Ginger", target: "Butternut Squash", value: 1 }, { source: "Ginger", target: "Cabbage", value: 1 }, { source: "Ginger", target: "Cardamom", value: 1 }, { source: "Ginger", target: "Chili", value: 1 }, { source: "Ginger", target: "Chocolate", value: 1 }, { source: "Ginger", target: "Cinnamon", value: 1 }, { source: "Ginger", target: "Clove", value: 1 }, { source: "Ginger", target: "Coffee", value: 1 }, { source: "Ginger", target: "Egg", value: 1 }, { source: "Ginger", target: "Eggplant", value: 1 }, { source: "Ginger", target: "Garlic", value: 1 }, { source: "Ginger", target: "Lemon", value: 1 }, { source: "Ginger", target: "Lime", value: 1 }, { source: "Ginger", target: "Mango", value: 1 }, { source: "Ginger", target: "Melon", value: 1 }, { source: "Ginger", target: "Mint", value: 1 }, { source: "Ginger", target: "Oily Fish", value: 1 }, { source: "Ginger", target: "Onion", value: 1 }, { source: "Ginger", target: "Orange", value: 1 }, { source: "Ginger", target: "Pork", value: 1 }, { source: "Ginger", target: "Rhubarb", value: 1 }, { source: "Ginger", target: "Tomato", value: 1 }, { source: "Ginger", target: "Vanilla", value: 1 }, { source: "Ginger", target: "White Fish", value: 1 }, { source: "Globe Artichoke", target: "Bacon", value: 1 }, { source: "Globe Artichoke", target: "Hard Cheese", value: 1 }, { source: "Globe Artichoke", target: "Lamb", value: 1 }, { source: "Globe Artichoke", target: "Lemon", value: 1 }, { source: "Globe Artichoke", target: "Mint", value: 1 }, { source: "Globe Artichoke", target: "Oyster", value: 1 }, { source: "Globe Artichoke", target: "Pea", value: 1 }, { source: "Globe Artichoke", target: "Pork", value: 1 }, { source: "Globe Artichoke", target: "Potato", value: 1 }, { source: "Globe Artichoke", target: "Prosciutto", value: 1 }, { source: "Globe Artichoke", target: "Shellfish", value: 1 }, { source: "Globe Artichoke", target: "Truffle", value: 1 }, { source: "Goat Cheese", target: "Anise", value: 1 }, { source: "Goat Cheese", target: "Apricot", value: 1 }, { source: "Goat Cheese", target: "Basil", value: 1 }, { source: "Goat Cheese", target: "Beet", value: 1 }, { source: "Goat Cheese", target: "Blackberry", value: 1 }, { source: "Goat Cheese", target: "Butternut Squash", value: 1 }, { source: "Goat Cheese", target: "Caper", value: 1 }, { source: "Goat Cheese", target: "Cherry", value: 1 }, { source: "Goat Cheese", target: "Chili", value: 1 }, { source: "Goat Cheese", target: "Chocolate", value: 1 }, { source: "Goat Cheese", target: "Cilantro", value: 1 }, { source: "Goat Cheese", target: "Coffee", value: 1 }, { source: "Goat Cheese", target: "Coriander Seed", value: 1 }, { source: "Goat Cheese", target: "Cucumber", value: 1 }, { source: "Goat Cheese", target: "Fig", value: 1 }, { source: "Goat Cheese", target: "Garlic", value: 1 }, { source: "Goat Cheese", target: "Lamb", value: 1 }, { source: "Goat Cheese", target: "Lemon", value: 1 }, { source: "Goat Cheese", target: "Mint", value: 1 }, { source: "Goat Cheese", target: "Mushroom", value: 1 }, { source: "Goat Cheese", target: "Olive", value: 1 }, { source: "Goat Cheese", target: "Pear", value: 1 }, { source: "Goat Cheese", target: "Raspberry", value: 1 }, { source: "Goat Cheese", target: "Rosemary", value: 1 }, { source: "Goat Cheese", target: "Thyme", value: 1 }, { source: "Goat Cheese", target: "Walnut", value: 1 }, { source: "Goat Cheese", target: "Watercress", value: 1 }, { source: "Goat Cheese", target: "Watermelon", value: 1 }, { source: "Grape", target: "Almond", value: 1 }, { source: "Grape", target: "Anise", value: 1 }, { source: "Grape", target: "Avocado", value: 1 }, { source: "Grape", target: "Blue Cheese", value: 1 }, { source: "Grape", target: "Chicken", value: 1 }, { source: "Grape", target: "Hard Cheese", value: 1 }, { source: "Grape", target: "Melon", value: 1 }, { source: "Grape", target: "Peach", value: 1 }, { source: "Grape", target: "Peanut", value: 1 }, { source: "Grape", target: "Pineapple", value: 1 }, { source: "Grape", target: "Pork", value: 1 }, { source: "Grape", target: "Rosemary", value: 1 }, { source: "Grape", target: "Soft Cheese", value: 1 }, { source: "Grape", target: "Strawberry", value: 1 }, { source: "Grape", target: "Walnut", value: 1 }, { source: "Grape", target: "White Fish", value: 1 }, { source: "Grapefruit", target: "Avocado", value: 1 }, { source: "Grapefruit", target: "Blue Cheese", value: 1 }, { source: "Grapefruit", target: "Cinnamon", value: 1 }, { source: "Grapefruit", target: "Juniper", value: 1 }, { source: "Grapefruit", target: "Orange", value: 1 }, { source: "Grapefruit", target: "Pineapple", value: 1 }, { source: "Grapefruit", target: "Pork", value: 1 }, { source: "Grapefruit", target: "Shellfish", value: 1 }, { source: "Grapefruit", target: "Watercress", value: 1 }, { source: "Hard Cheese", target: "Almond", value: 1 }, { source: "Hard Cheese", target: "Anchovy", value: 1 }, { source: "Hard Cheese", target: "Anise", value: 1 }, { source: "Hard Cheese", target: "Apple", value: 1 }, { source: "Hard Cheese", target: "Apricot", value: 1 }, { source: "Hard Cheese", target: "Asparagus", value: 1 }, { source: "Hard Cheese", target: "Bacon", value: 1 }, { source: "Hard Cheese", target: "Banana", value: 1 }, { source: "Hard Cheese", target: "Basil", value: 1 }, { source: "Hard Cheese", target: "Beef", value: 1 }, { source: "Hard Cheese", target: "Broccoli", value: 1 }, { source: "Hard Cheese", target: "Cauliflower", value: 1 }, { source: "Hard Cheese", target: "Chicken", value: 1 }, { source: "Hard Cheese", target: "Chili", value: 1 }, { source: "Hard Cheese", target: "Clove", value: 1 }, { source: "Hard Cheese", target: "Fig", value: 1 }, { source: "Hard Cheese", target: "Globe Artichoke", value: 1 }, { source: "Hard Cheese", target: "Grape", value: 1 }, { source: "Hard Cheese", target: "Juniper", value: 1 }, { source: "Hard Cheese", target: "Mushroom", value: 1 }, { source: "Hard Cheese", target: "Nutmeg", value: 1 }, { source: "Hard Cheese", target: "Onion", value: 1 }, { source: "Hard Cheese", target: "Orange", value: 1 }, { source: "Hard Cheese", target: "Parsnip", value: 1 }, { source: "Hard Cheese", target: "Pea", value: 1 }, { source: "Hard Cheese", target: "Pear", value: 1 }, { source: "Hard Cheese", target: "Pineapple", value: 1 }, { source: "Hard Cheese", target: "Potato", value: 1 }, { source: "Hard Cheese", target: "Sage", value: 1 }, { source: "Hard Cheese", target: "Shellfish", value: 1 }, { source: "Hard Cheese", target: "Tomato", value: 1 }, { source: "Hard Cheese", target: "Walnut", value: 1 }, { source: "Hard Cheese", target: "White Fish", value: 1 }, { source: "Hazelnut", target: "Almond", value: 1 }, { source: "Hazelnut", target: "Apple", value: 1 }, { source: "Hazelnut", target: "Avocado", value: 1 }, { source: "Hazelnut", target: "Banana", value: 1 }, { source: "Hazelnut", target: "Carrot", value: 1 }, { source: "Hazelnut", target: "Caviar", value: 1 }, { source: "Hazelnut", target: "Cherry", value: 1 }, { source: "Hazelnut", target: "Chicken", value: 1 }, { source: "Hazelnut", target: "Chocolate", value: 1 }, { source: "Hazelnut", target: "Coffee", value: 1 }, { source: "Hazelnut", target: "Fig", value: 1 }, { source: "Hazelnut", target: "Garlic", value: 1 }, { source: "Hazelnut", target: "Pear", value: 1 }, { source: "Hazelnut", target: "Raspberry", value: 1 }, { source: "Hazelnut", target: "Rosemary", value: 1 }, { source: "Hazelnut", target: "Strawberry", value: 1 }, { source: "Hazelnut", target: "Vanilla", value: 1 }, { source: "Hazelnut", target: "White Fish", value: 1 }, { source: "Horseradish", target: "Apple", value: 1 }, { source: "Horseradish", target: "Bacon", value: 1 }, { source: "Horseradish", target: "Beef", value: 1 }, { source: "Horseradish", target: "Beet", value: 1 }, { source: "Horseradish", target: "Celery", value: 1 }, { source: "Horseradish", target: "Oily Fish", value: 1 }, { source: "Horseradish", target: "Oyster", value: 1 }, { source: "Horseradish", target: "Pea", value: 1 }, { source: "Horseradish", target: "Potato", value: 1 }, { source: "Horseradish", target: "Smoked Fish", value: 1 }, { source: "Horseradish", target: "Tomato", value: 1 }, { source: "Horseradish", target: "White Fish", value: 1 }, { source: "Juniper", target: "Beef", value: 1 }, { source: "Juniper", target: "Black Currant", value: 1 }, { source: "Juniper", target: "Cabbage", value: 1 }, { source: "Juniper", target: "Grapefruit", value: 1 }, { source: "Juniper", target: "Hard Cheese", value: 1 }, { source: "Juniper", target: "Lemon", value: 1 }, { source: "Juniper", target: "Olive", value: 1 }, { source: "Juniper", target: "Orange", value: 1 }, { source: "Juniper", target: "Pork", value: 1 }, { source: "Juniper", target: "Prosciutto", value: 1 }, { source: "Juniper", target: "Rhubarb", value: 1 }, { source: "Juniper", target: "Sage", value: 1 }, { source: "Lamb", target: "Almond", value: 1 }, { source: "Lamb", target: "Anchovy", value: 1 }, { source: "Lamb", target: "Anise", value: 1 }, { source: "Lamb", target: "Apricot", value: 1 }, { source: "Lamb", target: "Black Pudding", value: 1 }, { source: "Lamb", target: "Cabbage", value: 1 }, { source: "Lamb", target: "Caper", value: 1 }, { source: "Lamb", target: "Cardamom", value: 1 }, { source: "Lamb", target: "Celery", value: 1 }, { source: "Lamb", target: "Cherry", value: 1 }, { source: "Lamb", target: "Chestnut", value: 1 }, { source: "Lamb", target: "Cilantro", value: 1 }, { source: "Lamb", target: "Cinnamon", value: 1 }, { source: "Lamb", target: "Cumin", value: 1 }, { source: "Lamb", target: "Dill", value: 1 }, { source: "Lamb", target: "Eggplant", value: 1 }, { source: "Lamb", target: "Garlic", value: 1 }, { source: "Lamb", target: "Globe Artichoke", value: 1 }, { source: "Lamb", target: "Goat Cheese", value: 1 }, { source: "Lamb", target: "Lemon", value: 1 }, { source: "Lamb", target: "Mint", value: 1 }, { source: "Lamb", target: "Nutmeg", value: 1 }, { source: "Lamb", target: "Onion", value: 1 }, { source: "Lamb", target: "Pea", value: 1 }, { source: "Lamb", target: "Peanut", value: 1 }, { source: "Lamb", target: "Potato", value: 1 }, { source: "Lamb", target: "Rhubarb", value: 1 }, { source: "Lamb", target: "Rosemary", value: 1 }, { source: "Lamb", target: "Rutabaga", value: 1 }, { source: "Lamb", target: "Saffron", value: 1 }, { source: "Lamb", target: "Shellfish", value: 1 }, { source: "Lamb", target: "Thyme", value: 1 }, { source: "Lamb", target: "Tomato", value: 1 }, { source: "Lemon", target: "Almond", value: 1 }, { source: "Lemon", target: "Anchovy", value: 1 }, { source: "Lemon", target: "Anise", value: 1 }, { source: "Lemon", target: "Asparagus", value: 1 }, { source: "Lemon", target: "Basil", value: 1 }, { source: "Lemon", target: "Beef", value: 1 }, { source: "Lemon", target: "Blueberry", value: 1 }, { source: "Lemon", target: "Broccoli", value: 1 }, { source: "Lemon", target: "Caper", value: 1 }, { source: "Lemon", target: "Caviar", value: 1 }, { source: "Lemon", target: "Chicken", value: 1 }, { source: "Lemon", target: "Chili", value: 1 }, { source: "Lemon", target: "Chocolate", value: 1 }, { source: "Lemon", target: "Cilantro", value: 1 }, { source: "Lemon", target: "Coconut", value: 1 }, { source: "Lemon", target: "Coriander Seed", value: 1 }, { source: "Lemon", target: "Cumin", value: 1 }, { source: "Lemon", target: "Dill", value: 1 }, { source: "Lemon", target: "Egg", value: 1 }, { source: "Lemon", target: "Ginger", value: 1 }, { source: "Lemon", target: "Globe Artichoke", value: 1 }, { source: "Lemon", target: "Goat Cheese", value: 1 }, { source: "Lemon", target: "Juniper", value: 1 }, { source: "Lemon", target: "Lamb", value: 1 }, { source: "Lemon", target: "Lime", value: 1 }, { source: "Lemon", target: "Mint", value: 1 }, { source: "Lemon", target: "Oily Fish", value: 1 }, { source: "Lemon", target: "Olive", value: 1 }, { source: "Lemon", target: "Orange", value: 1 }, { source: "Lemon", target: "Oyster", value: 1 }, { source: "Lemon", target: "Parsley", value: 1 }, { source: "Lemon", target: "Potato", value: 1 }, { source: "Lemon", target: "Rose", value: 1 }, { source: "Lemon", target: "Rosemary", value: 1 }, { source: "Lemon", target: "Saffron", value: 1 }, { source: "Lemon", target: "Shellfish", value: 1 }, { source: "Lemon", target: "Smoked Fish", value: 1 }, { source: "Lemon", target: "Thyme", value: 1 }, { source: "Lemon", target: "Tomato", value: 1 }, { source: "Lemon", target: "White Chocolate", value: 1 }, { source: "Lemon", target: "White Fish", value: 1 }, { source: "Lime", target: "Anchovy", value: 1 }, { source: "Lime", target: "Avocado", value: 1 }, { source: "Lime", target: "Basil", value: 1 }, { source: "Lime", target: "Beef", value: 1 }, { source: "Lime", target: "Butternut Squash", value: 1 }, { source: "Lime", target: "Chicken", value: 1 }, { source: "Lime", target: "Chili", value: 1 }, { source: "Lime", target: "Chocolate", value: 1 }, { source: "Lime", target: "Cilantro", value: 1 }, { source: "Lime", target: "Cinnamon", value: 1 }, { source: "Lime", target: "Coconut", value: 1 }, { source: "Lime", target: "Cumin", value: 1 }, { source: "Lime", target: "Ginger", value: 1 }, { source: "Lime", target: "Lemon", value: 1 }, { source: "Lime", target: "Mango", value: 1 }, { source: "Lime", target: "Mint", value: 1 }, { source: "Lime", target: "Oily Fish", value: 1 }, { source: "Lime", target: "Orange", value: 1 }, { source: "Lime", target: "Peanut", value: 1 }, { source: "Lime", target: "Shellfish", value: 1 }, { source: "Lime", target: "Tomato", value: 1 }, { source: "Lime", target: "Watermelon", value: 1 }, { source: "Lime", target: "White Fish", value: 1 }, { source: "Liver", target: "Apple", value: 1 }, { source: "Liver", target: "Bacon", value: 1 }, { source: "Liver", target: "Beef", value: 1 }, { source: "Liver", target: "Beet", value: 1 }, { source: "Liver", target: "Black Pudding", value: 1 }, { source: "Liver", target: "Chili", value: 1 }, { source: "Liver", target: "Fig", value: 1 }, { source: "Liver", target: "Garlic", value: 1 }, { source: "Liver", target: "Oily Fish", value: 1 }, { source: "Liver", target: "Onion", value: 1 }, { source: "Liver", target: "Sage", value: 1 }, { source: "Liver", target: "Truffle", value: 1 }, { source: "Mango", target: "Apple", value: 1 }, { source: "Mango", target: "Apricot", value: 1 }, { source: "Mango", target: "Avocado", value: 1 }, { source: "Mango", target: "Cardamom", value: 1 }, { source: "Mango", target: "Chili", value: 1 }, { source: "Mango", target: "Cilantro", value: 1 }, { source: "Mango", target: "Coconut", value: 1 }, { source: "Mango", target: "Cumin", value: 1 }, { source: "Mango", target: "Ginger", value: 1 }, { source: "Mango", target: "Lime", value: 1 }, { source: "Mango", target: "Mint", value: 1 }, { source: "Mango", target: "Orange", value: 1 }, { source: "Mango", target: "Peach", value: 1 }, { source: "Mango", target: "Pineapple", value: 1 }, { source: "Mango", target: "Rhubarb", value: 1 }, { source: "Mango", target: "Shellfish", value: 1 }, { source: "Mango", target: "White Fish", value: 1 }, { source: "Melon", target: "Almond", value: 1 }, { source: "Melon", target: "Anise", value: 1 }, { source: "Melon", target: "Cucumber", value: 1 }, { source: "Melon", target: "Ginger", value: 1 }, { source: "Melon", target: "Grape", value: 1 }, { source: "Melon", target: "Mint", value: 1 }, { source: "Melon", target: "Orange", value: 1 }, { source: "Melon", target: "Prosciutto", value: 1 }, { source: "Melon", target: "Rose", value: 1 }, { source: "Melon", target: "Strawberry", value: 1 }, { source: "Melon", target: "Watermelon", value: 1 }, { source: "Mint", target: "Anise", value: 1 }, { source: "Mint", target: "Asparagus", value: 1 }, { source: "Mint", target: "Avocado", value: 1 }, { source: "Mint", target: "Basil", value: 1 }, { source: "Mint", target: "Beef", value: 1 }, { source: "Mint", target: "Black Currant", value: 1 }, { source: "Mint", target: "Black Pudding", value: 1 }, { source: "Mint", target: "Chili", value: 1 }, { source: "Mint", target: "Chocolate", value: 1 }, { source: "Mint", target: "Cilantro", value: 1 }, { source: "Mint", target: "Cinnamon", value: 1 }, { source: "Mint", target: "Cucumber", value: 1 }, { source: "Mint", target: "Cumin", value: 1 }, { source: "Mint", target: "Dill", value: 1 }, { source: "Mint", target: "Fig", value: 1 }, { source: "Mint", target: "Garlic", value: 1 }, { source: "Mint", target: "Ginger", value: 1 }, { source: "Mint", target: "Globe Artichoke", value: 1 }, { source: "Mint", target: "Goat Cheese", value: 1 }, { source: "Mint", target: "Lamb", value: 1 }, { source: "Mint", target: "Lemon", value: 1 }, { source: "Mint", target: "Lime", value: 1 }, { source: "Mint", target: "Mango", value: 1 }, { source: "Mint", target: "Melon", value: 1 }, { source: "Mint", target: "Mushroom", value: 1 }, { source: "Mint", target: "Oily Fish", value: 1 }, { source: "Mint", target: "Onion", value: 1 }, { source: "Mint", target: "Orange", value: 1 }, { source: "Mint", target: "Parsley", value: 1 }, { source: "Mint", target: "Pea", value: 1 }, { source: "Mint", target: "Peanut", value: 1 }, { source: "Mint", target: "Potato", value: 1 }, { source: "Mint", target: "Raspberry", value: 1 }, { source: "Mint", target: "Strawberry", value: 1 }, { source: "Mint", target: "Watermelon", value: 1 }, { source: "Mushroom", target: "Anise", value: 1 }, { source: "Mushroom", target: "Apricot", value: 1 }, { source: "Mushroom", target: "Asparagus", value: 1 }, { source: "Mushroom", target: "Bacon", value: 1 }, { source: "Mushroom", target: "Beef", value: 1 }, { source: "Mushroom", target: "Blueberry", value: 1 }, { source: "Mushroom", target: "Blue Cheese", value: 1 }, { source: "Mushroom", target: "Butternut Squash", value: 1 }, { source: "Mushroom", target: "Chestnut", value: 1 }, { source: "Mushroom", target: "Chicken", value: 1 }, { source: "Mushroom", target: "Dill", value: 1 }, { source: "Mushroom", target: "Egg", value: 1 }, { source: "Mushroom", target: "Garlic", value: 1 }, { source: "Mushroom", target: "Goat Cheese", value: 1 }, { source: "Mushroom", target: "Hard Cheese", value: 1 }, { source: "Mushroom", target: "Mint", value: 1 }, { source: "Mushroom", target: "Oily Fish", value: 1 }, { source: "Mushroom", target: "Onion", value: 1 }, { source: "Mushroom", target: "Oyster", value: 1 }, { source: "Mushroom", target: "Parsley", value: 1 }, { source: "Mushroom", target: "Pork", value: 1 }, { source: "Mushroom", target: "Potato", value: 1 }, { source: "Mushroom", target: "Rosemary", value: 1 }, { source: "Mushroom", target: "Shellfish", value: 1 }, { source: "Mushroom", target: "Soft Cheese", value: 1 }, { source: "Mushroom", target: "Thyme", value: 1 }, { source: "Mushroom", target: "Tomato", value: 1 }, { source: "Mushroom", target: "Truffle", value: 1 }, { source: "Mushroom", target: "Walnut", value: 1 }, { source: "Mushroom", target: "White Fish", value: 1 }, { source: "Nutmeg", target: "Apple", value: 1 }, { source: "Nutmeg", target: "Avocado", value: 1 }, { source: "Nutmeg", target: "Butternut Squash", value: 1 }, { source: "Nutmeg", target: "Cabbage", value: 1 }, { source: "Nutmeg", target: "Cauliflower", value: 1 }, { source: "Nutmeg", target: "Celery", value: 1 }, { source: "Nutmeg", target: "Chocolate", value: 1 }, { source: "Nutmeg", target: "Egg", value: 1 }, { source: "Nutmeg", target: "Eggplant", value: 1 }, { source: "Nutmeg", target: "Hard Cheese", value: 1 }, { source: "Nutmeg", target: "Lamb", value: 1 }, { source: "Nutmeg", target: "Onion", value: 1 }, { source: "Nutmeg", target: "Oyster", value: 1 }, { source: "Nutmeg", target: "Parsnip", value: 1 }, { source: "Nutmeg", target: "Potato", value: 1 }, { source: "Nutmeg", target: "Rutabaga", value: 1 }, { source: "Nutmeg", target: "Saffron", value: 1 }, { source: "Nutmeg", target: "Shellfish", value: 1 }, { source: "Nutmeg", target: "Tomato", value: 1 }, { source: "Nutmeg", target: "Vanilla", value: 1 }, { source: "Nutmeg", target: "Walnut", value: 1 }, { source: "Oily Fish", target: "Almond", value: 1 }, { source: "Oily Fish", target: "Anise", value: 1 }, { source: "Oily Fish", target: "Asparagus", value: 1 }, { source: "Oily Fish", target: "Avocado", value: 1 }, { source: "Oily Fish", target: "Beef", value: 1 }, { source: "Oily Fish", target: "Beet", value: 1 }, { source: "Oily Fish", target: "Caper", value: 1 }, { source: "Oily Fish", target: "Chili", value: 1 }, { source: "Oily Fish", target: "Cucumber", value: 1 }, { source: "Oily Fish", target: "Cumin", value: 1 }, { source: "Oily Fish", target: "Dill", value: 1 }, { source: "Oily Fish", target: "Egg", value: 1 }, { source: "Oily Fish", target: "Garlic", value: 1 }, { source: "Oily Fish", target: "Ginger", value: 1 }, { source: "Oily Fish", target: "Horseradish", value: 1 }, { source: "Oily Fish", target: "Lemon", value: 1 }, { source: "Oily Fish", target: "Lime", value: 1 }, { source: "Oily Fish", target: "Liver", value: 1 }, { source: "Oily Fish", target: "Mint", value: 1 }, { source: "Oily Fish", target: "Mushroom", value: 1 }, { source: "Oily Fish", target: "Onion", value: 1 }, { source: "Oily Fish", target: "Parsley", value: 1 }, { source: "Oily Fish", target: "Pea", value: 1 }, { source: "Oily Fish", target: "Pork", value: 1 }, { source: "Oily Fish", target: "Potato", value: 1 }, { source: "Oily Fish", target: "Rhubarb", value: 1 }, { source: "Oily Fish", target: "Rosemary", value: 1 }, { source: "Oily Fish", target: "Shellfish", value: 1 }, { source: "Oily Fish", target: "Thyme", value: 1 }, { source: "Oily Fish", target: "Watercress", value: 1 }, { source: "Olive", target: "Almond", value: 1 }, { source: "Olive", target: "Anchovy", value: 1 }, { source: "Olive", target: "Anise", value: 1 }, { source: "Olive", target: "Beef", value: 1 }, { source: "Olive", target: "Bell Pepper", value: 1 }, { source: "Olive", target: "Caper", value: 1 }, { source: "Olive", target: "Carrot", value: 1 }, { source: "Olive", target: "Chili", value: 1 }, { source: "Olive", target: "Coriander Seed", value: 1 }, { source: "Olive", target: "Garlic", value: 1 }, { source: "Olive", target: "Goat Cheese", value: 1 }, { source: "Olive", target: "Juniper", value: 1 }, { source: "Olive", target: "Lemon", value: 1 }, { source: "Olive", target: "Orange", value: 1 }, { source: "Olive", target: "Potato", value: 1 }, { source: "Olive", target: "Prosciutto", value: 1 }, { source: "Olive", target: "Rosemary", value: 1 }, { source: "Olive", target: "Shellfish", value: 1 }, { source: "Olive", target: "Tomato", value: 1 }, { source: "Olive", target: "Thyme", value: 1 }, { source: "Olive", target: "White Chocolate", value: 1 }, { source: "Olive", target: "White Fish", value: 1 }, { source: "Onion", target: "Anchovy", value: 1 }, { source: "Onion", target: "Bacon", value: 1 }, { source: "Onion", target: "Beef", value: 1 }, { source: "Onion", target: "Beet", value: 1 }, { source: "Onion", target: "Bell Pepper", value: 1 }, { source: "Onion", target: "Black Pudding", value: 1 }, { source: "Onion", target: "Cabbage", value: 1 }, { source: "Onion", target: "Carrot", value: 1 }, { source: "Onion", target: "Celery", value: 1 }, { source: "Onion", target: "Chicken", value: 1 }, { source: "Onion", target: "Clove", value: 1 }, { source: "Onion", target: "Cucumber", value: 1 }, { source: "Onion", target: "Egg", value: 1 }, { source: "Onion", target: "Garlic", value: 1 }, { source: "Onion", target: "Ginger", value: 1 }, { source: "Onion", target: "Hard Cheese", value: 1 }, { source: "Onion", target: "Lamb", value: 1 }, { source: "Onion", target: "Liver", value: 1 }, { source: "Onion", target: "Mint", value: 1 }, { source: "Onion", target: "Mushroom", value: 1 }, { source: "Onion", target: "Nutmeg", value: 1 }, { source: "Onion", target: "Oily Fish", value: 1 }, { source: "Onion", target: "Orange", value: 1 }, { source: "Onion", target: "Oyster", value: 1 }, { source: "Onion", target: "Pea", value: 1 }, { source: "Onion", target: "Pork", value: 1 }, { source: "Onion", target: "Potato", value: 1 }, { source: "Onion", target: "Rosemary", value: 1 }, { source: "Onion", target: "Sage", value: 1 }, { source: "Onion", target: "Smoked Fish", value: 1 }, { source: "Onion", target: "Thyme", value: 1 }, { source: "Onion", target: "Tomato", value: 1 }, { source: "Orange", target: "Almond", value: 1 }, { source: "Orange", target: "Anise", value: 1 }, { source: "Orange", target: "Apple", value: 1 }, { source: "Orange", target: "Apricot", value: 1 }, { source: "Orange", target: "Asparagus", value: 1 }, { source: "Orange", target: "Bacon", value: 1 }, { source: "Orange", target: "Beef", value: 1 }, { source: "Orange", target: "Beet", value: 1 }, { source: "Orange", target: "Carrot", value: 1 }, { source: "Orange", target: "Chili", value: 1 }, { source: "Orange", target: "Chocolate", value: 1 }, { source: "Orange", target: "Cilantro", value: 1 }, { source: "Orange", target: "Cinnamon", value: 1 }, { source: "Orange", target: "Clove", value: 1 }, { source: "Orange", target: "Coffee", value: 1 }, { source: "Orange", target: "Coriander Seed", value: 1 }, { source: "Orange", target: "Fig", value: 1 }, { source: "Orange", target: "Ginger", value: 1 }, { source: "Orange", target: "Grapefruit", value: 1 }, { source: "Orange", target: "Hard Cheese", value: 1 }, { source: "Orange", target: "Juniper", value: 1 }, { source: "Orange", target: "Lemon", value: 1 }, { source: "Orange", target: "Lime", value: 1 }, { source: "Orange", target: "Mango", value: 1 }, { source: "Orange", target: "Melon", value: 1 }, { source: "Orange", target: "Mint", value: 1 }, { source: "Orange", target: "Olive", value: 1 }, { source: "Orange", target: "Onion", value: 1 }, { source: "Orange", target: "Peach", value: 1 }, { source: "Orange", target: "Pineapple", value: 1 }, { source: "Orange", target: "Rhubarb", value: 1 }, { source: "Orange", target: "Rose", value: 1 }, { source: "Orange", target: "Rosemary", value: 1 }, { source: "Orange", target: "Saffron", value: 1 }, { source: "Orange", target: "Strawberry", value: 1 }, { source: "Orange", target: "Thyme", value: 1 }, { source: "Orange", target: "Vanilla", value: 1 }, { source: "Orange", target: "Walnut", value: 1 }, { source: "Orange", target: "Watercress", value: 1 }, { source: "Orange", target: "White Fish", value: 1 }, { source: "Oyster", target: "Anise", value: 1 }, { source: "Oyster", target: "Bacon", value: 1 }, { source: "Oyster", target: "Beef", value: 1 }, { source: "Oyster", target: "Caviar", value: 1 }, { source: "Oyster", target: "Celery", value: 1 }, { source: "Oyster", target: "Chicken", value: 1 }, { source: "Oyster", target: "Chili", value: 1 }, { source: "Oyster", target: "Egg", value: 1 }, { source: "Oyster", target: "Globe Artichoke", value: 1 }, { source: "Oyster", target: "Horseradish", value: 1 }, { source: "Oyster", target: "Lemon", value: 1 }, { source: "Oyster", target: "Mushroom", value: 1 }, { source: "Oyster", target: "Nutmeg", value: 1 }, { source: "Oyster", target: "Onion", value: 1 }, { source: "Oyster", target: "Parsley", value: 1 }, { source: "Oyster", target: "Pork", value: 1 }, { source: "Oyster", target: "Watermelon", value: 1 }, { source: "Parsley", target: "Bacon", value: 1 }, { source: "Parsley", target: "Beef", value: 1 }, { source: "Parsley", target: "Caper", value: 1 }, { source: "Parsley", target: "Carrot", value: 1 }, { source: "Parsley", target: "Cilantro", value: 1 }, { source: "Parsley", target: "Egg", value: 1 }, { source: "Parsley", target: "Garlic", value: 1 }, { source: "Parsley", target: "Lemon", value: 1 }, { source: "Parsley", target: "Mint", value: 1 }, { source: "Parsley", target: "Mushroom", value: 1 }, { source: "Parsley", target: "Oily Fish", value: 1 }, { source: "Parsley", target: "Oyster", value: 1 }, { source: "Parsley", target: "Potato", value: 1 }, { source: "Parsley", target: "Shellfish", value: 1 }, { source: "Parsley", target: "Smoked Fish", value: 1 }, { source: "Parsley", target: "Walnut", value: 1 }, { source: "Parsley", target: "White Fish", value: 1 }, { source: "Parsnip", target: "Anise", value: 1 }, { source: "Parsnip", target: "Bacon", value: 1 }, { source: "Parsnip", target: "Banana", value: 1 }, { source: "Parsnip", target: "Beef", value: 1 }, { source: "Parsnip", target: "Chicken", value: 1 }, { source: "Parsnip", target: "Hard Cheese", value: 1 }, { source: "Parsnip", target: "Nutmeg", value: 1 }, { source: "Parsnip", target: "Pea", value: 1 }, { source: "Parsnip", target: "Pork", value: 1 }, { source: "Parsnip", target: "Potato", value: 1 }, { source: "Parsnip", target: "Shellfish", value: 1 }, { source: "Parsnip", target: "Walnut", value: 1 }, { source: "Parsnip", target: "Watercress", value: 1 }, { source: "Parsnip", target: "White Fish", value: 1 }, { source: "Pea", target: "Anise", value: 1 }, { source: "Pea", target: "Asparagus", value: 1 }, { source: "Pea", target: "Bacon", value: 1 }, { source: "Pea", target: "Beef", value: 1 }, { source: "Pea", target: "Chicken", value: 1 }, { source: "Pea", target: "Dill", value: 1 }, { source: "Pea", target: "Egg", value: 1 }, { source: "Pea", target: "Globe Artichoke", value: 1 }, { source: "Pea", target: "Hard Cheese", value: 1 }, { source: "Pea", target: "Horseradish", value: 1 }, { source: "Pea", target: "Lamb", value: 1 }, { source: "Pea", target: "Mint", value: 1 }, { source: "Pea", target: "Oily Fish", value: 1 }, { source: "Pea", target: "Onion", value: 1 }, { source: "Pea", target: "Parsnip", value: 1 }, { source: "Pea", target: "Pork", value: 1 }, { source: "Pea", target: "Potato", value: 1 }, { source: "Pea", target: "Prosciutto", value: 1 }, { source: "Pea", target: "Rosemary", value: 1 }, { source: "Pea", target: "Shellfish", value: 1 }, { source: "Pea", target: "Smoked Fish", value: 1 }, { source: "Pea", target: "White Fish", value: 1 }, { source: "Peach", target: "Almond", value: 1 }, { source: "Peach", target: "Apricot", value: 1 }, { source: "Peach", target: "Blackberry", value: 1 }, { source: "Peach", target: "Blueberry", value: 1 }, { source: "Peach", target: "Blue Cheese", value: 1 }, { source: "Peach", target: "Cherry", value: 1 }, { source: "Peach", target: "Clove", value: 1 }, { source: "Peach", target: "Grape", value: 1 }, { source: "Peach", target: "Mango", value: 1 }, { source: "Peach", target: "Orange", value: 1 }, { source: "Peach", target: "Prosciutto", value: 1 }, { source: "Peach", target: "Raspberry", value: 1 }, { source: "Peach", target: "Strawberry", value: 1 }, { source: "Peach", target: "Vanilla", value: 1 }, { source: "Peanut", target: "Apple", value: 1 }, { source: "Peanut", target: "Asparagus", value: 1 }, { source: "Peanut", target: "Banana", value: 1 }, { source: "Peanut", target: "Beef", value: 1 }, { source: "Peanut", target: "Black Currant", value: 1 }, { source: "Peanut", target: "Broccoli", value: 1 }, { source: "Peanut", target: "Carrot", value: 1 }, { source: "Peanut", target: "Celery", value: 1 }, { source: "Peanut", target: "Chicken", value: 1 }, { source: "Peanut", target: "Chili", value: 1 }, { source: "Peanut", target: "Chocolate", value: 1 }, { source: "Peanut", target: "Cilantro", value: 1 }, { source: "Peanut", target: "Cinnamon", value: 1 }, { source: "Peanut", target: "Coconut", value: 1 }, { source: "Peanut", target: "Cucumber", value: 1 }, { source: "Peanut", target: "Grape", value: 1 }, { source: "Peanut", target: "Lamb", value: 1 }, { source: "Peanut", target: "Lime", value: 1 }, { source: "Peanut", target: "Mint", value: 1 }, { source: "Peanut", target: "Pork", value: 1 }, { source: "Peanut", target: "Potato", value: 1 }, { source: "Peanut", target: "Shellfish", value: 1 }, { source: "Peanut", target: "Tomato", value: 1 }, { source: "Peanut", target: "Vanilla", value: 1 }, { source: "Pear", target: "Almond", value: 1 }, { source: "Pear", target: "Anise", value: 1 }, { source: "Pear", target: "Apple", value: 1 }, { source: "Pear", target: "Banana", value: 1 }, { source: "Pear", target: "Beef", value: 1 }, { source: "Pear", target: "Blue Cheese", value: 1 }, { source: "Pear", target: "Cardamom", value: 1 }, { source: "Pear", target: "Chestnut", value: 1 }, { source: "Pear", target: "Chicken", value: 1 }, { source: "Pear", target: "Chocolate", value: 1 }, { source: "Pear", target: "Cinnamon", value: 1 }, { source: "Pear", target: "Goat Cheese", value: 1 }, { source: "Pear", target: "Hard Cheese", value: 1 }, { source: "Pear", target: "Hazelnut", value: 1 }, { source: "Pear", target: "Pork", value: 1 }, { source: "Pear", target: "Prosciutto", value: 1 }, { source: "Pear", target: "Walnut", value: 1 }, { source: "Pear", target: "Washed-rind Cheese", value: 1 }, { source: "Pineapple", target: "Anchovy", value: 1 }, { source: "Pineapple", target: "Anise", value: 1 }, { source: "Pineapple", target: "Apple", value: 1 }, { source: "Pineapple", target: "Avocado", value: 1 }, { source: "Pineapple", target: "Bacon", value: 1 }, { source: "Pineapple", target: "Banana", value: 1 }, { source: "Pineapple", target: "Blue Cheese", value: 1 }, { source: "Pineapple", target: "Chili", value: 1 }, { source: "Pineapple", target: "Chocolate", value: 1 }, { source: "Pineapple", target: "Cilantro", value: 1 }, { source: "Pineapple", target: "Cinnamon", value: 1 }, { source: "Pineapple", target: "Coconut", value: 1 }, { source: "Pineapple", target: "Grape", value: 1 }, { source: "Pineapple", target: "Grapefruit", value: 1 }, { source: "Pineapple", target: "Hard Cheese", value: 1 }, { source: "Pineapple", target: "Mango", value: 1 }, { source: "Pineapple", target: "Orange", value: 1 }, { source: "Pineapple", target: "Pork", value: 1 }, { source: "Pineapple", target: "Prosciutto", value: 1 }, { source: "Pineapple", target: "Raspberry", value: 1 }, { source: "Pineapple", target: "Sage", value: 1 }, { source: "Pineapple", target: "Shellfish", value: 1 }, { source: "Pineapple", target: "Strawberry", value: 1 }, { source: "Pineapple", target: "Vanilla", value: 1 }, { source: "Pineapple", target: "White Chocolate", value: 1 }, { source: "Pork", target: "Anise", value: 1 }, { source: "Pork", target: "Apple", value: 1 }, { source: "Pork", target: "Apricot", value: 1 }, { source: "Pork", target: "Bacon", value: 1 }, { source: "Pork", target: "Beef", value: 1 }, { source: "Pork", target: "Beet", value: 1 }, { source: "Pork", target: "Black Pudding", value: 1 }, { source: "Pork", target: "Broccoli", value: 1 }, { source: "Pork", target: "Butternut Squash", value: 1 }, { source: "Pork", target: "Cabbage", value: 1 }, { source: "Pork", target: "Celery", value: 1 }, { source: "Pork", target: "Chestnut", value: 1 }, { source: "Pork", target: "Chili", value: 1 }, { source: "Pork", target: "Cilantro", value: 1 }, { source: "Pork", target: "Cinnamon", value: 1 }, { source: "Pork", target: "Clove", value: 1 }, { source: "Pork", target: "Coconut", value: 1 }, { source: "Pork", target: "Coriander Seed", value: 1 }, { source: "Pork", target: "Cucumber", value: 1 }, { source: "Pork", target: "Cumin", value: 1 }, { source: "Pork", target: "Dill", value: 1 }, { source: "Pork", target: "Egg", value: 1 }, { source: "Pork", target: "Garlic", value: 1 }, { source: "Pork", target: "Ginger", value: 1 }, { source: "Pork", target: "Globe Artichoke", value: 1 }, { source: "Pork", target: "Grape", value: 1 }, { source: "Pork", target: "Grapefruit", value: 1 }, { source: "Pork", target: "Juniper", value: 1 }, { source: "Pork", target: "Mushroom", value: 1 }, { source: "Pork", target: "Oily Fish", value: 1 }, { source: "Pork", target: "Onion", value: 1 }, { source: "Pork", target: "Oyster", value: 1 }, { source: "Pork", target: "Parsnip", value: 1 }, { source: "Pork", target: "Pea", value: 1 }, { source: "Pork", target: "Peanut", value: 1 }, { source: "Pork", target: "Pear", value: 1 }, { source: "Pork", target: "Pineapple", value: 1 }, { source: "Pork", target: "Potato", value: 1 }, { source: "Pork", target: "Rhubarb", value: 1 }, { source: "Pork", target: "Rosemary", value: 1 }, { source: "Pork", target: "Rutabaga", value: 1 }, { source: "Pork", target: "Sage", value: 1 }, { source: "Pork", target: "Shellfish", value: 1 }, { source: "Pork", target: "Thyme", value: 1 }, { source: "Pork", target: "Tomato", value: 1 }, { source: "Pork", target: "Truffle", value: 1 }, { source: "Pork", target: "Watercress", value: 1 }, { source: "Pork", target: "Watermelon", value: 1 }, { source: "Potato", target: "Anchovy", value: 1 }, { source: "Potato", target: "Asparagus", value: 1 }, { source: "Potato", target: "Bacon", value: 1 }, { source: "Potato", target: "Beef", value: 1 }, { source: "Potato", target: "Beet", value: 1 }, { source: "Potato", target: "Black Pudding", value: 1 }, { source: "Potato", target: "Cabbage", value: 1 }, { source: "Potato", target: "Caper", value: 1 }, { source: "Potato", target: "Cauliflower", value: 1 }, { source: "Potato", target: "Caviar", value: 1 }, { source: "Potato", target: "Celery", value: 1 }, { source: "Potato", target: "Chicken", value: 1 }, { source: "Potato", target: "Chili", value: 1 }, { source: "Potato", target: "Cilantro", value: 1 }, { source: "Potato", target: "Cumin", value: 1 }, { source: "Potato", target: "Dill", value: 1 }, { source: "Potato", target: "Egg", value: 1 }, { source: "Potato", target: "Garlic", value: 1 }, { source: "Potato", target: "Globe Artichoke", value: 1 }, { source: "Potato", target: "Hard Cheese", value: 1 }, { source: "Potato", target: "Horseradish", value: 1 }, { source: "Potato", target: "Lamb", value: 1 }, { source: "Potato", target: "Lemon", value: 1 }, { source: "Potato", target: "Mint", value: 1 }, { source: "Potato", target: "Mushroom", value: 1 }, { source: "Potato", target: "Nutmeg", value: 1 }, { source: "Potato", target: "Oily Fish", value: 1 }, { source: "Potato", target: "Olive", value: 1 }, { source: "Potato", target: "Onion", value: 1 }, { source: "Potato", target: "Parsley", value: 1 }, { source: "Potato", target: "Parsnip", value: 1 }, { source: "Potato", target: "Pea", value: 1 }, { source: "Potato", target: "Peanut", value: 1 }, { source: "Potato", target: "Pork", value: 1 }, { source: "Potato", target: "Rosemary", value: 1 }, { source: "Potato", target: "Rutabaga", value: 1 }, { source: "Potato", target: "Saffron", value: 1 }, { source: "Potato", target: "Shellfish", value: 1 }, { source: "Potato", target: "Smoked Fish", value: 1 }, { source: "Potato", target: "Tomato", value: 1 }, { source: "Potato", target: "Truffle", value: 1 }, { source: "Potato", target: "Washed-rind Cheese", value: 1 }, { source: "Potato", target: "Watercress", value: 1 }, { source: "Potato", target: "White Fish", value: 1 }, { source: "Prosciutto", target: "Asparagus", value: 1 }, { source: "Prosciutto", target: "Celery", value: 1 }, { source: "Prosciutto", target: "Chestnut", value: 1 }, { source: "Prosciutto", target: "Egg", value: 1 }, { source: "Prosciutto", target: "Eggplant", value: 1 }, { source: "Prosciutto", target: "Fig", value: 1 }, { source: "Prosciutto", target: "Globe Artichoke", value: 1 }, { source: "Prosciutto", target: "Juniper", value: 1 }, { source: "Prosciutto", target: "Melon", value: 1 }, { source: "Prosciutto", target: "Olive", value: 1 }, { source: "Prosciutto", target: "Pea", value: 1 }, { source: "Prosciutto", target: "Peach", value: 1 }, { source: "Prosciutto", target: "Pear", value: 1 }, { source: "Prosciutto", target: "Pineapple", value: 1 }, { source: "Prosciutto", target: "Sage", value: 1 }, { source: "Prosciutto", target: "Tomato", value: 1 }, { source: "Prosciutto", target: "White Fish", value: 1 }, { source: "Raspberry", target: "Almond", value: 1 }, { source: "Raspberry", target: "Apricot", value: 1 }, { source: "Raspberry", target: "Basil", value: 1 }, { source: "Raspberry", target: "Blackberry", value: 1 }, { source: "Raspberry", target: "Chocolate", value: 1 }, { source: "Raspberry", target: "Coconut", value: 1 }, { source: "Raspberry", target: "Fig", value: 1 }, { source: "Raspberry", target: "Goat Cheese", value: 1 }, { source: "Raspberry", target: "Hazelnut", value: 1 }, { source: "Raspberry", target: "Mint", value: 1 }, { source: "Raspberry", target: "Peach", value: 1 }, { source: "Raspberry", target: "Pineapple", value: 1 }, { source: "Raspberry", target: "Strawberry", value: 1 }, { source: "Raspberry", target: "Vanilla", value: 1 }, { source: "Raspberry", target: "White Chocolate", value: 1 }, { source: "Rhubarb", target: "Almond", value: 1 }, { source: "Rhubarb", target: "Anise", value: 1 }, { source: "Rhubarb", target: "Black Pudding", value: 1 }, { source: "Rhubarb", target: "Cucumber", value: 1 }, { source: "Rhubarb", target: "Ginger", value: 1 }, { source: "Rhubarb", target: "Juniper", value: 1 }, { source: "Rhubarb", target: "Lamb", value: 1 }, { source: "Rhubarb", target: "Mango", value: 1 }, { source: "Rhubarb", target: "Oily Fish", value: 1 }, { source: "Rhubarb", target: "Orange", value: 1 }, { source: "Rhubarb", target: "Pork", value: 1 }, { source: "Rhubarb", target: "Rosemary", value: 1 }, { source: "Rhubarb", target: "Saffron", value: 1 }, { source: "Rhubarb", target: "Strawberry", value: 1 }, { source: "Rhubarb", target: "Vanilla", value: 1 }, { source: "Rose", target: "Almond", value: 1 }, { source: "Rose", target: "Apple", value: 1 }, { source: "Rose", target: "Apricot", value: 1 }, { source: "Rose", target: "Cardamom", value: 1 }, { source: "Rose", target: "Chicken", value: 1 }, { source: "Rose", target: "Chocolate", value: 1 }, { source: "Rose", target: "Coffee", value: 1 }, { source: "Rose", target: "Cucumber", value: 1 }, { source: "Rose", target: "Lemon", value: 1 }, { source: "Rose", target: "Melon", value: 1 }, { source: "Rose", target: "Orange", value: 1 }, { source: "Rose", target: "Saffron", value: 1 }, { source: "Rosemary", target: "Almond", value: 1 }, { source: "Rosemary", target: "Anchovy", value: 1 }, { source: "Rosemary", target: "Apricot", value: 1 }, { source: "Rosemary", target: "Butternut Squash", value: 1 }, { source: "Rosemary", target: "Chestnut", value: 1 }, { source: "Rosemary", target: "Chocolate", value: 1 }, { source: "Rosemary", target: "Garlic", value: 1 }, { source: "Rosemary", target: "Goat Cheese", value: 1 }, { source: "Rosemary", target: "Grape", value: 1 }, { source: "Rosemary", target: "Hazelnut", value: 1 }, { source: "Rosemary", target: "Lamb", value: 1 }, { source: "Rosemary", target: "Lemon", value: 1 }, { source: "Rosemary", target: "Mushroom", value: 1 }, { source: "Rosemary", target: "Oily Fish", value: 1 }, { source: "Rosemary", target: "Olive", value: 1 }, { source: "Rosemary", target: "Onion", value: 1 }, { source: "Rosemary", target: "Orange", value: 1 }, { source: "Rosemary", target: "Pea", value: 1 }, { source: "Rosemary", target: "Pork", value: 1 }, { source: "Rosemary", target: "Potato", value: 1 }, { source: "Rosemary", target: "Rhubarb", value: 1 }, { source: "Rosemary", target: "Watermelon", value: 1 }, { source: "Rutabaga", target: "Anise", value: 1 }, { source: "Rutabaga", target: "Beef", value: 1 }, { source: "Rutabaga", target: "Carrot", value: 1 }, { source: "Rutabaga", target: "Lamb", value: 1 }, { source: "Rutabaga", target: "Nutmeg", value: 1 }, { source: "Rutabaga", target: "Pork", value: 1 }, { source: "Rutabaga", target: "Potato", value: 1 }, { source: "Saffron", target: "Almond", value: 1 }, { source: "Saffron", target: "Anise", value: 1 }, { source: "Saffron", target: "Cardamom", value: 1 }, { source: "Saffron", target: "Cauliflower", value: 1 }, { source: "Saffron", target: "Chicken", value: 1 }, { source: "Saffron", target: "Lamb", value: 1 }, { source: "Saffron", target: "Lemon", value: 1 }, { source: "Saffron", target: "Nutmeg", value: 1 }, { source: "Saffron", target: "Orange", value: 1 }, { source: "Saffron", target: "Potato", value: 1 }, { source: "Saffron", target: "Rhubarb", value: 1 }, { source: "Saffron", target: "Rose", value: 1 }, { source: "Saffron", target: "Shellfish", value: 1 }, { source: "Saffron", target: "White Chocolate", value: 1 }, { source: "Saffron", target: "White Fish", value: 1 }, { source: "Sage", target: "Anchovy", value: 1 }, { source: "Sage", target: "Apple", value: 1 }, { source: "Sage", target: "Bacon", value: 1 }, { source: "Sage", target: "Blue Cheese", value: 1 }, { source: "Sage", target: "Butternut Squash", value: 1 }, { source: "Sage", target: "Chicken", value: 1 }, { source: "Sage", target: "Egg", value: 1 }, { source: "Sage", target: "Hard Cheese", value: 1 }, { source: "Sage", target: "Juniper", value: 1 }, { source: "Sage", target: "Liver", value: 1 }, { source: "Sage", target: "Onion", value: 1 }, { source: "Sage", target: "Pineapple", value: 1 }, { source: "Sage", target: "Pork", value: 1 }, { source: "Sage", target: "Prosciutto", value: 1 }, { source: "Sage", target: "Tomato", value: 1 }, { source: "Shellfish", target: "Almond", value: 1 }, { source: "Shellfish", target: "Anise", value: 1 }, { source: "Shellfish", target: "Apple", value: 1 }, { source: "Shellfish", target: "Asparagus", value: 1 }, { source: "Shellfish", target: "Avocado", value: 1 }, { source: "Shellfish", target: "Bacon", value: 1 }, { source: "Shellfish", target: "Basil", value: 1 }, { source: "Shellfish", target: "Beef", value: 1 }, { source: "Shellfish", target: "Bell Pepper", value: 1 }, { source: "Shellfish", target: "Black Pudding", value: 1 }, { source: "Shellfish", target: "Butternut Squash", value: 1 }, { source: "Shellfish", target: "Cabbage", value: 1 }, { source: "Shellfish", target: "Caper", value: 1 }, { source: "Shellfish", target: "Cauliflower", value: 1 }, { source: "Shellfish", target: "Celery", value: 1 }, { source: "Shellfish", target: "Chicken", value: 1 }, { source: "Shellfish", target: "Chili", value: 1 }, { source: "Shellfish", target: "Cilantro", value: 1 }, { source: "Shellfish", target: "Coconut", value: 1 }, { source: "Shellfish", target: "Cucumber", value: 1 }, { source: "Shellfish", target: "Cumin", value: 1 }, { source: "Shellfish", target: "Dill", value: 1 }, { source: "Shellfish", target: "Egg", value: 1 }, { source: "Shellfish", target: "Garlic", value: 1 }, { source: "Shellfish", target: "Globe Artichoke", value: 1 }, { source: "Shellfish", target: "Grapefruit", value: 1 }, { source: "Shellfish", target: "Hard Cheese", value: 1 }, { source: "Shellfish", target: "Lamb", value: 1 }, { source: "Shellfish", target: "Lemon", value: 1 }, { source: "Shellfish", target: "Lime", value: 1 }, { source: "Shellfish", target: "Mango", value: 1 }, { source: "Shellfish", target: "Mushroom", value: 1 }, { source: "Shellfish", target: "Nutmeg", value: 1 }, { source: "Shellfish", target: "Olive", value: 1 }, { source: "Shellfish", target: "Parsley", value: 1 }, { source: "Shellfish", target: "Parsnip", value: 1 }, { source: "Shellfish", target: "Pea", value: 1 }, { source: "Shellfish", target: "Peanut", value: 1 }, { source: "Shellfish", target: "Pineapple", value: 1 }, { source: "Shellfish", target: "Pork", value: 1 }, { source: "Shellfish", target: "Potato", value: 1 }, { source: "Shellfish", target: "Saffron", value: 1 }, { source: "Shellfish", target: "Smoked Fish", value: 1 }, { source: "Shellfish", target: "Thyme", value: 1 }, { source: "Shellfish", target: "Tomato", value: 1 }, { source: "Shellfish", target: "Truffle", value: 1 }, { source: "Shellfish", target: "Vanilla", value: 1 }, { source: "Shellfish", target: "Walnut", value: 1 }, { source: "Shellfish", target: "Watercress", value: 1 }, { source: "Shellfish", target: "White Fish", value: 1 }, { source: "Smoked Fish", target: "Cabbage", value: 1 }, { source: "Smoked Fish", target: "Caper", value: 1 }, { source: "Smoked Fish", target: "Caviar", value: 1 }, { source: "Smoked Fish", target: "Cherry", value: 1 }, { source: "Smoked Fish", target: "Coconut", value: 1 }, { source: "Smoked Fish", target: "Dill", value: 1 }, { source: "Smoked Fish", target: "Egg", value: 1 }, { source: "Smoked Fish", target: "Horseradish", value: 1 }, { source: "Smoked Fish", target: "Lemon", value: 1 }, { source: "Smoked Fish", target: "Onion", value: 1 }, { source: "Smoked Fish", target: "Parsley", value: 1 }, { source: "Smoked Fish", target: "Pea", value: 1 }, { source: "Smoked Fish", target: "Potato", value: 1 }, { source: "Smoked Fish", target: "Shellfish", value: 1 }, { source: "Smoked Fish", target: "Watercress", value: 1 }, { source: "Soft Cheese", target: "Anchovy", value: 1 }, { source: "Soft Cheese", target: "Apple", value: 1 }, { source: "Soft Cheese", target: "Avocado", value: 1 }, { source: "Soft Cheese", target: "Basil", value: 1 }, { source: "Soft Cheese", target: "Bell Pepper", value: 1 }, { source: "Soft Cheese", target: "Black Currant", value: 1 }, { source: "Soft Cheese", target: "Caper", value: 1 }, { source: "Soft Cheese", target: "Caviar", value: 1 }, { source: "Soft Cheese", target: "Celery", value: 1 }, { source: "Soft Cheese", target: "Cinnamon", value: 1 }, { source: "Soft Cheese", target: "Eggplant", value: 1 }, { source: "Soft Cheese", target: "Fig", value: 1 }, { source: "Soft Cheese", target: "Garlic", value: 1 }, { source: "Soft Cheese", target: "Grape", value: 1 }, { source: "Soft Cheese", target: "Mushroom", value: 1 }, { source: "Soft Cheese", target: "Smoked Fish", value: 1 }, { source: "Soft Cheese", target: "Strawberry", value: 1 }, { source: "Soft Cheese", target: "Tomato", value: 1 }, { source: "Soft Cheese", target: "Truffle", value: 1 }, { source: "Soft Cheese", target: "Walnut", value: 1 }, { source: "Strawberry", target: "Almond", value: 1 }, { source: "Strawberry", target: "Anise", value: 1 }, { source: "Strawberry", target: "Avocado", value: 1 }, { source: "Strawberry", target: "Chocolate", value: 1 }, { source: "Strawberry", target: "Cinnamon", value: 1 }, { source: "Strawberry", target: "Coconut", value: 1 }, { source: "Strawberry", target: "Cucumber", value: 1 }, { source: "Strawberry", target: "Grape", value: 1 }, { source: "Strawberry", target: "Hazelnut", value: 1 }, { source: "Strawberry", target: "Melon", value: 1 }, { source: "Strawberry", target: "Mint", value: 1 }, { source: "Strawberry", target: "Orange", value: 1 }, { source: "Strawberry", target: "Peach", value: 1 }, { source: "Strawberry", target: "Pineapple", value: 1 }, { source: "Strawberry", target: "Raspberry", value: 1 }, { source: "Strawberry", target: "Rhubarb", value: 1 }, { source: "Strawberry", target: "Soft Cheese", value: 1 }, { source: "Strawberry", target: "Tomato", value: 1 }, { source: "Strawberry", target: "Vanilla", value: 1 }, { source: "Strawberry", target: "White Chocolate", value: 1 }, { source: "Thyme", target: "Bacon", value: 1 }, { source: "Thyme", target: "Beef", value: 1 }, { source: "Thyme", target: "Chicken", value: 1 }, { source: "Thyme", target: "Chocolate", value: 1 }, { source: "Thyme", target: "Cinnamon", value: 1 }, { source: "Thyme", target: "Garlic", value: 1 }, { source: "Thyme", target: "Goat Cheese", value: 1 }, { source: "Thyme", target: "Lamb", value: 1 }, { source: "Thyme", target: "Lemon", value: 1 }, { source: "Thyme", target: "Mushroom", value: 1 }, { source: "Thyme", target: "Oily Fish", value: 1 }, { source: "Thyme", target: "Olive", value: 1 }, { source: "Thyme", target: "Onion", value: 1 }, { source: "Thyme", target: "Orange", value: 1 }, { source: "Thyme", target: "Pork", value: 1 }, { source: "Thyme", target: "Shellfish", value: 1 }, { source: "Thyme", target: "Tomato", value: 1 }, { source: "Thyme", target: "White Fish", value: 1 }, { source: "Tomato", target: "Anchovy", value: 1 }, { source: "Tomato", target: "Anise", value: 1 }, { source: "Tomato", target: "Avocado", value: 1 }, { source: "Tomato", target: "Bacon", value: 1 }, { source: "Tomato", target: "Basil", value: 1 }, { source: "Tomato", target: "Beef", value: 1 }, { source: "Tomato", target: "Bell Pepper", value: 1 }, { source: "Tomato", target: "Caper", value: 1 }, { source: "Tomato", target: "Chicken", value: 1 }, { source: "Tomato", target: "Chili", value: 1 }, { source: "Tomato", target: "Chocolate", value: 1 }, { source: "Tomato", target: "Cilantro", value: 1 }, { source: "Tomato", target: "Cinnamon", value: 1 }, { source: "Tomato", target: "Clove", value: 1 }, { source: "Tomato", target: "Cucumber", value: 1 }, { source: "Tomato", target: "Egg", value: 1 }, { source: "Tomato", target: "Eggplant", value: 1 }, { source: "Tomato", target: "Garlic", value: 1 }, { source: "Tomato", target: "Ginger", value: 1 }, { source: "Tomato", target: "Hard Cheese", value: 1 }, { source: "Tomato", target: "Horseradish", value: 1 }, { source: "Tomato", target: "Lamb", value: 1 }, { source: "Tomato", target: "Lemon", value: 1 }, { source: "Tomato", target: "Lime", value: 1 }, { source: "Tomato", target: "Mushroom", value: 1 }, { source: "Tomato", target: "Nutmeg", value: 1 }, { source: "Tomato", target: "Olive", value: 1 }, { source: "Tomato", target: "Onion", value: 1 }, { source: "Tomato", target: "Peanut", value: 1 }, { source: "Tomato", target: "Pork", value: 1 }, { source: "Tomato", target: "Potato", value: 1 }, { source: "Tomato", target: "Prosciutto", value: 1 }, { source: "Tomato", target: "Sage", value: 1 }, { source: "Tomato", target: "Shellfish", value: 1 }, { source: "Tomato", target: "Soft Cheese", value: 1 }, { source: "Tomato", target: "Strawberry", value: 1 }, { source: "Tomato", target: "Thyme", value: 1 }, { source: "Tomato", target: "Vanilla", value: 1 }, { source: "Tomato", target: "Watermelon", value: 1 }, { source: "Tomato", target: "White Fish", value: 1 }, { source: "Truffle", target: "Asparagus", value: 1 }, { source: "Truffle", target: "Bacon", value: 1 }, { source: "Truffle", target: "Beef", value: 1 }, { source: "Truffle", target: "Blue Cheese", value: 1 }, { source: "Truffle", target: "Cabbage", value: 1 }, { source: "Truffle", target: "Cauliflower", value: 1 }, { source: "Truffle", target: "Celery", value: 1 }, { source: "Truffle", target: "Chicken", value: 1 }, { source: "Truffle", target: "Egg", value: 1 }, { source: "Truffle", target: "Garlic", value: 1 }, { source: "Truffle", target: "Globe Artichoke", value: 1 }, { source: "Truffle", target: "Liver", value: 1 }, { source: "Truffle", target: "Mushroom", value: 1 }, { source: "Truffle", target: "Pork", value: 1 }, { source: "Truffle", target: "Potato", value: 1 }, { source: "Truffle", target: "Shellfish", value: 1 }, { source: "Truffle", target: "Soft Cheese", value: 1 }, { source: "Vanilla", target: "Anise", value: 1 }, { source: "Vanilla", target: "Apple", value: 1 }, { source: "Vanilla", target: "Apricot", value: 1 }, { source: "Vanilla", target: "Banana", value: 1 }, { source: "Vanilla", target: "Blackberry", value: 1 }, { source: "Vanilla", target: "Blueberry", value: 1 }, { source: "Vanilla", target: "Cardamom", value: 1 }, { source: "Vanilla", target: "Cherry", value: 1 }, { source: "Vanilla", target: "Chestnut", value: 1 }, { source: "Vanilla", target: "Chocolate", value: 1 }, { source: "Vanilla", target: "Clove", value: 1 }, { source: "Vanilla", target: "Coconut", value: 1 }, { source: "Vanilla", target: "Coffee", value: 1 }, { source: "Vanilla", target: "Egg", value: 1 }, { source: "Vanilla", target: "Fig", value: 1 }, { source: "Vanilla", target: "Ginger", value: 1 }, { source: "Vanilla", target: "Hazelnut", value: 1 }, { source: "Vanilla", target: "Nutmeg", value: 1 }, { source: "Vanilla", target: "Orange", value: 1 }, { source: "Vanilla", target: "Peach", value: 1 }, { source: "Vanilla", target: "Peanut", value: 1 }, { source: "Vanilla", target: "Pineapple", value: 1 }, { source: "Vanilla", target: "Raspberry", value: 1 }, { source: "Vanilla", target: "Rhubarb", value: 1 }, { source: "Vanilla", target: "Shellfish", value: 1 }, { source: "Vanilla", target: "Strawberry", value: 1 }, { source: "Vanilla", target: "Tomato", value: 1 }, { source: "Vanilla", target: "Walnut", value: 1 }, { source: "Walnut", target: "Anise", value: 1 }, { source: "Walnut", target: "Apple", value: 1 }, { source: "Walnut", target: "Banana", value: 1 }, { source: "Walnut", target: "Basil", value: 1 }, { source: "Walnut", target: "Beef", value: 1 }, { source: "Walnut", target: "Beet", value: 1 }, { source: "Walnut", target: "Blue Cheese", value: 1 }, { source: "Walnut", target: "Broccoli", value: 1 }, { source: "Walnut", target: "Carrot", value: 1 }, { source: "Walnut", target: "Cauliflower", value: 1 }, { source: "Walnut", target: "Celery", value: 1 }, { source: "Walnut", target: "Cherry", value: 1 }, { source: "Walnut", target: "Chicken", value: 1 }, { source: "Walnut", target: "Chili", value: 1 }, { source: "Walnut", target: "Chocolate", value: 1 }, { source: "Walnut", target: "Cinnamon", value: 1 }, { source: "Walnut", target: "Coffee", value: 1 }, { source: "Walnut", target: "Eggplant", value: 1 }, { source: "Walnut", target: "Fig", value: 1 }, { source: "Walnut", target: "Garlic", value: 1 }, { source: "Walnut", target: "Goat Cheese", value: 1 }, { source: "Walnut", target: "Grape", value: 1 }, { source: "Walnut", target: "Hard Cheese", value: 1 }, { source: "Walnut", target: "Mushroom", value: 1 }, { source: "Walnut", target: "Nutmeg", value: 1 }, { source: "Walnut", target: "Orange", value: 1 }, { source: "Walnut", target: "Parsley", value: 1 }, { source: "Walnut", target: "Parsnip", value: 1 }, { source: "Walnut", target: "Pear", value: 1 }, { source: "Walnut", target: "Shellfish", value: 1 }, { source: "Walnut", target: "Soft Cheese", value: 1 }, { source: "Walnut", target: "Vanilla", value: 1 }, { source: "Walnut", target: "Washed-rind Cheese", value: 1 }, { source: "Walnut", target: "Watercress", value: 1 }, { source: "Washed-rind Cheese", target: "Anise", value: 1 }, { source: "Washed-rind Cheese", target: "Apple", value: 1 }, { source: "Washed-rind Cheese", target: "Bacon", value: 1 }, { source: "Washed-rind Cheese", target: "Cumin", value: 1 }, { source: "Washed-rind Cheese", target: "Garlic", value: 1 }, { source: "Washed-rind Cheese", target: "Pear", value: 1 }, { source: "Washed-rind Cheese", target: "Potato", value: 1 }, { source: "Washed-rind Cheese", target: "Walnut", value: 1 }, { source: "Watercress", target: "Anchovy", value: 1 }, { source: "Watercress", target: "Beef", value: 1 }, { source: "Watercress", target: "Beet", value: 1 }, { source: "Watercress", target: "Blue Cheese", value: 1 }, { source: "Watercress", target: "Chicken", value: 1 }, { source: "Watercress", target: "Egg", value: 1 }, { source: "Watercress", target: "Goat Cheese", value: 1 }, { source: "Watercress", target: "Grapefruit", value: 1 }, { source: "Watercress", target: "Oily Fish", value: 1 }, { source: "Watercress", target: "Orange", value: 1 }, { source: "Watercress", target: "Parsnip", value: 1 }, { source: "Watercress", target: "Pork", value: 1 }, { source: "Watercress", target: "Potato", value: 1 }, { source: "Watercress", target: "Shellfish", value: 1 }, { source: "Watercress", target: "Smoked Fish", value: 1 }, { source: "Watercress", target: "Walnut", value: 1 }, { source: "Watermelon", target: "Chili", value: 1 }, { source: "Watermelon", target: "Chocolate", value: 1 }, { source: "Watermelon", target: "Cilantro", value: 1 }, { source: "Watermelon", target: "Cinnamon", value: 1 }, { source: "Watermelon", target: "Cucumber", value: 1 }, { source: "Watermelon", target: "Goat Cheese", value: 1 }, { source: "Watermelon", target: "Lime", value: 1 }, { source: "Watermelon", target: "Melon", value: 1 }, { source: "Watermelon", target: "Mint", value: 1 }, { source: "Watermelon", target: "Oyster", value: 1 }, { source: "Watermelon", target: "Pork", value: 1 }, { source: "Watermelon", target: "Rosemary", value: 1 }, { source: "Watermelon", target: "Tomato", value: 1 }, { source: "White Chocolate", target: "Almond", value: 1 }, { source: "White Chocolate", target: "Blackberry", value: 1 }, { source: "White Chocolate", target: "Cardamom", value: 1 }, { source: "White Chocolate", target: "Caviar", value: 1 }, { source: "White Chocolate", target: "Chocolate", value: 1 }, { source: "White Chocolate", target: "Coconut", value: 1 }, { source: "White Chocolate", target: "Coffee", value: 1 }, { source: "White Chocolate", target: "Lemon", value: 1 }, { source: "White Chocolate", target: "Olive", value: 1 }, { source: "White Chocolate", target: "Pineapple", value: 1 }, { source: "White Chocolate", target: "Raspberry", value: 1 }, { source: "White Chocolate", target: "Saffron", value: 1 }, { source: "White Chocolate", target: "Strawberry", value: 1 }, { source: "White Fish", target: "Anchovy", value: 1 }, { source: "White Fish", target: "Anise", value: 1 }, { source: "White Fish", target: "Asparagus", value: 1 }, { source: "White Fish", target: "Bacon", value: 1 }, { source: "White Fish", target: "Caper", value: 1 }, { source: "White Fish", target: "Celery", value: 1 }, { source: "White Fish", target: "Cilantro", value: 1 }, { source: "White Fish", target: "Coconut", value: 1 }, { source: "White Fish", target: "Cucumber", value: 1 }, { source: "White Fish", target: "Dill", value: 1 }, { source: "White Fish", target: "Garlic", value: 1 }, { source: "White Fish", target: "Ginger", value: 1 }, { source: "White Fish", target: "Grape", value: 1 }, { source: "White Fish", target: "Hard Cheese", value: 1 }, { source: "White Fish", target: "Hazelnut", value: 1 }, { source: "White Fish", target: "Horseradish", value: 1 }, { source: "White Fish", target: "Lemon", value: 1 }, { source: "White Fish", target: "Lime", value: 1 }, { source: "White Fish", target: "Mango", value: 1 }, { source: "White Fish", target: "Mushroom", value: 1 }, { source: "White Fish", target: "Olive", value: 1 }, { source: "White Fish", target: "Orange", value: 1 }, { source: "White Fish", target: "Parsley", value: 1 }, { source: "White Fish", target: "Parsnip", value: 1 }, { source: "White Fish", target: "Pea", value: 1 }, { source: "White Fish", target: "Potato", value: 1 }, { source: "White Fish", target: "Prosciutto", value: 1 }, { source: "White Fish", target: "Saffron", value: 1 }, { source: "White Fish", target: "Shellfish", value: 1 }, { source: "White Fish", target: "Thyme", value: 1 }, { source: "White Fish", target: "Tomato", value: 1 }]
};

// scripts/index.ts
var import_circular = __toESM(require_circular(), 1);
var import_worker = __toESM(require_worker(), 1);

// node:events
var a = typeof Reflect == "object" ? Reflect : null;
var d = a && typeof a.apply == "function" ? a.apply : function(e, n, r) {
  return Function.prototype.apply.call(e, n, r);
};
var l;
a && typeof a.ownKeys == "function" ? l = a.ownKeys : Object.getOwnPropertySymbols ? l = function(e) {
  return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
} : l = function(e) {
  return Object.getOwnPropertyNames(e);
};
function x(t) {
  console && console.warn && console.warn(t);
}
var L = Number.isNaN || function(e) {
  return e !== e;
};
function o() {
  o.init.call(this);
}
o.EventEmitter = o;
o.prototype._events = undefined;
o.prototype._eventsCount = 0;
o.prototype._maxListeners = undefined;
var h = 10;
function v(t) {
  if (typeof t != "function")
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof t);
}
Object.defineProperty(o, "defaultMaxListeners", { enumerable: true, get: function() {
  return h;
}, set: function(t) {
  if (typeof t != "number" || t < 0 || L(t))
    throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + t + ".");
  h = t;
} });
o.init = function() {
  (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) && (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || undefined;
};
o.prototype.setMaxListeners = function(e) {
  if (typeof e != "number" || e < 0 || L(e))
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
  return this._maxListeners = e, this;
};
function m(t) {
  return t._maxListeners === undefined ? o.defaultMaxListeners : t._maxListeners;
}
o.prototype.getMaxListeners = function() {
  return m(this);
};
o.prototype.emit = function(e) {
  for (var n = [], r = 1;r < arguments.length; r++)
    n.push(arguments[r]);
  var i = e === "error", f = this._events;
  if (f !== undefined)
    i = i && f.error === undefined;
  else if (!i)
    return false;
  if (i) {
    var s;
    if (n.length > 0 && (s = n[0]), s instanceof Error)
      throw s;
    var u = new Error("Unhandled error." + (s ? " (" + s.message + ")" : ""));
    throw u.context = s, u;
  }
  var c = f[e];
  if (c === undefined)
    return false;
  if (typeof c == "function")
    d(c, this, n);
  else
    for (var p = c.length, O = b(c, p), r = 0;r < p; ++r)
      d(O[r], this, n);
  return true;
};
function y(t, e, n, r) {
  var i, f, s;
  if (v(n), f = t._events, f === undefined ? (f = t._events = Object.create(null), t._eventsCount = 0) : (f.newListener !== undefined && (t.emit("newListener", e, n.listener ? n.listener : n), f = t._events), s = f[e]), s === undefined)
    s = f[e] = n, ++t._eventsCount;
  else if (typeof s == "function" ? s = f[e] = r ? [n, s] : [s, n] : r ? s.unshift(n) : s.push(n), i = m(t), i > 0 && s.length > i && !s.warned) {
    s.warned = true;
    var u = new Error("Possible EventEmitter memory leak detected. " + s.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
    u.name = "MaxListenersExceededWarning", u.emitter = t, u.type = e, u.count = s.length, x(u);
  }
  return t;
}
o.prototype.addListener = function(e, n) {
  return y(this, e, n, false);
};
o.prototype.on = o.prototype.addListener;
o.prototype.prependListener = function(e, n) {
  return y(this, e, n, true);
};
function C() {
  if (!this.fired)
    return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
}
function g(t, e, n) {
  var r = { fired: false, wrapFn: undefined, target: t, type: e, listener: n }, i = C.bind(r);
  return i.listener = n, r.wrapFn = i, i;
}
o.prototype.once = function(e, n) {
  return v(n), this.on(e, g(this, e, n)), this;
};
o.prototype.prependOnceListener = function(e, n) {
  return v(n), this.prependListener(e, g(this, e, n)), this;
};
o.prototype.removeListener = function(e, n) {
  var r, i, f, s, u;
  if (v(n), i = this._events, i === undefined)
    return this;
  if (r = i[e], r === undefined)
    return this;
  if (r === n || r.listener === n)
    --this._eventsCount === 0 ? this._events = Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, r.listener || n));
  else if (typeof r != "function") {
    for (f = -1, s = r.length - 1;s >= 0; s--)
      if (r[s] === n || r[s].listener === n) {
        u = r[s].listener, f = s;
        break;
      }
    if (f < 0)
      return this;
    f === 0 ? r.shift() : j(r, f), r.length === 1 && (i[e] = r[0]), i.removeListener !== undefined && this.emit("removeListener", e, u || n);
  }
  return this;
};
o.prototype.off = o.prototype.removeListener;
o.prototype.removeAllListeners = function(e) {
  var n, r, i;
  if (r = this._events, r === undefined)
    return this;
  if (r.removeListener === undefined)
    return arguments.length === 0 ? (this._events = Object.create(null), this._eventsCount = 0) : r[e] !== undefined && (--this._eventsCount === 0 ? this._events = Object.create(null) : delete r[e]), this;
  if (arguments.length === 0) {
    var f = Object.keys(r), s;
    for (i = 0;i < f.length; ++i)
      s = f[i], s !== "removeListener" && this.removeAllListeners(s);
    return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this;
  }
  if (n = r[e], typeof n == "function")
    this.removeListener(e, n);
  else if (n !== undefined)
    for (i = n.length - 1;i >= 0; i--)
      this.removeListener(e, n[i]);
  return this;
};
function _(t, e, n) {
  var r = t._events;
  if (r === undefined)
    return [];
  var i = r[e];
  return i === undefined ? [] : typeof i == "function" ? n ? [i.listener || i] : [i] : n ? R(i) : b(i, i.length);
}
o.prototype.listeners = function(e) {
  return _(this, e, true);
};
o.prototype.rawListeners = function(e) {
  return _(this, e, false);
};
o.listenerCount = function(t, e) {
  return typeof t.listenerCount == "function" ? t.listenerCount(e) : w.call(t, e);
};
o.prototype.listenerCount = w;
function w(t) {
  var e = this._events;
  if (e !== undefined) {
    var n = e[t];
    if (typeof n == "function")
      return 1;
    if (n !== undefined)
      return n.length;
  }
  return 0;
}
o.prototype.eventNames = function() {
  return this._eventsCount > 0 ? l(this._events) : [];
};
function b(t, e) {
  for (var n = new Array(e), r = 0;r < e; ++r)
    n[r] = t[r];
  return n;
}
function j(t, e) {
  for (;e + 1 < t.length; e++)
    t[e] = t[e + 1];
  t.pop();
}
function R(t) {
  for (var e = new Array(t.length), n = 0;n < e.length; ++n)
    e[n] = t[n].listener || t[n];
  return e;
}
var P = o.prototype;

// node_modules/graphology/dist/graphology.mjs
function assignPolyfill() {
  const target = arguments[0];
  for (let i = 1, l2 = arguments.length;i < l2; i++) {
    if (!arguments[i])
      continue;
    for (const k in arguments[i])
      target[k] = arguments[i][k];
  }
  return target;
}
var assign = assignPolyfill;
if (typeof Object.assign === "function")
  assign = Object.assign;
function getMatchingEdge(graph, source, target, type) {
  const sourceData = graph._nodes.get(source);
  let edge = null;
  if (!sourceData)
    return edge;
  if (type === "mixed") {
    edge = sourceData.out && sourceData.out[target] || sourceData.undirected && sourceData.undirected[target];
  } else if (type === "directed") {
    edge = sourceData.out && sourceData.out[target];
  } else {
    edge = sourceData.undirected && sourceData.undirected[target];
  }
  return edge;
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null;
}
function isEmpty(o2) {
  let k;
  for (k in o2)
    return false;
  return true;
}
function privateProperty(target, name, value) {
  Object.defineProperty(target, name, {
    enumerable: false,
    configurable: false,
    writable: true,
    value
  });
}
function readOnlyProperty(target, name, value) {
  const descriptor = {
    enumerable: true,
    configurable: true
  };
  if (typeof value === "function") {
    descriptor.get = value;
  } else {
    descriptor.value = value;
    descriptor.writable = false;
  }
  Object.defineProperty(target, name, descriptor);
}
function validateHints(hints) {
  if (!isPlainObject(hints))
    return false;
  if (hints.attributes && !Array.isArray(hints.attributes))
    return false;
  return true;
}
function incrementalIdStartingFromRandomByte() {
  let i = Math.floor(Math.random() * 256) & 255;
  return () => {
    return i++;
  };
}
function chain() {
  const iterables = arguments;
  let current = null;
  let i = -1;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      let step = null;
      do {
        if (current === null) {
          i++;
          if (i >= iterables.length)
            return { done: true };
          current = iterables[i][Symbol.iterator]();
        }
        step = current.next();
        if (step.done) {
          current = null;
          continue;
        }
        break;
      } while (true);
      return step;
    }
  };
}
function emptyIterator() {
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      return { done: true };
    }
  };
}

class GraphError extends Error {
  constructor(message) {
    super();
    this.name = "GraphError";
    this.message = message;
  }
}

class InvalidArgumentsGraphError extends GraphError {
  constructor(message) {
    super(message);
    this.name = "InvalidArgumentsGraphError";
    if (typeof Error.captureStackTrace === "function")
      Error.captureStackTrace(this, InvalidArgumentsGraphError.prototype.constructor);
  }
}

class NotFoundGraphError extends GraphError {
  constructor(message) {
    super(message);
    this.name = "NotFoundGraphError";
    if (typeof Error.captureStackTrace === "function")
      Error.captureStackTrace(this, NotFoundGraphError.prototype.constructor);
  }
}

class UsageGraphError extends GraphError {
  constructor(message) {
    super(message);
    this.name = "UsageGraphError";
    if (typeof Error.captureStackTrace === "function")
      Error.captureStackTrace(this, UsageGraphError.prototype.constructor);
  }
}
function MixedNodeData(key, attributes) {
  this.key = key;
  this.attributes = attributes;
  this.clear();
}
MixedNodeData.prototype.clear = function() {
  this.inDegree = 0;
  this.outDegree = 0;
  this.undirectedDegree = 0;
  this.undirectedLoops = 0;
  this.directedLoops = 0;
  this.in = {};
  this.out = {};
  this.undirected = {};
};
function DirectedNodeData(key, attributes) {
  this.key = key;
  this.attributes = attributes;
  this.clear();
}
DirectedNodeData.prototype.clear = function() {
  this.inDegree = 0;
  this.outDegree = 0;
  this.directedLoops = 0;
  this.in = {};
  this.out = {};
};
function UndirectedNodeData(key, attributes) {
  this.key = key;
  this.attributes = attributes;
  this.clear();
}
UndirectedNodeData.prototype.clear = function() {
  this.undirectedDegree = 0;
  this.undirectedLoops = 0;
  this.undirected = {};
};
function EdgeData(undirected, key, source, target, attributes) {
  this.key = key;
  this.attributes = attributes;
  this.undirected = undirected;
  this.source = source;
  this.target = target;
}
EdgeData.prototype.attach = function() {
  let outKey = "out";
  let inKey = "in";
  if (this.undirected)
    outKey = inKey = "undirected";
  const source = this.source.key;
  const target = this.target.key;
  this.source[outKey][target] = this;
  if (this.undirected && source === target)
    return;
  this.target[inKey][source] = this;
};
EdgeData.prototype.attachMulti = function() {
  let outKey = "out";
  let inKey = "in";
  const source = this.source.key;
  const target = this.target.key;
  if (this.undirected)
    outKey = inKey = "undirected";
  const adj = this.source[outKey];
  const head = adj[target];
  if (typeof head === "undefined") {
    adj[target] = this;
    if (!(this.undirected && source === target)) {
      this.target[inKey][source] = this;
    }
    return;
  }
  head.previous = this;
  this.next = head;
  adj[target] = this;
  this.target[inKey][source] = this;
};
EdgeData.prototype.detach = function() {
  const source = this.source.key;
  const target = this.target.key;
  let outKey = "out";
  let inKey = "in";
  if (this.undirected)
    outKey = inKey = "undirected";
  delete this.source[outKey][target];
  delete this.target[inKey][source];
};
EdgeData.prototype.detachMulti = function() {
  const source = this.source.key;
  const target = this.target.key;
  let outKey = "out";
  let inKey = "in";
  if (this.undirected)
    outKey = inKey = "undirected";
  if (this.previous === undefined) {
    if (this.next === undefined) {
      delete this.source[outKey][target];
      delete this.target[inKey][source];
    } else {
      this.next.previous = undefined;
      this.source[outKey][target] = this.next;
      this.target[inKey][source] = this.next;
    }
  } else {
    this.previous.next = this.next;
    if (this.next !== undefined) {
      this.next.previous = this.previous;
    }
  }
};
var NODE = 0;
var SOURCE = 1;
var TARGET = 2;
var OPPOSITE = 3;
function findRelevantNodeData(graph, method, mode, nodeOrEdge, nameOrEdge, add1, add2) {
  let nodeData, edgeData, arg1, arg2;
  nodeOrEdge = "" + nodeOrEdge;
  if (mode === NODE) {
    nodeData = graph._nodes.get(nodeOrEdge);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.${method}: could not find the "${nodeOrEdge}" node in the graph.`);
    arg1 = nameOrEdge;
    arg2 = add1;
  } else if (mode === OPPOSITE) {
    nameOrEdge = "" + nameOrEdge;
    edgeData = graph._edges.get(nameOrEdge);
    if (!edgeData)
      throw new NotFoundGraphError(`Graph.${method}: could not find the "${nameOrEdge}" edge in the graph.`);
    const source = edgeData.source.key;
    const target = edgeData.target.key;
    if (nodeOrEdge === source) {
      nodeData = edgeData.target;
    } else if (nodeOrEdge === target) {
      nodeData = edgeData.source;
    } else {
      throw new NotFoundGraphError(`Graph.${method}: the "${nodeOrEdge}" node is not attached to the "${nameOrEdge}" edge (${source}, ${target}).`);
    }
    arg1 = add1;
    arg2 = add2;
  } else {
    edgeData = graph._edges.get(nodeOrEdge);
    if (!edgeData)
      throw new NotFoundGraphError(`Graph.${method}: could not find the "${nodeOrEdge}" edge in the graph.`);
    if (mode === SOURCE) {
      nodeData = edgeData.source;
    } else {
      nodeData = edgeData.target;
    }
    arg1 = nameOrEdge;
    arg2 = add1;
  }
  return [nodeData, arg1, arg2];
}
function attachNodeAttributeGetter(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1) {
    const [data, name] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1);
    return data.attributes[name];
  };
}
function attachNodeAttributesGetter(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge) {
    const [data] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge);
    return data.attributes;
  };
}
function attachNodeAttributeChecker(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1) {
    const [data, name] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1);
    return data.attributes.hasOwnProperty(name);
  };
}
function attachNodeAttributeSetter(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1, add2) {
    const [data, name, value] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1, add2);
    data.attributes[name] = value;
    this.emit("nodeAttributesUpdated", {
      key: data.key,
      type: "set",
      attributes: data.attributes,
      name
    });
    return this;
  };
}
function attachNodeAttributeUpdater(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1, add2) {
    const [data, name, updater] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1, add2);
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError(`Graph.${method}: updater should be a function.`);
    const attributes = data.attributes;
    const value = updater(attributes[name]);
    attributes[name] = value;
    this.emit("nodeAttributesUpdated", {
      key: data.key,
      type: "set",
      attributes: data.attributes,
      name
    });
    return this;
  };
}
function attachNodeAttributeRemover(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1) {
    const [data, name] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1);
    delete data.attributes[name];
    this.emit("nodeAttributesUpdated", {
      key: data.key,
      type: "remove",
      attributes: data.attributes,
      name
    });
    return this;
  };
}
function attachNodeAttributesReplacer(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1) {
    const [data, attributes] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1);
    if (!isPlainObject(attributes))
      throw new InvalidArgumentsGraphError(`Graph.${method}: provided attributes are not a plain object.`);
    data.attributes = attributes;
    this.emit("nodeAttributesUpdated", {
      key: data.key,
      type: "replace",
      attributes: data.attributes
    });
    return this;
  };
}
function attachNodeAttributesMerger(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1) {
    const [data, attributes] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1);
    if (!isPlainObject(attributes))
      throw new InvalidArgumentsGraphError(`Graph.${method}: provided attributes are not a plain object.`);
    assign(data.attributes, attributes);
    this.emit("nodeAttributesUpdated", {
      key: data.key,
      type: "merge",
      attributes: data.attributes,
      data: attributes
    });
    return this;
  };
}
function attachNodeAttributesUpdater(Class, method, mode) {
  Class.prototype[method] = function(nodeOrEdge, nameOrEdge, add1) {
    const [data, updater] = findRelevantNodeData(this, method, mode, nodeOrEdge, nameOrEdge, add1);
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError(`Graph.${method}: provided updater is not a function.`);
    data.attributes = updater(data.attributes);
    this.emit("nodeAttributesUpdated", {
      key: data.key,
      type: "update",
      attributes: data.attributes
    });
    return this;
  };
}
var NODE_ATTRIBUTES_METHODS = [
  {
    name: (element) => `get${element}Attribute`,
    attacher: attachNodeAttributeGetter
  },
  {
    name: (element) => `get${element}Attributes`,
    attacher: attachNodeAttributesGetter
  },
  {
    name: (element) => `has${element}Attribute`,
    attacher: attachNodeAttributeChecker
  },
  {
    name: (element) => `set${element}Attribute`,
    attacher: attachNodeAttributeSetter
  },
  {
    name: (element) => `update${element}Attribute`,
    attacher: attachNodeAttributeUpdater
  },
  {
    name: (element) => `remove${element}Attribute`,
    attacher: attachNodeAttributeRemover
  },
  {
    name: (element) => `replace${element}Attributes`,
    attacher: attachNodeAttributesReplacer
  },
  {
    name: (element) => `merge${element}Attributes`,
    attacher: attachNodeAttributesMerger
  },
  {
    name: (element) => `update${element}Attributes`,
    attacher: attachNodeAttributesUpdater
  }
];
function attachNodeAttributesMethods(Graph) {
  NODE_ATTRIBUTES_METHODS.forEach(function({ name, attacher }) {
    attacher(Graph, name("Node"), NODE);
    attacher(Graph, name("Source"), SOURCE);
    attacher(Graph, name("Target"), TARGET);
    attacher(Graph, name("Opposite"), OPPOSITE);
  });
}
function attachEdgeAttributeGetter(Class, method, type) {
  Class.prototype[method] = function(element, name) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 2) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element;
      const target = "" + name;
      name = arguments[2];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    return data.attributes[name];
  };
}
function attachEdgeAttributesGetter(Class, method, type) {
  Class.prototype[method] = function(element) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 1) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element, target = "" + arguments[1];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    return data.attributes;
  };
}
function attachEdgeAttributeChecker(Class, method, type) {
  Class.prototype[method] = function(element, name) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 2) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element;
      const target = "" + name;
      name = arguments[2];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    return data.attributes.hasOwnProperty(name);
  };
}
function attachEdgeAttributeSetter(Class, method, type) {
  Class.prototype[method] = function(element, name, value) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 3) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element;
      const target = "" + name;
      name = arguments[2];
      value = arguments[3];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    data.attributes[name] = value;
    this.emit("edgeAttributesUpdated", {
      key: data.key,
      type: "set",
      attributes: data.attributes,
      name
    });
    return this;
  };
}
function attachEdgeAttributeUpdater(Class, method, type) {
  Class.prototype[method] = function(element, name, updater) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 3) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element;
      const target = "" + name;
      name = arguments[2];
      updater = arguments[3];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError(`Graph.${method}: updater should be a function.`);
    data.attributes[name] = updater(data.attributes[name]);
    this.emit("edgeAttributesUpdated", {
      key: data.key,
      type: "set",
      attributes: data.attributes,
      name
    });
    return this;
  };
}
function attachEdgeAttributeRemover(Class, method, type) {
  Class.prototype[method] = function(element, name) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 2) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element;
      const target = "" + name;
      name = arguments[2];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    delete data.attributes[name];
    this.emit("edgeAttributesUpdated", {
      key: data.key,
      type: "remove",
      attributes: data.attributes,
      name
    });
    return this;
  };
}
function attachEdgeAttributesReplacer(Class, method, type) {
  Class.prototype[method] = function(element, attributes) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 2) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element, target = "" + attributes;
      attributes = arguments[2];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    if (!isPlainObject(attributes))
      throw new InvalidArgumentsGraphError(`Graph.${method}: provided attributes are not a plain object.`);
    data.attributes = attributes;
    this.emit("edgeAttributesUpdated", {
      key: data.key,
      type: "replace",
      attributes: data.attributes
    });
    return this;
  };
}
function attachEdgeAttributesMerger(Class, method, type) {
  Class.prototype[method] = function(element, attributes) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 2) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element, target = "" + attributes;
      attributes = arguments[2];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    if (!isPlainObject(attributes))
      throw new InvalidArgumentsGraphError(`Graph.${method}: provided attributes are not a plain object.`);
    assign(data.attributes, attributes);
    this.emit("edgeAttributesUpdated", {
      key: data.key,
      type: "merge",
      attributes: data.attributes,
      data: attributes
    });
    return this;
  };
}
function attachEdgeAttributesUpdater(Class, method, type) {
  Class.prototype[method] = function(element, updater) {
    let data;
    if (this.type !== "mixed" && type !== "mixed" && type !== this.type)
      throw new UsageGraphError(`Graph.${method}: cannot find this type of edges in your ${this.type} graph.`);
    if (arguments.length > 2) {
      if (this.multi)
        throw new UsageGraphError(`Graph.${method}: cannot use a {source,target} combo when asking about an edge's attributes in a MultiGraph since we cannot infer the one you want information about.`);
      const source = "" + element, target = "" + updater;
      updater = arguments[2];
      data = getMatchingEdge(this, source, target, type);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find an edge for the given path ("${source}" - "${target}").`);
    } else {
      if (type !== "mixed")
        throw new UsageGraphError(`Graph.${method}: calling this method with only a key (vs. a source and target) does not make sense since an edge with this key could have the other type.`);
      element = "" + element;
      data = this._edges.get(element);
      if (!data)
        throw new NotFoundGraphError(`Graph.${method}: could not find the "${element}" edge in the graph.`);
    }
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError(`Graph.${method}: provided updater is not a function.`);
    data.attributes = updater(data.attributes);
    this.emit("edgeAttributesUpdated", {
      key: data.key,
      type: "update",
      attributes: data.attributes
    });
    return this;
  };
}
var EDGE_ATTRIBUTES_METHODS = [
  {
    name: (element) => `get${element}Attribute`,
    attacher: attachEdgeAttributeGetter
  },
  {
    name: (element) => `get${element}Attributes`,
    attacher: attachEdgeAttributesGetter
  },
  {
    name: (element) => `has${element}Attribute`,
    attacher: attachEdgeAttributeChecker
  },
  {
    name: (element) => `set${element}Attribute`,
    attacher: attachEdgeAttributeSetter
  },
  {
    name: (element) => `update${element}Attribute`,
    attacher: attachEdgeAttributeUpdater
  },
  {
    name: (element) => `remove${element}Attribute`,
    attacher: attachEdgeAttributeRemover
  },
  {
    name: (element) => `replace${element}Attributes`,
    attacher: attachEdgeAttributesReplacer
  },
  {
    name: (element) => `merge${element}Attributes`,
    attacher: attachEdgeAttributesMerger
  },
  {
    name: (element) => `update${element}Attributes`,
    attacher: attachEdgeAttributesUpdater
  }
];
function attachEdgeAttributesMethods(Graph) {
  EDGE_ATTRIBUTES_METHODS.forEach(function({ name, attacher }) {
    attacher(Graph, name("Edge"), "mixed");
    attacher(Graph, name("DirectedEdge"), "directed");
    attacher(Graph, name("UndirectedEdge"), "undirected");
  });
}
var EDGES_ITERATION = [
  {
    name: "edges",
    type: "mixed"
  },
  {
    name: "inEdges",
    type: "directed",
    direction: "in"
  },
  {
    name: "outEdges",
    type: "directed",
    direction: "out"
  },
  {
    name: "inboundEdges",
    type: "mixed",
    direction: "in"
  },
  {
    name: "outboundEdges",
    type: "mixed",
    direction: "out"
  },
  {
    name: "directedEdges",
    type: "directed"
  },
  {
    name: "undirectedEdges",
    type: "undirected"
  }
];
function forEachSimple(breakable, object, callback, avoid) {
  let shouldBreak = false;
  for (const k in object) {
    if (k === avoid)
      continue;
    const edgeData = object[k];
    shouldBreak = callback(edgeData.key, edgeData.attributes, edgeData.source.key, edgeData.target.key, edgeData.source.attributes, edgeData.target.attributes, edgeData.undirected);
    if (breakable && shouldBreak)
      return edgeData.key;
  }
  return;
}
function forEachMulti(breakable, object, callback, avoid) {
  let edgeData, source, target;
  let shouldBreak = false;
  for (const k in object) {
    if (k === avoid)
      continue;
    edgeData = object[k];
    do {
      source = edgeData.source;
      target = edgeData.target;
      shouldBreak = callback(edgeData.key, edgeData.attributes, source.key, target.key, source.attributes, target.attributes, edgeData.undirected);
      if (breakable && shouldBreak)
        return edgeData.key;
      edgeData = edgeData.next;
    } while (edgeData !== undefined);
  }
  return;
}
function createIterator(object, avoid) {
  const keys = Object.keys(object);
  const l2 = keys.length;
  let edgeData;
  let i = 0;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      do {
        if (!edgeData) {
          if (i >= l2)
            return { done: true };
          const k = keys[i++];
          if (k === avoid) {
            edgeData = undefined;
            continue;
          }
          edgeData = object[k];
        } else {
          edgeData = edgeData.next;
        }
      } while (!edgeData);
      return {
        done: false,
        value: {
          edge: edgeData.key,
          attributes: edgeData.attributes,
          source: edgeData.source.key,
          target: edgeData.target.key,
          sourceAttributes: edgeData.source.attributes,
          targetAttributes: edgeData.target.attributes,
          undirected: edgeData.undirected
        }
      };
    }
  };
}
function forEachForKeySimple(breakable, object, k, callback) {
  const edgeData = object[k];
  if (!edgeData)
    return;
  const sourceData = edgeData.source;
  const targetData = edgeData.target;
  if (callback(edgeData.key, edgeData.attributes, sourceData.key, targetData.key, sourceData.attributes, targetData.attributes, edgeData.undirected) && breakable)
    return edgeData.key;
}
function forEachForKeyMulti(breakable, object, k, callback) {
  let edgeData = object[k];
  if (!edgeData)
    return;
  let shouldBreak = false;
  do {
    shouldBreak = callback(edgeData.key, edgeData.attributes, edgeData.source.key, edgeData.target.key, edgeData.source.attributes, edgeData.target.attributes, edgeData.undirected);
    if (breakable && shouldBreak)
      return edgeData.key;
    edgeData = edgeData.next;
  } while (edgeData !== undefined);
  return;
}
function createIteratorForKey(object, k) {
  let edgeData = object[k];
  if (edgeData.next !== undefined) {
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        if (!edgeData)
          return { done: true };
        const value = {
          edge: edgeData.key,
          attributes: edgeData.attributes,
          source: edgeData.source.key,
          target: edgeData.target.key,
          sourceAttributes: edgeData.source.attributes,
          targetAttributes: edgeData.target.attributes,
          undirected: edgeData.undirected
        };
        edgeData = edgeData.next;
        return {
          done: false,
          value
        };
      }
    };
  }
  let done = false;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      if (done === true)
        return { done: true };
      done = true;
      return {
        done: false,
        value: {
          edge: edgeData.key,
          attributes: edgeData.attributes,
          source: edgeData.source.key,
          target: edgeData.target.key,
          sourceAttributes: edgeData.source.attributes,
          targetAttributes: edgeData.target.attributes,
          undirected: edgeData.undirected
        }
      };
    }
  };
}
function createEdgeArray(graph, type) {
  if (graph.size === 0)
    return [];
  if (type === "mixed" || type === graph.type) {
    return Array.from(graph._edges.keys());
  }
  const size = type === "undirected" ? graph.undirectedSize : graph.directedSize;
  const list = new Array(size), mask = type === "undirected";
  const iterator = graph._edges.values();
  let i = 0;
  let step, data;
  while (step = iterator.next(), step.done !== true) {
    data = step.value;
    if (data.undirected === mask)
      list[i++] = data.key;
  }
  return list;
}
function forEachEdge(breakable, graph, type, callback) {
  if (graph.size === 0)
    return;
  const shouldFilter = type !== "mixed" && type !== graph.type;
  const mask = type === "undirected";
  let step, data;
  let shouldBreak = false;
  const iterator = graph._edges.values();
  while (step = iterator.next(), step.done !== true) {
    data = step.value;
    if (shouldFilter && data.undirected !== mask)
      continue;
    const { key, attributes, source, target } = data;
    shouldBreak = callback(key, attributes, source.key, target.key, source.attributes, target.attributes, data.undirected);
    if (breakable && shouldBreak)
      return key;
  }
  return;
}
function createEdgeIterator(graph, type) {
  if (graph.size === 0)
    return emptyIterator();
  const shouldFilter = type !== "mixed" && type !== graph.type;
  const mask = type === "undirected";
  const iterator = graph._edges.values();
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      let step, data;
      while (true) {
        step = iterator.next();
        if (step.done)
          return step;
        data = step.value;
        if (shouldFilter && data.undirected !== mask)
          continue;
        break;
      }
      const value = {
        edge: data.key,
        attributes: data.attributes,
        source: data.source.key,
        target: data.target.key,
        sourceAttributes: data.source.attributes,
        targetAttributes: data.target.attributes,
        undirected: data.undirected
      };
      return { value, done: false };
    }
  };
}
function forEachEdgeForNode(breakable, multi, type, direction, nodeData, callback) {
  const fn = multi ? forEachMulti : forEachSimple;
  let found;
  if (type !== "undirected") {
    if (direction !== "out") {
      found = fn(breakable, nodeData.in, callback);
      if (breakable && found)
        return found;
    }
    if (direction !== "in") {
      found = fn(breakable, nodeData.out, callback, !direction ? nodeData.key : undefined);
      if (breakable && found)
        return found;
    }
  }
  if (type !== "directed") {
    found = fn(breakable, nodeData.undirected, callback);
    if (breakable && found)
      return found;
  }
  return;
}
function createEdgeArrayForNode(multi, type, direction, nodeData) {
  const edges = [];
  forEachEdgeForNode(false, multi, type, direction, nodeData, function(key) {
    edges.push(key);
  });
  return edges;
}
function createEdgeIteratorForNode(type, direction, nodeData) {
  let iterator = emptyIterator();
  if (type !== "undirected") {
    if (direction !== "out" && typeof nodeData.in !== "undefined")
      iterator = chain(iterator, createIterator(nodeData.in));
    if (direction !== "in" && typeof nodeData.out !== "undefined")
      iterator = chain(iterator, createIterator(nodeData.out, !direction ? nodeData.key : undefined));
  }
  if (type !== "directed" && typeof nodeData.undirected !== "undefined") {
    iterator = chain(iterator, createIterator(nodeData.undirected));
  }
  return iterator;
}
function forEachEdgeForPath(breakable, type, multi, direction, sourceData, target, callback) {
  const fn = multi ? forEachForKeyMulti : forEachForKeySimple;
  let found;
  if (type !== "undirected") {
    if (typeof sourceData.in !== "undefined" && direction !== "out") {
      found = fn(breakable, sourceData.in, target, callback);
      if (breakable && found)
        return found;
    }
    if (typeof sourceData.out !== "undefined" && direction !== "in" && (direction || sourceData.key !== target)) {
      found = fn(breakable, sourceData.out, target, callback);
      if (breakable && found)
        return found;
    }
  }
  if (type !== "directed") {
    if (typeof sourceData.undirected !== "undefined") {
      found = fn(breakable, sourceData.undirected, target, callback);
      if (breakable && found)
        return found;
    }
  }
  return;
}
function createEdgeArrayForPath(type, multi, direction, sourceData, target) {
  const edges = [];
  forEachEdgeForPath(false, type, multi, direction, sourceData, target, function(key) {
    edges.push(key);
  });
  return edges;
}
function createEdgeIteratorForPath(type, direction, sourceData, target) {
  let iterator = emptyIterator();
  if (type !== "undirected") {
    if (typeof sourceData.in !== "undefined" && direction !== "out" && target in sourceData.in)
      iterator = chain(iterator, createIteratorForKey(sourceData.in, target));
    if (typeof sourceData.out !== "undefined" && direction !== "in" && target in sourceData.out && (direction || sourceData.key !== target))
      iterator = chain(iterator, createIteratorForKey(sourceData.out, target));
  }
  if (type !== "directed") {
    if (typeof sourceData.undirected !== "undefined" && target in sourceData.undirected)
      iterator = chain(iterator, createIteratorForKey(sourceData.undirected, target));
  }
  return iterator;
}
function attachEdgeArrayCreator(Class, description) {
  const { name, type, direction } = description;
  Class.prototype[name] = function(source, target) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return [];
    if (!arguments.length)
      return createEdgeArray(this, type);
    if (arguments.length === 1) {
      source = "" + source;
      const nodeData = this._nodes.get(source);
      if (typeof nodeData === "undefined")
        throw new NotFoundGraphError(`Graph.${name}: could not find the "${source}" node in the graph.`);
      return createEdgeArrayForNode(this.multi, type === "mixed" ? this.type : type, direction, nodeData);
    }
    if (arguments.length === 2) {
      source = "" + source;
      target = "" + target;
      const sourceData = this._nodes.get(source);
      if (!sourceData)
        throw new NotFoundGraphError(`Graph.${name}:  could not find the "${source}" source node in the graph.`);
      if (!this._nodes.has(target))
        throw new NotFoundGraphError(`Graph.${name}:  could not find the "${target}" target node in the graph.`);
      return createEdgeArrayForPath(type, this.multi, direction, sourceData, target);
    }
    throw new InvalidArgumentsGraphError(`Graph.${name}: too many arguments (expecting 0, 1 or 2 and got ${arguments.length}).`);
  };
}
function attachForEachEdge(Class, description) {
  const { name, type, direction } = description;
  const forEachName = "forEach" + name[0].toUpperCase() + name.slice(1, -1);
  Class.prototype[forEachName] = function(source, target, callback) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return;
    if (arguments.length === 1) {
      callback = source;
      return forEachEdge(false, this, type, callback);
    }
    if (arguments.length === 2) {
      source = "" + source;
      callback = target;
      const nodeData = this._nodes.get(source);
      if (typeof nodeData === "undefined")
        throw new NotFoundGraphError(`Graph.${forEachName}: could not find the "${source}" node in the graph.`);
      return forEachEdgeForNode(false, this.multi, type === "mixed" ? this.type : type, direction, nodeData, callback);
    }
    if (arguments.length === 3) {
      source = "" + source;
      target = "" + target;
      const sourceData = this._nodes.get(source);
      if (!sourceData)
        throw new NotFoundGraphError(`Graph.${forEachName}:  could not find the "${source}" source node in the graph.`);
      if (!this._nodes.has(target))
        throw new NotFoundGraphError(`Graph.${forEachName}:  could not find the "${target}" target node in the graph.`);
      return forEachEdgeForPath(false, type, this.multi, direction, sourceData, target, callback);
    }
    throw new InvalidArgumentsGraphError(`Graph.${forEachName}: too many arguments (expecting 1, 2 or 3 and got ${arguments.length}).`);
  };
  const mapName = "map" + name[0].toUpperCase() + name.slice(1);
  Class.prototype[mapName] = function() {
    const args = Array.prototype.slice.call(arguments);
    const callback = args.pop();
    let result;
    if (args.length === 0) {
      let length = 0;
      if (type !== "directed")
        length += this.undirectedSize;
      if (type !== "undirected")
        length += this.directedSize;
      result = new Array(length);
      let i = 0;
      args.push((e, ea, s, t, sa, ta, u) => {
        result[i++] = callback(e, ea, s, t, sa, ta, u);
      });
    } else {
      result = [];
      args.push((e, ea, s, t, sa, ta, u) => {
        result.push(callback(e, ea, s, t, sa, ta, u));
      });
    }
    this[forEachName].apply(this, args);
    return result;
  };
  const filterName = "filter" + name[0].toUpperCase() + name.slice(1);
  Class.prototype[filterName] = function() {
    const args = Array.prototype.slice.call(arguments);
    const callback = args.pop();
    const result = [];
    args.push((e, ea, s, t, sa, ta, u) => {
      if (callback(e, ea, s, t, sa, ta, u))
        result.push(e);
    });
    this[forEachName].apply(this, args);
    return result;
  };
  const reduceName = "reduce" + name[0].toUpperCase() + name.slice(1);
  Class.prototype[reduceName] = function() {
    let args = Array.prototype.slice.call(arguments);
    if (args.length < 2 || args.length > 4) {
      throw new InvalidArgumentsGraphError(`Graph.${reduceName}: invalid number of arguments (expecting 2, 3 or 4 and got ${args.length}).`);
    }
    if (typeof args[args.length - 1] === "function" && typeof args[args.length - 2] !== "function") {
      throw new InvalidArgumentsGraphError(`Graph.${reduceName}: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.`);
    }
    let callback;
    let initialValue;
    if (args.length === 2) {
      callback = args[0];
      initialValue = args[1];
      args = [];
    } else if (args.length === 3) {
      callback = args[1];
      initialValue = args[2];
      args = [args[0]];
    } else if (args.length === 4) {
      callback = args[2];
      initialValue = args[3];
      args = [args[0], args[1]];
    }
    let accumulator = initialValue;
    args.push((e, ea, s, t, sa, ta, u) => {
      accumulator = callback(accumulator, e, ea, s, t, sa, ta, u);
    });
    this[forEachName].apply(this, args);
    return accumulator;
  };
}
function attachFindEdge(Class, description) {
  const { name, type, direction } = description;
  const findEdgeName = "find" + name[0].toUpperCase() + name.slice(1, -1);
  Class.prototype[findEdgeName] = function(source, target, callback) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return false;
    if (arguments.length === 1) {
      callback = source;
      return forEachEdge(true, this, type, callback);
    }
    if (arguments.length === 2) {
      source = "" + source;
      callback = target;
      const nodeData = this._nodes.get(source);
      if (typeof nodeData === "undefined")
        throw new NotFoundGraphError(`Graph.${findEdgeName}: could not find the "${source}" node in the graph.`);
      return forEachEdgeForNode(true, this.multi, type === "mixed" ? this.type : type, direction, nodeData, callback);
    }
    if (arguments.length === 3) {
      source = "" + source;
      target = "" + target;
      const sourceData = this._nodes.get(source);
      if (!sourceData)
        throw new NotFoundGraphError(`Graph.${findEdgeName}:  could not find the "${source}" source node in the graph.`);
      if (!this._nodes.has(target))
        throw new NotFoundGraphError(`Graph.${findEdgeName}:  could not find the "${target}" target node in the graph.`);
      return forEachEdgeForPath(true, type, this.multi, direction, sourceData, target, callback);
    }
    throw new InvalidArgumentsGraphError(`Graph.${findEdgeName}: too many arguments (expecting 1, 2 or 3 and got ${arguments.length}).`);
  };
  const someName = "some" + name[0].toUpperCase() + name.slice(1, -1);
  Class.prototype[someName] = function() {
    const args = Array.prototype.slice.call(arguments);
    const callback = args.pop();
    args.push((e, ea, s, t, sa, ta, u) => {
      return callback(e, ea, s, t, sa, ta, u);
    });
    const found = this[findEdgeName].apply(this, args);
    if (found)
      return true;
    return false;
  };
  const everyName = "every" + name[0].toUpperCase() + name.slice(1, -1);
  Class.prototype[everyName] = function() {
    const args = Array.prototype.slice.call(arguments);
    const callback = args.pop();
    args.push((e, ea, s, t, sa, ta, u) => {
      return !callback(e, ea, s, t, sa, ta, u);
    });
    const found = this[findEdgeName].apply(this, args);
    if (found)
      return false;
    return true;
  };
}
function attachEdgeIteratorCreator(Class, description) {
  const { name: originalName, type, direction } = description;
  const name = originalName.slice(0, -1) + "Entries";
  Class.prototype[name] = function(source, target) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return emptyIterator();
    if (!arguments.length)
      return createEdgeIterator(this, type);
    if (arguments.length === 1) {
      source = "" + source;
      const sourceData = this._nodes.get(source);
      if (!sourceData)
        throw new NotFoundGraphError(`Graph.${name}: could not find the "${source}" node in the graph.`);
      return createEdgeIteratorForNode(type, direction, sourceData);
    }
    if (arguments.length === 2) {
      source = "" + source;
      target = "" + target;
      const sourceData = this._nodes.get(source);
      if (!sourceData)
        throw new NotFoundGraphError(`Graph.${name}:  could not find the "${source}" source node in the graph.`);
      if (!this._nodes.has(target))
        throw new NotFoundGraphError(`Graph.${name}:  could not find the "${target}" target node in the graph.`);
      return createEdgeIteratorForPath(type, direction, sourceData, target);
    }
    throw new InvalidArgumentsGraphError(`Graph.${name}: too many arguments (expecting 0, 1 or 2 and got ${arguments.length}).`);
  };
}
function attachEdgeIterationMethods(Graph) {
  EDGES_ITERATION.forEach((description) => {
    attachEdgeArrayCreator(Graph, description);
    attachForEachEdge(Graph, description);
    attachFindEdge(Graph, description);
    attachEdgeIteratorCreator(Graph, description);
  });
}
var NEIGHBORS_ITERATION = [
  {
    name: "neighbors",
    type: "mixed"
  },
  {
    name: "inNeighbors",
    type: "directed",
    direction: "in"
  },
  {
    name: "outNeighbors",
    type: "directed",
    direction: "out"
  },
  {
    name: "inboundNeighbors",
    type: "mixed",
    direction: "in"
  },
  {
    name: "outboundNeighbors",
    type: "mixed",
    direction: "out"
  },
  {
    name: "directedNeighbors",
    type: "directed"
  },
  {
    name: "undirectedNeighbors",
    type: "undirected"
  }
];
function CompositeSetWrapper() {
  this.A = null;
  this.B = null;
}
CompositeSetWrapper.prototype.wrap = function(set) {
  if (this.A === null)
    this.A = set;
  else if (this.B === null)
    this.B = set;
};
CompositeSetWrapper.prototype.has = function(key) {
  if (this.A !== null && key in this.A)
    return true;
  if (this.B !== null && key in this.B)
    return true;
  return false;
};
function forEachInObjectOnce(breakable, visited, nodeData, object, callback) {
  for (const k in object) {
    const edgeData = object[k];
    const sourceData = edgeData.source;
    const targetData = edgeData.target;
    const neighborData = sourceData === nodeData ? targetData : sourceData;
    if (visited && visited.has(neighborData.key))
      continue;
    const shouldBreak = callback(neighborData.key, neighborData.attributes);
    if (breakable && shouldBreak)
      return neighborData.key;
  }
  return;
}
function forEachNeighbor(breakable, type, direction, nodeData, callback) {
  if (type !== "mixed") {
    if (type === "undirected")
      return forEachInObjectOnce(breakable, null, nodeData, nodeData.undirected, callback);
    if (typeof direction === "string")
      return forEachInObjectOnce(breakable, null, nodeData, nodeData[direction], callback);
  }
  const visited = new CompositeSetWrapper;
  let found;
  if (type !== "undirected") {
    if (direction !== "out") {
      found = forEachInObjectOnce(breakable, null, nodeData, nodeData.in, callback);
      if (breakable && found)
        return found;
      visited.wrap(nodeData.in);
    }
    if (direction !== "in") {
      found = forEachInObjectOnce(breakable, visited, nodeData, nodeData.out, callback);
      if (breakable && found)
        return found;
      visited.wrap(nodeData.out);
    }
  }
  if (type !== "directed") {
    found = forEachInObjectOnce(breakable, visited, nodeData, nodeData.undirected, callback);
    if (breakable && found)
      return found;
  }
  return;
}
function createNeighborArrayForNode(type, direction, nodeData) {
  if (type !== "mixed") {
    if (type === "undirected")
      return Object.keys(nodeData.undirected);
    if (typeof direction === "string")
      return Object.keys(nodeData[direction]);
  }
  const neighbors = [];
  forEachNeighbor(false, type, direction, nodeData, function(key) {
    neighbors.push(key);
  });
  return neighbors;
}
function createDedupedObjectIterator(visited, nodeData, object) {
  const keys = Object.keys(object);
  const l2 = keys.length;
  let i = 0;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      let neighborData = null;
      do {
        if (i >= l2) {
          if (visited)
            visited.wrap(object);
          return { done: true };
        }
        const edgeData = object[keys[i++]];
        const sourceData = edgeData.source;
        const targetData = edgeData.target;
        neighborData = sourceData === nodeData ? targetData : sourceData;
        if (visited && visited.has(neighborData.key)) {
          neighborData = null;
          continue;
        }
      } while (neighborData === null);
      return {
        done: false,
        value: { neighbor: neighborData.key, attributes: neighborData.attributes }
      };
    }
  };
}
function createNeighborIterator(type, direction, nodeData) {
  if (type !== "mixed") {
    if (type === "undirected")
      return createDedupedObjectIterator(null, nodeData, nodeData.undirected);
    if (typeof direction === "string")
      return createDedupedObjectIterator(null, nodeData, nodeData[direction]);
  }
  let iterator = emptyIterator();
  const visited = new CompositeSetWrapper;
  if (type !== "undirected") {
    if (direction !== "out") {
      iterator = chain(iterator, createDedupedObjectIterator(visited, nodeData, nodeData.in));
    }
    if (direction !== "in") {
      iterator = chain(iterator, createDedupedObjectIterator(visited, nodeData, nodeData.out));
    }
  }
  if (type !== "directed") {
    iterator = chain(iterator, createDedupedObjectIterator(visited, nodeData, nodeData.undirected));
  }
  return iterator;
}
function attachNeighborArrayCreator(Class, description) {
  const { name, type, direction } = description;
  Class.prototype[name] = function(node) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return [];
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (typeof nodeData === "undefined")
      throw new NotFoundGraphError(`Graph.${name}: could not find the "${node}" node in the graph.`);
    return createNeighborArrayForNode(type === "mixed" ? this.type : type, direction, nodeData);
  };
}
function attachForEachNeighbor(Class, description) {
  const { name, type, direction } = description;
  const forEachName = "forEach" + name[0].toUpperCase() + name.slice(1, -1);
  Class.prototype[forEachName] = function(node, callback) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return;
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (typeof nodeData === "undefined")
      throw new NotFoundGraphError(`Graph.${forEachName}: could not find the "${node}" node in the graph.`);
    forEachNeighbor(false, type === "mixed" ? this.type : type, direction, nodeData, callback);
  };
  const mapName = "map" + name[0].toUpperCase() + name.slice(1);
  Class.prototype[mapName] = function(node, callback) {
    const result = [];
    this[forEachName](node, (n, a2) => {
      result.push(callback(n, a2));
    });
    return result;
  };
  const filterName = "filter" + name[0].toUpperCase() + name.slice(1);
  Class.prototype[filterName] = function(node, callback) {
    const result = [];
    this[forEachName](node, (n, a2) => {
      if (callback(n, a2))
        result.push(n);
    });
    return result;
  };
  const reduceName = "reduce" + name[0].toUpperCase() + name.slice(1);
  Class.prototype[reduceName] = function(node, callback, initialValue) {
    if (arguments.length < 3)
      throw new InvalidArgumentsGraphError(`Graph.${reduceName}: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.`);
    let accumulator = initialValue;
    this[forEachName](node, (n, a2) => {
      accumulator = callback(accumulator, n, a2);
    });
    return accumulator;
  };
}
function attachFindNeighbor(Class, description) {
  const { name, type, direction } = description;
  const capitalizedSingular = name[0].toUpperCase() + name.slice(1, -1);
  const findName = "find" + capitalizedSingular;
  Class.prototype[findName] = function(node, callback) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return;
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (typeof nodeData === "undefined")
      throw new NotFoundGraphError(`Graph.${findName}: could not find the "${node}" node in the graph.`);
    return forEachNeighbor(true, type === "mixed" ? this.type : type, direction, nodeData, callback);
  };
  const someName = "some" + capitalizedSingular;
  Class.prototype[someName] = function(node, callback) {
    const found = this[findName](node, callback);
    if (found)
      return true;
    return false;
  };
  const everyName = "every" + capitalizedSingular;
  Class.prototype[everyName] = function(node, callback) {
    const found = this[findName](node, (n, a2) => {
      return !callback(n, a2);
    });
    if (found)
      return false;
    return true;
  };
}
function attachNeighborIteratorCreator(Class, description) {
  const { name, type, direction } = description;
  const iteratorName = name.slice(0, -1) + "Entries";
  Class.prototype[iteratorName] = function(node) {
    if (type !== "mixed" && this.type !== "mixed" && type !== this.type)
      return emptyIterator();
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (typeof nodeData === "undefined")
      throw new NotFoundGraphError(`Graph.${iteratorName}: could not find the "${node}" node in the graph.`);
    return createNeighborIterator(type === "mixed" ? this.type : type, direction, nodeData);
  };
}
function attachNeighborIterationMethods(Graph) {
  NEIGHBORS_ITERATION.forEach((description) => {
    attachNeighborArrayCreator(Graph, description);
    attachForEachNeighbor(Graph, description);
    attachFindNeighbor(Graph, description);
    attachNeighborIteratorCreator(Graph, description);
  });
}
function forEachAdjacency(breakable, assymetric, disconnectedNodes, graph, callback) {
  const iterator = graph._nodes.values();
  const type = graph.type;
  let step, sourceData, neighbor, adj, edgeData, targetData, shouldBreak;
  while (step = iterator.next(), step.done !== true) {
    let hasEdges = false;
    sourceData = step.value;
    if (type !== "undirected") {
      adj = sourceData.out;
      for (neighbor in adj) {
        edgeData = adj[neighbor];
        do {
          targetData = edgeData.target;
          hasEdges = true;
          shouldBreak = callback(sourceData.key, targetData.key, sourceData.attributes, targetData.attributes, edgeData.key, edgeData.attributes, edgeData.undirected);
          if (breakable && shouldBreak)
            return edgeData;
          edgeData = edgeData.next;
        } while (edgeData);
      }
    }
    if (type !== "directed") {
      adj = sourceData.undirected;
      for (neighbor in adj) {
        if (assymetric && sourceData.key > neighbor)
          continue;
        edgeData = adj[neighbor];
        do {
          targetData = edgeData.target;
          if (targetData.key !== neighbor)
            targetData = edgeData.source;
          hasEdges = true;
          shouldBreak = callback(sourceData.key, targetData.key, sourceData.attributes, targetData.attributes, edgeData.key, edgeData.attributes, edgeData.undirected);
          if (breakable && shouldBreak)
            return edgeData;
          edgeData = edgeData.next;
        } while (edgeData);
      }
    }
    if (disconnectedNodes && !hasEdges) {
      shouldBreak = callback(sourceData.key, null, sourceData.attributes, null, null, null, null);
      if (breakable && shouldBreak)
        return null;
    }
  }
  return;
}
function serializeNode(key, data) {
  const serialized = { key };
  if (!isEmpty(data.attributes))
    serialized.attributes = assign({}, data.attributes);
  return serialized;
}
function serializeEdge(type, key, data) {
  const serialized = {
    key,
    source: data.source.key,
    target: data.target.key
  };
  if (!isEmpty(data.attributes))
    serialized.attributes = assign({}, data.attributes);
  if (type === "mixed" && data.undirected)
    serialized.undirected = true;
  return serialized;
}
function validateSerializedNode(value) {
  if (!isPlainObject(value))
    throw new InvalidArgumentsGraphError('Graph.import: invalid serialized node. A serialized node should be a plain object with at least a "key" property.');
  if (!("key" in value))
    throw new InvalidArgumentsGraphError("Graph.import: serialized node is missing its key.");
  if ("attributes" in value && (!isPlainObject(value.attributes) || value.attributes === null))
    throw new InvalidArgumentsGraphError("Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.");
}
function validateSerializedEdge(value) {
  if (!isPlainObject(value))
    throw new InvalidArgumentsGraphError('Graph.import: invalid serialized edge. A serialized edge should be a plain object with at least a "source" & "target" property.');
  if (!("source" in value))
    throw new InvalidArgumentsGraphError("Graph.import: serialized edge is missing its source.");
  if (!("target" in value))
    throw new InvalidArgumentsGraphError("Graph.import: serialized edge is missing its target.");
  if ("attributes" in value && (!isPlainObject(value.attributes) || value.attributes === null))
    throw new InvalidArgumentsGraphError("Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.");
  if ("undirected" in value && typeof value.undirected !== "boolean")
    throw new InvalidArgumentsGraphError("Graph.import: invalid undirectedness information. Undirected should be boolean or omitted.");
}
var INSTANCE_ID = incrementalIdStartingFromRandomByte();
var TYPES = new Set(["directed", "undirected", "mixed"]);
var EMITTER_PROPS = new Set([
  "domain",
  "_events",
  "_eventsCount",
  "_maxListeners"
]);
var EDGE_ADD_METHODS = [
  {
    name: (verb) => `${verb}Edge`,
    generateKey: true
  },
  {
    name: (verb) => `${verb}DirectedEdge`,
    generateKey: true,
    type: "directed"
  },
  {
    name: (verb) => `${verb}UndirectedEdge`,
    generateKey: true,
    type: "undirected"
  },
  {
    name: (verb) => `${verb}EdgeWithKey`
  },
  {
    name: (verb) => `${verb}DirectedEdgeWithKey`,
    type: "directed"
  },
  {
    name: (verb) => `${verb}UndirectedEdgeWithKey`,
    type: "undirected"
  }
];
var DEFAULTS = {
  allowSelfLoops: true,
  multi: false,
  type: "mixed"
};
function addNode(graph, node, attributes) {
  if (attributes && !isPlainObject(attributes))
    throw new InvalidArgumentsGraphError(`Graph.addNode: invalid attributes. Expecting an object but got "${attributes}"`);
  node = "" + node;
  attributes = attributes || {};
  if (graph._nodes.has(node))
    throw new UsageGraphError(`Graph.addNode: the "${node}" node already exist in the graph.`);
  const data = new graph.NodeDataClass(node, attributes);
  graph._nodes.set(node, data);
  graph.emit("nodeAdded", {
    key: node,
    attributes
  });
  return data;
}
function unsafeAddNode(graph, node, attributes) {
  const data = new graph.NodeDataClass(node, attributes);
  graph._nodes.set(node, data);
  graph.emit("nodeAdded", {
    key: node,
    attributes
  });
  return data;
}
function addEdge(graph, name, mustGenerateKey, undirected, edge, source, target, attributes) {
  if (!undirected && graph.type === "undirected")
    throw new UsageGraphError(`Graph.${name}: you cannot add a directed edge to an undirected graph. Use the #.addEdge or #.addUndirectedEdge instead.`);
  if (undirected && graph.type === "directed")
    throw new UsageGraphError(`Graph.${name}: you cannot add an undirected edge to a directed graph. Use the #.addEdge or #.addDirectedEdge instead.`);
  if (attributes && !isPlainObject(attributes))
    throw new InvalidArgumentsGraphError(`Graph.${name}: invalid attributes. Expecting an object but got "${attributes}"`);
  source = "" + source;
  target = "" + target;
  attributes = attributes || {};
  if (!graph.allowSelfLoops && source === target)
    throw new UsageGraphError(`Graph.${name}: source & target are the same ("${source}"), thus creating a loop explicitly forbidden by this graph 'allowSelfLoops' option set to false.`);
  const sourceData = graph._nodes.get(source), targetData = graph._nodes.get(target);
  if (!sourceData)
    throw new NotFoundGraphError(`Graph.${name}: source node "${source}" not found.`);
  if (!targetData)
    throw new NotFoundGraphError(`Graph.${name}: target node "${target}" not found.`);
  const eventData = {
    key: null,
    undirected,
    source,
    target,
    attributes
  };
  if (mustGenerateKey) {
    edge = graph._edgeKeyGenerator();
  } else {
    edge = "" + edge;
    if (graph._edges.has(edge))
      throw new UsageGraphError(`Graph.${name}: the "${edge}" edge already exists in the graph.`);
  }
  if (!graph.multi && (undirected ? typeof sourceData.undirected[target] !== "undefined" : typeof sourceData.out[target] !== "undefined")) {
    throw new UsageGraphError(`Graph.${name}: an edge linking "${source}" to "${target}" already exists. If you really want to add multiple edges linking those nodes, you should create a multi graph by using the 'multi' option.`);
  }
  const edgeData = new EdgeData(undirected, edge, sourceData, targetData, attributes);
  graph._edges.set(edge, edgeData);
  const isSelfLoop = source === target;
  if (undirected) {
    sourceData.undirectedDegree++;
    targetData.undirectedDegree++;
    if (isSelfLoop) {
      sourceData.undirectedLoops++;
      graph._undirectedSelfLoopCount++;
    }
  } else {
    sourceData.outDegree++;
    targetData.inDegree++;
    if (isSelfLoop) {
      sourceData.directedLoops++;
      graph._directedSelfLoopCount++;
    }
  }
  if (graph.multi)
    edgeData.attachMulti();
  else
    edgeData.attach();
  if (undirected)
    graph._undirectedSize++;
  else
    graph._directedSize++;
  eventData.key = edge;
  graph.emit("edgeAdded", eventData);
  return edge;
}
function mergeEdge(graph, name, mustGenerateKey, undirected, edge, source, target, attributes, asUpdater) {
  if (!undirected && graph.type === "undirected")
    throw new UsageGraphError(`Graph.${name}: you cannot merge/update a directed edge to an undirected graph. Use the #.mergeEdge/#.updateEdge or #.addUndirectedEdge instead.`);
  if (undirected && graph.type === "directed")
    throw new UsageGraphError(`Graph.${name}: you cannot merge/update an undirected edge to a directed graph. Use the #.mergeEdge/#.updateEdge or #.addDirectedEdge instead.`);
  if (attributes) {
    if (asUpdater) {
      if (typeof attributes !== "function")
        throw new InvalidArgumentsGraphError(`Graph.${name}: invalid updater function. Expecting a function but got "${attributes}"`);
    } else {
      if (!isPlainObject(attributes))
        throw new InvalidArgumentsGraphError(`Graph.${name}: invalid attributes. Expecting an object but got "${attributes}"`);
    }
  }
  source = "" + source;
  target = "" + target;
  let updater;
  if (asUpdater) {
    updater = attributes;
    attributes = undefined;
  }
  if (!graph.allowSelfLoops && source === target)
    throw new UsageGraphError(`Graph.${name}: source & target are the same ("${source}"), thus creating a loop explicitly forbidden by this graph 'allowSelfLoops' option set to false.`);
  let sourceData = graph._nodes.get(source);
  let targetData = graph._nodes.get(target);
  let edgeData;
  let alreadyExistingEdgeData;
  if (!mustGenerateKey) {
    edgeData = graph._edges.get(edge);
    if (edgeData) {
      if (edgeData.source.key !== source || edgeData.target.key !== target) {
        if (!undirected || edgeData.source.key !== target || edgeData.target.key !== source) {
          throw new UsageGraphError(`Graph.${name}: inconsistency detected when attempting to merge the "${edge}" edge with "${source}" source & "${target}" target vs. ("${edgeData.source.key}", "${edgeData.target.key}").`);
        }
      }
      alreadyExistingEdgeData = edgeData;
    }
  }
  if (!alreadyExistingEdgeData && !graph.multi && sourceData) {
    alreadyExistingEdgeData = undirected ? sourceData.undirected[target] : sourceData.out[target];
  }
  if (alreadyExistingEdgeData) {
    const info = [alreadyExistingEdgeData.key, false, false, false];
    if (asUpdater ? !updater : !attributes)
      return info;
    if (asUpdater) {
      const oldAttributes = alreadyExistingEdgeData.attributes;
      alreadyExistingEdgeData.attributes = updater(oldAttributes);
      graph.emit("edgeAttributesUpdated", {
        type: "replace",
        key: alreadyExistingEdgeData.key,
        attributes: alreadyExistingEdgeData.attributes
      });
    } else {
      assign(alreadyExistingEdgeData.attributes, attributes);
      graph.emit("edgeAttributesUpdated", {
        type: "merge",
        key: alreadyExistingEdgeData.key,
        attributes: alreadyExistingEdgeData.attributes,
        data: attributes
      });
    }
    return info;
  }
  attributes = attributes || {};
  if (asUpdater && updater)
    attributes = updater(attributes);
  const eventData = {
    key: null,
    undirected,
    source,
    target,
    attributes
  };
  if (mustGenerateKey) {
    edge = graph._edgeKeyGenerator();
  } else {
    edge = "" + edge;
    if (graph._edges.has(edge))
      throw new UsageGraphError(`Graph.${name}: the "${edge}" edge already exists in the graph.`);
  }
  let sourceWasAdded = false;
  let targetWasAdded = false;
  if (!sourceData) {
    sourceData = unsafeAddNode(graph, source, {});
    sourceWasAdded = true;
    if (source === target) {
      targetData = sourceData;
      targetWasAdded = true;
    }
  }
  if (!targetData) {
    targetData = unsafeAddNode(graph, target, {});
    targetWasAdded = true;
  }
  edgeData = new EdgeData(undirected, edge, sourceData, targetData, attributes);
  graph._edges.set(edge, edgeData);
  const isSelfLoop = source === target;
  if (undirected) {
    sourceData.undirectedDegree++;
    targetData.undirectedDegree++;
    if (isSelfLoop) {
      sourceData.undirectedLoops++;
      graph._undirectedSelfLoopCount++;
    }
  } else {
    sourceData.outDegree++;
    targetData.inDegree++;
    if (isSelfLoop) {
      sourceData.directedLoops++;
      graph._directedSelfLoopCount++;
    }
  }
  if (graph.multi)
    edgeData.attachMulti();
  else
    edgeData.attach();
  if (undirected)
    graph._undirectedSize++;
  else
    graph._directedSize++;
  eventData.key = edge;
  graph.emit("edgeAdded", eventData);
  return [edge, true, sourceWasAdded, targetWasAdded];
}
function dropEdgeFromData(graph, edgeData) {
  graph._edges.delete(edgeData.key);
  const { source: sourceData, target: targetData, attributes } = edgeData;
  const undirected = edgeData.undirected;
  const isSelfLoop = sourceData === targetData;
  if (undirected) {
    sourceData.undirectedDegree--;
    targetData.undirectedDegree--;
    if (isSelfLoop) {
      sourceData.undirectedLoops--;
      graph._undirectedSelfLoopCount--;
    }
  } else {
    sourceData.outDegree--;
    targetData.inDegree--;
    if (isSelfLoop) {
      sourceData.directedLoops--;
      graph._directedSelfLoopCount--;
    }
  }
  if (graph.multi)
    edgeData.detachMulti();
  else
    edgeData.detach();
  if (undirected)
    graph._undirectedSize--;
  else
    graph._directedSize--;
  graph.emit("edgeDropped", {
    key: edgeData.key,
    attributes,
    source: sourceData.key,
    target: targetData.key,
    undirected
  });
}

class Graph extends o {
  constructor(options) {
    super();
    options = assign({}, DEFAULTS, options);
    if (typeof options.multi !== "boolean")
      throw new InvalidArgumentsGraphError(`Graph.constructor: invalid 'multi' option. Expecting a boolean but got "${options.multi}".`);
    if (!TYPES.has(options.type))
      throw new InvalidArgumentsGraphError(`Graph.constructor: invalid 'type' option. Should be one of "mixed", "directed" or "undirected" but got "${options.type}".`);
    if (typeof options.allowSelfLoops !== "boolean")
      throw new InvalidArgumentsGraphError(`Graph.constructor: invalid 'allowSelfLoops' option. Expecting a boolean but got "${options.allowSelfLoops}".`);
    const NodeDataClass = options.type === "mixed" ? MixedNodeData : options.type === "directed" ? DirectedNodeData : UndirectedNodeData;
    privateProperty(this, "NodeDataClass", NodeDataClass);
    const instancePrefix = "geid_" + INSTANCE_ID() + "_";
    let edgeId = 0;
    const edgeKeyGenerator = () => {
      let availableEdgeKey;
      do {
        availableEdgeKey = instancePrefix + edgeId++;
      } while (this._edges.has(availableEdgeKey));
      return availableEdgeKey;
    };
    privateProperty(this, "_attributes", {});
    privateProperty(this, "_nodes", new Map);
    privateProperty(this, "_edges", new Map);
    privateProperty(this, "_directedSize", 0);
    privateProperty(this, "_undirectedSize", 0);
    privateProperty(this, "_directedSelfLoopCount", 0);
    privateProperty(this, "_undirectedSelfLoopCount", 0);
    privateProperty(this, "_edgeKeyGenerator", edgeKeyGenerator);
    privateProperty(this, "_options", options);
    EMITTER_PROPS.forEach((prop) => privateProperty(this, prop, this[prop]));
    readOnlyProperty(this, "order", () => this._nodes.size);
    readOnlyProperty(this, "size", () => this._edges.size);
    readOnlyProperty(this, "directedSize", () => this._directedSize);
    readOnlyProperty(this, "undirectedSize", () => this._undirectedSize);
    readOnlyProperty(this, "selfLoopCount", () => this._directedSelfLoopCount + this._undirectedSelfLoopCount);
    readOnlyProperty(this, "directedSelfLoopCount", () => this._directedSelfLoopCount);
    readOnlyProperty(this, "undirectedSelfLoopCount", () => this._undirectedSelfLoopCount);
    readOnlyProperty(this, "multi", this._options.multi);
    readOnlyProperty(this, "type", this._options.type);
    readOnlyProperty(this, "allowSelfLoops", this._options.allowSelfLoops);
    readOnlyProperty(this, "implementation", () => "graphology");
  }
  _resetInstanceCounters() {
    this._directedSize = 0;
    this._undirectedSize = 0;
    this._directedSelfLoopCount = 0;
    this._undirectedSelfLoopCount = 0;
  }
  hasNode(node) {
    return this._nodes.has("" + node);
  }
  hasDirectedEdge(source, target) {
    if (this.type === "undirected")
      return false;
    if (arguments.length === 1) {
      const edge = "" + source;
      const edgeData = this._edges.get(edge);
      return !!edgeData && !edgeData.undirected;
    } else if (arguments.length === 2) {
      source = "" + source;
      target = "" + target;
      const nodeData = this._nodes.get(source);
      if (!nodeData)
        return false;
      return nodeData.out.hasOwnProperty(target);
    }
    throw new InvalidArgumentsGraphError(`Graph.hasDirectedEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`);
  }
  hasUndirectedEdge(source, target) {
    if (this.type === "directed")
      return false;
    if (arguments.length === 1) {
      const edge = "" + source;
      const edgeData = this._edges.get(edge);
      return !!edgeData && edgeData.undirected;
    } else if (arguments.length === 2) {
      source = "" + source;
      target = "" + target;
      const nodeData = this._nodes.get(source);
      if (!nodeData)
        return false;
      return nodeData.undirected.hasOwnProperty(target);
    }
    throw new InvalidArgumentsGraphError(`Graph.hasDirectedEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`);
  }
  hasEdge(source, target) {
    if (arguments.length === 1) {
      const edge = "" + source;
      return this._edges.has(edge);
    } else if (arguments.length === 2) {
      source = "" + source;
      target = "" + target;
      const nodeData = this._nodes.get(source);
      if (!nodeData)
        return false;
      return typeof nodeData.out !== "undefined" && nodeData.out.hasOwnProperty(target) || typeof nodeData.undirected !== "undefined" && nodeData.undirected.hasOwnProperty(target);
    }
    throw new InvalidArgumentsGraphError(`Graph.hasEdge: invalid arity (${arguments.length}, instead of 1 or 2). You can either ask for an edge id or for the existence of an edge between a source & a target.`);
  }
  directedEdge(source, target) {
    if (this.type === "undirected")
      return;
    source = "" + source;
    target = "" + target;
    if (this.multi)
      throw new UsageGraphError("Graph.directedEdge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.directedEdges instead.");
    const sourceData = this._nodes.get(source);
    if (!sourceData)
      throw new NotFoundGraphError(`Graph.directedEdge: could not find the "${source}" source node in the graph.`);
    if (!this._nodes.has(target))
      throw new NotFoundGraphError(`Graph.directedEdge: could not find the "${target}" target node in the graph.`);
    const edgeData = sourceData.out && sourceData.out[target] || undefined;
    if (edgeData)
      return edgeData.key;
  }
  undirectedEdge(source, target) {
    if (this.type === "directed")
      return;
    source = "" + source;
    target = "" + target;
    if (this.multi)
      throw new UsageGraphError("Graph.undirectedEdge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.undirectedEdges instead.");
    const sourceData = this._nodes.get(source);
    if (!sourceData)
      throw new NotFoundGraphError(`Graph.undirectedEdge: could not find the "${source}" source node in the graph.`);
    if (!this._nodes.has(target))
      throw new NotFoundGraphError(`Graph.undirectedEdge: could not find the "${target}" target node in the graph.`);
    const edgeData = sourceData.undirected && sourceData.undirected[target] || undefined;
    if (edgeData)
      return edgeData.key;
  }
  edge(source, target) {
    if (this.multi)
      throw new UsageGraphError("Graph.edge: this method is irrelevant with multigraphs since there might be multiple edges between source & target. See #.edges instead.");
    source = "" + source;
    target = "" + target;
    const sourceData = this._nodes.get(source);
    if (!sourceData)
      throw new NotFoundGraphError(`Graph.edge: could not find the "${source}" source node in the graph.`);
    if (!this._nodes.has(target))
      throw new NotFoundGraphError(`Graph.edge: could not find the "${target}" target node in the graph.`);
    const edgeData = sourceData.out && sourceData.out[target] || sourceData.undirected && sourceData.undirected[target] || undefined;
    if (edgeData)
      return edgeData.key;
  }
  areDirectedNeighbors(node, neighbor) {
    node = "" + node;
    neighbor = "" + neighbor;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.areDirectedNeighbors: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return false;
    return neighbor in nodeData.in || neighbor in nodeData.out;
  }
  areOutNeighbors(node, neighbor) {
    node = "" + node;
    neighbor = "" + neighbor;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.areOutNeighbors: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return false;
    return neighbor in nodeData.out;
  }
  areInNeighbors(node, neighbor) {
    node = "" + node;
    neighbor = "" + neighbor;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.areInNeighbors: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return false;
    return neighbor in nodeData.in;
  }
  areUndirectedNeighbors(node, neighbor) {
    node = "" + node;
    neighbor = "" + neighbor;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.areUndirectedNeighbors: could not find the "${node}" node in the graph.`);
    if (this.type === "directed")
      return false;
    return neighbor in nodeData.undirected;
  }
  areNeighbors(node, neighbor) {
    node = "" + node;
    neighbor = "" + neighbor;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.areNeighbors: could not find the "${node}" node in the graph.`);
    if (this.type !== "undirected") {
      if (neighbor in nodeData.in || neighbor in nodeData.out)
        return true;
    }
    if (this.type !== "directed") {
      if (neighbor in nodeData.undirected)
        return true;
    }
    return false;
  }
  areInboundNeighbors(node, neighbor) {
    node = "" + node;
    neighbor = "" + neighbor;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.areInboundNeighbors: could not find the "${node}" node in the graph.`);
    if (this.type !== "undirected") {
      if (neighbor in nodeData.in)
        return true;
    }
    if (this.type !== "directed") {
      if (neighbor in nodeData.undirected)
        return true;
    }
    return false;
  }
  areOutboundNeighbors(node, neighbor) {
    node = "" + node;
    neighbor = "" + neighbor;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.areOutboundNeighbors: could not find the "${node}" node in the graph.`);
    if (this.type !== "undirected") {
      if (neighbor in nodeData.out)
        return true;
    }
    if (this.type !== "directed") {
      if (neighbor in nodeData.undirected)
        return true;
    }
    return false;
  }
  inDegree(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.inDegree: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return 0;
    return nodeData.inDegree;
  }
  outDegree(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.outDegree: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return 0;
    return nodeData.outDegree;
  }
  directedDegree(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.directedDegree: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return 0;
    return nodeData.inDegree + nodeData.outDegree;
  }
  undirectedDegree(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.undirectedDegree: could not find the "${node}" node in the graph.`);
    if (this.type === "directed")
      return 0;
    return nodeData.undirectedDegree;
  }
  inboundDegree(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.inboundDegree: could not find the "${node}" node in the graph.`);
    let degree = 0;
    if (this.type !== "directed") {
      degree += nodeData.undirectedDegree;
    }
    if (this.type !== "undirected") {
      degree += nodeData.inDegree;
    }
    return degree;
  }
  outboundDegree(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.outboundDegree: could not find the "${node}" node in the graph.`);
    let degree = 0;
    if (this.type !== "directed") {
      degree += nodeData.undirectedDegree;
    }
    if (this.type !== "undirected") {
      degree += nodeData.outDegree;
    }
    return degree;
  }
  degree(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.degree: could not find the "${node}" node in the graph.`);
    let degree = 0;
    if (this.type !== "directed") {
      degree += nodeData.undirectedDegree;
    }
    if (this.type !== "undirected") {
      degree += nodeData.inDegree + nodeData.outDegree;
    }
    return degree;
  }
  inDegreeWithoutSelfLoops(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.inDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return 0;
    return nodeData.inDegree - nodeData.directedLoops;
  }
  outDegreeWithoutSelfLoops(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.outDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return 0;
    return nodeData.outDegree - nodeData.directedLoops;
  }
  directedDegreeWithoutSelfLoops(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.directedDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`);
    if (this.type === "undirected")
      return 0;
    return nodeData.inDegree + nodeData.outDegree - nodeData.directedLoops * 2;
  }
  undirectedDegreeWithoutSelfLoops(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.undirectedDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`);
    if (this.type === "directed")
      return 0;
    return nodeData.undirectedDegree - nodeData.undirectedLoops * 2;
  }
  inboundDegreeWithoutSelfLoops(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.inboundDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`);
    let degree = 0;
    let loops = 0;
    if (this.type !== "directed") {
      degree += nodeData.undirectedDegree;
      loops += nodeData.undirectedLoops * 2;
    }
    if (this.type !== "undirected") {
      degree += nodeData.inDegree;
      loops += nodeData.directedLoops;
    }
    return degree - loops;
  }
  outboundDegreeWithoutSelfLoops(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.outboundDegreeWithoutSelfLoops: could not find the "${node}" node in the graph.`);
    let degree = 0;
    let loops = 0;
    if (this.type !== "directed") {
      degree += nodeData.undirectedDegree;
      loops += nodeData.undirectedLoops * 2;
    }
    if (this.type !== "undirected") {
      degree += nodeData.outDegree;
      loops += nodeData.directedLoops;
    }
    return degree - loops;
  }
  degreeWithoutSelfLoops(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.degreeWithoutSelfLoops: could not find the "${node}" node in the graph.`);
    let degree = 0;
    let loops = 0;
    if (this.type !== "directed") {
      degree += nodeData.undirectedDegree;
      loops += nodeData.undirectedLoops * 2;
    }
    if (this.type !== "undirected") {
      degree += nodeData.inDegree + nodeData.outDegree;
      loops += nodeData.directedLoops * 2;
    }
    return degree - loops;
  }
  source(edge) {
    edge = "" + edge;
    const data = this._edges.get(edge);
    if (!data)
      throw new NotFoundGraphError(`Graph.source: could not find the "${edge}" edge in the graph.`);
    return data.source.key;
  }
  target(edge) {
    edge = "" + edge;
    const data = this._edges.get(edge);
    if (!data)
      throw new NotFoundGraphError(`Graph.target: could not find the "${edge}" edge in the graph.`);
    return data.target.key;
  }
  extremities(edge) {
    edge = "" + edge;
    const edgeData = this._edges.get(edge);
    if (!edgeData)
      throw new NotFoundGraphError(`Graph.extremities: could not find the "${edge}" edge in the graph.`);
    return [edgeData.source.key, edgeData.target.key];
  }
  opposite(node, edge) {
    node = "" + node;
    edge = "" + edge;
    const data = this._edges.get(edge);
    if (!data)
      throw new NotFoundGraphError(`Graph.opposite: could not find the "${edge}" edge in the graph.`);
    const source = data.source.key;
    const target = data.target.key;
    if (node === source)
      return target;
    if (node === target)
      return source;
    throw new NotFoundGraphError(`Graph.opposite: the "${node}" node is not attached to the "${edge}" edge (${source}, ${target}).`);
  }
  hasExtremity(edge, node) {
    edge = "" + edge;
    node = "" + node;
    const data = this._edges.get(edge);
    if (!data)
      throw new NotFoundGraphError(`Graph.hasExtremity: could not find the "${edge}" edge in the graph.`);
    return data.source.key === node || data.target.key === node;
  }
  isUndirected(edge) {
    edge = "" + edge;
    const data = this._edges.get(edge);
    if (!data)
      throw new NotFoundGraphError(`Graph.isUndirected: could not find the "${edge}" edge in the graph.`);
    return data.undirected;
  }
  isDirected(edge) {
    edge = "" + edge;
    const data = this._edges.get(edge);
    if (!data)
      throw new NotFoundGraphError(`Graph.isDirected: could not find the "${edge}" edge in the graph.`);
    return !data.undirected;
  }
  isSelfLoop(edge) {
    edge = "" + edge;
    const data = this._edges.get(edge);
    if (!data)
      throw new NotFoundGraphError(`Graph.isSelfLoop: could not find the "${edge}" edge in the graph.`);
    return data.source === data.target;
  }
  addNode(node, attributes) {
    const nodeData = addNode(this, node, attributes);
    return nodeData.key;
  }
  mergeNode(node, attributes) {
    if (attributes && !isPlainObject(attributes))
      throw new InvalidArgumentsGraphError(`Graph.mergeNode: invalid attributes. Expecting an object but got "${attributes}"`);
    node = "" + node;
    attributes = attributes || {};
    let data = this._nodes.get(node);
    if (data) {
      if (attributes) {
        assign(data.attributes, attributes);
        this.emit("nodeAttributesUpdated", {
          type: "merge",
          key: node,
          attributes: data.attributes,
          data: attributes
        });
      }
      return [node, false];
    }
    data = new this.NodeDataClass(node, attributes);
    this._nodes.set(node, data);
    this.emit("nodeAdded", {
      key: node,
      attributes
    });
    return [node, true];
  }
  updateNode(node, updater) {
    if (updater && typeof updater !== "function")
      throw new InvalidArgumentsGraphError(`Graph.updateNode: invalid updater function. Expecting a function but got "${updater}"`);
    node = "" + node;
    let data = this._nodes.get(node);
    if (data) {
      if (updater) {
        const oldAttributes = data.attributes;
        data.attributes = updater(oldAttributes);
        this.emit("nodeAttributesUpdated", {
          type: "replace",
          key: node,
          attributes: data.attributes
        });
      }
      return [node, false];
    }
    const attributes = updater ? updater({}) : {};
    data = new this.NodeDataClass(node, attributes);
    this._nodes.set(node, data);
    this.emit("nodeAdded", {
      key: node,
      attributes
    });
    return [node, true];
  }
  dropNode(node) {
    node = "" + node;
    const nodeData = this._nodes.get(node);
    if (!nodeData)
      throw new NotFoundGraphError(`Graph.dropNode: could not find the "${node}" node in the graph.`);
    let edgeData;
    if (this.type !== "undirected") {
      for (const neighbor in nodeData.out) {
        edgeData = nodeData.out[neighbor];
        do {
          dropEdgeFromData(this, edgeData);
          edgeData = edgeData.next;
        } while (edgeData);
      }
      for (const neighbor in nodeData.in) {
        edgeData = nodeData.in[neighbor];
        do {
          dropEdgeFromData(this, edgeData);
          edgeData = edgeData.next;
        } while (edgeData);
      }
    }
    if (this.type !== "directed") {
      for (const neighbor in nodeData.undirected) {
        edgeData = nodeData.undirected[neighbor];
        do {
          dropEdgeFromData(this, edgeData);
          edgeData = edgeData.next;
        } while (edgeData);
      }
    }
    this._nodes.delete(node);
    this.emit("nodeDropped", {
      key: node,
      attributes: nodeData.attributes
    });
  }
  dropEdge(edge) {
    let edgeData;
    if (arguments.length > 1) {
      const source = "" + arguments[0];
      const target = "" + arguments[1];
      edgeData = getMatchingEdge(this, source, target, this.type);
      if (!edgeData)
        throw new NotFoundGraphError(`Graph.dropEdge: could not find the "${source}" -> "${target}" edge in the graph.`);
    } else {
      edge = "" + edge;
      edgeData = this._edges.get(edge);
      if (!edgeData)
        throw new NotFoundGraphError(`Graph.dropEdge: could not find the "${edge}" edge in the graph.`);
    }
    dropEdgeFromData(this, edgeData);
    return this;
  }
  dropDirectedEdge(source, target) {
    if (arguments.length < 2)
      throw new UsageGraphError("Graph.dropDirectedEdge: it does not make sense to try and drop a directed edge by key. What if the edge with this key is undirected? Use #.dropEdge for this purpose instead.");
    if (this.multi)
      throw new UsageGraphError("Graph.dropDirectedEdge: cannot use a {source,target} combo when dropping an edge in a MultiGraph since we cannot infer the one you want to delete as there could be multiple ones.");
    source = "" + source;
    target = "" + target;
    const edgeData = getMatchingEdge(this, source, target, "directed");
    if (!edgeData)
      throw new NotFoundGraphError(`Graph.dropDirectedEdge: could not find a "${source}" -> "${target}" edge in the graph.`);
    dropEdgeFromData(this, edgeData);
    return this;
  }
  dropUndirectedEdge(source, target) {
    if (arguments.length < 2)
      throw new UsageGraphError("Graph.dropUndirectedEdge: it does not make sense to drop a directed edge by key. What if the edge with this key is undirected? Use #.dropEdge for this purpose instead.");
    if (this.multi)
      throw new UsageGraphError("Graph.dropUndirectedEdge: cannot use a {source,target} combo when dropping an edge in a MultiGraph since we cannot infer the one you want to delete as there could be multiple ones.");
    const edgeData = getMatchingEdge(this, source, target, "undirected");
    if (!edgeData)
      throw new NotFoundGraphError(`Graph.dropUndirectedEdge: could not find a "${source}" -> "${target}" edge in the graph.`);
    dropEdgeFromData(this, edgeData);
    return this;
  }
  clear() {
    this._edges.clear();
    this._nodes.clear();
    this._resetInstanceCounters();
    this.emit("cleared");
  }
  clearEdges() {
    const iterator = this._nodes.values();
    let step;
    while (step = iterator.next(), step.done !== true) {
      step.value.clear();
    }
    this._edges.clear();
    this._resetInstanceCounters();
    this.emit("edgesCleared");
  }
  getAttribute(name) {
    return this._attributes[name];
  }
  getAttributes() {
    return this._attributes;
  }
  hasAttribute(name) {
    return this._attributes.hasOwnProperty(name);
  }
  setAttribute(name, value) {
    this._attributes[name] = value;
    this.emit("attributesUpdated", {
      type: "set",
      attributes: this._attributes,
      name
    });
    return this;
  }
  updateAttribute(name, updater) {
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError("Graph.updateAttribute: updater should be a function.");
    const value = this._attributes[name];
    this._attributes[name] = updater(value);
    this.emit("attributesUpdated", {
      type: "set",
      attributes: this._attributes,
      name
    });
    return this;
  }
  removeAttribute(name) {
    delete this._attributes[name];
    this.emit("attributesUpdated", {
      type: "remove",
      attributes: this._attributes,
      name
    });
    return this;
  }
  replaceAttributes(attributes) {
    if (!isPlainObject(attributes))
      throw new InvalidArgumentsGraphError("Graph.replaceAttributes: provided attributes are not a plain object.");
    this._attributes = attributes;
    this.emit("attributesUpdated", {
      type: "replace",
      attributes: this._attributes
    });
    return this;
  }
  mergeAttributes(attributes) {
    if (!isPlainObject(attributes))
      throw new InvalidArgumentsGraphError("Graph.mergeAttributes: provided attributes are not a plain object.");
    assign(this._attributes, attributes);
    this.emit("attributesUpdated", {
      type: "merge",
      attributes: this._attributes,
      data: attributes
    });
    return this;
  }
  updateAttributes(updater) {
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError("Graph.updateAttributes: provided updater is not a function.");
    this._attributes = updater(this._attributes);
    this.emit("attributesUpdated", {
      type: "update",
      attributes: this._attributes
    });
    return this;
  }
  updateEachNodeAttributes(updater, hints) {
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError("Graph.updateEachNodeAttributes: expecting an updater function.");
    if (hints && !validateHints(hints))
      throw new InvalidArgumentsGraphError("Graph.updateEachNodeAttributes: invalid hints. Expecting an object having the following shape: {attributes?: [string]}");
    const iterator = this._nodes.values();
    let step, nodeData;
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      nodeData.attributes = updater(nodeData.key, nodeData.attributes);
    }
    this.emit("eachNodeAttributesUpdated", {
      hints: hints ? hints : null
    });
  }
  updateEachEdgeAttributes(updater, hints) {
    if (typeof updater !== "function")
      throw new InvalidArgumentsGraphError("Graph.updateEachEdgeAttributes: expecting an updater function.");
    if (hints && !validateHints(hints))
      throw new InvalidArgumentsGraphError("Graph.updateEachEdgeAttributes: invalid hints. Expecting an object having the following shape: {attributes?: [string]}");
    const iterator = this._edges.values();
    let step, edgeData, sourceData, targetData;
    while (step = iterator.next(), step.done !== true) {
      edgeData = step.value;
      sourceData = edgeData.source;
      targetData = edgeData.target;
      edgeData.attributes = updater(edgeData.key, edgeData.attributes, sourceData.key, targetData.key, sourceData.attributes, targetData.attributes, edgeData.undirected);
    }
    this.emit("eachEdgeAttributesUpdated", {
      hints: hints ? hints : null
    });
  }
  forEachAdjacencyEntry(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.forEachAdjacencyEntry: expecting a callback.");
    forEachAdjacency(false, false, false, this, callback);
  }
  forEachAdjacencyEntryWithOrphans(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.forEachAdjacencyEntryWithOrphans: expecting a callback.");
    forEachAdjacency(false, false, true, this, callback);
  }
  forEachAssymetricAdjacencyEntry(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.forEachAssymetricAdjacencyEntry: expecting a callback.");
    forEachAdjacency(false, true, false, this, callback);
  }
  forEachAssymetricAdjacencyEntryWithOrphans(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.forEachAssymetricAdjacencyEntryWithOrphans: expecting a callback.");
    forEachAdjacency(false, true, true, this, callback);
  }
  nodes() {
    return Array.from(this._nodes.keys());
  }
  forEachNode(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.forEachNode: expecting a callback.");
    const iterator = this._nodes.values();
    let step, nodeData;
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      callback(nodeData.key, nodeData.attributes);
    }
  }
  findNode(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.findNode: expecting a callback.");
    const iterator = this._nodes.values();
    let step, nodeData;
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      if (callback(nodeData.key, nodeData.attributes))
        return nodeData.key;
    }
    return;
  }
  mapNodes(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.mapNode: expecting a callback.");
    const iterator = this._nodes.values();
    let step, nodeData;
    const result = new Array(this.order);
    let i = 0;
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      result[i++] = callback(nodeData.key, nodeData.attributes);
    }
    return result;
  }
  someNode(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.someNode: expecting a callback.");
    const iterator = this._nodes.values();
    let step, nodeData;
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      if (callback(nodeData.key, nodeData.attributes))
        return true;
    }
    return false;
  }
  everyNode(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.everyNode: expecting a callback.");
    const iterator = this._nodes.values();
    let step, nodeData;
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      if (!callback(nodeData.key, nodeData.attributes))
        return false;
    }
    return true;
  }
  filterNodes(callback) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.filterNodes: expecting a callback.");
    const iterator = this._nodes.values();
    let step, nodeData;
    const result = [];
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      if (callback(nodeData.key, nodeData.attributes))
        result.push(nodeData.key);
    }
    return result;
  }
  reduceNodes(callback, initialValue) {
    if (typeof callback !== "function")
      throw new InvalidArgumentsGraphError("Graph.reduceNodes: expecting a callback.");
    if (arguments.length < 2)
      throw new InvalidArgumentsGraphError("Graph.reduceNodes: missing initial value. You must provide it because the callback takes more than one argument and we cannot infer the initial value from the first iteration, as you could with a simple array.");
    let accumulator = initialValue;
    const iterator = this._nodes.values();
    let step, nodeData;
    while (step = iterator.next(), step.done !== true) {
      nodeData = step.value;
      accumulator = callback(accumulator, nodeData.key, nodeData.attributes);
    }
    return accumulator;
  }
  nodeEntries() {
    const iterator = this._nodes.values();
    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        const step = iterator.next();
        if (step.done)
          return step;
        const data = step.value;
        return {
          value: { node: data.key, attributes: data.attributes },
          done: false
        };
      }
    };
  }
  export() {
    const nodes = new Array(this._nodes.size);
    let i = 0;
    this._nodes.forEach((data, key) => {
      nodes[i++] = serializeNode(key, data);
    });
    const edges = new Array(this._edges.size);
    i = 0;
    this._edges.forEach((data, key) => {
      edges[i++] = serializeEdge(this.type, key, data);
    });
    return {
      options: {
        type: this.type,
        multi: this.multi,
        allowSelfLoops: this.allowSelfLoops
      },
      attributes: this.getAttributes(),
      nodes,
      edges
    };
  }
  import(data, merge = false) {
    if (data instanceof Graph) {
      data.forEachNode((n, a2) => {
        if (merge)
          this.mergeNode(n, a2);
        else
          this.addNode(n, a2);
      });
      data.forEachEdge((e, a2, s, t, _sa, _ta, u) => {
        if (merge) {
          if (u)
            this.mergeUndirectedEdgeWithKey(e, s, t, a2);
          else
            this.mergeDirectedEdgeWithKey(e, s, t, a2);
        } else {
          if (u)
            this.addUndirectedEdgeWithKey(e, s, t, a2);
          else
            this.addDirectedEdgeWithKey(e, s, t, a2);
        }
      });
      return this;
    }
    if (!isPlainObject(data))
      throw new InvalidArgumentsGraphError("Graph.import: invalid argument. Expecting a serialized graph or, alternatively, a Graph instance.");
    if (data.attributes) {
      if (!isPlainObject(data.attributes))
        throw new InvalidArgumentsGraphError("Graph.import: invalid attributes. Expecting a plain object.");
      if (merge)
        this.mergeAttributes(data.attributes);
      else
        this.replaceAttributes(data.attributes);
    }
    let i, l2, list, node, edge;
    if (data.nodes) {
      list = data.nodes;
      if (!Array.isArray(list))
        throw new InvalidArgumentsGraphError("Graph.import: invalid nodes. Expecting an array.");
      for (i = 0, l2 = list.length;i < l2; i++) {
        node = list[i];
        validateSerializedNode(node);
        const { key, attributes } = node;
        if (merge)
          this.mergeNode(key, attributes);
        else
          this.addNode(key, attributes);
      }
    }
    if (data.edges) {
      let undirectedByDefault = false;
      if (this.type === "undirected") {
        undirectedByDefault = true;
      }
      list = data.edges;
      if (!Array.isArray(list))
        throw new InvalidArgumentsGraphError("Graph.import: invalid edges. Expecting an array.");
      for (i = 0, l2 = list.length;i < l2; i++) {
        edge = list[i];
        validateSerializedEdge(edge);
        const {
          source,
          target,
          attributes,
          undirected = undirectedByDefault
        } = edge;
        let method;
        if ("key" in edge) {
          method = merge ? undirected ? this.mergeUndirectedEdgeWithKey : this.mergeDirectedEdgeWithKey : undirected ? this.addUndirectedEdgeWithKey : this.addDirectedEdgeWithKey;
          method.call(this, edge.key, source, target, attributes);
        } else {
          method = merge ? undirected ? this.mergeUndirectedEdge : this.mergeDirectedEdge : undirected ? this.addUndirectedEdge : this.addDirectedEdge;
          method.call(this, source, target, attributes);
        }
      }
    }
    return this;
  }
  nullCopy(options) {
    const graph = new Graph(assign({}, this._options, options));
    graph.replaceAttributes(assign({}, this.getAttributes()));
    return graph;
  }
  emptyCopy(options) {
    const graph = this.nullCopy(options);
    this._nodes.forEach((nodeData, key) => {
      const attributes = assign({}, nodeData.attributes);
      nodeData = new graph.NodeDataClass(key, attributes);
      graph._nodes.set(key, nodeData);
    });
    return graph;
  }
  copy(options) {
    options = options || {};
    if (typeof options.type === "string" && options.type !== this.type && options.type !== "mixed")
      throw new UsageGraphError(`Graph.copy: cannot create an incompatible copy from "${this.type}" type to "${options.type}" because this would mean losing information about the current graph.`);
    if (typeof options.multi === "boolean" && options.multi !== this.multi && options.multi !== true)
      throw new UsageGraphError("Graph.copy: cannot create an incompatible copy by downgrading a multi graph to a simple one because this would mean losing information about the current graph.");
    if (typeof options.allowSelfLoops === "boolean" && options.allowSelfLoops !== this.allowSelfLoops && options.allowSelfLoops !== true)
      throw new UsageGraphError("Graph.copy: cannot create an incompatible copy from a graph allowing self loops to one that does not because this would mean losing information about the current graph.");
    const graph = this.emptyCopy(options);
    const iterator = this._edges.values();
    let step, edgeData;
    while (step = iterator.next(), step.done !== true) {
      edgeData = step.value;
      addEdge(graph, "copy", false, edgeData.undirected, edgeData.key, edgeData.source.key, edgeData.target.key, assign({}, edgeData.attributes));
    }
    return graph;
  }
  toJSON() {
    return this.export();
  }
  toString() {
    return "[object Graph]";
  }
  inspect() {
    const nodes = {};
    this._nodes.forEach((data, key) => {
      nodes[key] = data.attributes;
    });
    const edges = {}, multiIndex = {};
    this._edges.forEach((data, key) => {
      const direction = data.undirected ? "--" : "->";
      let label = "";
      let source = data.source.key;
      let target = data.target.key;
      let tmp;
      if (data.undirected && source > target) {
        tmp = source;
        source = target;
        target = tmp;
      }
      const desc = `(${source})${direction}(${target})`;
      if (!key.startsWith("geid_")) {
        label += `[${key}]: `;
      } else if (this.multi) {
        if (typeof multiIndex[desc] === "undefined") {
          multiIndex[desc] = 0;
        } else {
          multiIndex[desc]++;
        }
        label += `${multiIndex[desc]}. `;
      }
      label += desc;
      edges[label] = data.attributes;
    });
    const dummy = {};
    for (const k in this) {
      if (this.hasOwnProperty(k) && !EMITTER_PROPS.has(k) && typeof this[k] !== "function" && typeof k !== "symbol")
        dummy[k] = this[k];
    }
    dummy.attributes = this._attributes;
    dummy.nodes = nodes;
    dummy.edges = edges;
    privateProperty(dummy, "constructor", this.constructor);
    return dummy;
  }
}
if (typeof Symbol !== "undefined")
  Graph.prototype[Symbol.for("nodejs.util.inspect.custom")] = Graph.prototype.inspect;
EDGE_ADD_METHODS.forEach((method) => {
  ["add", "merge", "update"].forEach((verb) => {
    const name = method.name(verb);
    const fn = verb === "add" ? addEdge : mergeEdge;
    if (method.generateKey) {
      Graph.prototype[name] = function(source, target, attributes) {
        return fn(this, name, true, (method.type || this.type) === "undirected", null, source, target, attributes, verb === "update");
      };
    } else {
      Graph.prototype[name] = function(edge, source, target, attributes) {
        return fn(this, name, false, (method.type || this.type) === "undirected", edge, source, target, attributes, verb === "update");
      };
    }
  });
});
attachNodeAttributesMethods(Graph);
attachEdgeAttributesMethods(Graph);
attachEdgeIterationMethods(Graph);
attachNeighborIterationMethods(Graph);

class DirectedGraph extends Graph {
  constructor(options) {
    const finalOptions = assign({ type: "directed" }, options);
    if ("multi" in finalOptions && finalOptions.multi !== false)
      throw new InvalidArgumentsGraphError("DirectedGraph.from: inconsistent indication that the graph should be multi in given options!");
    if (finalOptions.type !== "directed")
      throw new InvalidArgumentsGraphError('DirectedGraph.from: inconsistent "' + finalOptions.type + '" type in given options!');
    super(finalOptions);
  }
}

class UndirectedGraph extends Graph {
  constructor(options) {
    const finalOptions = assign({ type: "undirected" }, options);
    if ("multi" in finalOptions && finalOptions.multi !== false)
      throw new InvalidArgumentsGraphError("UndirectedGraph.from: inconsistent indication that the graph should be multi in given options!");
    if (finalOptions.type !== "undirected")
      throw new InvalidArgumentsGraphError('UndirectedGraph.from: inconsistent "' + finalOptions.type + '" type in given options!');
    super(finalOptions);
  }
}

class MultiGraph extends Graph {
  constructor(options) {
    const finalOptions = assign({ multi: true }, options);
    if ("multi" in finalOptions && finalOptions.multi !== true)
      throw new InvalidArgumentsGraphError("MultiGraph.from: inconsistent indication that the graph should be simple in given options!");
    super(finalOptions);
  }
}

class MultiDirectedGraph extends Graph {
  constructor(options) {
    const finalOptions = assign({ type: "directed", multi: true }, options);
    if ("multi" in finalOptions && finalOptions.multi !== true)
      throw new InvalidArgumentsGraphError("MultiDirectedGraph.from: inconsistent indication that the graph should be simple in given options!");
    if (finalOptions.type !== "directed")
      throw new InvalidArgumentsGraphError('MultiDirectedGraph.from: inconsistent "' + finalOptions.type + '" type in given options!');
    super(finalOptions);
  }
}

class MultiUndirectedGraph extends Graph {
  constructor(options) {
    const finalOptions = assign({ type: "undirected", multi: true }, options);
    if ("multi" in finalOptions && finalOptions.multi !== true)
      throw new InvalidArgumentsGraphError("MultiUndirectedGraph.from: inconsistent indication that the graph should be simple in given options!");
    if (finalOptions.type !== "undirected")
      throw new InvalidArgumentsGraphError('MultiUndirectedGraph.from: inconsistent "' + finalOptions.type + '" type in given options!');
    super(finalOptions);
  }
}
function attachStaticFromMethod(Class) {
  Class.from = function(data, options) {
    const finalOptions = assign({}, data.options, options);
    const instance = new Class(finalOptions);
    instance.import(data);
    return instance;
  };
}
attachStaticFromMethod(Graph);
attachStaticFromMethod(DirectedGraph);
attachStaticFromMethod(UndirectedGraph);
attachStaticFromMethod(MultiGraph);
attachStaticFromMethod(MultiDirectedGraph);
attachStaticFromMethod(MultiUndirectedGraph);
Graph.Graph = Graph;
Graph.DirectedGraph = DirectedGraph;
Graph.UndirectedGraph = UndirectedGraph;
Graph.MultiGraph = MultiGraph;
Graph.MultiDirectedGraph = MultiDirectedGraph;
Graph.MultiUndirectedGraph = MultiUndirectedGraph;
Graph.InvalidArgumentsGraphError = InvalidArgumentsGraphError;
Graph.NotFoundGraphError = NotFoundGraphError;
Graph.UsageGraphError = UsageGraphError;

// node_modules/sigma/dist/inherits-d1a1e29b.esm.js
function _toPrimitive(t, r) {
  if (typeof t != "object" || !t)
    return t;
  var e = t[Symbol.toPrimitive];
  if (e !== undefined) {
    var i = e.call(t, r || "default");
    if (typeof i != "object")
      return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return typeof i == "symbol" ? i : i + "";
}
function _classCallCheck(a2, n) {
  if (!(a2 instanceof n))
    throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0;t < r.length; t++) {
    var o2 = r[t];
    o2.enumerable = o2.enumerable || false, o2.configurable = true, "value" in o2 && (o2.writable = true), Object.defineProperty(e, _toPropertyKey(o2.key), o2);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
    return t2.__proto__ || Object.getPrototypeOf(t2);
  }, _getPrototypeOf(t);
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct = function() {
    return !!t;
  })();
}
function _assertThisInitialized(e) {
  if (e === undefined)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
function _possibleConstructorReturn(t, e) {
  if (e && (typeof e == "object" || typeof e == "function"))
    return e;
  if (e !== undefined)
    throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
}
function _callSuper(t, o2, e) {
  return o2 = _getPrototypeOf(o2), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o2, e || [], _getPrototypeOf(t).constructor) : o2.apply(t, e));
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
    return t2.__proto__ = e2, t2;
  }, _setPrototypeOf(t, e);
}
function _inherits(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t, "prototype", {
    writable: false
  }), e && _setPrototypeOf(t, e);
}

// node_modules/sigma/dist/colors-beb06eb2.esm.js
function _arrayWithHoles(r) {
  if (Array.isArray(r))
    return r;
}
function _iterableToArrayLimit(r, l2) {
  var t = r == null ? null : typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e, n, i, u, a2 = [], f = true, o2 = false;
    try {
      if (i = (t = t.call(r)).next, l2 === 0) {
        if (Object(t) !== t)
          return;
        f = false;
      } else
        for (;!(f = (e = i.call(t)).done) && (a2.push(e.value), a2.length !== l2); f = true)
          ;
    } catch (r2) {
      o2 = true, n = r2;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u))
          return;
      } finally {
        if (o2)
          throw n;
      }
    }
    return a2;
  }
}
function _arrayLikeToArray(r, a2) {
  (a2 == null || a2 > r.length) && (a2 = r.length);
  for (var e = 0, n = Array(a2);e < a2; e++)
    n[e] = r[e];
  return n;
}
function _unsupportedIterableToArray(r, a2) {
  if (r) {
    if (typeof r == "string")
      return _arrayLikeToArray(r, a2);
    var t = {}.toString.call(r).slice(8, -1);
    return t === "Object" && r.constructor && (t = r.constructor.name), t === "Map" || t === "Set" ? Array.from(r) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a2) : undefined;
  }
}
function _nonIterableRest() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
var HTML_COLORS = {
  black: "#000000",
  silver: "#C0C0C0",
  gray: "#808080",
  grey: "#808080",
  white: "#FFFFFF",
  maroon: "#800000",
  red: "#FF0000",
  purple: "#800080",
  fuchsia: "#FF00FF",
  green: "#008000",
  lime: "#00FF00",
  olive: "#808000",
  yellow: "#FFFF00",
  navy: "#000080",
  blue: "#0000FF",
  teal: "#008080",
  aqua: "#00FFFF",
  darkblue: "#00008B",
  mediumblue: "#0000CD",
  darkgreen: "#006400",
  darkcyan: "#008B8B",
  deepskyblue: "#00BFFF",
  darkturquoise: "#00CED1",
  mediumspringgreen: "#00FA9A",
  springgreen: "#00FF7F",
  cyan: "#00FFFF",
  midnightblue: "#191970",
  dodgerblue: "#1E90FF",
  lightseagreen: "#20B2AA",
  forestgreen: "#228B22",
  seagreen: "#2E8B57",
  darkslategray: "#2F4F4F",
  darkslategrey: "#2F4F4F",
  limegreen: "#32CD32",
  mediumseagreen: "#3CB371",
  turquoise: "#40E0D0",
  royalblue: "#4169E1",
  steelblue: "#4682B4",
  darkslateblue: "#483D8B",
  mediumturquoise: "#48D1CC",
  indigo: "#4B0082",
  darkolivegreen: "#556B2F",
  cadetblue: "#5F9EA0",
  cornflowerblue: "#6495ED",
  rebeccapurple: "#663399",
  mediumaquamarine: "#66CDAA",
  dimgray: "#696969",
  dimgrey: "#696969",
  slateblue: "#6A5ACD",
  olivedrab: "#6B8E23",
  slategray: "#708090",
  slategrey: "#708090",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  mediumslateblue: "#7B68EE",
  lawngreen: "#7CFC00",
  chartreuse: "#7FFF00",
  aquamarine: "#7FFFD4",
  skyblue: "#87CEEB",
  lightskyblue: "#87CEFA",
  blueviolet: "#8A2BE2",
  darkred: "#8B0000",
  darkmagenta: "#8B008B",
  saddlebrown: "#8B4513",
  darkseagreen: "#8FBC8F",
  lightgreen: "#90EE90",
  mediumpurple: "#9370DB",
  darkviolet: "#9400D3",
  palegreen: "#98FB98",
  darkorchid: "#9932CC",
  yellowgreen: "#9ACD32",
  sienna: "#A0522D",
  brown: "#A52A2A",
  darkgray: "#A9A9A9",
  darkgrey: "#A9A9A9",
  lightblue: "#ADD8E6",
  greenyellow: "#ADFF2F",
  paleturquoise: "#AFEEEE",
  lightsteelblue: "#B0C4DE",
  powderblue: "#B0E0E6",
  firebrick: "#B22222",
  darkgoldenrod: "#B8860B",
  mediumorchid: "#BA55D3",
  rosybrown: "#BC8F8F",
  darkkhaki: "#BDB76B",
  mediumvioletred: "#C71585",
  indianred: "#CD5C5C",
  peru: "#CD853F",
  chocolate: "#D2691E",
  tan: "#D2B48C",
  lightgray: "#D3D3D3",
  lightgrey: "#D3D3D3",
  thistle: "#D8BFD8",
  orchid: "#DA70D6",
  goldenrod: "#DAA520",
  palevioletred: "#DB7093",
  crimson: "#DC143C",
  gainsboro: "#DCDCDC",
  plum: "#DDA0DD",
  burlywood: "#DEB887",
  lightcyan: "#E0FFFF",
  lavender: "#E6E6FA",
  darksalmon: "#E9967A",
  violet: "#EE82EE",
  palegoldenrod: "#EEE8AA",
  lightcoral: "#F08080",
  khaki: "#F0E68C",
  aliceblue: "#F0F8FF",
  honeydew: "#F0FFF0",
  azure: "#F0FFFF",
  sandybrown: "#F4A460",
  wheat: "#F5DEB3",
  beige: "#F5F5DC",
  whitesmoke: "#F5F5F5",
  mintcream: "#F5FFFA",
  ghostwhite: "#F8F8FF",
  salmon: "#FA8072",
  antiquewhite: "#FAEBD7",
  linen: "#FAF0E6",
  lightgoldenrodyellow: "#FAFAD2",
  oldlace: "#FDF5E6",
  magenta: "#FF00FF",
  deeppink: "#FF1493",
  orangered: "#FF4500",
  tomato: "#FF6347",
  hotpink: "#FF69B4",
  coral: "#FF7F50",
  darkorange: "#FF8C00",
  lightsalmon: "#FFA07A",
  orange: "#FFA500",
  lightpink: "#FFB6C1",
  pink: "#FFC0CB",
  gold: "#FFD700",
  peachpuff: "#FFDAB9",
  navajowhite: "#FFDEAD",
  moccasin: "#FFE4B5",
  bisque: "#FFE4C4",
  mistyrose: "#FFE4E1",
  blanchedalmond: "#FFEBCD",
  papayawhip: "#FFEFD5",
  lavenderblush: "#FFF0F5",
  seashell: "#FFF5EE",
  cornsilk: "#FFF8DC",
  lemonchiffon: "#FFFACD",
  floralwhite: "#FFFAF0",
  snow: "#FFFAFA",
  lightyellow: "#FFFFE0",
  ivory: "#FFFFF0"
};
var INT8 = new Int8Array(4);
var INT32 = new Int32Array(INT8.buffer, 0, 1);
var FLOAT32 = new Float32Array(INT8.buffer, 0, 1);
var RGBA_TEST_REGEX = /^\s*rgba?\s*\(/;
var RGBA_EXTRACT_REGEX = /^\s*rgba?\s*\(\s*([0-9]*)\s*,\s*([0-9]*)\s*,\s*([0-9]*)(?:\s*,\s*(.*)?)?\)\s*$/;
function parseColor(val) {
  var r = 0;
  var g2 = 0;
  var b2 = 0;
  var a2 = 1;
  if (val[0] === "#") {
    if (val.length === 4) {
      r = parseInt(val.charAt(1) + val.charAt(1), 16);
      g2 = parseInt(val.charAt(2) + val.charAt(2), 16);
      b2 = parseInt(val.charAt(3) + val.charAt(3), 16);
    } else {
      r = parseInt(val.charAt(1) + val.charAt(2), 16);
      g2 = parseInt(val.charAt(3) + val.charAt(4), 16);
      b2 = parseInt(val.charAt(5) + val.charAt(6), 16);
    }
    if (val.length === 9) {
      a2 = parseInt(val.charAt(7) + val.charAt(8), 16) / 255;
    }
  } else if (RGBA_TEST_REGEX.test(val)) {
    var match = val.match(RGBA_EXTRACT_REGEX);
    if (match) {
      r = +match[1];
      g2 = +match[2];
      b2 = +match[3];
      if (match[4])
        a2 = +match[4];
    }
  }
  return {
    r,
    g: g2,
    b: b2,
    a: a2
  };
}
var FLOAT_COLOR_CACHE = {};
for (htmlColor in HTML_COLORS) {
  FLOAT_COLOR_CACHE[htmlColor] = floatColor(HTML_COLORS[htmlColor]);
  FLOAT_COLOR_CACHE[HTML_COLORS[htmlColor]] = FLOAT_COLOR_CACHE[htmlColor];
}
var htmlColor;
function rgbaToFloat(r, g2, b2, a2, masking) {
  INT32[0] = a2 << 24 | b2 << 16 | g2 << 8 | r;
  if (masking)
    INT32[0] = INT32[0] & 4278190079;
  return FLOAT32[0];
}
function floatColor(val) {
  val = val.toLowerCase();
  if (typeof FLOAT_COLOR_CACHE[val] !== "undefined")
    return FLOAT_COLOR_CACHE[val];
  var parsed = parseColor(val);
  var { r, g: g2, b: b2 } = parsed;
  var a2 = parsed.a;
  a2 = a2 * 255 | 0;
  var color = rgbaToFloat(r, g2, b2, a2, true);
  FLOAT_COLOR_CACHE[val] = color;
  return color;
}
var FLOAT_INDEX_CACHE = {};
function indexToColor(index) {
  if (typeof FLOAT_INDEX_CACHE[index] !== "undefined")
    return FLOAT_INDEX_CACHE[index];
  var r = (index & 16711680) >>> 16;
  var g2 = (index & 65280) >>> 8;
  var b2 = index & 255;
  var a2 = 255;
  var color = rgbaToFloat(r, g2, b2, a2, true);
  FLOAT_INDEX_CACHE[index] = color;
  return color;
}
function colorToIndex(r, g2, b2, _a) {
  return b2 + (g2 << 8) + (r << 16);
}
function getPixelColor(gl, frameBuffer, x2, y2, pixelRatio, downSizingRatio) {
  var bufferX = Math.floor(x2 / downSizingRatio * pixelRatio);
  var bufferY = Math.floor(gl.drawingBufferHeight / downSizingRatio - y2 / downSizingRatio * pixelRatio);
  var pixel = new Uint8Array(4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.readPixels(bufferX, bufferY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  var _pixel = _slicedToArray(pixel, 4), r = _pixel[0], g2 = _pixel[1], b2 = _pixel[2], a2 = _pixel[3];
  return [r, g2, b2, a2];
}

// node_modules/sigma/dist/index-236c62ad.esm.js
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o2 = Object.getOwnPropertySymbols(e);
    r && (o2 = o2.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o2);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1;r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _superPropBase(t, o2) {
  for (;!{}.hasOwnProperty.call(t, o2) && (t = _getPrototypeOf(t)) !== null; )
    ;
  return t;
}
function _get() {
  return _get = typeof Reflect != "undefined" && Reflect.get ? Reflect.get.bind() : function(e, t, r) {
    var p = _superPropBase(e, t);
    if (p) {
      var n = Object.getOwnPropertyDescriptor(p, t);
      return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
    }
  }, _get.apply(null, arguments);
}
function _superPropGet(t, o2, e, r) {
  var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o2, e);
  return 2 & r && typeof p == "function" ? function(t2) {
    return p.apply(e, t2);
  } : p;
}
function getAttributeItemsCount(attr) {
  return attr.normalized ? 1 : attr.size;
}
function getAttributesItemsCount(attrs) {
  var res = 0;
  attrs.forEach(function(attr) {
    return res += getAttributeItemsCount(attr);
  });
  return res;
}
function loadShader(type, gl, source) {
  var glType = type === "VERTEX" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
  var shader = gl.createShader(glType);
  if (shader === null) {
    throw new Error("loadShader: error while creating the shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var successfullyCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!successfullyCompiled) {
    var infoLog = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`loadShader: error while compiling the shader:
`.concat(infoLog, `
`).concat(source));
  }
  return shader;
}
function loadVertexShader(gl, source) {
  return loadShader("VERTEX", gl, source);
}
function loadFragmentShader(gl, source) {
  return loadShader("FRAGMENT", gl, source);
}
function loadProgram(gl, shaders) {
  var program = gl.createProgram();
  if (program === null) {
    throw new Error("loadProgram: error while creating the program.");
  }
  var i, l2;
  for (i = 0, l2 = shaders.length;i < l2; i++)
    gl.attachShader(program, shaders[i]);
  gl.linkProgram(program);
  var successfullyLinked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!successfullyLinked) {
    gl.deleteProgram(program);
    throw new Error("loadProgram: error while linking the program.");
  }
  return program;
}
function killProgram(_ref) {
  var { gl, buffer, program, vertexShader, fragmentShader } = _ref;
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  gl.deleteProgram(program);
  gl.deleteBuffer(buffer);
}
var PICKING_PREFIX = `#define PICKING_MODE
`;
var SIZE_FACTOR_PER_ATTRIBUTE_TYPE = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, WebGL2RenderingContext.BOOL, 1), WebGL2RenderingContext.BYTE, 1), WebGL2RenderingContext.UNSIGNED_BYTE, 1), WebGL2RenderingContext.SHORT, 2), WebGL2RenderingContext.UNSIGNED_SHORT, 2), WebGL2RenderingContext.INT, 4), WebGL2RenderingContext.UNSIGNED_INT, 4), WebGL2RenderingContext.FLOAT, 4);
var Program = /* @__PURE__ */ function() {
  function Program2(gl, pickingBuffer, renderer) {
    _classCallCheck(this, Program2);
    _defineProperty(this, "array", new Float32Array);
    _defineProperty(this, "constantArray", new Float32Array);
    _defineProperty(this, "capacity", 0);
    _defineProperty(this, "verticesCount", 0);
    var def = this.getDefinition();
    this.VERTICES = def.VERTICES;
    this.VERTEX_SHADER_SOURCE = def.VERTEX_SHADER_SOURCE;
    this.FRAGMENT_SHADER_SOURCE = def.FRAGMENT_SHADER_SOURCE;
    this.UNIFORMS = def.UNIFORMS;
    this.ATTRIBUTES = def.ATTRIBUTES;
    this.METHOD = def.METHOD;
    this.CONSTANT_ATTRIBUTES = "CONSTANT_ATTRIBUTES" in def ? def.CONSTANT_ATTRIBUTES : [];
    this.CONSTANT_DATA = "CONSTANT_DATA" in def ? def.CONSTANT_DATA : [];
    this.isInstanced = "CONSTANT_ATTRIBUTES" in def;
    this.ATTRIBUTES_ITEMS_COUNT = getAttributesItemsCount(this.ATTRIBUTES);
    this.STRIDE = this.VERTICES * this.ATTRIBUTES_ITEMS_COUNT;
    this.renderer = renderer;
    this.normalProgram = this.getProgramInfo("normal", gl, def.VERTEX_SHADER_SOURCE, def.FRAGMENT_SHADER_SOURCE, null);
    this.pickProgram = pickingBuffer ? this.getProgramInfo("pick", gl, PICKING_PREFIX + def.VERTEX_SHADER_SOURCE, PICKING_PREFIX + def.FRAGMENT_SHADER_SOURCE, pickingBuffer) : null;
    if (this.isInstanced) {
      var constantAttributesItemsCount = getAttributesItemsCount(this.CONSTANT_ATTRIBUTES);
      if (this.CONSTANT_DATA.length !== this.VERTICES)
        throw new Error("Program: error while getting constant data (expected ".concat(this.VERTICES, " items, received ").concat(this.CONSTANT_DATA.length, " instead)"));
      this.constantArray = new Float32Array(this.CONSTANT_DATA.length * constantAttributesItemsCount);
      for (var i = 0;i < this.CONSTANT_DATA.length; i++) {
        var vector = this.CONSTANT_DATA[i];
        if (vector.length !== constantAttributesItemsCount)
          throw new Error("Program: error while getting constant data (one vector has ".concat(vector.length, " items instead of ").concat(constantAttributesItemsCount, ")"));
        for (var j2 = 0;j2 < vector.length; j2++)
          this.constantArray[i * constantAttributesItemsCount + j2] = vector[j2];
      }
      this.STRIDE = this.ATTRIBUTES_ITEMS_COUNT;
    }
  }
  return _createClass(Program2, [{
    key: "kill",
    value: function kill() {
      killProgram(this.normalProgram);
      if (this.pickProgram) {
        killProgram(this.pickProgram);
        this.pickProgram = null;
      }
    }
  }, {
    key: "getProgramInfo",
    value: function getProgramInfo(name, gl, vertexShaderSource, fragmentShaderSource, frameBuffer) {
      var def = this.getDefinition();
      var buffer = gl.createBuffer();
      if (buffer === null)
        throw new Error("Program: error while creating the WebGL buffer.");
      var vertexShader = loadVertexShader(gl, vertexShaderSource);
      var fragmentShader = loadFragmentShader(gl, fragmentShaderSource);
      var program = loadProgram(gl, [vertexShader, fragmentShader]);
      var uniformLocations = {};
      def.UNIFORMS.forEach(function(uniformName) {
        var location = gl.getUniformLocation(program, uniformName);
        if (location)
          uniformLocations[uniformName] = location;
      });
      var attributeLocations = {};
      def.ATTRIBUTES.forEach(function(attr) {
        attributeLocations[attr.name] = gl.getAttribLocation(program, attr.name);
      });
      var constantBuffer;
      if ("CONSTANT_ATTRIBUTES" in def) {
        def.CONSTANT_ATTRIBUTES.forEach(function(attr) {
          attributeLocations[attr.name] = gl.getAttribLocation(program, attr.name);
        });
        constantBuffer = gl.createBuffer();
        if (constantBuffer === null)
          throw new Error("Program: error while creating the WebGL constant buffer.");
      }
      return {
        name,
        program,
        gl,
        frameBuffer,
        buffer,
        constantBuffer: constantBuffer || {},
        uniformLocations,
        attributeLocations,
        isPicking: name === "pick",
        vertexShader,
        fragmentShader
      };
    }
  }, {
    key: "bindProgram",
    value: function bindProgram(program) {
      var _this = this;
      var offset = 0;
      var { gl, buffer } = program;
      if (!this.isInstanced) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        offset = 0;
        this.ATTRIBUTES.forEach(function(attr) {
          return offset += _this.bindAttribute(attr, program, offset);
        });
        gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.DYNAMIC_DRAW);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, program.constantBuffer);
        offset = 0;
        this.CONSTANT_ATTRIBUTES.forEach(function(attr) {
          return offset += _this.bindAttribute(attr, program, offset, false);
        });
        gl.bufferData(gl.ARRAY_BUFFER, this.constantArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, program.buffer);
        offset = 0;
        this.ATTRIBUTES.forEach(function(attr) {
          return offset += _this.bindAttribute(attr, program, offset, true);
        });
        gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.DYNAMIC_DRAW);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }, {
    key: "unbindProgram",
    value: function unbindProgram(program) {
      var _this2 = this;
      if (!this.isInstanced) {
        this.ATTRIBUTES.forEach(function(attr) {
          return _this2.unbindAttribute(attr, program);
        });
      } else {
        this.CONSTANT_ATTRIBUTES.forEach(function(attr) {
          return _this2.unbindAttribute(attr, program, false);
        });
        this.ATTRIBUTES.forEach(function(attr) {
          return _this2.unbindAttribute(attr, program, true);
        });
      }
    }
  }, {
    key: "bindAttribute",
    value: function bindAttribute(attr, program, offset, setDivisor) {
      var sizeFactor = SIZE_FACTOR_PER_ATTRIBUTE_TYPE[attr.type];
      if (typeof sizeFactor !== "number")
        throw new Error('Program.bind: yet unsupported attribute type "'.concat(attr.type, '"'));
      var location = program.attributeLocations[attr.name];
      var gl = program.gl;
      if (location !== -1) {
        gl.enableVertexAttribArray(location);
        var stride = !this.isInstanced ? this.ATTRIBUTES_ITEMS_COUNT * Float32Array.BYTES_PER_ELEMENT : (setDivisor ? this.ATTRIBUTES_ITEMS_COUNT : getAttributesItemsCount(this.CONSTANT_ATTRIBUTES)) * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(location, attr.size, attr.type, attr.normalized || false, stride, offset);
        if (this.isInstanced && setDivisor) {
          if (gl instanceof WebGL2RenderingContext) {
            gl.vertexAttribDivisor(location, 1);
          } else {
            var ext = gl.getExtension("ANGLE_instanced_arrays");
            if (ext)
              ext.vertexAttribDivisorANGLE(location, 1);
          }
        }
      }
      return attr.size * sizeFactor;
    }
  }, {
    key: "unbindAttribute",
    value: function unbindAttribute(attr, program, unsetDivisor) {
      var location = program.attributeLocations[attr.name];
      var gl = program.gl;
      if (location !== -1) {
        gl.disableVertexAttribArray(location);
        if (this.isInstanced && unsetDivisor) {
          if (gl instanceof WebGL2RenderingContext) {
            gl.vertexAttribDivisor(location, 0);
          } else {
            var ext = gl.getExtension("ANGLE_instanced_arrays");
            if (ext)
              ext.vertexAttribDivisorANGLE(location, 0);
          }
        }
      }
    }
  }, {
    key: "reallocate",
    value: function reallocate(capacity) {
      if (capacity === this.capacity)
        return;
      this.capacity = capacity;
      this.verticesCount = this.VERTICES * capacity;
      this.array = new Float32Array(!this.isInstanced ? this.verticesCount * this.ATTRIBUTES_ITEMS_COUNT : this.capacity * this.ATTRIBUTES_ITEMS_COUNT);
    }
  }, {
    key: "hasNothingToRender",
    value: function hasNothingToRender() {
      return this.verticesCount === 0;
    }
  }, {
    key: "renderProgram",
    value: function renderProgram(params, programInfo) {
      var { gl, program } = programInfo;
      gl.enable(gl.BLEND);
      gl.useProgram(program);
      this.setUniforms(params, programInfo);
      this.drawWebGL(this.METHOD, programInfo);
    }
  }, {
    key: "render",
    value: function render(params) {
      if (this.hasNothingToRender())
        return;
      if (this.pickProgram) {
        this.pickProgram.gl.viewport(0, 0, params.width * params.pixelRatio / params.downSizingRatio, params.height * params.pixelRatio / params.downSizingRatio);
        this.bindProgram(this.pickProgram);
        this.renderProgram(_objectSpread2(_objectSpread2({}, params), {}, {
          pixelRatio: params.pixelRatio / params.downSizingRatio
        }), this.pickProgram);
        this.unbindProgram(this.pickProgram);
      }
      this.normalProgram.gl.viewport(0, 0, params.width * params.pixelRatio, params.height * params.pixelRatio);
      this.bindProgram(this.normalProgram);
      this.renderProgram(params, this.normalProgram);
      this.unbindProgram(this.normalProgram);
    }
  }, {
    key: "drawWebGL",
    value: function drawWebGL(method, _ref) {
      var { gl, frameBuffer } = _ref;
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
      if (!this.isInstanced) {
        gl.drawArrays(method, 0, this.verticesCount);
      } else {
        if (gl instanceof WebGL2RenderingContext) {
          gl.drawArraysInstanced(method, 0, this.VERTICES, this.capacity);
        } else {
          var ext = gl.getExtension("ANGLE_instanced_arrays");
          if (ext)
            ext.drawArraysInstancedANGLE(method, 0, this.VERTICES, this.capacity);
        }
      }
    }
  }]);
}();
var NodeProgram = /* @__PURE__ */ function(_ref) {
  function NodeProgram2() {
    _classCallCheck(this, NodeProgram2);
    return _callSuper(this, NodeProgram2, arguments);
  }
  _inherits(NodeProgram2, _ref);
  return _createClass(NodeProgram2, [{
    key: "kill",
    value: function kill() {
      _superPropGet(NodeProgram2, "kill", this, 3)([]);
    }
  }, {
    key: "process",
    value: function process(nodeIndex, offset, data) {
      var i = offset * this.STRIDE;
      if (data.hidden) {
        for (var l2 = i + this.STRIDE;i < l2; i++) {
          this.array[i] = 0;
        }
        return;
      }
      return this.processVisibleItem(indexToColor(nodeIndex), i, data);
    }
  }]);
}(Program);
var EdgeProgram = /* @__PURE__ */ function(_ref) {
  function EdgeProgram2() {
    var _this;
    _classCallCheck(this, EdgeProgram2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, EdgeProgram2, [].concat(args));
    _defineProperty(_this, "drawLabel", undefined);
    return _this;
  }
  _inherits(EdgeProgram2, _ref);
  return _createClass(EdgeProgram2, [{
    key: "kill",
    value: function kill() {
      _superPropGet(EdgeProgram2, "kill", this, 3)([]);
    }
  }, {
    key: "process",
    value: function process(edgeIndex, offset, sourceData, targetData, data) {
      var i = offset * this.STRIDE;
      if (data.hidden || sourceData.hidden || targetData.hidden) {
        for (var l2 = i + this.STRIDE;i < l2; i++) {
          this.array[i] = 0;
        }
        return;
      }
      return this.processVisibleItem(indexToColor(edgeIndex), i, sourceData, targetData, data);
    }
  }]);
}(Program);
function createEdgeCompoundProgram(programClasses, drawLabel) {
  return /* @__PURE__ */ function() {
    function EdgeCompoundProgram(gl, pickingBuffer, renderer) {
      _classCallCheck(this, EdgeCompoundProgram);
      _defineProperty(this, "drawLabel", drawLabel);
      this.programs = programClasses.map(function(Program2) {
        return new Program2(gl, pickingBuffer, renderer);
      });
    }
    return _createClass(EdgeCompoundProgram, [{
      key: "reallocate",
      value: function reallocate(capacity) {
        this.programs.forEach(function(program) {
          return program.reallocate(capacity);
        });
      }
    }, {
      key: "process",
      value: function process(edgeIndex, offset, sourceData, targetData, data) {
        this.programs.forEach(function(program) {
          return program.process(edgeIndex, offset, sourceData, targetData, data);
        });
      }
    }, {
      key: "render",
      value: function render(params) {
        this.programs.forEach(function(program) {
          return program.render(params);
        });
      }
    }, {
      key: "kill",
      value: function kill() {
        this.programs.forEach(function(program) {
          return program.kill();
        });
      }
    }]);
  }();
}
function drawStraightEdgeLabel(context, edgeData, sourceData, targetData, settings) {
  var { edgeLabelSize: size, edgeLabelFont: font, edgeLabelWeight: weight } = settings, color = settings.edgeLabelColor.attribute ? edgeData[settings.edgeLabelColor.attribute] || settings.edgeLabelColor.color || "#000" : settings.edgeLabelColor.color;
  var label = edgeData.label;
  if (!label)
    return;
  context.fillStyle = color;
  context.font = "".concat(weight, " ").concat(size, "px ").concat(font);
  var sSize = sourceData.size;
  var tSize = targetData.size;
  var sx = sourceData.x;
  var sy = sourceData.y;
  var tx = targetData.x;
  var ty = targetData.y;
  var cx = (sx + tx) / 2;
  var cy = (sy + ty) / 2;
  var dx = tx - sx;
  var dy = ty - sy;
  var d2 = Math.sqrt(dx * dx + dy * dy);
  if (d2 < sSize + tSize)
    return;
  sx += dx * sSize / d2;
  sy += dy * sSize / d2;
  tx -= dx * tSize / d2;
  ty -= dy * tSize / d2;
  cx = (sx + tx) / 2;
  cy = (sy + ty) / 2;
  dx = tx - sx;
  dy = ty - sy;
  d2 = Math.sqrt(dx * dx + dy * dy);
  var textLength = context.measureText(label).width;
  if (textLength > d2) {
    var ellipsis = "…";
    label = label + ellipsis;
    textLength = context.measureText(label).width;
    while (textLength > d2 && label.length > 1) {
      label = label.slice(0, -2) + ellipsis;
      textLength = context.measureText(label).width;
    }
    if (label.length < 4)
      return;
  }
  var angle;
  if (dx > 0) {
    if (dy > 0)
      angle = Math.acos(dx / d2);
    else
      angle = Math.asin(dy / d2);
  } else {
    if (dy > 0)
      angle = Math.acos(dx / d2) + Math.PI;
    else
      angle = Math.asin(dx / d2) + Math.PI / 2;
  }
  context.save();
  context.translate(cx, cy);
  context.rotate(angle);
  context.fillText(label, -textLength / 2, edgeData.size / 2 + size);
  context.restore();
}
function drawDiscNodeLabel(context, data, settings) {
  if (!data.label)
    return;
  var { labelSize: size, labelFont: font, labelWeight: weight } = settings, color = settings.labelColor.attribute ? data[settings.labelColor.attribute] || settings.labelColor.color || "#000" : settings.labelColor.color;
  context.fillStyle = color;
  context.font = "".concat(weight, " ").concat(size, "px ").concat(font);
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}
function drawDiscNodeHover(context, data, settings) {
  var { labelSize: size, labelFont: font, labelWeight: weight } = settings;
  context.font = "".concat(weight, " ").concat(size, "px ").concat(font);
  context.fillStyle = "#FFF";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 8;
  context.shadowColor = "#000";
  var PADDING = 2;
  if (typeof data.label === "string") {
    var textWidth = context.measureText(data.label).width, boxWidth = Math.round(textWidth + 5), boxHeight = Math.round(size + 2 * PADDING), radius = Math.max(data.size, size / 2) + PADDING;
    var angleRadian = Math.asin(boxHeight / 2 / radius);
    var xDeltaCoord = Math.sqrt(Math.abs(Math.pow(radius, 2) - Math.pow(boxHeight / 2, 2)));
    context.beginPath();
    context.moveTo(data.x + xDeltaCoord, data.y + boxHeight / 2);
    context.lineTo(data.x + radius + boxWidth, data.y + boxHeight / 2);
    context.lineTo(data.x + radius + boxWidth, data.y - boxHeight / 2);
    context.lineTo(data.x + xDeltaCoord, data.y - boxHeight / 2);
    context.arc(data.x, data.y, radius, angleRadian, -angleRadian);
    context.closePath();
    context.fill();
  } else {
    context.beginPath();
    context.arc(data.x, data.y, data.size + PADDING, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  }
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;
  drawDiscNodeLabel(context, data, settings);
}
var SHADER_SOURCE$6 = `
precision highp float;

varying vec4 v_color;
varying vec2 v_diffVector;
varying float v_radius;

uniform float u_correctionRatio;

const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

void main(void) {
  float border = u_correctionRatio * 2.0;
  float dist = length(v_diffVector) - v_radius + border;

  // No antialiasing for picking mode:
  #ifdef PICKING_MODE
  if (dist > border)
    gl_FragColor = transparent;
  else
    gl_FragColor = v_color;

  #else
  float t = 0.0;
  if (dist > border)
    t = 1.0;
  else if (dist > 0.0)
    t = dist / border;

  gl_FragColor = mix(v_color, transparent, t);
  #endif
}
`;
var FRAGMENT_SHADER_SOURCE$2 = SHADER_SOURCE$6;
var SHADER_SOURCE$5 = `
attribute vec4 a_id;
attribute vec4 a_color;
attribute vec2 a_position;
attribute float a_size;
attribute float a_angle;

uniform mat3 u_matrix;
uniform float u_sizeRatio;
uniform float u_correctionRatio;

varying vec4 v_color;
varying vec2 v_diffVector;
varying float v_radius;
varying float v_border;

const float bias = 255.0 / 254.0;

void main() {
  float size = a_size * u_correctionRatio / u_sizeRatio * 4.0;
  vec2 diffVector = size * vec2(cos(a_angle), sin(a_angle));
  vec2 position = a_position + diffVector;
  gl_Position = vec4(
    (u_matrix * vec3(position, 1)).xy,
    0,
    1
  );

  v_diffVector = diffVector;
  v_radius = size / 2.0;

  #ifdef PICKING_MODE
  // For picking mode, we use the ID as the color:
  v_color = a_id;
  #else
  // For normal mode, we use the color:
  v_color = a_color;
  #endif

  v_color.a *= bias;
}
`;
var VERTEX_SHADER_SOURCE$3 = SHADER_SOURCE$5;
var _WebGLRenderingContex$3 = WebGLRenderingContext;
var UNSIGNED_BYTE$3 = _WebGLRenderingContex$3.UNSIGNED_BYTE;
var FLOAT$3 = _WebGLRenderingContex$3.FLOAT;
var UNIFORMS$3 = ["u_sizeRatio", "u_correctionRatio", "u_matrix"];
var NodeCircleProgram = /* @__PURE__ */ function(_NodeProgram) {
  function NodeCircleProgram2() {
    _classCallCheck(this, NodeCircleProgram2);
    return _callSuper(this, NodeCircleProgram2, arguments);
  }
  _inherits(NodeCircleProgram2, _NodeProgram);
  return _createClass(NodeCircleProgram2, [{
    key: "getDefinition",
    value: function getDefinition() {
      return {
        VERTICES: 3,
        VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE$3,
        FRAGMENT_SHADER_SOURCE: FRAGMENT_SHADER_SOURCE$2,
        METHOD: WebGLRenderingContext.TRIANGLES,
        UNIFORMS: UNIFORMS$3,
        ATTRIBUTES: [{
          name: "a_position",
          size: 2,
          type: FLOAT$3
        }, {
          name: "a_size",
          size: 1,
          type: FLOAT$3
        }, {
          name: "a_color",
          size: 4,
          type: UNSIGNED_BYTE$3,
          normalized: true
        }, {
          name: "a_id",
          size: 4,
          type: UNSIGNED_BYTE$3,
          normalized: true
        }],
        CONSTANT_ATTRIBUTES: [{
          name: "a_angle",
          size: 1,
          type: FLOAT$3
        }],
        CONSTANT_DATA: [[NodeCircleProgram2.ANGLE_1], [NodeCircleProgram2.ANGLE_2], [NodeCircleProgram2.ANGLE_3]]
      };
    }
  }, {
    key: "processVisibleItem",
    value: function processVisibleItem(nodeIndex, startIndex, data) {
      var array = this.array;
      var color = floatColor(data.color);
      array[startIndex++] = data.x;
      array[startIndex++] = data.y;
      array[startIndex++] = data.size;
      array[startIndex++] = color;
      array[startIndex++] = nodeIndex;
    }
  }, {
    key: "setUniforms",
    value: function setUniforms(params, _ref) {
      var { gl, uniformLocations } = _ref;
      var { u_sizeRatio, u_correctionRatio, u_matrix } = uniformLocations;
      gl.uniform1f(u_correctionRatio, params.correctionRatio);
      gl.uniform1f(u_sizeRatio, params.sizeRatio);
      gl.uniformMatrix3fv(u_matrix, false, params.matrix);
    }
  }]);
}(NodeProgram);
_defineProperty(NodeCircleProgram, "ANGLE_1", 0);
_defineProperty(NodeCircleProgram, "ANGLE_2", 2 * Math.PI / 3);
_defineProperty(NodeCircleProgram, "ANGLE_3", 4 * Math.PI / 3);
var SHADER_SOURCE$4 = `
precision mediump float;

varying vec4 v_color;

void main(void) {
  gl_FragColor = v_color;
}
`;
var FRAGMENT_SHADER_SOURCE$1 = SHADER_SOURCE$4;
var SHADER_SOURCE$3 = `
attribute vec2 a_position;
attribute vec2 a_normal;
attribute float a_radius;
attribute vec3 a_barycentric;

#ifdef PICKING_MODE
attribute vec4 a_id;
#else
attribute vec4 a_color;
#endif

uniform mat3 u_matrix;
uniform float u_sizeRatio;
uniform float u_correctionRatio;
uniform float u_minEdgeThickness;
uniform float u_lengthToThicknessRatio;
uniform float u_widenessToThicknessRatio;

varying vec4 v_color;

const float bias = 255.0 / 254.0;

void main() {
  float minThickness = u_minEdgeThickness;

  float normalLength = length(a_normal);
  vec2 unitNormal = a_normal / normalLength;

  // These first computations are taken from edge.vert.glsl and
  // edge.clamped.vert.glsl. Please read it to get better comments on what's
  // happening:
  float pixelsThickness = max(normalLength / u_sizeRatio, minThickness);
  float webGLThickness = pixelsThickness * u_correctionRatio;
  float webGLNodeRadius = a_radius * 2.0 * u_correctionRatio / u_sizeRatio;
  float webGLArrowHeadLength = webGLThickness * u_lengthToThicknessRatio * 2.0;
  float webGLArrowHeadThickness = webGLThickness * u_widenessToThicknessRatio;

  float da = a_barycentric.x;
  float db = a_barycentric.y;
  float dc = a_barycentric.z;

  vec2 delta = vec2(
      da * (webGLNodeRadius * unitNormal.y)
    + db * ((webGLNodeRadius + webGLArrowHeadLength) * unitNormal.y + webGLArrowHeadThickness * unitNormal.x)
    + dc * ((webGLNodeRadius + webGLArrowHeadLength) * unitNormal.y - webGLArrowHeadThickness * unitNormal.x),

      da * (-webGLNodeRadius * unitNormal.x)
    + db * (-(webGLNodeRadius + webGLArrowHeadLength) * unitNormal.x + webGLArrowHeadThickness * unitNormal.y)
    + dc * (-(webGLNodeRadius + webGLArrowHeadLength) * unitNormal.x - webGLArrowHeadThickness * unitNormal.y)
  );

  vec2 position = (u_matrix * vec3(a_position + delta, 1)).xy;

  gl_Position = vec4(position, 0, 1);

  #ifdef PICKING_MODE
  // For picking mode, we use the ID as the color:
  v_color = a_id;
  #else
  // For normal mode, we use the color:
  v_color = a_color;
  #endif

  v_color.a *= bias;
}
`;
var VERTEX_SHADER_SOURCE$2 = SHADER_SOURCE$3;
var _WebGLRenderingContex$2 = WebGLRenderingContext;
var UNSIGNED_BYTE$2 = _WebGLRenderingContex$2.UNSIGNED_BYTE;
var FLOAT$2 = _WebGLRenderingContex$2.FLOAT;
var UNIFORMS$2 = ["u_matrix", "u_sizeRatio", "u_correctionRatio", "u_minEdgeThickness", "u_lengthToThicknessRatio", "u_widenessToThicknessRatio"];
var DEFAULT_EDGE_ARROW_HEAD_PROGRAM_OPTIONS = {
  extremity: "target",
  lengthToThicknessRatio: 2.5,
  widenessToThicknessRatio: 2
};
function createEdgeArrowHeadProgram(inputOptions) {
  var options = _objectSpread2(_objectSpread2({}, DEFAULT_EDGE_ARROW_HEAD_PROGRAM_OPTIONS), inputOptions || {});
  return /* @__PURE__ */ function(_EdgeProgram) {
    function EdgeArrowHeadProgram() {
      _classCallCheck(this, EdgeArrowHeadProgram);
      return _callSuper(this, EdgeArrowHeadProgram, arguments);
    }
    _inherits(EdgeArrowHeadProgram, _EdgeProgram);
    return _createClass(EdgeArrowHeadProgram, [{
      key: "getDefinition",
      value: function getDefinition() {
        return {
          VERTICES: 3,
          VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE$2,
          FRAGMENT_SHADER_SOURCE: FRAGMENT_SHADER_SOURCE$1,
          METHOD: WebGLRenderingContext.TRIANGLES,
          UNIFORMS: UNIFORMS$2,
          ATTRIBUTES: [{
            name: "a_position",
            size: 2,
            type: FLOAT$2
          }, {
            name: "a_normal",
            size: 2,
            type: FLOAT$2
          }, {
            name: "a_radius",
            size: 1,
            type: FLOAT$2
          }, {
            name: "a_color",
            size: 4,
            type: UNSIGNED_BYTE$2,
            normalized: true
          }, {
            name: "a_id",
            size: 4,
            type: UNSIGNED_BYTE$2,
            normalized: true
          }],
          CONSTANT_ATTRIBUTES: [{
            name: "a_barycentric",
            size: 3,
            type: FLOAT$2
          }],
          CONSTANT_DATA: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        };
      }
    }, {
      key: "processVisibleItem",
      value: function processVisibleItem(edgeIndex, startIndex, sourceData, targetData, data) {
        if (options.extremity === "source") {
          var _ref = [targetData, sourceData];
          sourceData = _ref[0];
          targetData = _ref[1];
        }
        var thickness = data.size || 1;
        var radius = targetData.size || 1;
        var x1 = sourceData.x;
        var y1 = sourceData.y;
        var x2 = targetData.x;
        var y2 = targetData.y;
        var color = floatColor(data.color);
        var dx = x2 - x1;
        var dy = y2 - y1;
        var len = dx * dx + dy * dy;
        var n1 = 0;
        var n2 = 0;
        if (len) {
          len = 1 / Math.sqrt(len);
          n1 = -dy * len * thickness;
          n2 = dx * len * thickness;
        }
        var array = this.array;
        array[startIndex++] = x2;
        array[startIndex++] = y2;
        array[startIndex++] = -n1;
        array[startIndex++] = -n2;
        array[startIndex++] = radius;
        array[startIndex++] = color;
        array[startIndex++] = edgeIndex;
      }
    }, {
      key: "setUniforms",
      value: function setUniforms(params, _ref2) {
        var { gl, uniformLocations } = _ref2;
        var { u_matrix, u_sizeRatio, u_correctionRatio, u_minEdgeThickness, u_lengthToThicknessRatio, u_widenessToThicknessRatio } = uniformLocations;
        gl.uniformMatrix3fv(u_matrix, false, params.matrix);
        gl.uniform1f(u_sizeRatio, params.sizeRatio);
        gl.uniform1f(u_correctionRatio, params.correctionRatio);
        gl.uniform1f(u_minEdgeThickness, params.minEdgeThickness);
        gl.uniform1f(u_lengthToThicknessRatio, options.lengthToThicknessRatio);
        gl.uniform1f(u_widenessToThicknessRatio, options.widenessToThicknessRatio);
      }
    }]);
  }(EdgeProgram);
}
var EdgeArrowHeadProgram = createEdgeArrowHeadProgram();
var SHADER_SOURCE$2 = `
precision mediump float;

varying vec4 v_color;
varying vec2 v_normal;
varying float v_thickness;
varying float v_feather;

const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

void main(void) {
  // We only handle antialiasing for normal mode:
  #ifdef PICKING_MODE
  gl_FragColor = v_color;
  #else
  float dist = length(v_normal) * v_thickness;

  float t = smoothstep(
    v_thickness - v_feather,
    v_thickness,
    dist
  );

  gl_FragColor = mix(v_color, transparent, t);
  #endif
}
`;
var FRAGMENT_SHADER_SOURCE = SHADER_SOURCE$2;
var SHADER_SOURCE$1 = `
attribute vec4 a_id;
attribute vec4 a_color;
attribute vec2 a_normal;
attribute float a_normalCoef;
attribute vec2 a_positionStart;
attribute vec2 a_positionEnd;
attribute float a_positionCoef;
attribute float a_radius;
attribute float a_radiusCoef;

uniform mat3 u_matrix;
uniform float u_zoomRatio;
uniform float u_sizeRatio;
uniform float u_pixelRatio;
uniform float u_correctionRatio;
uniform float u_minEdgeThickness;
uniform float u_lengthToThicknessRatio;
uniform float u_feather;

varying vec4 v_color;
varying vec2 v_normal;
varying float v_thickness;
varying float v_feather;

const float bias = 255.0 / 254.0;

void main() {
  float minThickness = u_minEdgeThickness;

  float radius = a_radius * a_radiusCoef;
  vec2 normal = a_normal * a_normalCoef;
  vec2 position = a_positionStart * (1.0 - a_positionCoef) + a_positionEnd * a_positionCoef;

  float normalLength = length(normal);
  vec2 unitNormal = normal / normalLength;

  // These first computations are taken from edge.vert.glsl. Please read it to
  // get better comments on what's happening:
  float pixelsThickness = max(normalLength, minThickness * u_sizeRatio);
  float webGLThickness = pixelsThickness * u_correctionRatio / u_sizeRatio;

  // Here, we move the point to leave space for the arrow head:
  float direction = sign(radius);
  float webGLNodeRadius = direction * radius * 2.0 * u_correctionRatio / u_sizeRatio;
  float webGLArrowHeadLength = webGLThickness * u_lengthToThicknessRatio * 2.0;

  vec2 compensationVector = vec2(-direction * unitNormal.y, direction * unitNormal.x) * (webGLNodeRadius + webGLArrowHeadLength);

  // Here is the proper position of the vertex
  gl_Position = vec4((u_matrix * vec3(position + unitNormal * webGLThickness + compensationVector, 1)).xy, 0, 1);

  v_thickness = webGLThickness / u_zoomRatio;

  v_normal = unitNormal;

  v_feather = u_feather * u_correctionRatio / u_zoomRatio / u_pixelRatio * 2.0;

  #ifdef PICKING_MODE
  // For picking mode, we use the ID as the color:
  v_color = a_id;
  #else
  // For normal mode, we use the color:
  v_color = a_color;
  #endif

  v_color.a *= bias;
}
`;
var VERTEX_SHADER_SOURCE$1 = SHADER_SOURCE$1;
var _WebGLRenderingContex$1 = WebGLRenderingContext;
var UNSIGNED_BYTE$1 = _WebGLRenderingContex$1.UNSIGNED_BYTE;
var FLOAT$1 = _WebGLRenderingContex$1.FLOAT;
var UNIFORMS$1 = ["u_matrix", "u_zoomRatio", "u_sizeRatio", "u_correctionRatio", "u_pixelRatio", "u_feather", "u_minEdgeThickness", "u_lengthToThicknessRatio"];
var DEFAULT_EDGE_CLAMPED_PROGRAM_OPTIONS = {
  lengthToThicknessRatio: DEFAULT_EDGE_ARROW_HEAD_PROGRAM_OPTIONS.lengthToThicknessRatio
};
function createEdgeClampedProgram(inputOptions) {
  var options = _objectSpread2(_objectSpread2({}, DEFAULT_EDGE_CLAMPED_PROGRAM_OPTIONS), inputOptions || {});
  return /* @__PURE__ */ function(_EdgeProgram) {
    function EdgeClampedProgram() {
      _classCallCheck(this, EdgeClampedProgram);
      return _callSuper(this, EdgeClampedProgram, arguments);
    }
    _inherits(EdgeClampedProgram, _EdgeProgram);
    return _createClass(EdgeClampedProgram, [{
      key: "getDefinition",
      value: function getDefinition() {
        return {
          VERTICES: 6,
          VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE$1,
          FRAGMENT_SHADER_SOURCE,
          METHOD: WebGLRenderingContext.TRIANGLES,
          UNIFORMS: UNIFORMS$1,
          ATTRIBUTES: [{
            name: "a_positionStart",
            size: 2,
            type: FLOAT$1
          }, {
            name: "a_positionEnd",
            size: 2,
            type: FLOAT$1
          }, {
            name: "a_normal",
            size: 2,
            type: FLOAT$1
          }, {
            name: "a_color",
            size: 4,
            type: UNSIGNED_BYTE$1,
            normalized: true
          }, {
            name: "a_id",
            size: 4,
            type: UNSIGNED_BYTE$1,
            normalized: true
          }, {
            name: "a_radius",
            size: 1,
            type: FLOAT$1
          }],
          CONSTANT_ATTRIBUTES: [
            {
              name: "a_positionCoef",
              size: 1,
              type: FLOAT$1
            },
            {
              name: "a_normalCoef",
              size: 1,
              type: FLOAT$1
            },
            {
              name: "a_radiusCoef",
              size: 1,
              type: FLOAT$1
            }
          ],
          CONSTANT_DATA: [[0, 1, 0], [0, -1, 0], [1, 1, 1], [1, 1, 1], [0, -1, 0], [1, -1, -1]]
        };
      }
    }, {
      key: "processVisibleItem",
      value: function processVisibleItem(edgeIndex, startIndex, sourceData, targetData, data) {
        var thickness = data.size || 1;
        var x1 = sourceData.x;
        var y1 = sourceData.y;
        var x2 = targetData.x;
        var y2 = targetData.y;
        var color = floatColor(data.color);
        var dx = x2 - x1;
        var dy = y2 - y1;
        var radius = targetData.size || 1;
        var len = dx * dx + dy * dy;
        var n1 = 0;
        var n2 = 0;
        if (len) {
          len = 1 / Math.sqrt(len);
          n1 = -dy * len * thickness;
          n2 = dx * len * thickness;
        }
        var array = this.array;
        array[startIndex++] = x1;
        array[startIndex++] = y1;
        array[startIndex++] = x2;
        array[startIndex++] = y2;
        array[startIndex++] = n1;
        array[startIndex++] = n2;
        array[startIndex++] = color;
        array[startIndex++] = edgeIndex;
        array[startIndex++] = radius;
      }
    }, {
      key: "setUniforms",
      value: function setUniforms(params, _ref) {
        var { gl, uniformLocations } = _ref;
        var { u_matrix, u_zoomRatio, u_feather, u_pixelRatio, u_correctionRatio, u_sizeRatio, u_minEdgeThickness, u_lengthToThicknessRatio } = uniformLocations;
        gl.uniformMatrix3fv(u_matrix, false, params.matrix);
        gl.uniform1f(u_zoomRatio, params.zoomRatio);
        gl.uniform1f(u_sizeRatio, params.sizeRatio);
        gl.uniform1f(u_correctionRatio, params.correctionRatio);
        gl.uniform1f(u_pixelRatio, params.pixelRatio);
        gl.uniform1f(u_feather, params.antiAliasingFeather);
        gl.uniform1f(u_minEdgeThickness, params.minEdgeThickness);
        gl.uniform1f(u_lengthToThicknessRatio, options.lengthToThicknessRatio);
      }
    }]);
  }(EdgeProgram);
}
var EdgeClampedProgram = createEdgeClampedProgram();
function createEdgeArrowProgram(inputOptions) {
  return createEdgeCompoundProgram([createEdgeClampedProgram(inputOptions), createEdgeArrowHeadProgram(inputOptions)]);
}
var EdgeArrowProgram = createEdgeArrowProgram();
var EdgeArrowProgram$1 = EdgeArrowProgram;
var SHADER_SOURCE = `
attribute vec4 a_id;
attribute vec4 a_color;
attribute vec2 a_normal;
attribute float a_normalCoef;
attribute vec2 a_positionStart;
attribute vec2 a_positionEnd;
attribute float a_positionCoef;

uniform mat3 u_matrix;
uniform float u_sizeRatio;
uniform float u_zoomRatio;
uniform float u_pixelRatio;
uniform float u_correctionRatio;
uniform float u_minEdgeThickness;
uniform float u_feather;

varying vec4 v_color;
varying vec2 v_normal;
varying float v_thickness;
varying float v_feather;

const float bias = 255.0 / 254.0;

void main() {
  float minThickness = u_minEdgeThickness;

  vec2 normal = a_normal * a_normalCoef;
  vec2 position = a_positionStart * (1.0 - a_positionCoef) + a_positionEnd * a_positionCoef;

  float normalLength = length(normal);
  vec2 unitNormal = normal / normalLength;

  // We require edges to be at least "minThickness" pixels thick *on screen*
  // (so we need to compensate the size ratio):
  float pixelsThickness = max(normalLength, minThickness * u_sizeRatio);

  // Then, we need to retrieve the normalized thickness of the edge in the WebGL
  // referential (in a ([0, 1], [0, 1]) space), using our "magic" correction
  // ratio:
  float webGLThickness = pixelsThickness * u_correctionRatio / u_sizeRatio;

  // Here is the proper position of the vertex
  gl_Position = vec4((u_matrix * vec3(position + unitNormal * webGLThickness, 1)).xy, 0, 1);

  // For the fragment shader though, we need a thickness that takes the "magic"
  // correction ratio into account (as in webGLThickness), but so that the
  // antialiasing effect does not depend on the zoom level. So here's yet
  // another thickness version:
  v_thickness = webGLThickness / u_zoomRatio;

  v_normal = unitNormal;

  v_feather = u_feather * u_correctionRatio / u_zoomRatio / u_pixelRatio * 2.0;

  #ifdef PICKING_MODE
  // For picking mode, we use the ID as the color:
  v_color = a_id;
  #else
  // For normal mode, we use the color:
  v_color = a_color;
  #endif

  v_color.a *= bias;
}
`;
var VERTEX_SHADER_SOURCE = SHADER_SOURCE;
var _WebGLRenderingContex = WebGLRenderingContext;
var UNSIGNED_BYTE = _WebGLRenderingContex.UNSIGNED_BYTE;
var FLOAT = _WebGLRenderingContex.FLOAT;
var UNIFORMS = ["u_matrix", "u_zoomRatio", "u_sizeRatio", "u_correctionRatio", "u_pixelRatio", "u_feather", "u_minEdgeThickness"];
var EdgeRectangleProgram = /* @__PURE__ */ function(_EdgeProgram) {
  function EdgeRectangleProgram2() {
    _classCallCheck(this, EdgeRectangleProgram2);
    return _callSuper(this, EdgeRectangleProgram2, arguments);
  }
  _inherits(EdgeRectangleProgram2, _EdgeProgram);
  return _createClass(EdgeRectangleProgram2, [{
    key: "getDefinition",
    value: function getDefinition() {
      return {
        VERTICES: 6,
        VERTEX_SHADER_SOURCE,
        FRAGMENT_SHADER_SOURCE,
        METHOD: WebGLRenderingContext.TRIANGLES,
        UNIFORMS,
        ATTRIBUTES: [{
          name: "a_positionStart",
          size: 2,
          type: FLOAT
        }, {
          name: "a_positionEnd",
          size: 2,
          type: FLOAT
        }, {
          name: "a_normal",
          size: 2,
          type: FLOAT
        }, {
          name: "a_color",
          size: 4,
          type: UNSIGNED_BYTE,
          normalized: true
        }, {
          name: "a_id",
          size: 4,
          type: UNSIGNED_BYTE,
          normalized: true
        }],
        CONSTANT_ATTRIBUTES: [
          {
            name: "a_positionCoef",
            size: 1,
            type: FLOAT
          },
          {
            name: "a_normalCoef",
            size: 1,
            type: FLOAT
          }
        ],
        CONSTANT_DATA: [[0, 1], [0, -1], [1, 1], [1, 1], [0, -1], [1, -1]]
      };
    }
  }, {
    key: "processVisibleItem",
    value: function processVisibleItem(edgeIndex, startIndex, sourceData, targetData, data) {
      var thickness = data.size || 1;
      var x1 = sourceData.x;
      var y1 = sourceData.y;
      var x2 = targetData.x;
      var y2 = targetData.y;
      var color = floatColor(data.color);
      var dx = x2 - x1;
      var dy = y2 - y1;
      var len = dx * dx + dy * dy;
      var n1 = 0;
      var n2 = 0;
      if (len) {
        len = 1 / Math.sqrt(len);
        n1 = -dy * len * thickness;
        n2 = dx * len * thickness;
      }
      var array = this.array;
      array[startIndex++] = x1;
      array[startIndex++] = y1;
      array[startIndex++] = x2;
      array[startIndex++] = y2;
      array[startIndex++] = n1;
      array[startIndex++] = n2;
      array[startIndex++] = color;
      array[startIndex++] = edgeIndex;
    }
  }, {
    key: "setUniforms",
    value: function setUniforms(params, _ref) {
      var { gl, uniformLocations } = _ref;
      var { u_matrix, u_zoomRatio, u_feather, u_pixelRatio, u_correctionRatio, u_sizeRatio, u_minEdgeThickness } = uniformLocations;
      gl.uniformMatrix3fv(u_matrix, false, params.matrix);
      gl.uniform1f(u_zoomRatio, params.zoomRatio);
      gl.uniform1f(u_sizeRatio, params.sizeRatio);
      gl.uniform1f(u_correctionRatio, params.correctionRatio);
      gl.uniform1f(u_pixelRatio, params.pixelRatio);
      gl.uniform1f(u_feather, params.antiAliasingFeather);
      gl.uniform1f(u_minEdgeThickness, params.minEdgeThickness);
    }
  }]);
}(EdgeProgram);

// node_modules/sigma/types/dist/sigma-types.esm.js
var TypedEventEmitter = /* @__PURE__ */ function(_ref) {
  function TypedEventEmitter2() {
    var _this;
    _classCallCheck(this, TypedEventEmitter2);
    _this = _callSuper(this, TypedEventEmitter2);
    _this.rawEmitter = _this;
    return _this;
  }
  _inherits(TypedEventEmitter2, _ref);
  return _createClass(TypedEventEmitter2);
}(o);

// node_modules/sigma/dist/normalization-be445518.esm.js
var import_is_graph = __toESM(require_is_graph(), 1);
var linear = function linear2(k) {
  return k;
};
var quadraticIn = function quadraticIn2(k) {
  return k * k;
};
var quadraticOut = function quadraticOut2(k) {
  return k * (2 - k);
};
var quadraticInOut = function quadraticInOut2(k) {
  if ((k *= 2) < 1)
    return 0.5 * k * k;
  return -0.5 * (--k * (k - 2) - 1);
};
var cubicIn = function cubicIn2(k) {
  return k * k * k;
};
var cubicOut = function cubicOut2(k) {
  return --k * k * k + 1;
};
var cubicInOut = function cubicInOut2(k) {
  if ((k *= 2) < 1)
    return 0.5 * k * k * k;
  return 0.5 * ((k -= 2) * k * k + 2);
};
var easings = {
  linear,
  quadraticIn,
  quadraticOut,
  quadraticInOut,
  cubicIn,
  cubicOut,
  cubicInOut
};
var ANIMATE_DEFAULTS = {
  easing: "quadraticInOut",
  duration: 150
};
function identity() {
  return Float32Array.of(1, 0, 0, 0, 1, 0, 0, 0, 1);
}
function scale(m2, x2, y2) {
  m2[0] = x2;
  m2[4] = typeof y2 === "number" ? y2 : x2;
  return m2;
}
function rotate(m2, r) {
  var s = Math.sin(r), c = Math.cos(r);
  m2[0] = c;
  m2[1] = s;
  m2[3] = -s;
  m2[4] = c;
  return m2;
}
function translate(m2, x2, y2) {
  m2[6] = x2;
  m2[7] = y2;
  return m2;
}
function multiply(a2, b2) {
  var a00 = a2[0], a01 = a2[1], a02 = a2[2];
  var a10 = a2[3], a11 = a2[4], a12 = a2[5];
  var a20 = a2[6], a21 = a2[7], a22 = a2[8];
  var b00 = b2[0], b01 = b2[1], b02 = b2[2];
  var b10 = b2[3], b11 = b2[4], b12 = b2[5];
  var b20 = b2[6], b21 = b2[7], b22 = b2[8];
  a2[0] = b00 * a00 + b01 * a10 + b02 * a20;
  a2[1] = b00 * a01 + b01 * a11 + b02 * a21;
  a2[2] = b00 * a02 + b01 * a12 + b02 * a22;
  a2[3] = b10 * a00 + b11 * a10 + b12 * a20;
  a2[4] = b10 * a01 + b11 * a11 + b12 * a21;
  a2[5] = b10 * a02 + b11 * a12 + b12 * a22;
  a2[6] = b20 * a00 + b21 * a10 + b22 * a20;
  a2[7] = b20 * a01 + b21 * a11 + b22 * a21;
  a2[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return a2;
}
function multiplyVec2(a2, b2) {
  var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var a00 = a2[0];
  var a01 = a2[1];
  var a10 = a2[3];
  var a11 = a2[4];
  var a20 = a2[6];
  var a21 = a2[7];
  var b0 = b2.x;
  var b1 = b2.y;
  return {
    x: b0 * a00 + b1 * a10 + a20 * z,
    y: b0 * a01 + b1 * a11 + a21 * z
  };
}
function getCorrectionRatio(viewportDimensions, graphDimensions) {
  var viewportRatio = viewportDimensions.height / viewportDimensions.width;
  var graphRatio = graphDimensions.height / graphDimensions.width;
  if (viewportRatio < 1 && graphRatio > 1 || viewportRatio > 1 && graphRatio < 1) {
    return 1;
  }
  return Math.min(Math.max(graphRatio, 1 / graphRatio), Math.max(1 / viewportRatio, viewportRatio));
}
function matrixFromCamera(state, viewportDimensions, graphDimensions, padding, inverse) {
  var { angle, ratio, x: x2, y: y2 } = state;
  var { width, height } = viewportDimensions;
  var matrix = identity();
  var smallestDimension = Math.min(width, height) - 2 * padding;
  var correctionRatio = getCorrectionRatio(viewportDimensions, graphDimensions);
  if (!inverse) {
    multiply(matrix, scale(identity(), 2 * (smallestDimension / width) * correctionRatio, 2 * (smallestDimension / height) * correctionRatio));
    multiply(matrix, rotate(identity(), -angle));
    multiply(matrix, scale(identity(), 1 / ratio));
    multiply(matrix, translate(identity(), -x2, -y2));
  } else {
    multiply(matrix, translate(identity(), x2, y2));
    multiply(matrix, scale(identity(), ratio));
    multiply(matrix, rotate(identity(), angle));
    multiply(matrix, scale(identity(), width / smallestDimension / 2 / correctionRatio, height / smallestDimension / 2 / correctionRatio));
  }
  return matrix;
}
function getMatrixImpact(matrix, cameraState, viewportDimensions) {
  var _multiplyVec = multiplyVec2(matrix, {
    x: Math.cos(cameraState.angle),
    y: Math.sin(cameraState.angle)
  }, 0), x2 = _multiplyVec.x, y2 = _multiplyVec.y;
  return 1 / Math.sqrt(Math.pow(x2, 2) + Math.pow(y2, 2)) / viewportDimensions.width;
}
function graphExtent(graph) {
  if (!graph.order)
    return {
      x: [0, 1],
      y: [0, 1]
    };
  var xMin = Infinity;
  var xMax = -Infinity;
  var yMin = Infinity;
  var yMax = -Infinity;
  graph.forEachNode(function(_2, attr) {
    var { x: x2, y: y2 } = attr;
    if (x2 < xMin)
      xMin = x2;
    if (x2 > xMax)
      xMax = x2;
    if (y2 < yMin)
      yMin = y2;
    if (y2 > yMax)
      yMax = y2;
  });
  return {
    x: [xMin, xMax],
    y: [yMin, yMax]
  };
}
function validateGraph(graph) {
  if (!import_is_graph.default(graph))
    throw new Error("Sigma: invalid graph instance.");
  graph.forEachNode(function(key, attributes) {
    if (!Number.isFinite(attributes.x) || !Number.isFinite(attributes.y)) {
      throw new Error("Sigma: Coordinates of node ".concat(key, " are invalid. A node must have a numeric 'x' and 'y' attribute."));
    }
  });
}
function createElement(tag, style, attributes) {
  var element = document.createElement(tag);
  if (style) {
    for (var k in style) {
      element.style[k] = style[k];
    }
  }
  if (attributes) {
    for (var _k in attributes) {
      element.setAttribute(_k, attributes[_k]);
    }
  }
  return element;
}
function getPixelRatio() {
  if (typeof window.devicePixelRatio !== "undefined")
    return window.devicePixelRatio;
  return 1;
}
function zIndexOrdering(_extent, getter, elements) {
  return elements.sort(function(a2, b2) {
    var zA = getter(a2) || 0, zB = getter(b2) || 0;
    if (zA < zB)
      return -1;
    if (zA > zB)
      return 1;
    return 0;
  });
}
function createNormalizationFunction(extent) {
  var _extent$x = _slicedToArray(extent.x, 2), minX = _extent$x[0], maxX = _extent$x[1], _extent$y = _slicedToArray(extent.y, 2), minY = _extent$y[0], maxY = _extent$y[1];
  var ratio = Math.max(maxX - minX, maxY - minY), dX = (maxX + minX) / 2, dY = (maxY + minY) / 2;
  if (ratio === 0 || Math.abs(ratio) === Infinity || isNaN(ratio))
    ratio = 1;
  if (isNaN(dX))
    dX = 0;
  if (isNaN(dY))
    dY = 0;
  var fn = function fn(data) {
    return {
      x: 0.5 + (data.x - dX) / ratio,
      y: 0.5 + (data.y - dY) / ratio
    };
  };
  fn.applyTo = function(data) {
    data.x = 0.5 + (data.x - dX) / ratio;
    data.y = 0.5 + (data.y - dY) / ratio;
  };
  fn.inverse = function(data) {
    return {
      x: dX + ratio * (data.x - 0.5),
      y: dY + ratio * (data.y - 0.5)
    };
  };
  fn.ratio = ratio;
  return fn;
}

// node_modules/sigma/dist/data-11df7124.esm.js
function _typeof(o2) {
  "@babel/helpers - typeof";
  return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(o3) {
    return typeof o3;
  } : function(o3) {
    return o3 && typeof Symbol == "function" && o3.constructor === Symbol && o3 !== Symbol.prototype ? "symbol" : typeof o3;
  }, _typeof(o2);
}
function extend(array, values) {
  var l2 = values.size;
  if (l2 === 0)
    return;
  var l1 = array.length;
  array.length += l2;
  var i = 0;
  values.forEach(function(value) {
    array[l1 + i] = value;
    i++;
  });
}
function assign2(target) {
  target = target || {};
  for (var i = 0, l2 = arguments.length <= 1 ? 0 : arguments.length - 1;i < l2; i++) {
    var o2 = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
    if (!o2)
      continue;
    Object.assign(target, o2);
  }
  return target;
}

// node_modules/sigma/settings/dist/sigma-settings.esm.js
var DEFAULT_SETTINGS = {
  hideEdgesOnMove: false,
  hideLabelsOnMove: false,
  renderLabels: true,
  renderEdgeLabels: false,
  enableEdgeEvents: false,
  defaultNodeColor: "#999",
  defaultNodeType: "circle",
  defaultEdgeColor: "#ccc",
  defaultEdgeType: "line",
  labelFont: "Arial",
  labelSize: 14,
  labelWeight: "normal",
  labelColor: {
    color: "#000"
  },
  edgeLabelFont: "Arial",
  edgeLabelSize: 14,
  edgeLabelWeight: "normal",
  edgeLabelColor: {
    attribute: "color"
  },
  stagePadding: 30,
  defaultDrawEdgeLabel: drawStraightEdgeLabel,
  defaultDrawNodeLabel: drawDiscNodeLabel,
  defaultDrawNodeHover: drawDiscNodeHover,
  minEdgeThickness: 1.7,
  antiAliasingFeather: 1,
  dragTimeout: 100,
  draggedEventsTolerance: 3,
  inertiaDuration: 200,
  inertiaRatio: 3,
  zoomDuration: 250,
  zoomingRatio: 1.7,
  doubleClickTimeout: 300,
  doubleClickZoomingRatio: 2.2,
  doubleClickZoomingDuration: 200,
  tapMoveTolerance: 10,
  zoomToSizeRatioFunction: Math.sqrt,
  itemSizesReference: "screen",
  autoRescale: true,
  autoCenter: true,
  labelDensity: 1,
  labelGridCellSize: 100,
  labelRenderedSizeThreshold: 6,
  nodeReducer: null,
  edgeReducer: null,
  zIndex: false,
  minCameraRatio: null,
  maxCameraRatio: null,
  enableCameraZooming: true,
  enableCameraPanning: true,
  enableCameraRotation: true,
  cameraPanBoundaries: null,
  allowInvalidContainer: false,
  nodeProgramClasses: {},
  nodeHoverProgramClasses: {},
  edgeProgramClasses: {}
};
var DEFAULT_NODE_PROGRAM_CLASSES = {
  circle: NodeCircleProgram
};
var DEFAULT_EDGE_PROGRAM_CLASSES = {
  arrow: EdgeArrowProgram$1,
  line: EdgeRectangleProgram
};
function validateSettings(settings) {
  if (typeof settings.labelDensity !== "number" || settings.labelDensity < 0) {
    throw new Error("Settings: invalid `labelDensity`. Expecting a positive number.");
  }
  var { minCameraRatio, maxCameraRatio } = settings;
  if (typeof minCameraRatio === "number" && typeof maxCameraRatio === "number" && maxCameraRatio < minCameraRatio) {
    throw new Error("Settings: invalid camera ratio boundaries. Expecting `maxCameraRatio` to be greater than `minCameraRatio`.");
  }
}
function resolveSettings(settings) {
  var resolvedSettings = assign2({}, DEFAULT_SETTINGS, settings);
  resolvedSettings.nodeProgramClasses = assign2({}, DEFAULT_NODE_PROGRAM_CLASSES, resolvedSettings.nodeProgramClasses);
  resolvedSettings.edgeProgramClasses = assign2({}, DEFAULT_EDGE_PROGRAM_CLASSES, resolvedSettings.edgeProgramClasses);
  return resolvedSettings;
}

// node_modules/sigma/dist/sigma.esm.js
var import_is_graph2 = __toESM(require_is_graph(), 1);
var DEFAULT_ZOOMING_RATIO = 1.5;
var Camera = /* @__PURE__ */ function(_TypedEventEmitter) {
  function Camera2() {
    var _this;
    _classCallCheck(this, Camera2);
    _this = _callSuper(this, Camera2);
    _defineProperty(_this, "x", 0.5);
    _defineProperty(_this, "y", 0.5);
    _defineProperty(_this, "angle", 0);
    _defineProperty(_this, "ratio", 1);
    _defineProperty(_this, "minRatio", null);
    _defineProperty(_this, "maxRatio", null);
    _defineProperty(_this, "enabledZooming", true);
    _defineProperty(_this, "enabledPanning", true);
    _defineProperty(_this, "enabledRotation", true);
    _defineProperty(_this, "clean", null);
    _defineProperty(_this, "nextFrame", null);
    _defineProperty(_this, "previousState", null);
    _defineProperty(_this, "enabled", true);
    _this.previousState = _this.getState();
    return _this;
  }
  _inherits(Camera2, _TypedEventEmitter);
  return _createClass(Camera2, [{
    key: "enable",
    value: function enable() {
      this.enabled = true;
      return this;
    }
  }, {
    key: "disable",
    value: function disable() {
      this.enabled = false;
      return this;
    }
  }, {
    key: "getState",
    value: function getState() {
      return {
        x: this.x,
        y: this.y,
        angle: this.angle,
        ratio: this.ratio
      };
    }
  }, {
    key: "hasState",
    value: function hasState(state) {
      return this.x === state.x && this.y === state.y && this.ratio === state.ratio && this.angle === state.angle;
    }
  }, {
    key: "getPreviousState",
    value: function getPreviousState() {
      var state = this.previousState;
      if (!state)
        return null;
      return {
        x: state.x,
        y: state.y,
        angle: state.angle,
        ratio: state.ratio
      };
    }
  }, {
    key: "getBoundedRatio",
    value: function getBoundedRatio(ratio) {
      var r = ratio;
      if (typeof this.minRatio === "number")
        r = Math.max(r, this.minRatio);
      if (typeof this.maxRatio === "number")
        r = Math.min(r, this.maxRatio);
      return r;
    }
  }, {
    key: "validateState",
    value: function validateState(state) {
      var validatedState = {};
      if (this.enabledPanning && typeof state.x === "number")
        validatedState.x = state.x;
      if (this.enabledPanning && typeof state.y === "number")
        validatedState.y = state.y;
      if (this.enabledZooming && typeof state.ratio === "number")
        validatedState.ratio = this.getBoundedRatio(state.ratio);
      if (this.enabledRotation && typeof state.angle === "number")
        validatedState.angle = state.angle;
      return this.clean ? this.clean(_objectSpread2(_objectSpread2({}, this.getState()), validatedState)) : validatedState;
    }
  }, {
    key: "isAnimated",
    value: function isAnimated() {
      return !!this.nextFrame;
    }
  }, {
    key: "setState",
    value: function setState(state) {
      if (!this.enabled)
        return this;
      this.previousState = this.getState();
      var validState = this.validateState(state);
      if (typeof validState.x === "number")
        this.x = validState.x;
      if (typeof validState.y === "number")
        this.y = validState.y;
      if (typeof validState.ratio === "number")
        this.ratio = validState.ratio;
      if (typeof validState.angle === "number")
        this.angle = validState.angle;
      if (!this.hasState(this.previousState))
        this.emit("updated", this.getState());
      return this;
    }
  }, {
    key: "updateState",
    value: function updateState(updater) {
      this.setState(updater(this.getState()));
      return this;
    }
  }, {
    key: "animate",
    value: function animate(state) {
      var _this2 = this;
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var callback = arguments.length > 2 ? arguments[2] : undefined;
      if (!callback)
        return new Promise(function(resolve) {
          return _this2.animate(state, opts, resolve);
        });
      if (!this.enabled)
        return;
      var options = _objectSpread2(_objectSpread2({}, ANIMATE_DEFAULTS), opts);
      var validState = this.validateState(state);
      var easing = typeof options.easing === "function" ? options.easing : easings[options.easing];
      var start = Date.now(), initialState = this.getState();
      var _fn = function fn() {
        var t = (Date.now() - start) / options.duration;
        if (t >= 1) {
          _this2.nextFrame = null;
          _this2.setState(validState);
          if (_this2.animationCallback) {
            _this2.animationCallback.call(null);
            _this2.animationCallback = undefined;
          }
          return;
        }
        var coefficient = easing(t);
        var newState = {};
        if (typeof validState.x === "number")
          newState.x = initialState.x + (validState.x - initialState.x) * coefficient;
        if (typeof validState.y === "number")
          newState.y = initialState.y + (validState.y - initialState.y) * coefficient;
        if (_this2.enabledRotation && typeof validState.angle === "number")
          newState.angle = initialState.angle + (validState.angle - initialState.angle) * coefficient;
        if (typeof validState.ratio === "number")
          newState.ratio = initialState.ratio + (validState.ratio - initialState.ratio) * coefficient;
        _this2.setState(newState);
        _this2.nextFrame = requestAnimationFrame(_fn);
      };
      if (this.nextFrame) {
        cancelAnimationFrame(this.nextFrame);
        if (this.animationCallback)
          this.animationCallback.call(null);
        this.nextFrame = requestAnimationFrame(_fn);
      } else {
        _fn();
      }
      this.animationCallback = callback;
    }
  }, {
    key: "animatedZoom",
    value: function animatedZoom(factorOrOptions) {
      if (!factorOrOptions)
        return this.animate({
          ratio: this.ratio / DEFAULT_ZOOMING_RATIO
        });
      if (typeof factorOrOptions === "number")
        return this.animate({
          ratio: this.ratio / factorOrOptions
        });
      return this.animate({
        ratio: this.ratio / (factorOrOptions.factor || DEFAULT_ZOOMING_RATIO)
      }, factorOrOptions);
    }
  }, {
    key: "animatedUnzoom",
    value: function animatedUnzoom(factorOrOptions) {
      if (!factorOrOptions)
        return this.animate({
          ratio: this.ratio * DEFAULT_ZOOMING_RATIO
        });
      if (typeof factorOrOptions === "number")
        return this.animate({
          ratio: this.ratio * factorOrOptions
        });
      return this.animate({
        ratio: this.ratio * (factorOrOptions.factor || DEFAULT_ZOOMING_RATIO)
      }, factorOrOptions);
    }
  }, {
    key: "animatedReset",
    value: function animatedReset(options) {
      return this.animate({
        x: 0.5,
        y: 0.5,
        ratio: 1,
        angle: 0
      }, options);
    }
  }, {
    key: "copy",
    value: function copy() {
      return Camera2.from(this.getState());
    }
  }], [{
    key: "from",
    value: function from(state) {
      var camera = new Camera2;
      return camera.setState(state);
    }
  }]);
}(TypedEventEmitter);
function getPosition(e, dom) {
  var bbox = dom.getBoundingClientRect();
  return {
    x: e.clientX - bbox.left,
    y: e.clientY - bbox.top
  };
}
function getMouseCoords(e, dom) {
  var res = _objectSpread2(_objectSpread2({}, getPosition(e, dom)), {}, {
    sigmaDefaultPrevented: false,
    preventSigmaDefault: function preventSigmaDefault() {
      res.sigmaDefaultPrevented = true;
    },
    original: e
  });
  return res;
}
function cleanMouseCoords(e) {
  var res = "x" in e ? e : _objectSpread2(_objectSpread2({}, e.touches[0] || e.previousTouches[0]), {}, {
    original: e.original,
    sigmaDefaultPrevented: e.sigmaDefaultPrevented,
    preventSigmaDefault: function preventSigmaDefault() {
      e.sigmaDefaultPrevented = true;
      res.sigmaDefaultPrevented = true;
    }
  });
  return res;
}
function getWheelCoords(e, dom) {
  return _objectSpread2(_objectSpread2({}, getMouseCoords(e, dom)), {}, {
    delta: getWheelDelta(e)
  });
}
var MAX_TOUCHES = 2;
function getTouchesArray(touches) {
  var arr = [];
  for (var i = 0, l2 = Math.min(touches.length, MAX_TOUCHES);i < l2; i++)
    arr.push(touches[i]);
  return arr;
}
function getTouchCoords(e, previousTouches, dom) {
  var res = {
    touches: getTouchesArray(e.touches).map(function(touch) {
      return getPosition(touch, dom);
    }),
    previousTouches: previousTouches.map(function(touch) {
      return getPosition(touch, dom);
    }),
    sigmaDefaultPrevented: false,
    preventSigmaDefault: function preventSigmaDefault() {
      res.sigmaDefaultPrevented = true;
    },
    original: e
  };
  return res;
}
function getWheelDelta(e) {
  if (typeof e.deltaY !== "undefined")
    return e.deltaY * -3 / 360;
  if (typeof e.detail !== "undefined")
    return e.detail / -9;
  throw new Error("Captor: could not extract delta from event.");
}
var Captor = /* @__PURE__ */ function(_TypedEventEmitter) {
  function Captor2(container, renderer) {
    var _this;
    _classCallCheck(this, Captor2);
    _this = _callSuper(this, Captor2);
    _this.container = container;
    _this.renderer = renderer;
    return _this;
  }
  _inherits(Captor2, _TypedEventEmitter);
  return _createClass(Captor2);
}(TypedEventEmitter);
var MOUSE_SETTINGS_KEYS = ["doubleClickTimeout", "doubleClickZoomingDuration", "doubleClickZoomingRatio", "dragTimeout", "draggedEventsTolerance", "inertiaDuration", "inertiaRatio", "zoomDuration", "zoomingRatio"];
var DEFAULT_MOUSE_SETTINGS = MOUSE_SETTINGS_KEYS.reduce(function(iter, key) {
  return _objectSpread2(_objectSpread2({}, iter), {}, _defineProperty({}, key, DEFAULT_SETTINGS[key]));
}, {});
var MouseCaptor = /* @__PURE__ */ function(_Captor) {
  function MouseCaptor2(container, renderer) {
    var _this;
    _classCallCheck(this, MouseCaptor2);
    _this = _callSuper(this, MouseCaptor2, [container, renderer]);
    _defineProperty(_this, "enabled", true);
    _defineProperty(_this, "draggedEvents", 0);
    _defineProperty(_this, "downStartTime", null);
    _defineProperty(_this, "lastMouseX", null);
    _defineProperty(_this, "lastMouseY", null);
    _defineProperty(_this, "isMouseDown", false);
    _defineProperty(_this, "isMoving", false);
    _defineProperty(_this, "movingTimeout", null);
    _defineProperty(_this, "startCameraState", null);
    _defineProperty(_this, "clicks", 0);
    _defineProperty(_this, "doubleClickTimeout", null);
    _defineProperty(_this, "currentWheelDirection", 0);
    _defineProperty(_this, "settings", DEFAULT_MOUSE_SETTINGS);
    _this.handleClick = _this.handleClick.bind(_this);
    _this.handleRightClick = _this.handleRightClick.bind(_this);
    _this.handleDown = _this.handleDown.bind(_this);
    _this.handleUp = _this.handleUp.bind(_this);
    _this.handleMove = _this.handleMove.bind(_this);
    _this.handleWheel = _this.handleWheel.bind(_this);
    _this.handleLeave = _this.handleLeave.bind(_this);
    _this.handleEnter = _this.handleEnter.bind(_this);
    container.addEventListener("click", _this.handleClick, {
      capture: false
    });
    container.addEventListener("contextmenu", _this.handleRightClick, {
      capture: false
    });
    container.addEventListener("mousedown", _this.handleDown, {
      capture: false
    });
    container.addEventListener("wheel", _this.handleWheel, {
      capture: false
    });
    container.addEventListener("mouseleave", _this.handleLeave, {
      capture: false
    });
    container.addEventListener("mouseenter", _this.handleEnter, {
      capture: false
    });
    document.addEventListener("mousemove", _this.handleMove, {
      capture: false
    });
    document.addEventListener("mouseup", _this.handleUp, {
      capture: false
    });
    return _this;
  }
  _inherits(MouseCaptor2, _Captor);
  return _createClass(MouseCaptor2, [{
    key: "kill",
    value: function kill() {
      var container = this.container;
      container.removeEventListener("click", this.handleClick);
      container.removeEventListener("contextmenu", this.handleRightClick);
      container.removeEventListener("mousedown", this.handleDown);
      container.removeEventListener("wheel", this.handleWheel);
      container.removeEventListener("mouseleave", this.handleLeave);
      container.removeEventListener("mouseenter", this.handleEnter);
      document.removeEventListener("mousemove", this.handleMove);
      document.removeEventListener("mouseup", this.handleUp);
    }
  }, {
    key: "handleClick",
    value: function handleClick(e) {
      var _this2 = this;
      if (!this.enabled)
        return;
      this.clicks++;
      if (this.clicks === 2) {
        this.clicks = 0;
        if (typeof this.doubleClickTimeout === "number") {
          clearTimeout(this.doubleClickTimeout);
          this.doubleClickTimeout = null;
        }
        return this.handleDoubleClick(e);
      }
      setTimeout(function() {
        _this2.clicks = 0;
        _this2.doubleClickTimeout = null;
      }, this.settings.doubleClickTimeout);
      if (this.draggedEvents < this.settings.draggedEventsTolerance)
        this.emit("click", getMouseCoords(e, this.container));
    }
  }, {
    key: "handleRightClick",
    value: function handleRightClick(e) {
      if (!this.enabled)
        return;
      this.emit("rightClick", getMouseCoords(e, this.container));
    }
  }, {
    key: "handleDoubleClick",
    value: function handleDoubleClick(e) {
      if (!this.enabled)
        return;
      e.preventDefault();
      e.stopPropagation();
      var mouseCoords = getMouseCoords(e, this.container);
      this.emit("doubleClick", mouseCoords);
      if (mouseCoords.sigmaDefaultPrevented)
        return;
      var camera = this.renderer.getCamera();
      var newRatio = camera.getBoundedRatio(camera.getState().ratio / this.settings.doubleClickZoomingRatio);
      camera.animate(this.renderer.getViewportZoomedState(getPosition(e, this.container), newRatio), {
        easing: "quadraticInOut",
        duration: this.settings.doubleClickZoomingDuration
      });
    }
  }, {
    key: "handleDown",
    value: function handleDown(e) {
      if (!this.enabled)
        return;
      if (e.button === 0) {
        this.startCameraState = this.renderer.getCamera().getState();
        var _getPosition = getPosition(e, this.container), x2 = _getPosition.x, y2 = _getPosition.y;
        this.lastMouseX = x2;
        this.lastMouseY = y2;
        this.draggedEvents = 0;
        this.downStartTime = Date.now();
        this.isMouseDown = true;
      }
      this.emit("mousedown", getMouseCoords(e, this.container));
    }
  }, {
    key: "handleUp",
    value: function handleUp(e) {
      var _this3 = this;
      if (!this.enabled || !this.isMouseDown)
        return;
      var camera = this.renderer.getCamera();
      this.isMouseDown = false;
      if (typeof this.movingTimeout === "number") {
        clearTimeout(this.movingTimeout);
        this.movingTimeout = null;
      }
      var _getPosition2 = getPosition(e, this.container), x2 = _getPosition2.x, y2 = _getPosition2.y;
      var cameraState = camera.getState(), previousCameraState = camera.getPreviousState() || {
        x: 0,
        y: 0
      };
      if (this.isMoving) {
        camera.animate({
          x: cameraState.x + this.settings.inertiaRatio * (cameraState.x - previousCameraState.x),
          y: cameraState.y + this.settings.inertiaRatio * (cameraState.y - previousCameraState.y)
        }, {
          duration: this.settings.inertiaDuration,
          easing: "quadraticOut"
        });
      } else if (this.lastMouseX !== x2 || this.lastMouseY !== y2) {
        camera.setState({
          x: cameraState.x,
          y: cameraState.y
        });
      }
      this.isMoving = false;
      setTimeout(function() {
        var shouldRefresh = _this3.draggedEvents > 0;
        _this3.draggedEvents = 0;
        if (shouldRefresh && _this3.renderer.getSetting("hideEdgesOnMove"))
          _this3.renderer.refresh();
      }, 0);
      this.emit("mouseup", getMouseCoords(e, this.container));
    }
  }, {
    key: "handleMove",
    value: function handleMove(e) {
      var _this4 = this;
      if (!this.enabled)
        return;
      var mouseCoords = getMouseCoords(e, this.container);
      this.emit("mousemovebody", mouseCoords);
      if (e.target === this.container || e.composedPath()[0] === this.container) {
        this.emit("mousemove", mouseCoords);
      }
      if (mouseCoords.sigmaDefaultPrevented)
        return;
      if (this.isMouseDown) {
        this.isMoving = true;
        this.draggedEvents++;
        if (typeof this.movingTimeout === "number") {
          clearTimeout(this.movingTimeout);
        }
        this.movingTimeout = window.setTimeout(function() {
          _this4.movingTimeout = null;
          _this4.isMoving = false;
        }, this.settings.dragTimeout);
        var camera = this.renderer.getCamera();
        var _getPosition3 = getPosition(e, this.container), eX = _getPosition3.x, eY = _getPosition3.y;
        var lastMouse = this.renderer.viewportToFramedGraph({
          x: this.lastMouseX,
          y: this.lastMouseY
        });
        var mouse = this.renderer.viewportToFramedGraph({
          x: eX,
          y: eY
        });
        var offsetX = lastMouse.x - mouse.x, offsetY = lastMouse.y - mouse.y;
        var cameraState = camera.getState();
        var x2 = cameraState.x + offsetX, y2 = cameraState.y + offsetY;
        camera.setState({
          x: x2,
          y: y2
        });
        this.lastMouseX = eX;
        this.lastMouseY = eY;
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, {
    key: "handleLeave",
    value: function handleLeave(e) {
      this.emit("mouseleave", getMouseCoords(e, this.container));
    }
  }, {
    key: "handleEnter",
    value: function handleEnter(e) {
      this.emit("mouseenter", getMouseCoords(e, this.container));
    }
  }, {
    key: "handleWheel",
    value: function handleWheel(e) {
      var _this5 = this;
      var camera = this.renderer.getCamera();
      if (!this.enabled || !camera.enabledZooming)
        return;
      var delta = getWheelDelta(e);
      if (!delta)
        return;
      var wheelCoords = getWheelCoords(e, this.container);
      this.emit("wheel", wheelCoords);
      if (wheelCoords.sigmaDefaultPrevented) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      var currentRatio = camera.getState().ratio;
      var ratioDiff = delta > 0 ? 1 / this.settings.zoomingRatio : this.settings.zoomingRatio;
      var newRatio = camera.getBoundedRatio(currentRatio * ratioDiff);
      var wheelDirection = delta > 0 ? 1 : -1;
      var now = Date.now();
      if (currentRatio === newRatio)
        return;
      e.preventDefault();
      e.stopPropagation();
      if (this.currentWheelDirection === wheelDirection && this.lastWheelTriggerTime && now - this.lastWheelTriggerTime < this.settings.zoomDuration / 5) {
        return;
      }
      camera.animate(this.renderer.getViewportZoomedState(getPosition(e, this.container), newRatio), {
        easing: "quadraticOut",
        duration: this.settings.zoomDuration
      }, function() {
        _this5.currentWheelDirection = 0;
      });
      this.currentWheelDirection = wheelDirection;
      this.lastWheelTriggerTime = now;
    }
  }, {
    key: "setSettings",
    value: function setSettings(settings) {
      this.settings = settings;
    }
  }]);
}(Captor);
var TOUCH_SETTINGS_KEYS = ["dragTimeout", "inertiaDuration", "inertiaRatio", "doubleClickTimeout", "doubleClickZoomingRatio", "doubleClickZoomingDuration", "tapMoveTolerance"];
var DEFAULT_TOUCH_SETTINGS = TOUCH_SETTINGS_KEYS.reduce(function(iter, key) {
  return _objectSpread2(_objectSpread2({}, iter), {}, _defineProperty({}, key, DEFAULT_SETTINGS[key]));
}, {});
var TouchCaptor = /* @__PURE__ */ function(_Captor) {
  function TouchCaptor2(container, renderer) {
    var _this;
    _classCallCheck(this, TouchCaptor2);
    _this = _callSuper(this, TouchCaptor2, [container, renderer]);
    _defineProperty(_this, "enabled", true);
    _defineProperty(_this, "isMoving", false);
    _defineProperty(_this, "hasMoved", false);
    _defineProperty(_this, "touchMode", 0);
    _defineProperty(_this, "startTouchesPositions", []);
    _defineProperty(_this, "lastTouches", []);
    _defineProperty(_this, "lastTap", null);
    _defineProperty(_this, "settings", DEFAULT_TOUCH_SETTINGS);
    _this.handleStart = _this.handleStart.bind(_this);
    _this.handleLeave = _this.handleLeave.bind(_this);
    _this.handleMove = _this.handleMove.bind(_this);
    container.addEventListener("touchstart", _this.handleStart, {
      capture: false
    });
    container.addEventListener("touchcancel", _this.handleLeave, {
      capture: false
    });
    document.addEventListener("touchend", _this.handleLeave, {
      capture: false,
      passive: false
    });
    document.addEventListener("touchmove", _this.handleMove, {
      capture: false,
      passive: false
    });
    return _this;
  }
  _inherits(TouchCaptor2, _Captor);
  return _createClass(TouchCaptor2, [{
    key: "kill",
    value: function kill() {
      var container = this.container;
      container.removeEventListener("touchstart", this.handleStart);
      container.removeEventListener("touchcancel", this.handleLeave);
      document.removeEventListener("touchend", this.handleLeave);
      document.removeEventListener("touchmove", this.handleMove);
    }
  }, {
    key: "getDimensions",
    value: function getDimensions() {
      return {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      };
    }
  }, {
    key: "handleStart",
    value: function handleStart(e) {
      var _this2 = this;
      if (!this.enabled)
        return;
      e.preventDefault();
      var touches = getTouchesArray(e.touches);
      this.touchMode = touches.length;
      this.startCameraState = this.renderer.getCamera().getState();
      this.startTouchesPositions = touches.map(function(touch) {
        return getPosition(touch, _this2.container);
      });
      if (this.touchMode === 2) {
        var _this$startTouchesPos = _slicedToArray(this.startTouchesPositions, 2), _this$startTouchesPos2 = _this$startTouchesPos[0], x0 = _this$startTouchesPos2.x, y0 = _this$startTouchesPos2.y, _this$startTouchesPos3 = _this$startTouchesPos[1], x1 = _this$startTouchesPos3.x, y1 = _this$startTouchesPos3.y;
        this.startTouchesAngle = Math.atan2(y1 - y0, x1 - x0);
        this.startTouchesDistance = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      }
      this.emit("touchdown", getTouchCoords(e, this.lastTouches, this.container));
      this.lastTouches = touches;
      this.lastTouchesPositions = this.startTouchesPositions;
    }
  }, {
    key: "handleLeave",
    value: function handleLeave(e) {
      if (!this.enabled || !this.startTouchesPositions.length)
        return;
      if (e.cancelable)
        e.preventDefault();
      if (this.movingTimeout) {
        this.isMoving = false;
        clearTimeout(this.movingTimeout);
      }
      switch (this.touchMode) {
        case 2:
          if (e.touches.length === 1) {
            this.handleStart(e);
            e.preventDefault();
            break;
          }
        case 1:
          if (this.isMoving) {
            var camera = this.renderer.getCamera();
            var cameraState = camera.getState(), previousCameraState = camera.getPreviousState() || {
              x: 0,
              y: 0
            };
            camera.animate({
              x: cameraState.x + this.settings.inertiaRatio * (cameraState.x - previousCameraState.x),
              y: cameraState.y + this.settings.inertiaRatio * (cameraState.y - previousCameraState.y)
            }, {
              duration: this.settings.inertiaDuration,
              easing: "quadraticOut"
            });
          }
          this.hasMoved = false;
          this.isMoving = false;
          this.touchMode = 0;
          break;
      }
      this.emit("touchup", getTouchCoords(e, this.lastTouches, this.container));
      if (!e.touches.length) {
        var position = getPosition(this.lastTouches[0], this.container);
        var downPosition = this.startTouchesPositions[0];
        var dSquare = Math.pow(position.x - downPosition.x, 2) + Math.pow(position.y - downPosition.y, 2);
        if (!e.touches.length && dSquare < Math.pow(this.settings.tapMoveTolerance, 2)) {
          if (this.lastTap && Date.now() - this.lastTap.time < this.settings.doubleClickTimeout) {
            var touchCoords = getTouchCoords(e, this.lastTouches, this.container);
            this.emit("doubletap", touchCoords);
            this.lastTap = null;
            if (!touchCoords.sigmaDefaultPrevented) {
              var _camera = this.renderer.getCamera();
              var newRatio = _camera.getBoundedRatio(_camera.getState().ratio / this.settings.doubleClickZoomingRatio);
              _camera.animate(this.renderer.getViewportZoomedState(position, newRatio), {
                easing: "quadraticInOut",
                duration: this.settings.doubleClickZoomingDuration
              });
            }
          } else {
            var _touchCoords = getTouchCoords(e, this.lastTouches, this.container);
            this.emit("tap", _touchCoords);
            this.lastTap = {
              time: Date.now(),
              position: _touchCoords.touches[0] || _touchCoords.previousTouches[0]
            };
          }
        }
      }
      this.lastTouches = getTouchesArray(e.touches);
      this.startTouchesPositions = [];
    }
  }, {
    key: "handleMove",
    value: function handleMove(e) {
      var _this3 = this;
      if (!this.enabled || !this.startTouchesPositions.length)
        return;
      e.preventDefault();
      var touches = getTouchesArray(e.touches);
      var touchesPositions = touches.map(function(touch) {
        return getPosition(touch, _this3.container);
      });
      var lastTouches = this.lastTouches;
      this.lastTouches = touches;
      this.lastTouchesPositions = touchesPositions;
      var touchCoords = getTouchCoords(e, lastTouches, this.container);
      this.emit("touchmove", touchCoords);
      if (touchCoords.sigmaDefaultPrevented)
        return;
      this.hasMoved || (this.hasMoved = touchesPositions.some(function(position, idx) {
        var startPosition = _this3.startTouchesPositions[idx];
        return startPosition && (position.x !== startPosition.x || position.y !== startPosition.y);
      }));
      if (!this.hasMoved) {
        return;
      }
      this.isMoving = true;
      if (this.movingTimeout)
        clearTimeout(this.movingTimeout);
      this.movingTimeout = window.setTimeout(function() {
        _this3.isMoving = false;
      }, this.settings.dragTimeout);
      var camera = this.renderer.getCamera();
      var startCameraState = this.startCameraState;
      var padding = this.renderer.getSetting("stagePadding");
      switch (this.touchMode) {
        case 1: {
          var _this$renderer$viewpo = this.renderer.viewportToFramedGraph((this.startTouchesPositions || [])[0]), xStart = _this$renderer$viewpo.x, yStart = _this$renderer$viewpo.y;
          var _this$renderer$viewpo2 = this.renderer.viewportToFramedGraph(touchesPositions[0]), x2 = _this$renderer$viewpo2.x, y2 = _this$renderer$viewpo2.y;
          camera.setState({
            x: startCameraState.x + xStart - x2,
            y: startCameraState.y + yStart - y2
          });
          break;
        }
        case 2: {
          var newCameraState = {
            x: 0.5,
            y: 0.5,
            angle: 0,
            ratio: 1
          };
          var _touchesPositions$ = touchesPositions[0], x0 = _touchesPositions$.x, y0 = _touchesPositions$.y;
          var _touchesPositions$2 = touchesPositions[1], x1 = _touchesPositions$2.x, y1 = _touchesPositions$2.y;
          var angleDiff = Math.atan2(y1 - y0, x1 - x0) - this.startTouchesAngle;
          var ratioDiff = Math.hypot(y1 - y0, x1 - x0) / this.startTouchesDistance;
          var newRatio = camera.getBoundedRatio(startCameraState.ratio / ratioDiff);
          newCameraState.ratio = newRatio;
          newCameraState.angle = startCameraState.angle + angleDiff;
          var dimensions = this.getDimensions();
          var touchGraphPosition = this.renderer.viewportToFramedGraph((this.startTouchesPositions || [])[0], {
            cameraState: startCameraState
          });
          var smallestDimension = Math.min(dimensions.width, dimensions.height) - 2 * padding;
          var dx = smallestDimension / dimensions.width;
          var dy = smallestDimension / dimensions.height;
          var ratio = newRatio / smallestDimension;
          var _x = x0 - smallestDimension / 2 / dx;
          var _y = y0 - smallestDimension / 2 / dy;
          var _ref = [_x * Math.cos(-newCameraState.angle) - _y * Math.sin(-newCameraState.angle), _y * Math.cos(-newCameraState.angle) + _x * Math.sin(-newCameraState.angle)];
          _x = _ref[0];
          _y = _ref[1];
          newCameraState.x = touchGraphPosition.x - _x * ratio;
          newCameraState.y = touchGraphPosition.y + _y * ratio;
          camera.setState(newCameraState);
          break;
        }
      }
    }
  }, {
    key: "setSettings",
    value: function setSettings(settings) {
      this.settings = settings;
    }
  }]);
}(Captor);
function _arrayWithoutHoles(r) {
  if (Array.isArray(r))
    return _arrayLikeToArray(r);
}
function _iterableToArray(r) {
  if (typeof Symbol != "undefined" && r[Symbol.iterator] != null || r["@@iterator"] != null)
    return Array.from(r);
}
function _nonIterableSpread() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _objectWithoutPropertiesLoose(r, e) {
  if (r == null)
    return {};
  var t = {};
  for (var n in r)
    if ({}.hasOwnProperty.call(r, n)) {
      if (e.includes(n))
        continue;
      t[n] = r[n];
    }
  return t;
}
function _objectWithoutProperties(e, t) {
  if (e == null)
    return {};
  var o2, r, i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (r = 0;r < s.length; r++)
      o2 = s[r], t.includes(o2) || {}.propertyIsEnumerable.call(e, o2) && (i[o2] = e[o2]);
  }
  return i;
}
var LabelCandidate = /* @__PURE__ */ function() {
  function LabelCandidate2(key, size) {
    _classCallCheck(this, LabelCandidate2);
    this.key = key;
    this.size = size;
  }
  return _createClass(LabelCandidate2, null, [{
    key: "compare",
    value: function compare(first, second) {
      if (first.size > second.size)
        return -1;
      if (first.size < second.size)
        return 1;
      if (first.key > second.key)
        return 1;
      return -1;
    }
  }]);
}();
var LabelGrid = /* @__PURE__ */ function() {
  function LabelGrid2() {
    _classCallCheck(this, LabelGrid2);
    _defineProperty(this, "width", 0);
    _defineProperty(this, "height", 0);
    _defineProperty(this, "cellSize", 0);
    _defineProperty(this, "columns", 0);
    _defineProperty(this, "rows", 0);
    _defineProperty(this, "cells", {});
  }
  return _createClass(LabelGrid2, [{
    key: "resizeAndClear",
    value: function resizeAndClear(dimensions, cellSize) {
      this.width = dimensions.width;
      this.height = dimensions.height;
      this.cellSize = cellSize;
      this.columns = Math.ceil(dimensions.width / cellSize);
      this.rows = Math.ceil(dimensions.height / cellSize);
      this.cells = {};
    }
  }, {
    key: "getIndex",
    value: function getIndex(pos) {
      var xIndex = Math.floor(pos.x / this.cellSize);
      var yIndex = Math.floor(pos.y / this.cellSize);
      return yIndex * this.columns + xIndex;
    }
  }, {
    key: "add",
    value: function add(key, size, pos) {
      var candidate = new LabelCandidate(key, size);
      var index = this.getIndex(pos);
      var cell = this.cells[index];
      if (!cell) {
        cell = [];
        this.cells[index] = cell;
      }
      cell.push(candidate);
    }
  }, {
    key: "organize",
    value: function organize() {
      for (var k in this.cells) {
        var cell = this.cells[k];
        cell.sort(LabelCandidate.compare);
      }
    }
  }, {
    key: "getLabelsToDisplay",
    value: function getLabelsToDisplay(ratio, density) {
      var cellArea = this.cellSize * this.cellSize;
      var scaledCellArea = cellArea / ratio / ratio;
      var scaledDensity = scaledCellArea * density / cellArea;
      var labelsToDisplayPerCell = Math.ceil(scaledDensity);
      var labels = [];
      for (var k in this.cells) {
        var cell = this.cells[k];
        for (var i = 0;i < Math.min(labelsToDisplayPerCell, cell.length); i++) {
          labels.push(cell[i].key);
        }
      }
      return labels;
    }
  }]);
}();
function edgeLabelsToDisplayFromNodes(params) {
  var { graph, hoveredNode, highlightedNodes, displayedNodeLabels } = params;
  var worthyEdges = [];
  graph.forEachEdge(function(edge, _2, source, target) {
    if (source === hoveredNode || target === hoveredNode || highlightedNodes.has(source) || highlightedNodes.has(target) || displayedNodeLabels.has(source) && displayedNodeLabels.has(target)) {
      worthyEdges.push(edge);
    }
  });
  return worthyEdges;
}
var X_LABEL_MARGIN = 150;
var Y_LABEL_MARGIN = 50;
var hasOwnProperty = Object.prototype.hasOwnProperty;
function applyNodeDefaults(settings, key, data) {
  if (!hasOwnProperty.call(data, "x") || !hasOwnProperty.call(data, "y"))
    throw new Error('Sigma: could not find a valid position (x, y) for node "'.concat(key, '". All your nodes must have a number "x" and "y". Maybe your forgot to apply a layout or your "nodeReducer" is not returning the correct data?'));
  if (!data.color)
    data.color = settings.defaultNodeColor;
  if (!data.label && data.label !== "")
    data.label = null;
  if (data.label !== undefined && data.label !== null)
    data.label = "" + data.label;
  else
    data.label = null;
  if (!data.size)
    data.size = 2;
  if (!hasOwnProperty.call(data, "hidden"))
    data.hidden = false;
  if (!hasOwnProperty.call(data, "highlighted"))
    data.highlighted = false;
  if (!hasOwnProperty.call(data, "forceLabel"))
    data.forceLabel = false;
  if (!data.type || data.type === "")
    data.type = settings.defaultNodeType;
  if (!data.zIndex)
    data.zIndex = 0;
  return data;
}
function applyEdgeDefaults(settings, _key, data) {
  if (!data.color)
    data.color = settings.defaultEdgeColor;
  if (!data.label)
    data.label = "";
  if (!data.size)
    data.size = 0.5;
  if (!hasOwnProperty.call(data, "hidden"))
    data.hidden = false;
  if (!hasOwnProperty.call(data, "forceLabel"))
    data.forceLabel = false;
  if (!data.type || data.type === "")
    data.type = settings.defaultEdgeType;
  if (!data.zIndex)
    data.zIndex = 0;
  return data;
}
var Sigma$1 = /* @__PURE__ */ function(_TypedEventEmitter) {
  function Sigma(graph, container) {
    var _this;
    var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _classCallCheck(this, Sigma);
    _this = _callSuper(this, Sigma);
    _defineProperty(_this, "elements", {});
    _defineProperty(_this, "canvasContexts", {});
    _defineProperty(_this, "webGLContexts", {});
    _defineProperty(_this, "pickingLayers", new Set);
    _defineProperty(_this, "textures", {});
    _defineProperty(_this, "frameBuffers", {});
    _defineProperty(_this, "activeListeners", {});
    _defineProperty(_this, "labelGrid", new LabelGrid);
    _defineProperty(_this, "nodeDataCache", {});
    _defineProperty(_this, "edgeDataCache", {});
    _defineProperty(_this, "nodeProgramIndex", {});
    _defineProperty(_this, "edgeProgramIndex", {});
    _defineProperty(_this, "nodesWithForcedLabels", new Set);
    _defineProperty(_this, "edgesWithForcedLabels", new Set);
    _defineProperty(_this, "nodeExtent", {
      x: [0, 1],
      y: [0, 1]
    });
    _defineProperty(_this, "nodeZExtent", [Infinity, -Infinity]);
    _defineProperty(_this, "edgeZExtent", [Infinity, -Infinity]);
    _defineProperty(_this, "matrix", identity());
    _defineProperty(_this, "invMatrix", identity());
    _defineProperty(_this, "correctionRatio", 1);
    _defineProperty(_this, "customBBox", null);
    _defineProperty(_this, "normalizationFunction", createNormalizationFunction({
      x: [0, 1],
      y: [0, 1]
    }));
    _defineProperty(_this, "graphToViewportRatio", 1);
    _defineProperty(_this, "itemIDsIndex", {});
    _defineProperty(_this, "nodeIndices", {});
    _defineProperty(_this, "edgeIndices", {});
    _defineProperty(_this, "width", 0);
    _defineProperty(_this, "height", 0);
    _defineProperty(_this, "pixelRatio", getPixelRatio());
    _defineProperty(_this, "pickingDownSizingRatio", 2 * _this.pixelRatio);
    _defineProperty(_this, "displayedNodeLabels", new Set);
    _defineProperty(_this, "displayedEdgeLabels", new Set);
    _defineProperty(_this, "highlightedNodes", new Set);
    _defineProperty(_this, "hoveredNode", null);
    _defineProperty(_this, "hoveredEdge", null);
    _defineProperty(_this, "renderFrame", null);
    _defineProperty(_this, "renderHighlightedNodesFrame", null);
    _defineProperty(_this, "needToProcess", false);
    _defineProperty(_this, "checkEdgesEventsFrame", null);
    _defineProperty(_this, "nodePrograms", {});
    _defineProperty(_this, "nodeHoverPrograms", {});
    _defineProperty(_this, "edgePrograms", {});
    _this.settings = resolveSettings(settings);
    validateSettings(_this.settings);
    validateGraph(graph);
    if (!(container instanceof HTMLElement))
      throw new Error("Sigma: container should be an html element.");
    _this.graph = graph;
    _this.container = container;
    _this.createWebGLContext("edges", {
      picking: settings.enableEdgeEvents
    });
    _this.createCanvasContext("edgeLabels");
    _this.createWebGLContext("nodes", {
      picking: true
    });
    _this.createCanvasContext("labels");
    _this.createCanvasContext("hovers");
    _this.createWebGLContext("hoverNodes");
    _this.createCanvasContext("mouse", {
      style: {
        touchAction: "none",
        userSelect: "none"
      }
    });
    _this.resize();
    for (var type in _this.settings.nodeProgramClasses) {
      _this.registerNodeProgram(type, _this.settings.nodeProgramClasses[type], _this.settings.nodeHoverProgramClasses[type]);
    }
    for (var _type in _this.settings.edgeProgramClasses) {
      _this.registerEdgeProgram(_type, _this.settings.edgeProgramClasses[_type]);
    }
    _this.camera = new Camera;
    _this.bindCameraHandlers();
    _this.mouseCaptor = new MouseCaptor(_this.elements.mouse, _this);
    _this.mouseCaptor.setSettings(_this.settings);
    _this.touchCaptor = new TouchCaptor(_this.elements.mouse, _this);
    _this.touchCaptor.setSettings(_this.settings);
    _this.bindEventHandlers();
    _this.bindGraphHandlers();
    _this.handleSettingsUpdate();
    _this.refresh();
    return _this;
  }
  _inherits(Sigma, _TypedEventEmitter);
  return _createClass(Sigma, [{
    key: "registerNodeProgram",
    value: function registerNodeProgram(key, NodeProgramClass, NodeHoverProgram) {
      if (this.nodePrograms[key])
        this.nodePrograms[key].kill();
      if (this.nodeHoverPrograms[key])
        this.nodeHoverPrograms[key].kill();
      this.nodePrograms[key] = new NodeProgramClass(this.webGLContexts.nodes, this.frameBuffers.nodes, this);
      this.nodeHoverPrograms[key] = new (NodeHoverProgram || NodeProgramClass)(this.webGLContexts.hoverNodes, null, this);
      return this;
    }
  }, {
    key: "registerEdgeProgram",
    value: function registerEdgeProgram(key, EdgeProgramClass) {
      if (this.edgePrograms[key])
        this.edgePrograms[key].kill();
      this.edgePrograms[key] = new EdgeProgramClass(this.webGLContexts.edges, this.frameBuffers.edges, this);
      return this;
    }
  }, {
    key: "unregisterNodeProgram",
    value: function unregisterNodeProgram(key) {
      if (this.nodePrograms[key]) {
        var _this$nodePrograms = this.nodePrograms, program = _this$nodePrograms[key], programs = _objectWithoutProperties(_this$nodePrograms, [key].map(_toPropertyKey));
        program.kill();
        this.nodePrograms = programs;
      }
      if (this.nodeHoverPrograms[key]) {
        var _this$nodeHoverProgra = this.nodeHoverPrograms, _program = _this$nodeHoverProgra[key], _programs = _objectWithoutProperties(_this$nodeHoverProgra, [key].map(_toPropertyKey));
        _program.kill();
        this.nodePrograms = _programs;
      }
      return this;
    }
  }, {
    key: "unregisterEdgeProgram",
    value: function unregisterEdgeProgram(key) {
      if (this.edgePrograms[key]) {
        var _this$edgePrograms = this.edgePrograms, program = _this$edgePrograms[key], programs = _objectWithoutProperties(_this$edgePrograms, [key].map(_toPropertyKey));
        program.kill();
        this.edgePrograms = programs;
      }
      return this;
    }
  }, {
    key: "resetWebGLTexture",
    value: function resetWebGLTexture(id) {
      var gl = this.webGLContexts[id];
      var frameBuffer = this.frameBuffers[id];
      var currentTexture = this.textures[id];
      if (currentTexture)
        gl.deleteTexture(currentTexture);
      var pickingTexture = gl.createTexture();
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
      gl.bindTexture(gl.TEXTURE_2D, pickingTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickingTexture, 0);
      this.textures[id] = pickingTexture;
      return this;
    }
  }, {
    key: "bindCameraHandlers",
    value: function bindCameraHandlers() {
      var _this2 = this;
      this.activeListeners.camera = function() {
        _this2.scheduleRender();
      };
      this.camera.on("updated", this.activeListeners.camera);
      return this;
    }
  }, {
    key: "unbindCameraHandlers",
    value: function unbindCameraHandlers() {
      this.camera.removeListener("updated", this.activeListeners.camera);
      return this;
    }
  }, {
    key: "getNodeAtPosition",
    value: function getNodeAtPosition(position) {
      var { x: x2, y: y2 } = position;
      var color = getPixelColor(this.webGLContexts.nodes, this.frameBuffers.nodes, x2, y2, this.pixelRatio, this.pickingDownSizingRatio);
      var index = colorToIndex.apply(undefined, _toConsumableArray(color));
      var itemAt = this.itemIDsIndex[index];
      return itemAt && itemAt.type === "node" ? itemAt.id : null;
    }
  }, {
    key: "bindEventHandlers",
    value: function bindEventHandlers() {
      var _this3 = this;
      this.activeListeners.handleResize = function() {
        _this3.scheduleRefresh();
      };
      window.addEventListener("resize", this.activeListeners.handleResize);
      this.activeListeners.handleMove = function(e) {
        var event = cleanMouseCoords(e);
        var baseEvent = {
          event,
          preventSigmaDefault: function preventSigmaDefault() {
            event.preventSigmaDefault();
          }
        };
        var nodeToHover = _this3.getNodeAtPosition(event);
        if (nodeToHover && _this3.hoveredNode !== nodeToHover && !_this3.nodeDataCache[nodeToHover].hidden) {
          if (_this3.hoveredNode)
            _this3.emit("leaveNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
              node: _this3.hoveredNode
            }));
          _this3.hoveredNode = nodeToHover;
          _this3.emit("enterNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
            node: nodeToHover
          }));
          _this3.scheduleHighlightedNodesRender();
          return;
        }
        if (_this3.hoveredNode) {
          if (_this3.getNodeAtPosition(event) !== _this3.hoveredNode) {
            var node = _this3.hoveredNode;
            _this3.hoveredNode = null;
            _this3.emit("leaveNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
              node
            }));
            _this3.scheduleHighlightedNodesRender();
            return;
          }
        }
        if (_this3.settings.enableEdgeEvents) {
          var edgeToHover = _this3.hoveredNode ? null : _this3.getEdgeAtPoint(baseEvent.event.x, baseEvent.event.y);
          if (edgeToHover !== _this3.hoveredEdge) {
            if (_this3.hoveredEdge)
              _this3.emit("leaveEdge", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
                edge: _this3.hoveredEdge
              }));
            if (edgeToHover)
              _this3.emit("enterEdge", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
                edge: edgeToHover
              }));
            _this3.hoveredEdge = edgeToHover;
          }
        }
      };
      this.activeListeners.handleMoveBody = function(e) {
        var event = cleanMouseCoords(e);
        _this3.emit("moveBody", {
          event,
          preventSigmaDefault: function preventSigmaDefault() {
            event.preventSigmaDefault();
          }
        });
      };
      this.activeListeners.handleLeave = function(e) {
        var event = cleanMouseCoords(e);
        var baseEvent = {
          event,
          preventSigmaDefault: function preventSigmaDefault() {
            event.preventSigmaDefault();
          }
        };
        if (_this3.hoveredNode) {
          _this3.emit("leaveNode", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
            node: _this3.hoveredNode
          }));
          _this3.scheduleHighlightedNodesRender();
        }
        if (_this3.settings.enableEdgeEvents && _this3.hoveredEdge) {
          _this3.emit("leaveEdge", _objectSpread2(_objectSpread2({}, baseEvent), {}, {
            edge: _this3.hoveredEdge
          }));
          _this3.scheduleHighlightedNodesRender();
        }
        _this3.emit("leaveStage", _objectSpread2({}, baseEvent));
      };
      this.activeListeners.handleEnter = function(e) {
        var event = cleanMouseCoords(e);
        var baseEvent = {
          event,
          preventSigmaDefault: function preventSigmaDefault() {
            event.preventSigmaDefault();
          }
        };
        _this3.emit("enterStage", _objectSpread2({}, baseEvent));
      };
      var createInteractionListener = function createInteractionListener(eventType) {
        return function(e) {
          var event = cleanMouseCoords(e);
          var baseEvent = {
            event,
            preventSigmaDefault: function preventSigmaDefault() {
              event.preventSigmaDefault();
            }
          };
          var nodeAtPosition = _this3.getNodeAtPosition(event);
          if (nodeAtPosition)
            return _this3.emit("".concat(eventType, "Node"), _objectSpread2(_objectSpread2({}, baseEvent), {}, {
              node: nodeAtPosition
            }));
          if (_this3.settings.enableEdgeEvents) {
            var edge = _this3.getEdgeAtPoint(event.x, event.y);
            if (edge)
              return _this3.emit("".concat(eventType, "Edge"), _objectSpread2(_objectSpread2({}, baseEvent), {}, {
                edge
              }));
          }
          return _this3.emit("".concat(eventType, "Stage"), baseEvent);
        };
      };
      this.activeListeners.handleClick = createInteractionListener("click");
      this.activeListeners.handleRightClick = createInteractionListener("rightClick");
      this.activeListeners.handleDoubleClick = createInteractionListener("doubleClick");
      this.activeListeners.handleWheel = createInteractionListener("wheel");
      this.activeListeners.handleDown = createInteractionListener("down");
      this.activeListeners.handleUp = createInteractionListener("up");
      this.mouseCaptor.on("mousemove", this.activeListeners.handleMove);
      this.mouseCaptor.on("mousemovebody", this.activeListeners.handleMoveBody);
      this.mouseCaptor.on("click", this.activeListeners.handleClick);
      this.mouseCaptor.on("rightClick", this.activeListeners.handleRightClick);
      this.mouseCaptor.on("doubleClick", this.activeListeners.handleDoubleClick);
      this.mouseCaptor.on("wheel", this.activeListeners.handleWheel);
      this.mouseCaptor.on("mousedown", this.activeListeners.handleDown);
      this.mouseCaptor.on("mouseup", this.activeListeners.handleUp);
      this.mouseCaptor.on("mouseleave", this.activeListeners.handleLeave);
      this.mouseCaptor.on("mouseenter", this.activeListeners.handleEnter);
      this.touchCaptor.on("touchdown", this.activeListeners.handleDown);
      this.touchCaptor.on("touchdown", this.activeListeners.handleMove);
      this.touchCaptor.on("touchup", this.activeListeners.handleUp);
      this.touchCaptor.on("touchmove", this.activeListeners.handleMove);
      this.touchCaptor.on("tap", this.activeListeners.handleClick);
      this.touchCaptor.on("doubletap", this.activeListeners.handleDoubleClick);
      this.touchCaptor.on("touchmove", this.activeListeners.handleMoveBody);
      return this;
    }
  }, {
    key: "bindGraphHandlers",
    value: function bindGraphHandlers() {
      var _this4 = this;
      var graph = this.graph;
      var LAYOUT_IMPACTING_FIELDS = new Set(["x", "y", "zIndex", "type"]);
      this.activeListeners.eachNodeAttributesUpdatedGraphUpdate = function(e) {
        var _e$hints;
        var updatedFields = (_e$hints = e.hints) === null || _e$hints === undefined ? undefined : _e$hints.attributes;
        _this4.graph.forEachNode(function(node) {
          return _this4.updateNode(node);
        });
        var layoutChanged = !updatedFields || updatedFields.some(function(f) {
          return LAYOUT_IMPACTING_FIELDS.has(f);
        });
        _this4.refresh({
          partialGraph: {
            nodes: graph.nodes()
          },
          skipIndexation: !layoutChanged,
          schedule: true
        });
      };
      this.activeListeners.eachEdgeAttributesUpdatedGraphUpdate = function(e) {
        var _e$hints2;
        var updatedFields = (_e$hints2 = e.hints) === null || _e$hints2 === undefined ? undefined : _e$hints2.attributes;
        _this4.graph.forEachEdge(function(edge) {
          return _this4.updateEdge(edge);
        });
        var layoutChanged = updatedFields && ["zIndex", "type"].some(function(f) {
          return updatedFields === null || updatedFields === undefined ? undefined : updatedFields.includes(f);
        });
        _this4.refresh({
          partialGraph: {
            edges: graph.edges()
          },
          skipIndexation: !layoutChanged,
          schedule: true
        });
      };
      this.activeListeners.addNodeGraphUpdate = function(payload) {
        var node = payload.key;
        _this4.addNode(node);
        _this4.refresh({
          partialGraph: {
            nodes: [node]
          },
          skipIndexation: false,
          schedule: true
        });
      };
      this.activeListeners.updateNodeGraphUpdate = function(payload) {
        var node = payload.key;
        _this4.refresh({
          partialGraph: {
            nodes: [node]
          },
          skipIndexation: false,
          schedule: true
        });
      };
      this.activeListeners.dropNodeGraphUpdate = function(payload) {
        var node = payload.key;
        _this4.removeNode(node);
        _this4.refresh({
          schedule: true
        });
      };
      this.activeListeners.addEdgeGraphUpdate = function(payload) {
        var edge = payload.key;
        _this4.addEdge(edge);
        _this4.refresh({
          partialGraph: {
            edges: [edge]
          },
          schedule: true
        });
      };
      this.activeListeners.updateEdgeGraphUpdate = function(payload) {
        var edge = payload.key;
        _this4.refresh({
          partialGraph: {
            edges: [edge]
          },
          skipIndexation: false,
          schedule: true
        });
      };
      this.activeListeners.dropEdgeGraphUpdate = function(payload) {
        var edge = payload.key;
        _this4.removeEdge(edge);
        _this4.refresh({
          schedule: true
        });
      };
      this.activeListeners.clearEdgesGraphUpdate = function() {
        _this4.clearEdgeState();
        _this4.clearEdgeIndices();
        _this4.refresh({
          schedule: true
        });
      };
      this.activeListeners.clearGraphUpdate = function() {
        _this4.clearEdgeState();
        _this4.clearNodeState();
        _this4.clearEdgeIndices();
        _this4.clearNodeIndices();
        _this4.refresh({
          schedule: true
        });
      };
      graph.on("nodeAdded", this.activeListeners.addNodeGraphUpdate);
      graph.on("nodeDropped", this.activeListeners.dropNodeGraphUpdate);
      graph.on("nodeAttributesUpdated", this.activeListeners.updateNodeGraphUpdate);
      graph.on("eachNodeAttributesUpdated", this.activeListeners.eachNodeAttributesUpdatedGraphUpdate);
      graph.on("edgeAdded", this.activeListeners.addEdgeGraphUpdate);
      graph.on("edgeDropped", this.activeListeners.dropEdgeGraphUpdate);
      graph.on("edgeAttributesUpdated", this.activeListeners.updateEdgeGraphUpdate);
      graph.on("eachEdgeAttributesUpdated", this.activeListeners.eachEdgeAttributesUpdatedGraphUpdate);
      graph.on("edgesCleared", this.activeListeners.clearEdgesGraphUpdate);
      graph.on("cleared", this.activeListeners.clearGraphUpdate);
      return this;
    }
  }, {
    key: "unbindGraphHandlers",
    value: function unbindGraphHandlers() {
      var graph = this.graph;
      graph.removeListener("nodeAdded", this.activeListeners.addNodeGraphUpdate);
      graph.removeListener("nodeDropped", this.activeListeners.dropNodeGraphUpdate);
      graph.removeListener("nodeAttributesUpdated", this.activeListeners.updateNodeGraphUpdate);
      graph.removeListener("eachNodeAttributesUpdated", this.activeListeners.eachNodeAttributesUpdatedGraphUpdate);
      graph.removeListener("edgeAdded", this.activeListeners.addEdgeGraphUpdate);
      graph.removeListener("edgeDropped", this.activeListeners.dropEdgeGraphUpdate);
      graph.removeListener("edgeAttributesUpdated", this.activeListeners.updateEdgeGraphUpdate);
      graph.removeListener("eachEdgeAttributesUpdated", this.activeListeners.eachEdgeAttributesUpdatedGraphUpdate);
      graph.removeListener("edgesCleared", this.activeListeners.clearEdgesGraphUpdate);
      graph.removeListener("cleared", this.activeListeners.clearGraphUpdate);
    }
  }, {
    key: "getEdgeAtPoint",
    value: function getEdgeAtPoint(x2, y2) {
      var color = getPixelColor(this.webGLContexts.edges, this.frameBuffers.edges, x2, y2, this.pixelRatio, this.pickingDownSizingRatio);
      var index = colorToIndex.apply(undefined, _toConsumableArray(color));
      var itemAt = this.itemIDsIndex[index];
      return itemAt && itemAt.type === "edge" ? itemAt.id : null;
    }
  }, {
    key: "process",
    value: function process() {
      var _this5 = this;
      this.emit("beforeProcess");
      var graph = this.graph;
      var settings = this.settings;
      var dimensions = this.getDimensions();
      this.nodeExtent = graphExtent(this.graph);
      if (!this.settings.autoRescale) {
        var { width, height } = dimensions;
        var _this$nodeExtent = this.nodeExtent, x2 = _this$nodeExtent.x, y2 = _this$nodeExtent.y;
        this.nodeExtent = {
          x: [(x2[0] + x2[1]) / 2 - width / 2, (x2[0] + x2[1]) / 2 + width / 2],
          y: [(y2[0] + y2[1]) / 2 - height / 2, (y2[0] + y2[1]) / 2 + height / 2]
        };
      }
      this.normalizationFunction = createNormalizationFunction(this.customBBox || this.nodeExtent);
      var nullCamera = new Camera;
      var nullCameraMatrix = matrixFromCamera(nullCamera.getState(), dimensions, this.getGraphDimensions(), this.getStagePadding());
      this.labelGrid.resizeAndClear(dimensions, settings.labelGridCellSize);
      var nodesPerPrograms = {};
      var nodeIndices = {};
      var edgeIndices = {};
      var itemIDsIndex = {};
      var incrID = 1;
      var nodes = graph.nodes();
      for (var i = 0, l2 = nodes.length;i < l2; i++) {
        var node = nodes[i];
        var data = this.nodeDataCache[node];
        var attrs = graph.getNodeAttributes(node);
        data.x = attrs.x;
        data.y = attrs.y;
        this.normalizationFunction.applyTo(data);
        if (typeof data.label === "string" && !data.hidden)
          this.labelGrid.add(node, data.size, this.framedGraphToViewport(data, {
            matrix: nullCameraMatrix
          }));
        nodesPerPrograms[data.type] = (nodesPerPrograms[data.type] || 0) + 1;
      }
      this.labelGrid.organize();
      for (var type in this.nodePrograms) {
        if (!hasOwnProperty.call(this.nodePrograms, type)) {
          throw new Error('Sigma: could not find a suitable program for node type "'.concat(type, '"!'));
        }
        this.nodePrograms[type].reallocate(nodesPerPrograms[type] || 0);
        nodesPerPrograms[type] = 0;
      }
      if (this.settings.zIndex && this.nodeZExtent[0] !== this.nodeZExtent[1])
        nodes = zIndexOrdering(this.nodeZExtent, function(node2) {
          return _this5.nodeDataCache[node2].zIndex;
        }, nodes);
      for (var _i = 0, _l = nodes.length;_i < _l; _i++) {
        var _node = nodes[_i];
        nodeIndices[_node] = incrID;
        itemIDsIndex[nodeIndices[_node]] = {
          type: "node",
          id: _node
        };
        incrID++;
        var _data = this.nodeDataCache[_node];
        this.addNodeToProgram(_node, nodeIndices[_node], nodesPerPrograms[_data.type]++);
      }
      var edgesPerPrograms = {};
      var edges = graph.edges();
      for (var _i2 = 0, _l2 = edges.length;_i2 < _l2; _i2++) {
        var edge = edges[_i2];
        var _data2 = this.edgeDataCache[edge];
        edgesPerPrograms[_data2.type] = (edgesPerPrograms[_data2.type] || 0) + 1;
      }
      if (this.settings.zIndex && this.edgeZExtent[0] !== this.edgeZExtent[1])
        edges = zIndexOrdering(this.edgeZExtent, function(edge2) {
          return _this5.edgeDataCache[edge2].zIndex;
        }, edges);
      for (var _type2 in this.edgePrograms) {
        if (!hasOwnProperty.call(this.edgePrograms, _type2)) {
          throw new Error('Sigma: could not find a suitable program for edge type "'.concat(_type2, '"!'));
        }
        this.edgePrograms[_type2].reallocate(edgesPerPrograms[_type2] || 0);
        edgesPerPrograms[_type2] = 0;
      }
      for (var _i3 = 0, _l3 = edges.length;_i3 < _l3; _i3++) {
        var _edge = edges[_i3];
        edgeIndices[_edge] = incrID;
        itemIDsIndex[edgeIndices[_edge]] = {
          type: "edge",
          id: _edge
        };
        incrID++;
        var _data3 = this.edgeDataCache[_edge];
        this.addEdgeToProgram(_edge, edgeIndices[_edge], edgesPerPrograms[_data3.type]++);
      }
      this.itemIDsIndex = itemIDsIndex;
      this.nodeIndices = nodeIndices;
      this.edgeIndices = edgeIndices;
      this.emit("afterProcess");
      return this;
    }
  }, {
    key: "handleSettingsUpdate",
    value: function handleSettingsUpdate(oldSettings) {
      var _this6 = this;
      var settings = this.settings;
      this.camera.minRatio = settings.minCameraRatio;
      this.camera.maxRatio = settings.maxCameraRatio;
      this.camera.enabledZooming = settings.enableCameraZooming;
      this.camera.enabledPanning = settings.enableCameraPanning;
      this.camera.enabledRotation = settings.enableCameraRotation;
      if (settings.cameraPanBoundaries) {
        this.camera.clean = function(state) {
          return _this6.cleanCameraState(state, settings.cameraPanBoundaries && _typeof(settings.cameraPanBoundaries) === "object" ? settings.cameraPanBoundaries : {});
        };
      } else {
        this.camera.clean = null;
      }
      this.camera.setState(this.camera.validateState(this.camera.getState()));
      if (oldSettings) {
        if (oldSettings.edgeProgramClasses !== settings.edgeProgramClasses) {
          for (var type in settings.edgeProgramClasses) {
            if (settings.edgeProgramClasses[type] !== oldSettings.edgeProgramClasses[type]) {
              this.registerEdgeProgram(type, settings.edgeProgramClasses[type]);
            }
          }
          for (var _type3 in oldSettings.edgeProgramClasses) {
            if (!settings.edgeProgramClasses[_type3])
              this.unregisterEdgeProgram(_type3);
          }
        }
        if (oldSettings.nodeProgramClasses !== settings.nodeProgramClasses || oldSettings.nodeHoverProgramClasses !== settings.nodeHoverProgramClasses) {
          for (var _type4 in settings.nodeProgramClasses) {
            if (settings.nodeProgramClasses[_type4] !== oldSettings.nodeProgramClasses[_type4] || settings.nodeHoverProgramClasses[_type4] !== oldSettings.nodeHoverProgramClasses[_type4]) {
              this.registerNodeProgram(_type4, settings.nodeProgramClasses[_type4], settings.nodeHoverProgramClasses[_type4]);
            }
          }
          for (var _type5 in oldSettings.nodeProgramClasses) {
            if (!settings.nodeProgramClasses[_type5])
              this.unregisterNodeProgram(_type5);
          }
        }
      }
      this.mouseCaptor.setSettings(this.settings);
      this.touchCaptor.setSettings(this.settings);
      return this;
    }
  }, {
    key: "cleanCameraState",
    value: function cleanCameraState(state) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, _ref$tolerance = _ref.tolerance, tolerance = _ref$tolerance === undefined ? 0 : _ref$tolerance, boundaries = _ref.boundaries;
      var newState = _objectSpread2({}, state);
      var _ref2 = boundaries || this.nodeExtent, _ref2$x = _slicedToArray(_ref2.x, 2), xMinGraph = _ref2$x[0], xMaxGraph = _ref2$x[1], _ref2$y = _slicedToArray(_ref2.y, 2), yMinGraph = _ref2$y[0], yMaxGraph = _ref2$y[1];
      var corners = [this.graphToViewport({
        x: xMinGraph,
        y: yMinGraph
      }, {
        cameraState: state
      }), this.graphToViewport({
        x: xMaxGraph,
        y: yMinGraph
      }, {
        cameraState: state
      }), this.graphToViewport({
        x: xMinGraph,
        y: yMaxGraph
      }, {
        cameraState: state
      }), this.graphToViewport({
        x: xMaxGraph,
        y: yMaxGraph
      }, {
        cameraState: state
      })];
      var xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
      corners.forEach(function(_ref3) {
        var { x: x2, y: y2 } = _ref3;
        xMin = Math.min(xMin, x2);
        xMax = Math.max(xMax, x2);
        yMin = Math.min(yMin, y2);
        yMax = Math.max(yMax, y2);
      });
      var graphWidth = xMax - xMin;
      var graphHeight = yMax - yMin;
      var _this$getDimensions = this.getDimensions(), width = _this$getDimensions.width, height = _this$getDimensions.height;
      var dx = 0;
      var dy = 0;
      if (graphWidth >= width) {
        if (xMax < width - tolerance)
          dx = xMax - (width - tolerance);
        else if (xMin > tolerance)
          dx = xMin - tolerance;
      } else {
        if (xMax > width + tolerance)
          dx = xMax - (width + tolerance);
        else if (xMin < -tolerance)
          dx = xMin + tolerance;
      }
      if (graphHeight >= height) {
        if (yMax < height - tolerance)
          dy = yMax - (height - tolerance);
        else if (yMin > tolerance)
          dy = yMin - tolerance;
      } else {
        if (yMax > height + tolerance)
          dy = yMax - (height + tolerance);
        else if (yMin < -tolerance)
          dy = yMin + tolerance;
      }
      if (dx || dy) {
        var origin = this.viewportToFramedGraph({
          x: 0,
          y: 0
        }, {
          cameraState: state
        });
        var delta = this.viewportToFramedGraph({
          x: dx,
          y: dy
        }, {
          cameraState: state
        });
        dx = delta.x - origin.x;
        dy = delta.y - origin.y;
        newState.x += dx;
        newState.y += dy;
      }
      return newState;
    }
  }, {
    key: "renderLabels",
    value: function renderLabels() {
      if (!this.settings.renderLabels)
        return this;
      var cameraState = this.camera.getState();
      var labelsToDisplay = this.labelGrid.getLabelsToDisplay(cameraState.ratio, this.settings.labelDensity);
      extend(labelsToDisplay, this.nodesWithForcedLabels);
      this.displayedNodeLabels = new Set;
      var context = this.canvasContexts.labels;
      for (var i = 0, l2 = labelsToDisplay.length;i < l2; i++) {
        var node = labelsToDisplay[i];
        var data = this.nodeDataCache[node];
        if (this.displayedNodeLabels.has(node))
          continue;
        if (data.hidden)
          continue;
        var _this$framedGraphToVi = this.framedGraphToViewport(data), x2 = _this$framedGraphToVi.x, y2 = _this$framedGraphToVi.y;
        var size = this.scaleSize(data.size);
        if (!data.forceLabel && size < this.settings.labelRenderedSizeThreshold)
          continue;
        if (x2 < -X_LABEL_MARGIN || x2 > this.width + X_LABEL_MARGIN || y2 < -Y_LABEL_MARGIN || y2 > this.height + Y_LABEL_MARGIN)
          continue;
        this.displayedNodeLabels.add(node);
        var defaultDrawNodeLabel = this.settings.defaultDrawNodeLabel;
        var nodeProgram = this.nodePrograms[data.type];
        var drawLabel = (nodeProgram === null || nodeProgram === undefined ? undefined : nodeProgram.drawLabel) || defaultDrawNodeLabel;
        drawLabel(context, _objectSpread2(_objectSpread2({
          key: node
        }, data), {}, {
          size,
          x: x2,
          y: y2
        }), this.settings);
      }
      return this;
    }
  }, {
    key: "renderEdgeLabels",
    value: function renderEdgeLabels() {
      if (!this.settings.renderEdgeLabels)
        return this;
      var context = this.canvasContexts.edgeLabels;
      context.clearRect(0, 0, this.width, this.height);
      var edgeLabelsToDisplay = edgeLabelsToDisplayFromNodes({
        graph: this.graph,
        hoveredNode: this.hoveredNode,
        displayedNodeLabels: this.displayedNodeLabels,
        highlightedNodes: this.highlightedNodes
      });
      extend(edgeLabelsToDisplay, this.edgesWithForcedLabels);
      var displayedLabels = new Set;
      for (var i = 0, l2 = edgeLabelsToDisplay.length;i < l2; i++) {
        var edge = edgeLabelsToDisplay[i], extremities = this.graph.extremities(edge), sourceData = this.nodeDataCache[extremities[0]], targetData = this.nodeDataCache[extremities[1]], edgeData = this.edgeDataCache[edge];
        if (displayedLabels.has(edge))
          continue;
        if (edgeData.hidden || sourceData.hidden || targetData.hidden) {
          continue;
        }
        var defaultDrawEdgeLabel = this.settings.defaultDrawEdgeLabel;
        var edgeProgram = this.edgePrograms[edgeData.type];
        var drawLabel = (edgeProgram === null || edgeProgram === undefined ? undefined : edgeProgram.drawLabel) || defaultDrawEdgeLabel;
        drawLabel(context, _objectSpread2(_objectSpread2({
          key: edge
        }, edgeData), {}, {
          size: this.scaleSize(edgeData.size)
        }), _objectSpread2(_objectSpread2(_objectSpread2({
          key: extremities[0]
        }, sourceData), this.framedGraphToViewport(sourceData)), {}, {
          size: this.scaleSize(sourceData.size)
        }), _objectSpread2(_objectSpread2(_objectSpread2({
          key: extremities[1]
        }, targetData), this.framedGraphToViewport(targetData)), {}, {
          size: this.scaleSize(targetData.size)
        }), this.settings);
        displayedLabels.add(edge);
      }
      this.displayedEdgeLabels = displayedLabels;
      return this;
    }
  }, {
    key: "renderHighlightedNodes",
    value: function renderHighlightedNodes() {
      var _this7 = this;
      var context = this.canvasContexts.hovers;
      context.clearRect(0, 0, this.width, this.height);
      var render = function render(node) {
        var data = _this7.nodeDataCache[node];
        var _this7$framedGraphToV = _this7.framedGraphToViewport(data), x2 = _this7$framedGraphToV.x, y2 = _this7$framedGraphToV.y;
        var size = _this7.scaleSize(data.size);
        var defaultDrawNodeHover = _this7.settings.defaultDrawNodeHover;
        var nodeProgram = _this7.nodePrograms[data.type];
        var drawHover = (nodeProgram === null || nodeProgram === undefined ? undefined : nodeProgram.drawHover) || defaultDrawNodeHover;
        drawHover(context, _objectSpread2(_objectSpread2({
          key: node
        }, data), {}, {
          size,
          x: x2,
          y: y2
        }), _this7.settings);
      };
      var nodesToRender = [];
      if (this.hoveredNode && !this.nodeDataCache[this.hoveredNode].hidden) {
        nodesToRender.push(this.hoveredNode);
      }
      this.highlightedNodes.forEach(function(node) {
        if (node !== _this7.hoveredNode)
          nodesToRender.push(node);
      });
      nodesToRender.forEach(function(node) {
        return render(node);
      });
      var nodesPerPrograms = {};
      nodesToRender.forEach(function(node) {
        var type2 = _this7.nodeDataCache[node].type;
        nodesPerPrograms[type2] = (nodesPerPrograms[type2] || 0) + 1;
      });
      for (var type in this.nodeHoverPrograms) {
        this.nodeHoverPrograms[type].reallocate(nodesPerPrograms[type] || 0);
        nodesPerPrograms[type] = 0;
      }
      nodesToRender.forEach(function(node) {
        var data = _this7.nodeDataCache[node];
        _this7.nodeHoverPrograms[data.type].process(0, nodesPerPrograms[data.type]++, data);
      });
      this.webGLContexts.hoverNodes.clear(this.webGLContexts.hoverNodes.COLOR_BUFFER_BIT);
      var renderParams = this.getRenderParams();
      for (var _type6 in this.nodeHoverPrograms) {
        var program = this.nodeHoverPrograms[_type6];
        program.render(renderParams);
      }
    }
  }, {
    key: "scheduleHighlightedNodesRender",
    value: function scheduleHighlightedNodesRender() {
      var _this8 = this;
      if (this.renderHighlightedNodesFrame || this.renderFrame)
        return;
      this.renderHighlightedNodesFrame = requestAnimationFrame(function() {
        _this8.renderHighlightedNodesFrame = null;
        _this8.renderHighlightedNodes();
        _this8.renderEdgeLabels();
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this9 = this;
      this.emit("beforeRender");
      var exitRender = function exitRender() {
        _this9.emit("afterRender");
        return _this9;
      };
      if (this.renderFrame) {
        cancelAnimationFrame(this.renderFrame);
        this.renderFrame = null;
      }
      this.resize();
      if (this.needToProcess)
        this.process();
      this.needToProcess = false;
      this.clear();
      this.pickingLayers.forEach(function(layer) {
        return _this9.resetWebGLTexture(layer);
      });
      if (!this.graph.order)
        return exitRender();
      var mouseCaptor = this.mouseCaptor;
      var moving = this.camera.isAnimated() || mouseCaptor.isMoving || mouseCaptor.draggedEvents || mouseCaptor.currentWheelDirection;
      var cameraState = this.camera.getState();
      var viewportDimensions = this.getDimensions();
      var graphDimensions = this.getGraphDimensions();
      var padding = this.getStagePadding();
      this.matrix = matrixFromCamera(cameraState, viewportDimensions, graphDimensions, padding);
      this.invMatrix = matrixFromCamera(cameraState, viewportDimensions, graphDimensions, padding, true);
      this.correctionRatio = getMatrixImpact(this.matrix, cameraState, viewportDimensions);
      this.graphToViewportRatio = this.getGraphToViewportRatio();
      var params = this.getRenderParams();
      for (var type in this.nodePrograms) {
        var program = this.nodePrograms[type];
        program.render(params);
      }
      if (!this.settings.hideEdgesOnMove || !moving) {
        for (var _type7 in this.edgePrograms) {
          var _program2 = this.edgePrograms[_type7];
          _program2.render(params);
        }
      }
      if (this.settings.hideLabelsOnMove && moving)
        return exitRender();
      this.renderLabels();
      this.renderEdgeLabels();
      this.renderHighlightedNodes();
      return exitRender();
    }
  }, {
    key: "addNode",
    value: function addNode(key) {
      var attr = Object.assign({}, this.graph.getNodeAttributes(key));
      if (this.settings.nodeReducer)
        attr = this.settings.nodeReducer(key, attr);
      var data = applyNodeDefaults(this.settings, key, attr);
      this.nodeDataCache[key] = data;
      this.nodesWithForcedLabels["delete"](key);
      if (data.forceLabel && !data.hidden)
        this.nodesWithForcedLabels.add(key);
      this.highlightedNodes["delete"](key);
      if (data.highlighted && !data.hidden)
        this.highlightedNodes.add(key);
      if (this.settings.zIndex) {
        if (data.zIndex < this.nodeZExtent[0])
          this.nodeZExtent[0] = data.zIndex;
        if (data.zIndex > this.nodeZExtent[1])
          this.nodeZExtent[1] = data.zIndex;
      }
    }
  }, {
    key: "updateNode",
    value: function updateNode(key) {
      this.addNode(key);
      var data = this.nodeDataCache[key];
      this.normalizationFunction.applyTo(data);
    }
  }, {
    key: "removeNode",
    value: function removeNode(key) {
      delete this.nodeDataCache[key];
      delete this.nodeProgramIndex[key];
      this.highlightedNodes["delete"](key);
      if (this.hoveredNode === key)
        this.hoveredNode = null;
      this.nodesWithForcedLabels["delete"](key);
    }
  }, {
    key: "addEdge",
    value: function addEdge(key) {
      var attr = Object.assign({}, this.graph.getEdgeAttributes(key));
      if (this.settings.edgeReducer)
        attr = this.settings.edgeReducer(key, attr);
      var data = applyEdgeDefaults(this.settings, key, attr);
      this.edgeDataCache[key] = data;
      this.edgesWithForcedLabels["delete"](key);
      if (data.forceLabel && !data.hidden)
        this.edgesWithForcedLabels.add(key);
      if (this.settings.zIndex) {
        if (data.zIndex < this.edgeZExtent[0])
          this.edgeZExtent[0] = data.zIndex;
        if (data.zIndex > this.edgeZExtent[1])
          this.edgeZExtent[1] = data.zIndex;
      }
    }
  }, {
    key: "updateEdge",
    value: function updateEdge(key) {
      this.addEdge(key);
    }
  }, {
    key: "removeEdge",
    value: function removeEdge(key) {
      delete this.edgeDataCache[key];
      delete this.edgeProgramIndex[key];
      if (this.hoveredEdge === key)
        this.hoveredEdge = null;
      this.edgesWithForcedLabels["delete"](key);
    }
  }, {
    key: "clearNodeIndices",
    value: function clearNodeIndices() {
      this.labelGrid = new LabelGrid;
      this.nodeExtent = {
        x: [0, 1],
        y: [0, 1]
      };
      this.nodeDataCache = {};
      this.edgeProgramIndex = {};
      this.nodesWithForcedLabels = new Set;
      this.nodeZExtent = [Infinity, -Infinity];
    }
  }, {
    key: "clearEdgeIndices",
    value: function clearEdgeIndices() {
      this.edgeDataCache = {};
      this.edgeProgramIndex = {};
      this.edgesWithForcedLabels = new Set;
      this.edgeZExtent = [Infinity, -Infinity];
    }
  }, {
    key: "clearIndices",
    value: function clearIndices() {
      this.clearEdgeIndices();
      this.clearNodeIndices();
    }
  }, {
    key: "clearNodeState",
    value: function clearNodeState() {
      this.displayedNodeLabels = new Set;
      this.highlightedNodes = new Set;
      this.hoveredNode = null;
    }
  }, {
    key: "clearEdgeState",
    value: function clearEdgeState() {
      this.displayedEdgeLabels = new Set;
      this.highlightedNodes = new Set;
      this.hoveredEdge = null;
    }
  }, {
    key: "clearState",
    value: function clearState() {
      this.clearEdgeState();
      this.clearNodeState();
    }
  }, {
    key: "addNodeToProgram",
    value: function addNodeToProgram(node, fingerprint, position) {
      var data = this.nodeDataCache[node];
      var nodeProgram = this.nodePrograms[data.type];
      if (!nodeProgram)
        throw new Error('Sigma: could not find a suitable program for node type "'.concat(data.type, '"!'));
      nodeProgram.process(fingerprint, position, data);
      this.nodeProgramIndex[node] = position;
    }
  }, {
    key: "addEdgeToProgram",
    value: function addEdgeToProgram(edge, fingerprint, position) {
      var data = this.edgeDataCache[edge];
      var edgeProgram = this.edgePrograms[data.type];
      if (!edgeProgram)
        throw new Error('Sigma: could not find a suitable program for edge type "'.concat(data.type, '"!'));
      var extremities = this.graph.extremities(edge), sourceData = this.nodeDataCache[extremities[0]], targetData = this.nodeDataCache[extremities[1]];
      edgeProgram.process(fingerprint, position, sourceData, targetData, data);
      this.edgeProgramIndex[edge] = position;
    }
  }, {
    key: "getRenderParams",
    value: function getRenderParams() {
      return {
        matrix: this.matrix,
        invMatrix: this.invMatrix,
        width: this.width,
        height: this.height,
        pixelRatio: this.pixelRatio,
        zoomRatio: this.camera.ratio,
        cameraAngle: this.camera.angle,
        sizeRatio: 1 / this.scaleSize(),
        correctionRatio: this.correctionRatio,
        downSizingRatio: this.pickingDownSizingRatio,
        minEdgeThickness: this.settings.minEdgeThickness,
        antiAliasingFeather: this.settings.antiAliasingFeather
      };
    }
  }, {
    key: "getStagePadding",
    value: function getStagePadding() {
      var _this$settings = this.settings, stagePadding = _this$settings.stagePadding, autoRescale = _this$settings.autoRescale;
      return autoRescale ? stagePadding || 0 : 0;
    }
  }, {
    key: "createLayer",
    value: function createLayer(id, tag) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (this.elements[id])
        throw new Error('Sigma: a layer named "'.concat(id, '" already exists'));
      var element = createElement(tag, {
        position: "absolute"
      }, {
        class: "sigma-".concat(id)
      });
      if (options.style)
        Object.assign(element.style, options.style);
      this.elements[id] = element;
      if ("beforeLayer" in options && options.beforeLayer) {
        this.elements[options.beforeLayer].before(element);
      } else if ("afterLayer" in options && options.afterLayer) {
        this.elements[options.afterLayer].after(element);
      } else {
        this.container.appendChild(element);
      }
      return element;
    }
  }, {
    key: "createCanvas",
    value: function createCanvas(id) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.createLayer(id, "canvas", options);
    }
  }, {
    key: "createCanvasContext",
    value: function createCanvasContext(id) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var canvas = this.createCanvas(id, options);
      var contextOptions = {
        preserveDrawingBuffer: false,
        antialias: false
      };
      this.canvasContexts[id] = canvas.getContext("2d", contextOptions);
      return this;
    }
  }, {
    key: "createWebGLContext",
    value: function createWebGLContext(id) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var canvas = (options === null || options === undefined ? undefined : options.canvas) || this.createCanvas(id, options);
      if (options.hidden)
        canvas.remove();
      var contextOptions = _objectSpread2({
        preserveDrawingBuffer: false,
        antialias: false
      }, options);
      var context;
      context = canvas.getContext("webgl2", contextOptions);
      if (!context)
        context = canvas.getContext("webgl", contextOptions);
      if (!context)
        context = canvas.getContext("experimental-webgl", contextOptions);
      var gl = context;
      this.webGLContexts[id] = gl;
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      if (options.picking) {
        this.pickingLayers.add(id);
        var newFrameBuffer = gl.createFramebuffer();
        if (!newFrameBuffer)
          throw new Error("Sigma: cannot create a new frame buffer for layer ".concat(id));
        this.frameBuffers[id] = newFrameBuffer;
      }
      return gl;
    }
  }, {
    key: "killLayer",
    value: function killLayer(id) {
      var element = this.elements[id];
      if (!element)
        throw new Error("Sigma: cannot kill layer ".concat(id, ", which does not exist"));
      if (this.webGLContexts[id]) {
        var _gl$getExtension;
        var gl = this.webGLContexts[id];
        (_gl$getExtension = gl.getExtension("WEBGL_lose_context")) === null || _gl$getExtension === undefined || _gl$getExtension.loseContext();
        delete this.webGLContexts[id];
      } else if (this.canvasContexts[id]) {
        delete this.canvasContexts[id];
      }
      element.remove();
      delete this.elements[id];
      return this;
    }
  }, {
    key: "getCamera",
    value: function getCamera() {
      return this.camera;
    }
  }, {
    key: "setCamera",
    value: function setCamera(camera) {
      this.unbindCameraHandlers();
      this.camera = camera;
      this.bindCameraHandlers();
    }
  }, {
    key: "getContainer",
    value: function getContainer() {
      return this.container;
    }
  }, {
    key: "getGraph",
    value: function getGraph() {
      return this.graph;
    }
  }, {
    key: "setGraph",
    value: function setGraph(graph) {
      if (graph === this.graph)
        return;
      if (this.hoveredNode && !graph.hasNode(this.hoveredNode))
        this.hoveredNode = null;
      if (this.hoveredEdge && !graph.hasEdge(this.hoveredEdge))
        this.hoveredEdge = null;
      this.unbindGraphHandlers();
      if (this.checkEdgesEventsFrame !== null) {
        cancelAnimationFrame(this.checkEdgesEventsFrame);
        this.checkEdgesEventsFrame = null;
      }
      this.graph = graph;
      this.bindGraphHandlers();
      this.refresh();
    }
  }, {
    key: "getMouseCaptor",
    value: function getMouseCaptor() {
      return this.mouseCaptor;
    }
  }, {
    key: "getTouchCaptor",
    value: function getTouchCaptor() {
      return this.touchCaptor;
    }
  }, {
    key: "getDimensions",
    value: function getDimensions() {
      return {
        width: this.width,
        height: this.height
      };
    }
  }, {
    key: "getGraphDimensions",
    value: function getGraphDimensions() {
      var extent = this.customBBox || this.nodeExtent;
      return {
        width: extent.x[1] - extent.x[0] || 1,
        height: extent.y[1] - extent.y[0] || 1
      };
    }
  }, {
    key: "getNodeDisplayData",
    value: function getNodeDisplayData(key) {
      var node = this.nodeDataCache[key];
      return node ? Object.assign({}, node) : undefined;
    }
  }, {
    key: "getEdgeDisplayData",
    value: function getEdgeDisplayData(key) {
      var edge = this.edgeDataCache[key];
      return edge ? Object.assign({}, edge) : undefined;
    }
  }, {
    key: "getNodeDisplayedLabels",
    value: function getNodeDisplayedLabels() {
      return new Set(this.displayedNodeLabels);
    }
  }, {
    key: "getEdgeDisplayedLabels",
    value: function getEdgeDisplayedLabels() {
      return new Set(this.displayedEdgeLabels);
    }
  }, {
    key: "getSettings",
    value: function getSettings() {
      return _objectSpread2({}, this.settings);
    }
  }, {
    key: "getSetting",
    value: function getSetting(key) {
      return this.settings[key];
    }
  }, {
    key: "setSetting",
    value: function setSetting(key, value) {
      var oldValues = _objectSpread2({}, this.settings);
      this.settings[key] = value;
      validateSettings(this.settings);
      this.handleSettingsUpdate(oldValues);
      this.scheduleRefresh();
      return this;
    }
  }, {
    key: "updateSetting",
    value: function updateSetting(key, updater) {
      this.setSetting(key, updater(this.settings[key]));
      return this;
    }
  }, {
    key: "setSettings",
    value: function setSettings(settings) {
      var oldValues = _objectSpread2({}, this.settings);
      this.settings = _objectSpread2(_objectSpread2({}, this.settings), settings);
      validateSettings(this.settings);
      this.handleSettingsUpdate(oldValues);
      this.scheduleRefresh();
      return this;
    }
  }, {
    key: "resize",
    value: function resize(force) {
      var previousWidth = this.width, previousHeight = this.height;
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.pixelRatio = getPixelRatio();
      if (this.width === 0) {
        if (this.settings.allowInvalidContainer)
          this.width = 1;
        else
          throw new Error("Sigma: Container has no width. You can set the allowInvalidContainer setting to true to stop seeing this error.");
      }
      if (this.height === 0) {
        if (this.settings.allowInvalidContainer)
          this.height = 1;
        else
          throw new Error("Sigma: Container has no height. You can set the allowInvalidContainer setting to true to stop seeing this error.");
      }
      if (!force && previousWidth === this.width && previousHeight === this.height)
        return this;
      for (var id in this.elements) {
        var element = this.elements[id];
        element.style.width = this.width + "px";
        element.style.height = this.height + "px";
      }
      for (var _id in this.canvasContexts) {
        this.elements[_id].setAttribute("width", this.width * this.pixelRatio + "px");
        this.elements[_id].setAttribute("height", this.height * this.pixelRatio + "px");
        if (this.pixelRatio !== 1)
          this.canvasContexts[_id].scale(this.pixelRatio, this.pixelRatio);
      }
      for (var _id2 in this.webGLContexts) {
        this.elements[_id2].setAttribute("width", this.width * this.pixelRatio + "px");
        this.elements[_id2].setAttribute("height", this.height * this.pixelRatio + "px");
        var gl = this.webGLContexts[_id2];
        gl.viewport(0, 0, this.width * this.pixelRatio, this.height * this.pixelRatio);
        if (this.pickingLayers.has(_id2)) {
          var currentTexture = this.textures[_id2];
          if (currentTexture)
            gl.deleteTexture(currentTexture);
        }
      }
      this.emit("resize");
      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.emit("beforeClear");
      this.webGLContexts.nodes.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
      this.webGLContexts.nodes.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
      this.webGLContexts.edges.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
      this.webGLContexts.edges.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
      this.webGLContexts.hoverNodes.clear(WebGLRenderingContext.COLOR_BUFFER_BIT);
      this.canvasContexts.labels.clearRect(0, 0, this.width, this.height);
      this.canvasContexts.hovers.clearRect(0, 0, this.width, this.height);
      this.canvasContexts.edgeLabels.clearRect(0, 0, this.width, this.height);
      this.emit("afterClear");
      return this;
    }
  }, {
    key: "refresh",
    value: function refresh(opts) {
      var _this10 = this;
      var skipIndexation = (opts === null || opts === undefined ? undefined : opts.skipIndexation) !== undefined ? opts === null || opts === undefined ? undefined : opts.skipIndexation : false;
      var schedule = (opts === null || opts === undefined ? undefined : opts.schedule) !== undefined ? opts.schedule : false;
      var fullRefresh = !opts || !opts.partialGraph;
      if (fullRefresh) {
        this.clearEdgeIndices();
        this.clearNodeIndices();
        this.graph.forEachNode(function(node2) {
          return _this10.addNode(node2);
        });
        this.graph.forEachEdge(function(edge2) {
          return _this10.addEdge(edge2);
        });
      } else {
        var _opts$partialGraph, _opts$partialGraph2;
        var nodes = ((_opts$partialGraph = opts.partialGraph) === null || _opts$partialGraph === undefined ? undefined : _opts$partialGraph.nodes) || [];
        for (var i = 0, l2 = (nodes === null || nodes === undefined ? undefined : nodes.length) || 0;i < l2; i++) {
          var node = nodes[i];
          this.updateNode(node);
          if (skipIndexation) {
            var programIndex = this.nodeProgramIndex[node];
            if (programIndex === undefined)
              throw new Error('Sigma: node "'.concat(node, `" can't be repaint`));
            this.addNodeToProgram(node, this.nodeIndices[node], programIndex);
          }
        }
        var edges = (opts === null || opts === undefined || (_opts$partialGraph2 = opts.partialGraph) === null || _opts$partialGraph2 === undefined ? undefined : _opts$partialGraph2.edges) || [];
        for (var _i4 = 0, _l4 = edges.length;_i4 < _l4; _i4++) {
          var edge = edges[_i4];
          this.updateEdge(edge);
          if (skipIndexation) {
            var _programIndex = this.edgeProgramIndex[edge];
            if (_programIndex === undefined)
              throw new Error('Sigma: edge "'.concat(edge, `" can't be repaint`));
            this.addEdgeToProgram(edge, this.edgeIndices[edge], _programIndex);
          }
        }
      }
      if (fullRefresh || !skipIndexation)
        this.needToProcess = true;
      if (schedule)
        this.scheduleRender();
      else
        this.render();
      return this;
    }
  }, {
    key: "scheduleRender",
    value: function scheduleRender() {
      var _this11 = this;
      if (!this.renderFrame) {
        this.renderFrame = requestAnimationFrame(function() {
          _this11.render();
        });
      }
      return this;
    }
  }, {
    key: "scheduleRefresh",
    value: function scheduleRefresh(opts) {
      return this.refresh(_objectSpread2(_objectSpread2({}, opts), {}, {
        schedule: true
      }));
    }
  }, {
    key: "getViewportZoomedState",
    value: function getViewportZoomedState(viewportTarget, newRatio) {
      var _this$camera$getState = this.camera.getState(), ratio = _this$camera$getState.ratio, angle = _this$camera$getState.angle, x2 = _this$camera$getState.x, y2 = _this$camera$getState.y;
      var _this$settings2 = this.settings, minCameraRatio = _this$settings2.minCameraRatio, maxCameraRatio = _this$settings2.maxCameraRatio;
      if (typeof maxCameraRatio === "number")
        newRatio = Math.min(newRatio, maxCameraRatio);
      if (typeof minCameraRatio === "number")
        newRatio = Math.max(newRatio, minCameraRatio);
      var ratioDiff = newRatio / ratio;
      var center = {
        x: this.width / 2,
        y: this.height / 2
      };
      var graphMousePosition = this.viewportToFramedGraph(viewportTarget);
      var graphCenterPosition = this.viewportToFramedGraph(center);
      return {
        angle,
        x: (graphMousePosition.x - graphCenterPosition.x) * (1 - ratioDiff) + x2,
        y: (graphMousePosition.y - graphCenterPosition.y) * (1 - ratioDiff) + y2,
        ratio: newRatio
      };
    }
  }, {
    key: "viewRectangle",
    value: function viewRectangle() {
      var p1 = this.viewportToFramedGraph({
        x: 0,
        y: 0
      }), p2 = this.viewportToFramedGraph({
        x: this.width,
        y: 0
      }), h2 = this.viewportToFramedGraph({
        x: 0,
        y: this.height
      });
      return {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        height: p2.y - h2.y
      };
    }
  }, {
    key: "framedGraphToViewport",
    value: function framedGraphToViewport(coordinates) {
      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var recomputeMatrix = !!override.cameraState || !!override.viewportDimensions || !!override.graphDimensions;
      var matrix = override.matrix ? override.matrix : recomputeMatrix ? matrixFromCamera(override.cameraState || this.camera.getState(), override.viewportDimensions || this.getDimensions(), override.graphDimensions || this.getGraphDimensions(), override.padding || this.getStagePadding()) : this.matrix;
      var viewportPos = multiplyVec2(matrix, coordinates);
      return {
        x: (1 + viewportPos.x) * this.width / 2,
        y: (1 - viewportPos.y) * this.height / 2
      };
    }
  }, {
    key: "viewportToFramedGraph",
    value: function viewportToFramedGraph(coordinates) {
      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var recomputeMatrix = !!override.cameraState || !!override.viewportDimensions || !override.graphDimensions;
      var invMatrix = override.matrix ? override.matrix : recomputeMatrix ? matrixFromCamera(override.cameraState || this.camera.getState(), override.viewportDimensions || this.getDimensions(), override.graphDimensions || this.getGraphDimensions(), override.padding || this.getStagePadding(), true) : this.invMatrix;
      var res = multiplyVec2(invMatrix, {
        x: coordinates.x / this.width * 2 - 1,
        y: 1 - coordinates.y / this.height * 2
      });
      if (isNaN(res.x))
        res.x = 0;
      if (isNaN(res.y))
        res.y = 0;
      return res;
    }
  }, {
    key: "viewportToGraph",
    value: function viewportToGraph(viewportPoint) {
      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.normalizationFunction.inverse(this.viewportToFramedGraph(viewportPoint, override));
    }
  }, {
    key: "graphToViewport",
    value: function graphToViewport(graphPoint) {
      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.framedGraphToViewport(this.normalizationFunction(graphPoint), override);
    }
  }, {
    key: "getGraphToViewportRatio",
    value: function getGraphToViewportRatio() {
      var graphP1 = {
        x: 0,
        y: 0
      };
      var graphP2 = {
        x: 1,
        y: 1
      };
      var graphD = Math.sqrt(Math.pow(graphP1.x - graphP2.x, 2) + Math.pow(graphP1.y - graphP2.y, 2));
      var viewportP1 = this.graphToViewport(graphP1);
      var viewportP2 = this.graphToViewport(graphP2);
      var viewportD = Math.sqrt(Math.pow(viewportP1.x - viewportP2.x, 2) + Math.pow(viewportP1.y - viewportP2.y, 2));
      return viewportD / graphD;
    }
  }, {
    key: "getBBox",
    value: function getBBox() {
      return this.nodeExtent;
    }
  }, {
    key: "getCustomBBox",
    value: function getCustomBBox() {
      return this.customBBox;
    }
  }, {
    key: "setCustomBBox",
    value: function setCustomBBox(customBBox) {
      this.customBBox = customBBox;
      this.scheduleRender();
      return this;
    }
  }, {
    key: "kill",
    value: function kill() {
      this.emit("kill");
      this.removeAllListeners();
      this.unbindCameraHandlers();
      window.removeEventListener("resize", this.activeListeners.handleResize);
      this.mouseCaptor.kill();
      this.touchCaptor.kill();
      this.unbindGraphHandlers();
      this.clearIndices();
      this.clearState();
      this.nodeDataCache = {};
      this.edgeDataCache = {};
      this.highlightedNodes.clear();
      if (this.renderFrame) {
        cancelAnimationFrame(this.renderFrame);
        this.renderFrame = null;
      }
      if (this.renderHighlightedNodesFrame) {
        cancelAnimationFrame(this.renderHighlightedNodesFrame);
        this.renderHighlightedNodesFrame = null;
      }
      var container = this.container;
      while (container.firstChild)
        container.removeChild(container.firstChild);
      this.canvasContexts = {};
      this.webGLContexts = {};
      this.elements = {};
      for (var type in this.nodePrograms) {
        this.nodePrograms[type].kill();
      }
      for (var _type8 in this.nodeHoverPrograms) {
        this.nodeHoverPrograms[_type8].kill();
      }
      for (var _type9 in this.edgePrograms) {
        this.edgePrograms[_type9].kill();
      }
      this.nodePrograms = {};
      this.nodeHoverPrograms = {};
      this.edgePrograms = {};
      for (var id in this.elements) {
        this.killLayer(id);
      }
    }
  }, {
    key: "scaleSize",
    value: function scaleSize() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var cameraRatio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.camera.ratio;
      return size / this.settings.zoomToSizeRatioFunction(cameraRatio) * (this.getSetting("itemSizesReference") === "positions" ? cameraRatio * this.graphToViewportRatio : 1);
    }
  }, {
    key: "getCanvases",
    value: function getCanvases() {
      var res = {};
      for (var layer in this.elements)
        if (this.elements[layer] instanceof HTMLCanvasElement)
          res[layer] = this.elements[layer];
      return res;
    }
  }]);
}(TypedEventEmitter);
var Sigma = Sigma$1;

// scripts/styles.ts
var DefaultNode = {
  size: 10,
  color: "gray"
};
var DefaultEdge = {
  size: 0.5
};
var HoveredNode = {
  forceLabel: true
};
var DeEmphasizedNode = {
  label: "",
  color: "#f6f6f6"
};
var DeEmphasizedEdge = {
  hidden: true
};
var SelectedNode = {
  ...HoveredNode
};
var SelectedEdge = {};

// scripts/state.ts
class State {
  graph;
  hoveredNode;
  hoveredNeighbors;
  selectedNode;
  selectedNeighbors;
  constructor(graph) {
    this.graph = graph;
  }
  setHoveredNode(node) {
    if (node === undefined) {
      this.hoveredNode = undefined;
      this.hoveredNeighbors = undefined;
      return;
    }
    this.hoveredNode = node;
    this.hoveredNeighbors = new Set(this.graph.neighbors(node));
  }
  setSelectedNode(node) {
    if (node === undefined) {
      this.selectedNode = undefined;
      this.selectedNeighbors = undefined;
      return;
    }
    this.selectedNode = node;
    this.selectedNeighbors = new Set(this.graph.neighbors(node));
  }
  nodeIsHovered = (node) => this.hoveredNeighbors && (this.hoveredNeighbors.has(node) || this.hoveredNode === node);
  nodeIsSelected = (node) => this.selectedNeighbors && (this.selectedNeighbors.has(node) || this.selectedNode === node);
  edgeIsHovered = (edge) => this.hoveredNode && this.graph.extremities(edge).every((n) => n === this.hoveredNode || this.graph.areNeighbors(n, this.hoveredNode));
  edgeIsSelected = (edge) => this.selectedNode && this.graph.extremities(edge).every((node) => node === this.selectedNode || this.graph.areNeighbors(node, this.selectedNode));
  get hoveringActive() {
    return !!this.hoveredNode;
  }
  get selectionActive() {
    return !!this.selectedNode;
  }
}

// scripts/index.ts
var constructGraph = () => {
  const graph = new Graph;
  for (const node of reformatted_default.nodes) {
    graph.addNode(node.id, { label: node.id, ...DefaultNode });
  }
  for (const edge of reformatted_default.links) {
    try {
      graph.addDirectedEdge(edge.source, edge.target, { ...DefaultEdge });
    } catch (error) {
      console.error(error);
    }
  }
  const MAX_SIZE = 20;
  const maxEdges = graph.reduceNodes((acc, node) => Math.max(acc, graph.neighbors(node).length), 0);
  graph.forEachNode((node) => {
    graph.updateNodeAttribute(node, "size", () => graph.neighbors(node).length / maxEdges * MAX_SIZE);
  });
  return graph;
};
var graph = constructGraph();
import_circular.default.assign(graph);
var state = new State(graph);
var layout = new import_worker.default(graph, {
  isNodeFixed: (_2, attr) => attr.highlighted,
  settings: {}
});
layout.start();
var renderer = new Sigma(graph, document.getElementById("container"));
renderer.on("enterNode", (payload) => {
  if (state.selectionActive) {
    return;
  }
  if (state.hoveringActive) {
    state.setHoveredNode(undefined);
  }
  state.setHoveredNode(payload.node);
  renderer.refresh({ skipIndexation: true });
});
renderer.on("leaveNode", (payload) => {
  state.setHoveredNode(undefined);
  renderer.refresh({ skipIndexation: true });
});
renderer.on("clickNode", (payload) => {
  if (state.selectionActive) {
    state.setSelectedNode(undefined);
  }
  state.setSelectedNode(payload.node);
  renderer.refresh({ skipIndexation: true });
});
renderer.on("clickStage", (payload) => {
  state.setSelectedNode(undefined);
  renderer.refresh({ skipIndexation: true });
});
renderer.setSetting("nodeReducer", (node, data) => {
  let res = { ...data };
  if (state.selectionActive) {
    if (state.nodeIsSelected(node)) {
      res = { ...res, ...SelectedNode };
    } else {
      res = { ...res, ...DeEmphasizedEdge };
    }
  }
  if (state.hoveringActive) {
    if (state.nodeIsHovered(node)) {
      res = { ...res, ...HoveredNode };
    }
    if (!state.nodeIsHovered(node)) {
      res = { ...res, ...DeEmphasizedNode };
    }
  }
  return res;
});
renderer.setSetting("edgeReducer", (edge, data) => {
  let res = { ...data };
  if (state.selectionActive) {
    if (state.edgeIsSelected(edge)) {
      res = { ...res, ...SelectedEdge };
    }
  }
  if (state.hoveringActive) {
    if (!state.edgeIsHovered(edge)) {
      res = { ...res, ...DeEmphasizedEdge };
    }
  }
  return res;
});
