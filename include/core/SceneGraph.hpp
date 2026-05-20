#pragma once

#include "core/CanvasNode.hpp"
#include <memory>

namespace vectma {

/**
 * @brief Composite structural layer tree.
 * Replaces the legacy GScene.
 */
class SceneGraph : public CanvasNode {
public:
    SceneGraph();
    virtual ~SceneGraph();

    std::string getClassName() const override { return "SceneGraph"; }

    // Root-level management
    void clear();

private:
    // Root node is the SceneGraph itself
};

} // namespace vectma
