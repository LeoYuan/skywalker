#ifndef ENGINE_WRAPPER_H
#define ENGINE_WRAPPER_H

#include <string>
#include <functional>

// Callback types
using StateCallback = std::function<void(const std::string& state, const std::string& error)>;
using ProtectCallback = std::function<void(int fd)>;

// Traffic statistics
struct TrafficStats {
    int64_t uploadTotal;
    int64_t downloadTotal;
    int64_t uploadSpeed;
    int64_t downloadSpeed;
};

// Proxy group info
struct ProxyGroupInfo {
    std::string name;
    std::string type;
    std::string now;
    std::vector<std::string> proxies;
};

/**
 * Engine wrapper - placeholder for Mihomo integration.
 * All functions are stubs that return success values.
 */
class EngineWrapper {
public:
    static EngineWrapper& getInstance();

    bool startEngine(const std::string& configPath, int tunFd);
    void stopEngine();

    TrafficStats getTrafficStats();
    bool switchProxy(const std::string& groupName, const std::string& proxyName);
    std::vector<ProxyGroupInfo> getProxyGroups();
    int testProxyLatency(const std::string& proxyName, const std::string& testUrl, int timeout);

    void setStateCallback(StateCallback callback);
    void setProtectCallback(ProtectCallback callback);

private:
    EngineWrapper() = default;
    ~EngineWrapper() = default;

    bool running_ = false;
    StateCallback stateCallback_;
    ProtectCallback protectCallback_;
};

#endif // ENGINE_WRAPPER_H
