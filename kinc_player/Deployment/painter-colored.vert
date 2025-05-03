#version 110

uniform mat4 projectionMatrix;

attribute vec3 vertexPosition;
varying vec4 fragmentColor;
attribute vec4 vertexColor;

void main()
{
    gl_Position = projectionMatrix * vec4(vertexPosition, 1.0);
    fragmentColor = vertexColor;
}

