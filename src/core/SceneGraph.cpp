#include "core/SceneGraph.hpp"

namespace vectma {

SceneGraph::SceneGraph() = default;

SceneGraph::~SceneGraph() = default;

void SceneGraph::clear() {
    m_children.clear();
}

} // namespace vectma
