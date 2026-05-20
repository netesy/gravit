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
    std::string id;
    MockNode(std::string name) : id(name) {}
    std::string getClassName() const override { return "MockNode"; }
    void draw(vectma::RenderPipeline&) override {}
    bool containsPoint(const vectma::GPoint&) const override { return false; }
    vectma::GRect computeBoundingBox() const override { return vectma::GRect(0, 0, 0, 0); }
};

void testCanvasNode() {
    std::cout << "Testing CanvasNode..." << std::endl;
    auto parent = std::make_unique<MockNode>("parent");
    auto child = std::make_unique<MockNode>("child");

    vectma::CanvasNode* childPtr = child.get();
    parent->addChild(std::move(child));

    assert(childPtr->getParent() == parent.get());
    assert(parent->getChildren().size() == 1);
    assert(parent->getChildren()[0].get() == childPtr);
    std::cout << "CanvasNode tests passed." << std::endl;
}

void testSceneGraphZOrder() {
    std::cout << "Testing SceneGraph Z-Order..." << std::endl;
    auto scene = std::make_unique<vectma::SceneGraph>();

    scene->addChild(std::make_unique<MockNode>("0"));
    scene->addChild(std::make_unique<MockNode>("1"));
    scene->addChild(std::make_unique<MockNode>("2"));

    assert(static_cast<MockNode*>(scene->getChildren()[0].get())->id == "0");

    scene->bringToFront(0);
    assert(static_cast<MockNode*>(scene->getChildren()[2].get())->id == "0");

    scene->sendToBack(2);
    assert(static_cast<MockNode*>(scene->getChildren()[0].get())->id == "0");

    scene->moveUp(0);
    assert(static_cast<MockNode*>(scene->getChildren()[1].get())->id == "0");

    scene->moveDown(1);
    assert(static_cast<MockNode*>(scene->getChildren()[0].get())->id == "0");

    std::cout << "SceneGraph Z-Order tests passed." << std::endl;
}

void testSceneGraphGrouping() {
    std::cout << "Testing SceneGraph Grouping..." << std::endl;
    auto scene = std::make_unique<vectma::SceneGraph>();

    scene->addChild(std::make_unique<MockNode>("0"));
    scene->addChild(std::make_unique<MockNode>("1"));
    scene->addChild(std::make_unique<MockNode>("2"));
    scene->addChild(std::make_unique<MockNode>("3"));

    // Group nodes 1 and 2
    scene->groupNodes({1, 2});

    assert(scene->getChildren().size() == 3);
    assert(scene->getChildren()[1]->getClassName() == "SceneGraph");

    auto* group = static_cast<vectma::SceneGraph*>(scene->getChildren()[1].get());
    assert(group->getChildren().size() == 2);
    assert(static_cast<MockNode*>(group->getChildren()[0].get())->id == "1");
    assert(static_cast<MockNode*>(group->getChildren()[1].get())->id == "2");

    // Ungroup
    scene->ungroupNode(1);
    assert(scene->getChildren().size() == 4);
    assert(static_cast<MockNode*>(scene->getChildren()[1].get())->id == "1");
    assert(static_cast<MockNode*>(scene->getChildren()[2].get())->id == "2");

    std::cout << "SceneGraph Grouping tests passed." << std::endl;
}

void testMathPrimitives() {
    std::cout << "Testing Math Primitives..." << std::endl;
    vectma::GPoint p(10, 20);
    assert(p.x == 10);
    vectma::GRect r1(0, 0, 100, 100);
    assert(r1.contains(50, 50));
    std::cout << "Math primitives tests passed." << std::endl;
}

int main() {
    testCanvasNode();
    testSceneGraphZOrder();
    testSceneGraphGrouping();
    testMathPrimitives();
    std::cout << "All core tests passed!" << std::endl;
    return 0;
}
