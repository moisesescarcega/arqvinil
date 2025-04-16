<script lang="ts">
	import { T, useThrelte, useTask } from '@threlte/core';
	import { CubeEnvironment, ImageMaterial, OrbitControls, Suspense, Text } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { DoubleSide, Color, ShaderMaterial, type WebGLRenderer, TextureLoader } from 'three';
	// import imageVertexShader from './vertex.glsl?raw';
	// import imageFragmentShader from './fragment.glsl?raw';
	let { modelColor = 'black', vinilSize = $bindable() } = $props();
	let currentColor = $state(modelColor); // Estado reactivo local

	$effect(() => {
		// console.log('Color actualizado en Scene:', modelColor);
    // if (imageShaderMaterial) {
    //     imageShaderMaterial.uniforms.uZoom.value = vinilSize;
    //     imageShaderMaterial.needsUpdate = true; // Forzar recompilación
    //     // console.log('uZoom updated:', imageShaderMaterial.uniforms.uZoom.value); // Depuración
    // };
		if (imageShaderMaterial) {
            imageShaderMaterial.uniforms.uZoom.value = vinilSize;
            imageShaderMaterial.needsUpdate = true;
        };
		currentColor = modelColor; // Sincroniza cuando cambia la prop
	});

	let time = 0;
	let shaderMaterial: ShaderMaterial | undefined = $state();
  let imageShaderMaterial: ShaderMaterial | undefined = $state();

	onMount(() => {
		const { renderer } = useThrelte() as { renderer: WebGLRenderer };
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	useTask((delta: number) => {
		time += delta;
		if (shaderMaterial) {
			(shaderMaterial as ShaderMaterial).uniforms.uTime.value = time;
		};
    if (imageShaderMaterial) {
        imageShaderMaterial.uniforms.uZoom.value = vinilSize; // Actualiza uZoom
    };
	});
</script>

<Suspense>
	{#snippet fallback()}
		<Text
			position.z={-2}
			text="Loading..."
			fontSize={2}
			color="black"
			anchorX="50%"
			anchorY="50%"
			oncreate={(ref) => {
				ref.lookAt(-40, 25, 40);
			}}
		/>
	{/snippet}

	<T.PerspectiveCamera makeDefault position={[-2.5, 0, 2.5]} fov={50}>
		<OrbitControls
			autoRotate={false}
			enableZoom={true}
			enableDamping
			autoRotateSpeed={0.5}
			target.y={-0.2}
		/>
	</T.PerspectiveCamera>
	<T.AmbientLight position={[0.5, 2.0, 2.0]} intensity={Math.PI / 8} />
	<T.DirectionalLight
		position={[2.5, 2.0, 2.0]}
		intensity={Math.PI / 2}
		color={new Color(0xffffff)}
	/>
	<T.Mesh>
		<T.SphereGeometry args={[20, 32, 32]} />
		<T.ShaderMaterial
			bind:ref={shaderMaterial}
			uniforms={{
				uTime: { value: 0 }
			}}
			vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
			fragmentShader={`
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec3 colorAzul = vec3(0.0, 0.35, 0.66);
          vec3 colorAmarillo = vec3(1.0, 0.95, 0.5);
          float oscillation = 0.5 + 0.5 * sin(uTime * 0.2);
          float pattern = 0.5 + 0.5 * sin(vUv.x * 10.0 + uTime * 0.3) * sin(vUv.y * 10.0 + uTime * 0.2);
          vec3 color = mix(colorAzul, colorAmarillo, oscillation * pattern);
          color += vec3(0.1) * pow(pattern, 2.0);
          gl_FragColor = vec4(color, 1.0);
        }
      `}
			side={DoubleSide}
		/>
	</T.Mesh>
	<T.Mesh>
		<T.PlaneGeometry args={[2, 2]} />
		<T.MeshPhysicalMaterial color="gray" roughness={0.35} side={DoubleSide} />
	</T.Mesh>
	<T.Mesh>
		<T.PlaneGeometry args={[2, 2]} />
		<T.ShaderMaterial
      bind:ref={imageShaderMaterial}
      uniforms={{
          uTexture: { value: new TextureLoader().load('manantiales_1.png') },
          uOffset: { value: [0.1, 0.1] },
          uZoom: { value: vinilSize },
        //   uMonochromeColor: { value: new Color('red') }
      }}
      vertexShader={`
varying vec2 vUv;
uniform vec2 uOffset;
void main() {
    vec2 scaledUv = uv * ${vinilSize} + (1.0 - ${vinilSize}) * 0.5;
    vUv = scaledUv + uOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`}
      fragmentShader={`
uniform sampler2D uTexture;
varying vec2 vUv;
void main() {
    vec4 texColor = texture2D(uTexture, vUv);
	float luminance = 0.299 * texColor.r + 0.587 * texColor.g + 0.114 * texColor.b;
	vec3 monoColor = vec3(1.0, 0.0, 0.0) * luminance;
    gl_FragColor = vec4(monoColor, texColor.a);
}
	  `}
      side={DoubleSide}
      transparent={true}
    />
	</T.Mesh>
</Suspense>
