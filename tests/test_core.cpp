#include "core/CanvasNode.hpp"
#include "core/SceneGraph.hpp"
#include "core/WorkspaceStage.hpp"
#include "core/RectNode.hpp"
#include "core/EllipseNode.hpp"
#include "core/PathNode.hpp"
#include "core/GPoint.hpp"
#include "core/GRect.hpp"
#include "core/GColor.hpp"
#include "core/GTransform.hpp"
#include "renderer/RenderPipeline.hpp"
#include <cassert>
#include <iostream>
#include <memory>
#include <vector>

class MockNode : public vectma::CanvasNode {
public:
    std::string id;
    MockNode(std::string name) : id(name) {}
    std::string getClassName() const override { return "MockNode"; }
    void render(vectma::RenderPipeline& p) const override { p.renderNode(*this); }
    bool containsPoint(const vectma::GPoint&) const override { return false; }
    vectma::GRect computeBoundingBox() const override { return vectma::GRect(0, 0, 0, 0); }
};

class MockRenderPipeline : public vectma::RenderPipeline {
public:
    std::vector<std::string> callOrder;
    int rectCount = 0;
    int ellipseCount = 0;
    int pathCount = 0;

    void beginFrame() override {}
    void endFrame() override {}

    void drawRect(const vectma::RectNode& node) override {
        (void)node;
        rectCount++;
        callOrder.push_back("rect");
    }

    void drawEllipse(const vectma::EllipseNode& node) override {
        (void)node;
        ellipseCount++;
        callOrder.push_back("ellipse");
    }

    void drawPath(const vectma::PathNode& node) override {
        (void)node;
        pathCount++;
        callOrder.push_back("path");
    }

    void renderNode(const vectma::CanvasNode& node) override {
        if (node.getClassName() == "MockNode") {
            callOrder.push_back(static_cast<const MockNode&>(node).id);
        }
    }
};

void testRenderingOrder() {
    std::cout << "Testing Rendering Order..." << std::endl;
    auto scene = std::make_unique<vectma::SceneGraph>();
    scene->addChild(std::make_unique<MockNode>("bottom"));
    scene->addChild(std::make_unique<MockNode>("middle"));
    scene->addChild(std::make_unique<MockNode>("top"));

    MockRenderPipeline pipeline;
    scene->render(pipeline);

    assert(pipeline.callOrder.size() == 3);
    assert(pipeline.callOrder[0] == "bottom");
    assert(pipeline.callOrder[1] == "middle");
    assert(pipeline.callOrder[2] == "top");

    std::cout << "Rendering order tests passed." << std::endl;
}

void testVisibilityRendering() {
    std::cout << "Testing Visibility Rendering..." << std::endl;
    auto scene = std::make_unique<vectma::SceneGraph>();
    auto node1 = std::make_unique<MockNode>("visible");
    auto node2 = std::make_unique<MockNode>("hidden");
    node2->setVisibility(false);

    scene->addChild(std::move(node1));
    scene->addChild(std::move(node2));

    MockRenderPipeline pipeline;
    scene->render(pipeline);

    assert(pipeline.callOrder.size() == 1);
    assert(pipeline.callOrder[0] == "visible");

    std::cout << "Visibility rendering tests passed." << std::endl;
}

void testDoubleDispatch() {
    std::cout << "Testing Double Dispatch..." << std::endl;
    auto scene = std::make_unique<vectma::SceneGraph>();
    scene->addChild(std::make_unique<vectma::RectNode>(0,0,10,10));
    scene->addChild(std::make_unique<vectma::EllipseNode>(0,0,10,10));
    scene->addChild(std::make_unique<vectma::PathNode>("M 0 0"));

    MockRenderPipeline pipeline;
    scene->render(pipeline);

    assert(pipeline.rectCount == 1);
    assert(pipeline.ellipseCount == 1);
    assert(pipeline.pathCount == 1);
    assert(pipeline.callOrder[0] == "rect");
    assert(pipeline.callOrder[1] == "ellipse");
    assert(pipeline.callOrder[2] == "path");

    std::cout << "Double dispatch tests passed." << std::endl;
}

int main() {
    testRenderingOrder();
    testVisibilityRendering();
    testDoubleDispatch();
    std::cout << "All core tests passed!" << std::endl;
    return 0;
}
