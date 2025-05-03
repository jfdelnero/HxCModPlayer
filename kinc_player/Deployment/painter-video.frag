#version 110

uniform sampler2D tex;

varying vec2 texCoord;
varying vec4 color;

void main()
{
    vec4 texcolor = texture2D(tex, texCoord) * color;
    vec3 _32 = texcolor.xyz * color.w;
    texcolor = vec4(_32.x, _32.y, _32.z, texcolor.w);
    gl_FragData[0] = texcolor;
}

