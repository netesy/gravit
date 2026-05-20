#include "core/CanvasNode.hpp"
#include "core/SceneGraph.hpp"
#include "core/WorkspaceStage.hpp"
#include <cassert>
#include <iostream>
#include <memory>

class MockNode : public vectma::CanvasNode {
public:
    std::string getClassName() const override { return "MockNode"; }
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

int main() {
    testCanvasNode();
    testSceneGraph();
    testWorkspaceStage();
    std::cout << "All core tests passed!" << std::endl;
    return 0;
}
