<script lang="ts">
	import { Button, Label, P, Range, Select, TabItem, Tabs, Toggle } from "flowbite-svelte";
    import { viniles, kitsColores } from "./variantes";
	import { onMount } from "svelte";
    import { cartItems } from "$lib/cartStore";
    let { 
        vinilImage = $bindable(),
        modelColor = $bindable(),
        vinilSize = $bindable(),
        vinilRotation = $bindable(),
        vinilX = $bindable(),
        vinilY = $bindable(),
        vinilMove = $bindable(),
        setViewOrder = () => {},
        preOrder = $bindable({
			scale: "",
			kits: 0,
			figures: {
				standing_man: 0,
				standing_woman: 0,
				sitting: 0,
				walking: 0,
				kit: undefined
			},
			figuresPerKit: 0,
			totalFigures: 0,
			totalAmount: 0,
			costPerFigure: 0
		})
    }: { 
        vinilImage: number,
        modelColor: string,
        vinilSize: number,
        vinilRotation: number,
        vinilX: number,
        vinilY: number,
        vinilMove: boolean,
        setViewOrder: (value: boolean) => void,
        preOrder: {
            scale: string;
            kits: number;
            figures: {
                standing_man: number;
                standing_woman: number;
                sitting: number;
                walking: number;
                kit?: undefined;
            } | {
                kit: string;
                standing_man?: undefined;
                standing_woman?: undefined;
                sitting?: undefined;
                walking?: undefined;
            };
            figuresPerKit: number;
            totalFigures: number;
            totalAmount: number;
            costPerFigure: number;
        }
    } = $props();
    let toggleKits = $state(true); // por default habilitada personalizacion, se puede cambiar a kits predefinidos
    let cantidad = $state(1); // cantidad de kits
    let selectedScale = $state(''); // sin escala seleccionada por default
    let selectedKit = $state(""); // sin kit seleccionado por default 
    let qitems = $state(0); // cantidad de figuras por kit
    let totalFigures = $state(0); // total de figuras
    let subtotalFigures = $state(0); // subtotal de figuras
    let selectedColor = $derived(modelColor);
    let enabledOrder = $state(false); // el botón de agregar se habilita si se cumplen los criterios
    let costoPorFigura = $state(0); // costo por figura depende de la escala seleccionada, 0 por default

    const handleColorChange = () => {
        modelColor = selectedColor;
    }
    // Calcula el total de figuras
    let calculateFigurines = () => {
        let sum: number;
        if (toggleKits) {
            sum = [1, 2, 3, 4].reduce((acc, num) => {
                const input = document.querySelector(`#ntipo-${num}`) as HTMLInputElement;
                return acc + (input ? parseInt(input.value) || 0 : 0);
            }, 0);
        } else { sum = qitems};
        subtotalFigures = sum;
        totalFigures = sum * cantidad;
        subtotalFigures >= qitems && qitems !== 0 ? enabledOrder = true : enabledOrder = false;
    };

    let setVinilImage = (n: number) => {vinilImage = n;}

    // Establece las clases de las imagenes al cargar
    let classTypeOnLoad = (num: number) => {
        (document.querySelector(`#ntipo-${num}`) as HTMLSelectElement)?.value !== '0' 
        ? document.querySelector(`#tipo-${num}`)?.classList.add("h-16", "m-2") 
        : document.querySelector(`#tipo-${num}`)?.classList.add("h-16", "m-2", "blur-xs", "grayscale");
    };
    onMount(() => {
        for (let i = 1; i <= 4; i++) {
            classTypeOnLoad(i);
        };
        if (selectedScale) {
            calculateFigurines();
        };
    });

    const handleAddToCart = () => {
        const currentValues = () => {
            if (toggleKits) {
                return {
                    standing_man: parseInt((document.querySelector('#ntipo-1') as HTMLInputElement)?.value || '0'),
                    standing_woman: parseInt((document.querySelector('#ntipo-2') as HTMLInputElement)?.value || '0'),
                    sitting: parseInt((document.querySelector('#ntipo-3') as HTMLInputElement)?.value || '0'),
                    walking: parseInt((document.querySelector('#ntipo-4') as HTMLInputElement)?.value || '0')
                };    
            } else {
                return {kit: selectedKit};
            }
        };
        preOrder = {
            scale: selectedScale,
            kits: cantidad,
            figures: currentValues(),
            figuresPerKit: qitems,
            totalFigures: totalFigures,
            totalAmount: totalFigures * costoPorFigura,
            costPerFigure: costoPorFigura
        };
        setViewOrder(false);
        const newItem = {
            id: crypto.randomUUID(),
            color: modelColor,
            order: {...preOrder}
        }
        cartItems.update( items => [...items, newItem]);
    };
