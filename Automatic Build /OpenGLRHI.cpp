#include "OpenGLRHI.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>

// -------------------------------------------------
// Shader sources (crimson PBR-style)
// -------------------------------------------------
static const char* vertexSrc = R"(
#version 450 core
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;

uniform mat4 uModel;
uniform mat4 uViewProj;
uniform float uPulse;

out vec3 vWorldPos;
out vec3 vNormal;
out vec2 vUV;
out float vPulse;

void main() {
    vec4 world = uModel * vec4(aPos, 1.0);
    vWorldPos = world.xyz;
    vNormal   = mat3(uModel) * aNormal;
    vUV       = aUV;
    vPulse    = uPulse;
    gl_Position = uViewProj * world;
}
)";

static const char* fragmentSrc = R"(
#version 450 core
in vec3 vWorldPos;
in vec3 vNormal;
in vec2 vUV;
in float vPulse;

uniform vec3  uAlbedo;
uniform float uMetallic;
uniform float uRoughness;

out vec4 FragColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vec3(0.4, 1.0, 0.3));
    float diff = max(dot(N, L), 0.0);

    vec3 ambient = uAlbedo * 0.18;
    vec3 diffuse = uAlbedo * diff * 0.82;

    // Crimson energy glow driven by LivesAPI / crimsonPower pulse
    float glow = 0.12 + 0.28 * sin(vPulse * 0.15);
    vec3 energy = vec3(1.0, 0.12, 0.22) * glow * (0.6 + uMetallic);

    vec3 color = ambient + diffuse + energy;
    // simple Reinhard tone-map
    color = color / (color + vec3(1.0));
    FragColor = vec4(color, 1.0);
}
)";

// -------------------------------------------------
// Helpers
// -------------------------------------------------
static GLuint compileShader(GLenum type, const char* src) {
    GLuint s = glCreateShader(type);
    glShaderSource(s, 1, &src, nullptr);
    glCompileShader(s);
    GLint ok = 0;
    glGetShaderiv(s, GL_COMPILE_STATUS, &ok);
    if (!ok) {
        char log[512];
        glGetShaderInfoLog(s, 512, nullptr, log);
        std::cerr << "[OpenGLRHI] Shader compile error:\n" << log << std::endl;
    }
    return s;
}

bool OpenGLRHI::createShaderProgram() {
    GLuint vs = compileShader(GL_VERTEX_SHADER, vertexSrc);
    GLuint fs = compileShader(GL_FRAGMENT_SHADER, fragmentSrc);
    program_ = glCreateProgram();
    glAttachShader(program_, vs);
    glAttachShader(program_, fs);
    glLinkProgram(program_);
    glDeleteShader(vs);
    glDeleteShader(fs);

    GLint ok = 0;
    glGetProgramiv(program_, GL_LINK_STATUS, &ok);
    if (!ok) {
        char log[512];
        glGetProgramInfoLog(program_, 512, nullptr, log);
        std::cerr << "[OpenGLRHI] Program link error:\n" << log << std::endl;
        return false;
    }

    locModel_     = glGetUniformLocation(program_, "uModel");
    locViewProj_  = glGetUniformLocation(program_, "uViewProj");
    locAlbedo_    = glGetUniformLocation(program_, "uAlbedo");
    locMetallic_  = glGetUniformLocation(program_, "uMetallic");
    locRoughness_ = glGetUniformLocation(program_, "uRoughness");
    locPulse_     = glGetUniformLocation(program_, "uPulse");
    return true;
}

void OpenGLRHI::createFallbackCube() {
    // pos + normal + uv
    float verts[] = {
        // front
        -0.5f,-0.5f, 0.5f,  0,0,1,  0,0,
         0.5f,-0.5f, 0.5f,  0,0,1,  1,0,
         0.5f, 0.5f, 0.5f,  0,0,1,  1,1,
        -0.5f, 0.5f, 0.5f,  0,0,1,  0,1,
        // back
        -0.5f,-0.5f,-0.5f,  0,0,-1, 1,0,
         0.5f,-0.5f,-0.5f,  0,0,-1, 0,0,
         0.5f, 0.5f,-0.5f,  0,0,-1, 0,1,
        -0.5f, 0.5f,-0.5f,  0,0,-1, 1,1,
        // left
        -0.5f,-0.5f,-0.5f, -1,0,0,  0,0,
        -0.5f,-0.5f, 0.5f, -1,0,0,  1,0,
        -0.5f, 0.5f, 0.5f, -1,0,0,  1,1,
        -0.5f, 0.5f,-0.5f, -1,0,0,  0,1,
        // right
         0.5f,-0.5f,-0.5f,  1,0,0,  1,0,
         0.5f,-0.5f, 0.5f,  1,0,0,  0,0,
         0.5f, 0.5f, 0.5f,  1,0,0,  0,1,
         0.5f, 0.5f,-0.5f,  1,0,0,  1,1,
        // top
        -0.5f, 0.5f, 0.5f,  0,1,0,  0,0,
         0.5f, 0.5f, 0.5f,  0,1,0,  1,0,
         0.5f, 0.5f,-0.5f,  0,1,0,  1,1,
        -0.5f, 0.5f,-0.5f,  0,1,0,  0,1,
        // bottom
        -0.5f,-0.5f,-0.5f,  0,-1,0, 0,0,
         0.5f,-0.5f,-0.5f,  0,-1,0, 1,0,
         0.5f,-0.5f, 0.5f,  0,-1,0, 1,1,
        -0.5f,-0.5f, 0.5f,  0,-1,0, 0,1,
    };

    uint32_t indices[] = {
         0,1,2, 0,2,3,   4,5,6, 4,6,7,
         8,9,10,8,10,11, 12,13,14,12,14,15,
        16,17,18,16,18,19, 20,21,22,20,22,23
    };
    cubeIndexCount_ = 36;

    glGenVertexArrays(1, &cubeVAO_);
    glGenBuffers(1, &cubeVBO_);
    glGenBuffers(1, &cubeEBO_);

    glBindVertexArray(cubeVAO_);
    glBindBuffer(GL_ARRAY_BUFFER, cubeVBO_);
    glBufferData(GL_ARRAY_BUFFER, sizeof(verts), verts, GL_STATIC_DRAW);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, cubeEBO_);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));

    glBindVertexArray(0);
}

