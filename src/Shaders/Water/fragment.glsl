uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying float vElevation;

void main()
{
    float mixcolor = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix( uDepthColor, uSurfaceColor,mixcolor);
    gl_FragColor = vec4(color, 1.0);
}