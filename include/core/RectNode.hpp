#pragma once

#include "core/CanvasNode.hpp"

namespace vectma {

class RectNode : public CanvasNode {
public:
    RectNode(double x, double y, double w, double h);

    std::string getClassName() const override { return "RectNode"; }

    void draw(RenderPipeline& renderer) override;
    bool containsPoint(const GPoint& point) const override;
    GRect computeBoundingBox() const override;

private:
    double m_x, m_y, m_w, m_h;
};

} // namespace vectma
