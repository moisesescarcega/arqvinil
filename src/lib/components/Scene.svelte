<script lang="ts">
	import { T, useThrelte, useTask } from '@threlte/core';
	import { OrbitControls, Suspense, Text } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { DoubleSide, Color, ShaderMaterial, type WebGLRenderer, TextureLoader, Vector3, Plane, MathUtils, Vector2 } from 'three';

	let { 
		modelColor = 'black', 
		vinilSize = $bindable(), 
		vinilRotation = $bindable(),
		vinilX = $bindable(),
		vinilY = $bindable()
	} = $props();
	let vinilRotate = $derived(MathUtils.degToRad(vinilRotation));
	let currentColor = $state(modelColor); // Estado reactivo local

	let planosCorte = $state([
		new Plane(new Vector3(0, -1, 0), 0.5),
		new Plane(new Vector3(0, 1, 0), 0.5),
		new Plane(new Vector3(1, 0, 0), 0.5),
		new Plane(new Vector3(-1, 0, 0), 0.5)
	]);

	let time = 0;
	let shaderMaterial: ShaderMaterial | undefined = $state();

	onMount(() => {
		const { renderer } = useThrelte() as { renderer: WebGLRenderer };
		renderer.localClippingEnabled = true;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	useTask((delta: number) => {
		time += delta;
		if (shaderMaterial) {
			(shaderMaterial as ShaderMaterial).uniforms.uTime.value = time;
		};
	});

	$effect(() => {
		currentColor = modelColor; // Sincroniza cuando cambia la prop
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
	<T.Group rotation={[0, 0, vinilRotate]}>
		<T.Mesh position.z={0.005} position.x={vinilX} position.y={vinilY} scale={vinilSize}>
			<T.PlaneGeometry args={[2, 2]} />
			<T.MeshStandardMaterial 
				transparent 
				map={
					(() => { 
						const texture = new TextureLoader().load('manantiales_1.png'); 
						texture.center = new Vector2(0.5,0.5);
						return texture; 
					})()
				}
				clippingPlanes={planosCorte}
				emissive={new Color(currentColor)}
				emissiveIntensity={0.2}
				roughness={0.1} 
			/>
		</T.Mesh>
	</T.Group>
	<!-- <T.Mesh>
		<T.BoxGeometry args={[2,2,2]} />
		<T.MeshStandardMaterial side={DoubleSide} color={'red'} clippingPlanes={planosCorte} />
	</T.Mesh> -->
</Suspense>
