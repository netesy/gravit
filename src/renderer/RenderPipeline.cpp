#include "renderer/RenderPipeline.hpp"
#include <iostream>

namespace vectma {

void BaselineRenderer::beginFrame() {}

void BaselineRenderer::endFrame() {}

void BaselineRenderer::drawRect(const RectNode& node) {
    (void)node;
}

void BaselineRenderer::drawEllipse(const EllipseNode& node) {
    (void)node;
}

void BaselineRenderer::drawPath(const PathNode& node) {
    (void)node;
}

void BaselineRenderer::renderNode(const CanvasNode& node) {
    (void)node;
}

} // namespace vectma
