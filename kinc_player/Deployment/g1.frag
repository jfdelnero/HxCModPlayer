#version 110

uniform sampler2D tex;

varying vec2 texCoord;

void main()
{
    gl_FragData[0] = texture2D(tex, texCoord);
}

