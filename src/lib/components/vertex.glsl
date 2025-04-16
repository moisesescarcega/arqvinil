varying vec2 vUv;
uniform vec2 uOffset;
uniform float uZoom;
void main() {
    vec2 scaledUv = uv * uZoom + (1.0 - uZoom) * 0.5;
    vUv = scaledUv + uOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}