</script>
<form>
    <Tabs tabStyle="full" contentClass="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 mt-1">
        <TabItem open title="Selecciona tu vinil">
             <div id="seleccionVinil" class="w-[calc(100vw-56px)] max-w-[420px]">
                 <Label class="h-[150px] lg:h-auto overflow-auto mb-3">
                     <div class="grid grid-cols-1 gap-2">
                        {#snippet values(img:string, id:number, altimg:string)}
                            <button onclick={() => setVinilImage(id)} class="flex flex-row items-center">
                                <img src={img} id={`tipo-${id}`} alt={altimg} class="w-36 h-auto m-2" />
                                <div class="flex-col">
                                    <P size="sm">{altimg}</P>
                                </div>
                            </button>
                        {/snippet}
                        {#each viniles as vinil}
                            {@render values(vinil.file, vinil.value, vinil.name)}
                        {/each}
                     </div>
                 </Label>
             </div>
        </TabItem>
        <TabItem>
            <span slot="title" class="max-w-[420px] w-full lg:w-[420px]">Configura tu vinil &nbsp;</span>
            <div class="grid grid-cols-2 gap-2">
                <Label>
                    <div class="flex flex-row items-center m-2">
                        <Toggle
                            id="ftoggle"
                            bind:checked={vinilMove}
                            class="mr-2"
                        >
                            <P class="text-sm">Mover</P>
                        </Toggle>
                    </div>
                </Label>
                <Label>
                    <Select 
                        id="sColor" 
                        items={kitsColores} 
                        bind:value={selectedColor} 
                        placeholder="Elige color" 
                        onchange={handleColorChange}
                    />
                </Label>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-3">
                    <Label class="mb-3">
                        Tamaño: {((vinilSize * 0.1) * viniles[vinilImage - 1].dX).toFixed(1)} x {((vinilSize * 0.1) * viniles[vinilImage - 1].dY).toFixed(1)} cm
                        <Range id="vSize" bind:value={vinilSize} max={16} min={8} step={0.25}
                        on:change={() => console.log('Configurator vinilSize:', vinilSize)} />
                    </Label>
                    <Label class="mb-3">
                        Rotación: {vinilRotation}°
                        <Range id="vSize" bind:value={vinilRotation} max={360} min={0} step={15} />
                    </Label>
            </div>
            <div class="grid grid-cols-10 gap-3 items-end">
                <Label class="col-span-2 justify-items-end-safe">Cantidad:
                    <Select 
                        required 
                        size="sm" 
                        id="fcantidad" 
                        placeholder="Selecciona la cantidad..." 
                        items={[{name: 1, value: 1}, {name: 2, value: 2}]}
                        bind:value={cantidad}
                    />
                </Label>
                <Label class="col-span-4 justify-items-end-safe">Total:
                    <P id="sumaSubtotal" size="xl" class="text-right font-bold h-[38px]">
                        $ &nbsp;{(vinilSize * 10).toFixed(2)} MXN
                    </P>
                </Label>
                <Button id="addToCart" class="col-span-4" size="lg" color="blue" disabled={!enabledOrder} onclick={handleAddToCart}>
                    Añadir
                </Button>
            </div>
        </TabItem>
    </Tabs>
</form>