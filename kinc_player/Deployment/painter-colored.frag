#version 110

varying vec4 fragmentColor;

void main()
{
    gl_FragData[0] = fragmentColor;
}

