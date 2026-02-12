package com.dmp.dto;

import java.util.List;

public class LineageResponse {
    private List<LineageNode> nodes;
    private List<LineageEdge> edges;

    public LineageResponse() {}
    public LineageResponse(List<LineageNode> nodes, List<LineageEdge> edges) {
        this.nodes = nodes; this.edges = edges;
    }
    public List<LineageNode> getNodes() { return nodes; } public void setNodes(List<LineageNode> nodes) { this.nodes = nodes; }
    public List<LineageEdge> getEdges() { return edges; } public void setEdges(List<LineageEdge> edges) { this.edges = edges; }
}