OpenGLRHI::GPUMesh& OpenGLRHI::getOrUploadMesh(const Mesh* mesh) {
    auto it = meshCache_.find(mesh);
    if (it != meshCache_.end()) return it->second;

    GPUMesh gpu;
    glGenVertexArrays(1, &gpu.vao);
    glGenBuffers(1, &gpu.vbo);
    glGenBuffers(1, &gpu.ebo);

    glBindVertexArray(gpu.vao);
    glBindBuffer(GL_ARRAY_BUFFER, gpu.vbo);
    glBufferData(GL_ARRAY_BUFFER,
                 mesh->vertices.size() * sizeof(float),
                 mesh->vertices.data(), GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, gpu.ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER,
                 mesh->indices.size() * sizeof(uint32_t),
                 mesh->indices.data(), GL_STATIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));

    glBindVertexArray(0);
    gpu.indexCount = static_cast<GLsizei>(mesh->indices.size());
    meshCache_[mesh] = gpu;
    return meshCache_[mesh];
}

// -------------------------------------------------
// IRHI implementation
// -------------------------------------------------
bool OpenGLRHI::init(void* nativeWindow, int width, int height) {
    width_ = width;
    height_ = height;

    // If the caller already created a GLFW window, use it.
    // Otherwise create one.
    if (nativeWindow) {
        window_ = static_cast<GLFWwindow*>(nativeWindow);
    } else {
        if (!glfwInit()) return false;
        glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
        glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 5);
        glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
        window_ = glfwCreateWindow(width, height, "Crimson Sovereign – OpenGLRHI", nullptr, nullptr);
        if (!window_) return false;
    }

    glfwMakeContextCurrent(window_);
    glfwSwapInterval(1); // vsync

    // Load GL functions (glad / glew / etc.)
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cerr << "[OpenGLRHI] Failed to load OpenGL\n";
        return false;
    }

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);

    if (!createShaderProgram()) return false;
    createFallbackCube();

    std::cout << "[OpenGLRHI] Initialized " << width << "x" << height
              << " | GL " << glGetString(GL_VERSION) << std::endl;
    return true;
}

void OpenGLRHI::beginFrame() {
    glViewport(0, 0, width_, height_);
    glClearColor(0.02f, 0.01f, 0.03f, 1.0f); // deep crimson night
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glUseProgram(program_);
}

void OpenGLRHI::setUniforms(const Entity& e, const mat4_t& model, const mat4_t& viewProj) {
    glUniformMatrix4fv(locModel_, 1, GL_FALSE, model.m.data());
    glUniformMatrix4fv(locViewProj_, 1, GL_FALSE, viewProj.m.data());
    glUniform3f(locAlbedo_, e.material.albedo.x, e.material.albedo.y, e.material.albedo.z);
    glUniform1f(locMetallic_, e.material.metallic);
    glUniform1f(locRoughness_, e.material.roughness);
    glUniform1f(locPulse_, e.crimsonPower);   // drives the glow from LivesAPI
}

void OpenGLRHI::draw(const Entity& e, const mat4_t& model, const mat4_t& viewProj) {
    setUniforms(e, model, viewProj);

    if (e.mesh && !e.mesh->vertices.empty()) {
        GPUMesh& gpu = getOrUploadMesh(e.mesh);
        glBindVertexArray(gpu.vao);
        glDrawElements(GL_TRIANGLES, gpu.indexCount, GL_UNSIGNED_INT, 0);
    } else {
        // fallback cube
        glBindVertexArray(cubeVAO_);
        glDrawElements(GL_TRIANGLES, cubeIndexCount_, GL_UNSIGNED_INT, 0);
    }
    glBindVertexArray(0);
}

void OpenGLRHI::endFrame() {
    glfwSwapBuffers(window_);
    glfwPollEvents();
}

void OpenGLRHI::shutdown() {
    for (auto& [_, gpu] : meshCache_) {
        glDeleteVertexArrays(1, &gpu.vao);
        glDeleteBuffers(1, &gpu.vbo);
        glDeleteBuffers(1, &gpu.ebo);
    }
    meshCache_.clear();

    if (cubeVAO_) {
        glDeleteVertexArrays(1, &cubeVAO_);
        glDeleteBuffers(1, &cubeVBO_);
        glDeleteBuffers(1, &cubeEBO_);
        cubeVAO_ = 0;
    }
    if (program_) {
        glDeleteProgram(program_);
        program_ = 0;
    }
    // Do NOT destroy the window if it was passed in from outside
}