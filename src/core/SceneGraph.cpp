#include "core/SceneGraph.hpp"
#include "renderer/RenderPipeline.hpp"

namespace vectma {

SceneGraph::SceneGraph() = default;

SceneGraph::~SceneGraph() = default;

void SceneGraph::draw(RenderPipeline& renderer) {
    for (const auto& child : m_children) {
        child->draw(renderer);
    }
}

bool SceneGraph::containsPoint(const GPoint& point) const {
    for (const auto& child : m_children) {
        if (child->containsPoint(point)) return true;
    }
    return false;
}

GRect SceneGraph::computeBoundingBox() const {
    GRect bbox;
    for (const auto& child : m_children) {
        bbox = bbox.united(child->computeBoundingBox());
    }
    return bbox;
}

void SceneGraph::clear() {
    m_children.clear();
}

} // namespace vectma
