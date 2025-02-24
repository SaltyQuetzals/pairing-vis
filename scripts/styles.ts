import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

export const DefaultNode: Partial<NodeDisplayData> = {
  size: 10,
  color: "gray",
};

export const DefaultEdge: Partial<EdgeDisplayData> = {
  size: 0.5,
};

export const HoveredNode: Partial<NodeDisplayData> = {
  forceLabel: true,
};

export const DeEmphasizedNode: Partial<NodeDisplayData> = {
  label: "",
  color: "#f6f6f6",
};

export const DeEmphasizedEdge: Partial<EdgeDisplayData> = {
  hidden: true,
};

export const SelectedNode: Partial<NodeDisplayData> = {
  ...HoveredNode,
};

export const SelectedEdge: Partial<EdgeDisplayData> = {};
