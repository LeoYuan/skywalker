#include "engine_wrapper.h"
#include <vector>

EngineWrapper& EngineWrapper::getInstance() {
    static EngineWrapper instance;
    return instance;
}

bool EngineWrapper::startEngine(const std::string& configPath, int tunFd) {
    // TODO: Integrate Mihomo engine
    // 1. Load config from configPath
    // 2. Initialize Mihomo with TUN fd
    // 3. Start proxy routing
    running_ = true;

    if (stateCallback_) {
        stateCallback_("started", "");
    }

    return true;
}

void EngineWrapper::stopEngine() {
    // TODO: Stop Mihomo engine and cleanup
    running_ = false;

    if (stateCallback_) {
        stateCallback_("stopped", "");
    }
}

TrafficStats EngineWrapper::getTrafficStats() {
    // TODO: Get real stats from Mihomo
    TrafficStats stats = {0, 0, 0, 0};
    return stats;
}

bool EngineWrapper::switchProxy(const std::string& groupName, const std::string& proxyName) {
    // TODO: Call Mihomo API to switch proxy in group
    return true;
}

std::vector<ProxyGroupInfo> EngineWrapper::getProxyGroups() {
    // TODO: Get proxy groups from Mihomo
    return {};
}

int EngineWrapper::testProxyLatency(const std::string& proxyName, const std::string& testUrl, int timeout) {
    // TODO: Use Mihomo to test proxy latency
    return -1; // Not implemented
}

void EngineWrapper::setStateCallback(StateCallback callback) {
    stateCallback_ = callback;
}

void EngineWrapper::setProtectCallback(ProtectCallback callback) {
    protectCallback_ = callback;
}
