import data from "./data/reformatted.json";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import Graph from "graphology";
import Sigma from "sigma";
import {
  DeEmphasizedEdge,
  DeEmphasizedNode,
  DefaultEdge,
  DefaultNode,
  HoveredNode,
  SelectedEdge,
  SelectedNode,
} from "./styles";
import State from "./state";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

const constructGraph = () => {
  const graph = new Graph();

  for (const node of data.nodes) {
    graph.addNode(node.id, { label: node.id, ...DefaultNode });
  }

  for (const edge of data.links) {
    try {
      graph.addUndirectedEdge(edge.source, edge.target, { ...DefaultEdge });
    } catch (error) {
      console.error(error);
    }
  }

  const MAX_SIZE = 20;
  const maxEdges = graph.reduceNodes(
    (acc, node) => Math.max(acc, graph.degree(node)),
    0
  );

  graph.forEachNode((node) => {
    graph.updateNodeAttribute(
      node,
      "size",
      () => (graph.degree(node) / maxEdges) * MAX_SIZE
    );
  });
  return graph;
};

const graph = constructGraph();
circular.assign(graph);
const state = new State(graph);

const sensibleSettings = forceAtlas2.inferSettings(graph);
console.log(sensibleSettings);
const layout = new FA2Layout(graph, {
  settings: sensibleSettings
});
layout.start();

const renderer = new Sigma(graph, document.getElementById("container")!);

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

renderer.setSetting(
  "nodeReducer",
  (node: string, data: Partial<NodeDisplayData>) => {
    let res: Partial<NodeDisplayData> = { ...data };

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
  }
);

renderer.setSetting(
  "edgeReducer",
  (edge: string, data: Partial<EdgeDisplayData>) => {
    let res: Partial<EdgeDisplayData> = { ...data };

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
  }
);
