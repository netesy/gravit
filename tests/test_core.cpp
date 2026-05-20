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
#include <cassert>
#include <iostream>
#include <memory>

class MockNode : public vectma::CanvasNode {
public:
    std::string getClassName() const override { return "MockNode"; }
    void draw(vectma::RenderPipeline&) override {}
    bool containsPoint(const vectma::GPoint&) const override { return false; }
    vectma::GRect computeBoundingBox() const override { return vectma::GRect(0, 0, 0, 0); }
};

void testCanvasNode() {
    std::cout << "Testing CanvasNode..." << std::endl;
    auto parent = std::make_unique<MockNode>();
    auto child = std::make_unique<MockNode>();

    vectma::CanvasNode* childPtr = child.get();
    parent->addChild(std::move(child));

    assert(childPtr->getParent() == parent.get());
    assert(parent->getChildren().size() == 1);
    assert(parent->getChildren()[0].get() == childPtr);
    std::cout << "CanvasNode tests passed." << std::endl;
}

void testSceneGraph() {
    std::cout << "Testing SceneGraph..." << std::endl;
    auto scene = std::make_unique<vectma::SceneGraph>();
    assert(scene->getClassName() == "SceneGraph");

    scene->addChild(std::make_unique<MockNode>());
    assert(scene->getChildren().size() == 1);

    scene->clear();
    assert(scene->getChildren().size() == 0);
    std::cout << "SceneGraph tests passed." << std::endl;
}

void testWorkspaceStage() {
    std::cout << "Testing WorkspaceStage..." << std::endl;
    auto workspace = std::make_unique<vectma::WorkspaceStage>();
    auto scene = std::make_shared<vectma::SceneGraph>();

    workspace->setScene(scene);
    assert(workspace->getScene() == scene);

    auto node = std::make_unique<MockNode>();
    workspace->addToSelection(node.get());
    assert(workspace->getSelection().size() == 1);
    assert(workspace->getSelection()[0] == node.get());

    workspace->clearSelection();
    assert(workspace->getSelection().size() == 0);
    std::cout << "WorkspaceStage tests passed." << std::endl;
}

void testMathPrimitives() {
    std::cout << "Testing Math Primitives..." << std::endl;

    // GPoint
    vectma::GPoint p(10, 20);
    assert(p.x == 10);
    assert(p.y == 20);

    // GRect
    vectma::GRect r1(0, 0, 100, 100);
    assert(r1.contains(50, 50));
    assert(!r1.contains(150, 50));

    vectma::GRect r2(50, 50, 100, 100);
    vectma::GRect r3 = r1.united(r2);
    assert(r3.x == 0);
    assert(r3.y == 0);
    assert(r3.width == 150);
    assert(r3.height == 150);

    // GColor
    vectma::GColor c(255, 0, 0, 128);
    assert(c.r == 255);
    assert(c.a == 128);

    // GTransform
    vectma::GTransform t = vectma::GTransform::Translation(10, 20);
    assert(t.e == 10);
    assert(t.f == 20);

    std::cout << "Math primitives tests passed." << std::endl;
}

void testShapeNodes() {
    std::cout << "Testing Shape Nodes..." << std::endl;

    // RectNode
    auto rect = std::make_unique<vectma::RectNode>(10, 10, 50, 50);
    assert(rect->containsPoint({30, 30}));
    assert(!rect->containsPoint({0, 0}));
    auto rBox = rect->computeBoundingBox();
    assert(rBox.x == 10 && rBox.width == 50);

    // EllipseNode
    auto ellipse = std::make_unique<vectma::EllipseNode>(100, 100, 50, 50);
    assert(ellipse->containsPoint({120, 120}));
    assert(!ellipse->containsPoint({200, 200}));
    auto eBox = ellipse->computeBoundingBox();
    assert(eBox.x == 50 && eBox.width == 100);

    // PathNode
    auto path = std::make_unique<vectma::PathNode>("M 0 0 L 100 100");
    assert(path->getClassName() == "PathNode");

    std::cout << "Shape nodes tests passed." << std::endl;
}

int main() {
    testCanvasNode();
    testSceneGraph();
    testWorkspaceStage();
    testMathPrimitives();
    testShapeNodes();
    std::cout << "All core tests passed!" << std::endl;
    return 0;
}
