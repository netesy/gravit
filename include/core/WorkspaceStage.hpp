#pragma once

#include "core/SceneGraph.hpp"
#include <memory>
#include <vector>

namespace vectma {

/**
 * @brief State coordinator for active tools and selections.
 * Replaces the legacy GEditor.
 */
class WorkspaceStage {
public:
    WorkspaceStage();
    ~WorkspaceStage();

    void setScene(std::shared_ptr<SceneGraph> scene);
    std::shared_ptr<SceneGraph> getScene() const;

    void addToSelection(CanvasNode* node);
    void clearSelection();
    const std::vector<CanvasNode*>& getSelection() const;

private:
    std::shared_ptr<SceneGraph> m_scene;
    std::vector<CanvasNode*> m_selection;
};

} // namespace vectma
