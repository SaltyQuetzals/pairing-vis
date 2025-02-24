import Graph from "graphology";

export default class State {
  private hoveredNode?: string;
  private hoveredNeighbors?: Set<string>;

  private selectedNode?: string;
  private selectedNeighbors?: Set<string>;

  constructor(private readonly graph: Graph) {}

  public setHoveredNode(node?: string) {
    if (node === undefined) {
      this.hoveredNode = undefined;
      this.hoveredNeighbors = undefined;
      return;
    }
    this.hoveredNode = node;
    this.hoveredNeighbors = new Set(this.graph.neighbors(node));
  }

  public setSelectedNode(node?: string) {
    if (node === undefined) {
      this.selectedNode = undefined;
      this.selectedNeighbors = undefined;
      return;
    }
    this.selectedNode = node;
    this.selectedNeighbors = new Set(this.graph.neighbors(node));
  }

  public nodeIsHovered = (node: string) =>
    this.hoveredNeighbors &&
    (this.hoveredNeighbors.has(node) || this.hoveredNode === node);

  public nodeIsSelected = (node: string) =>
    this.selectedNeighbors &&
    (this.selectedNeighbors.has(node) || this.selectedNode === node);

  public edgeIsHovered = (edge: string) =>
    this.hoveredNode &&
    this.graph
      .extremities(edge)
      .every(
        (n) =>
          n === this.hoveredNode || this.graph.areNeighbors(n, this.hoveredNode)
      );

  public edgeIsSelected = (edge: string) =>
    this.selectedNode &&
    this.graph
      .extremities(edge)
      .every(
        (node) =>
          node === this.selectedNode ||
          this.graph.areNeighbors(node, this.selectedNode)
      );

  public get hoveringActive() {
    return !!this.hoveredNode;
  }
  public get selectionActive() {
    return !!this.selectedNode;
  }
}
