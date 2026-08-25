#pragma once
#include "MathTypes.hpp"
#include <string>
#include <vector>

enum class EntityType {
    Sovereign, BloodKnight, CrimsonWraith, ThroneRelic, GateOfSovereign
};

struct Mesh {
    std::vector<float> vertices;   // pos3 + normal3 + uv2
    std::vector<uint32_t> indices;
};

struct Material {
    vec3_t albedo{0.85f, 0.08f, 0.15f};
    float metallic = 0.4f;
    float roughness = 0.45f;
};

struct Entity {
    EntityType type = EntityType::CrimsonWraith;
    std::string name;
    vec3_t position{0,0,0};
    vec3_t rotation{0,0,0};
    vec3_t scale{1,1,1};
    Mesh* mesh = nullptr;
    Material material;
    float health = 100.f;
    float crimsonPower = 0.f;
};