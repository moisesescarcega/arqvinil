uniform sampler2D uTexture;
uniform vec3 uMonochromeColor;
varying vec2 vUv;
void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    vec3 finalColor = mix(texColor.rgb, vec3(1.0, 0.0, 0.0), 1.0 - texColor.a);
    gl_FragColor = vec4(finalColor, texColor.a);
}