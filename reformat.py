import json
import dataclasses
from dataclasses import dataclass, asdict


@dataclass
class Pairing:
    source: str
    pair: list[str]


@dataclass
class Node:
    id: str


@dataclass
class Edge:
    source: str
    target: str
    value: int


class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if dataclasses.is_dataclass(o):
            return dataclasses.asdict(o)
        return super().default(o)


with open("pairings.json", "r") as pairings_file:
    entries: list[dict] = json.load(pairings_file)
    pairings: list[Pairing] = [Pairing(**e) for e in entries]

nodes: list[Node] = []
edges: list[Edge] = []
for pairing in pairings:
    nodes.append(Node(id=pairing.source))
    for pair in pairing.pair:
        if not pair:
            continue
        edges.append(Edge(source=pairing.source, target=pair, value=1))

with open("reformatted.json", "w+") as reformatted_file:
    json.dump(
        {"nodes": nodes, "links": edges}, reformatted_file, cls=EnhancedJSONEncoder
    )
