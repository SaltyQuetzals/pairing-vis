import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

export const DefaultNodeDisplayData: Partial<NodeDisplayData> = {
  size: 10,
  color: "gray",
};

export const HoveredNodeDisplayData: Partial<NodeDisplayData> = {
  forceLabel: true
}

export const DeEmphasizedNodeDisplayData: Partial<NodeDisplayData> = {
  label: "",
  color: "#f6f6f6",
};

export const DeEmphasizedEdgeDisplayData: Partial<EdgeDisplayData> = {
    hidden: true
}

export const SelectedNodeDisplayData: Partial<NodeDisplayData> = {
    color: "orange",
    forceLabel: true
}

export const SelectedEdgeDisplayData: Partial<EdgeDisplayData> = {
    color: "orange"
}