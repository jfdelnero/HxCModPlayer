#version 110

uniform mat4 projectionMatrix;

attribute vec3 vertexPosition;
varying vec2 texCoord;
attribute vec2 vertexUV;
varying vec4 color;
attribute vec4 vertexColor;

void main()
{
    gl_Position = projectionMatrix * vec4(vertexPosition, 1.0);
    texCoord = vertexUV;
    color = vertexColor;
}

