#include <napi/native_api.h>
#include <string>
#include "engine_wrapper.h"

// Helper: extract string from napi_value
static std::string GetString(napi_env env, napi_value value) {
    size_t len = 0;
    napi_get_value_string_utf8(env, value, nullptr, 0, &len);
    std::string result(len, '\0');
    napi_get_value_string_utf8(env, value, &result[0], len + 1, &len);
    return result;
}

static napi_value StartEngine(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    std::string configPath = GetString(env, args[0]);

    int32_t tunFd = 0;
    napi_get_value_int32(env, args[1], &tunFd);

    bool result = EngineWrapper::getInstance().startEngine(configPath, tunFd);

    napi_value ret;
    napi_get_boolean(env, result, &ret);
    return ret;
}

static napi_value StopEngine(napi_env env, napi_callback_info info) {
    EngineWrapper::getInstance().stopEngine();

    napi_value undefined;
    napi_get_undefined(env, &undefined);
    return undefined;
}

static napi_value GetTrafficStats(napi_env env, napi_callback_info info) {
    TrafficStats stats = EngineWrapper::getInstance().getTrafficStats();

    napi_value result;
    napi_create_object(env, &result);

    napi_value val;
    napi_create_int64(env, stats.uploadTotal, &val);
    napi_set_named_property(env, result, "uploadTotal", val);

    napi_create_int64(env, stats.downloadTotal, &val);
    napi_set_named_property(env, result, "downloadTotal", val);

    napi_create_int64(env, stats.uploadSpeed, &val);
    napi_set_named_property(env, result, "uploadSpeed", val);

    napi_create_int64(env, stats.downloadSpeed, &val);
    napi_set_named_property(env, result, "downloadSpeed", val);

    return result;
}

static napi_value SwitchProxy(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    std::string groupName = GetString(env, args[0]);
    std::string proxyName = GetString(env, args[1]);

    bool result = EngineWrapper::getInstance().switchProxy(groupName, proxyName);

    napi_value ret;
    napi_get_boolean(env, result, &ret);
    return ret;
}

static napi_value GetProxyGroups(napi_env env, napi_callback_info info) {
    auto groups = EngineWrapper::getInstance().getProxyGroups();

    napi_value result;
    napi_create_array_with_length(env, groups.size(), &result);

    for (size_t i = 0; i < groups.size(); i++) {
        napi_value group;
        napi_create_object(env, &group);

        napi_value val;
        napi_create_string_utf8(env, groups[i].name.c_str(), groups[i].name.length(), &val);
        napi_set_named_property(env, group, "name", val);

        napi_create_string_utf8(env, groups[i].type.c_str(), groups[i].type.length(), &val);
        napi_set_named_property(env, group, "type", val);

        napi_create_string_utf8(env, groups[i].now.c_str(), groups[i].now.length(), &val);
        napi_set_named_property(env, group, "now", val);

        napi_value proxies;
        napi_create_array_with_length(env, groups[i].proxies.size(), &proxies);
        for (size_t j = 0; j < groups[i].proxies.size(); j++) {
            napi_value pval;
            napi_create_string_utf8(env, groups[i].proxies[j].c_str(), groups[i].proxies[j].length(), &pval);
            napi_set_element(env, proxies, j, pval);
        }
        napi_set_named_property(env, group, "proxies", proxies);

        napi_set_element(env, result, i, group);
    }

    return result;
}

static napi_value TestProxyLatency(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    std::string proxyName = GetString(env, args[0]);
    std::string testUrl = GetString(env, args[1]);

    int32_t timeout = 0;
    napi_get_value_int32(env, args[2], &timeout);

    int latency = EngineWrapper::getInstance().testProxyLatency(proxyName, testUrl, timeout);

    napi_value ret;
    napi_create_int32(env, latency, &ret);
    return ret;
}

// Store persistent reference for state callback
static napi_ref stateCallbackRef = nullptr;

static napi_value RegisterStateCallback(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    if (stateCallbackRef) {
        napi_delete_reference(env, stateCallbackRef);
    }
    napi_create_reference(env, args[0], 1, &stateCallbackRef);

    // TODO: Wire callback to EngineWrapper state changes

    napi_value undefined;
    napi_get_undefined(env, &undefined);
    return undefined;
}

static napi_ref protectCallbackRef = nullptr;

static napi_value RegisterProtectCallback(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    if (protectCallbackRef) {
        napi_delete_reference(env, protectCallbackRef);
    }
    napi_create_reference(env, args[0], 1, &protectCallbackRef);

    // TODO: Wire callback so engine can request socket protection

    napi_value undefined;
    napi_get_undefined(env, &undefined);
    return undefined;
}

// NAPI module registration
static napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor desc[] = {
        {"StartEngine", nullptr, StartEngine, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"StopEngine", nullptr, StopEngine, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"GetTrafficStats", nullptr, GetTrafficStats, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"SwitchProxy", nullptr, SwitchProxy, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"GetProxyGroups", nullptr, GetProxyGroups, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"TestProxyLatency", nullptr, TestProxyLatency, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"RegisterStateCallback", nullptr, RegisterStateCallback, nullptr, nullptr, nullptr, napi_default, nullptr},
        {"RegisterProtectCallback", nullptr, RegisterProtectCallback, nullptr, nullptr, nullptr, napi_default, nullptr},
    };

    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
    return exports;
}

EXTERN_C_START
static napi_module proxyEngineModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "proxy_engine",
    .nm_priv = nullptr,
    .reserved = {0},
};

__attribute__((constructor)) void RegisterProxyEngineModule(void) {
    napi_module_register(&proxyEngineModule);
}
EXTERN_C_END
