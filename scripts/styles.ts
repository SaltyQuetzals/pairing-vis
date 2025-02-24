import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

type Style = {
  node: Partial<NodeDisplayData>;
  edge: Partial<EdgeDisplayData>;
};

export const defaultStyle: Style = {
  node: {
    size: 10,
    color: "gray",
  },
  edge: { size: 0.5 },
};

export const nodeHovered: Style = {
  node: {
    forceLabel: true,
  },
  edge: {},
};

export const deEmphasized: Style = {
  node: {
    label: "",
    color: "#f6f6f6",
  },
  edge: {
    hidden: true,
  },
};

export const hidden: Style = {
  node: {
    hidden: true,
  },
  edge: {
    hidden: true,
  },
};

export const nodeSelected: Style = {
  node: nodeHovered.node,
  edge: {},
};
