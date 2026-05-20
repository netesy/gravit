#include "core/WorkspaceStage.hpp"
#include "core/SceneGraph.hpp"
#include "renderer/RenderPipeline.hpp"
#include <iostream>
#include <memory>
#include <chrono>
#include <thread>

int main() {
    std::cout << "Starting Vectma..." << std::endl;

    // Initialize core components
    auto workspace = std::make_unique<vectma::WorkspaceStage>();
    auto scene = std::make_shared<vectma::SceneGraph>();
    workspace->setScene(scene);

    auto renderer = std::make_unique<vectma::BaselineRenderer>();

    std::cout << "Vectma initialized. Entering main loop..." << std::endl;

    // Simple desktop frame processing loop (simulation)
    bool running = true;
    int frames = 0;
    while (running && frames < 5) {
        renderer->beginFrame();

        // Render scene
        if (workspace->getScene()) {
            renderer->renderNode(*workspace->getScene());
        }

        renderer->endFrame();

        std::cout << "Frame " << ++frames << " rendered." << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(16)); // ~60 FPS
    }

    std::cout << "Vectma shutting down." << std::endl;
    return 0;
}
