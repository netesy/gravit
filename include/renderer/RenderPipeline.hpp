#pragma once

#include <string>

namespace vectma {

class CanvasNode;

/**
 * @brief Graphics hardware abstraction interface.
 * Replaces the legacy GPaintCanvas.
 */
class RenderPipeline {
public:
    virtual ~RenderPipeline() = default;

    virtual void beginFrame() = 0;
    virtual void endFrame() = 0;

    virtual void renderNode(const CanvasNode& node) = 0;

    // Abstracted drawing primitives
    virtual void drawPath(const std::string& pathData) = 0;
};

/**
 * @brief Software/Null implementation of RenderPipeline for baseline.
 */
class BaselineRenderer : public RenderPipeline {
public:
    void beginFrame() override;
    void endFrame() override;
    void renderNode(const CanvasNode& node) override;
    void drawPath(const std::string& pathData) override;
};

} // namespace vectma
