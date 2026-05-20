#include "core/WorkspaceStage.hpp"

namespace vectma {

WorkspaceStage::WorkspaceStage() = default;

WorkspaceStage::~WorkspaceStage() = default;

void WorkspaceStage::setScene(std::shared_ptr<SceneGraph> scene) {
    m_scene = std::move(scene);
}

std::shared_ptr<SceneGraph> WorkspaceStage::getScene() const {
    return m_scene;
}

void WorkspaceStage::addToSelection(CanvasNode* node) {
    m_selection.push_back(node);
}

void WorkspaceStage::clearSelection() {
    m_selection.clear();
}

const std::vector<CanvasNode*>& WorkspaceStage::getSelection() const {
    return m_selection;
}

} // namespace vectma
