#include "core/PathNode.hpp"
#include "renderer/RenderPipeline.hpp"

namespace vectma {

PathNode::PathNode(const std::string& pathData)
    : m_pathData(pathData) {}

void PathNode::draw(RenderPipeline& renderer) {
    renderer.drawPath(m_pathData);
}

bool PathNode::containsPoint(const GPoint& point) const {
    // Placeholder for path containment logic
    return false;
}

GRect PathNode::computeBoundingBox() const {
    // Placeholder for path bbox calculation
    return GRect(0, 0, 0, 0);
}

} // namespace vectma
