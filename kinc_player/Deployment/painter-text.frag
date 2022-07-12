#version 110

uniform sampler2D tex;

varying vec4 fragmentColor;
varying vec2 texCoord;

void main()
{
    gl_FragData[0] = vec4(fragmentColor.xyz, texture2D(tex, texCoord).x * fragmentColor.w);
}

