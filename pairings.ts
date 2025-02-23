import data from "./reformatted.json";
import circular from "graphology-layout/circular";
import Graph from "graphology";
import Sigma from "sigma";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

const graph = new Graph();

for (const node of data.nodes) {
  graph.addNode(node.id, { label: node.id, size: 10, color: "gray" });
}

for (const edge of data.links) {
  try {
    graph.addUndirectedEdge(edge.source, edge.target);
  } catch (error) {
    console.error(error);
  }
}

circular.assign(graph);

interface State {
  hoveredNode?: string;
  hoveredNeighbors?: Set<string>;
}

const state: State = {};

const sigma = new Sigma(graph, document.getElementById("container")!);

const setHoveredNode = (node?: string) => {
  if (node === undefined) {
    state.hoveredNode = undefined;
    state.hoveredNeighbors = undefined;
  } else {
    state.hoveredNode = node;
    state.hoveredNeighbors = new Set(graph.neighbors(node));
  }

  sigma.refresh({ skipIndexation: true });
};

sigma.on("enterNode", ({ node }) => setHoveredNode(node));
sigma.on("leaveNode", () => setHoveredNode(undefined));

// Render nodes accordingly to the internal state:
// 1. If a node is selected, it is highlighted
// 2. If there is query, all non-matching nodes are greyed
// 3. If there is a hovered node, all non-neighbor nodes are greyed
sigma.setSetting("nodeReducer", (node, data) => {
  const res: Partial<NodeDisplayData> = { ...data };

  if (
    state.hoveredNeighbors &&
    !state.hoveredNeighbors.has(node) &&
    state.hoveredNode !== node
  ) {
    res.label = "";
    res.color = "#f6f6f6";
  }

  return res;
});

// Render edges accordingly to the internal state:
// 1. If a node is hovered, the edge is hidden if it is not connected to the
//    node
// 2. If there is a query, the edge is only visible if it connects two
//    suggestions
sigma.setSetting("edgeReducer", (edge, data) => {
  const res: Partial<EdgeDisplayData> = { ...data };

  if (
    state.hoveredNode &&
    !graph
      .extremities(edge)
      .every(
        (n) =>
          n === state.hoveredNode || graph.areNeighbors(n, state.hoveredNode)
      )
  ) {
    res.hidden = true;
  }

  return res;
});
