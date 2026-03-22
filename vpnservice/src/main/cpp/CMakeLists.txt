cmake_minimum_required(VERSION 3.16)
project(proxy_engine)

set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})

add_library(proxy_engine SHARED
    src/napi_proxy_engine.cpp
    src/engine_wrapper.cpp
)

target_link_libraries(proxy_engine PUBLIC
    libace_napi.z.so
    libhilog_ndk.z.so
    # Uncomment when Mihomo .so is available:
    # ${CMAKE_CURRENT_SOURCE_DIR}/third_party/mihomo/libmihomo.so
)

target_include_directories(proxy_engine PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/mihomo/include
)
