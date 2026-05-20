#pragma once

#include "core/CanvasNode.hpp"

namespace vectma {

class EllipseNode : public CanvasNode {
public:
    EllipseNode(double cx, double cy, double rx, double ry);

    std::string getClassName() const override { return "EllipseNode"; }

    void draw(RenderPipeline& renderer) override;
    bool containsPoint(const GPoint& point) const override;
    GRect computeBoundingBox() const override;

private:
    double m_cx, m_cy, m_rx, m_ry;
};

} // namespace vectma
