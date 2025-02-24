import data from "./data/reformatted.json";
import circular from "graphology-layout/circular";

import Graph from "graphology";
import Sigma from "sigma";
import {
  DeEmphasizedEdgeDisplayData,
  DeEmphasizedNodeDisplayData,
  DefaultNodeDisplayData,
  HoveredNodeDisplayData,
  SelectedEdgeDisplayData,
  SelectedNodeDisplayData,
} from "./styles";
import State from "./state";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

const constructGraph = () => {
  const graph = new Graph();

  for (const node of data.nodes) {
    graph.addNode(node.id, { label: node.id, ...DefaultNodeDisplayData });
  }

  for (const edge of data.links) {
    try {
      graph.addDirectedEdge(edge.source, edge.target);
    } catch (error) {
      console.error(error);
    }
  }

  return graph;
};

const graph = constructGraph();

circular.assign(graph);

const state = new State(graph);

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
        res = { ...res, ...SelectedNodeDisplayData };
      } else {
        res = {...res, ...DeEmphasizedEdgeDisplayData}
      }
    }

    if (state.hoveringActive) {
      if (state.nodeIsHovered(node)) {
        res = { ...res, ...HoveredNodeDisplayData };
      }
      if (!state.nodeIsHovered(node)) {
        res = { ...res, ...DeEmphasizedNodeDisplayData };
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
        res = { ...res, ...SelectedEdgeDisplayData };
      }
    }

    if (state.hoveringActive) {
      if (!state.edgeIsHovered(edge)) {
        res = { ...res, ...DeEmphasizedEdgeDisplayData };
      }
    }

    return res;
  }
);
