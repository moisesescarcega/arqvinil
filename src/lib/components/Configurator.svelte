<script lang="ts">
	import { Accordion, AccordionItem, Button, Label, NumberInput, P, Range, Select, TabItem, Tabs, Toggle } from "flowbite-svelte";
    import { itemsScale, itemsVariants, kitsVariants, kitsColores } from "./variantes";
	import { onMount } from "svelte";
    import { cartItems } from "$lib/cartStore";
    let { 
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
    let dcantidad = $state(true); // el campo de cantidad está inhabilitado por default
    let selectedScale = $state(''); // sin escala seleccionada por default
    let selectedKit = $state(""); // sin kit seleccionado por default 
    let qitems = $state(0); // cantidad de figuras por kit
    let totalFigures = $state(0); // total de figuras
    let subtotalFigures = $state(0); // subtotal de figuras
    let qFiguraInicial1 = $state(1);
    let qFiguraInicial2 = $state(1);
    let qFiguraInicial3 = $state(1);
    let qFiguraInicial4 = $state(1);
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

    // Selecciona la escala de acuerdo a las opciones disponibles
    let selectScale = () => {
        selectedScale = (document.getElementById("fescala") as HTMLSelectElement)?.value;
        configureScaleValues(selectedScale);
        const selectedItem = itemsScale.find((item) => item.value === selectedScale);
        qitems = selectedItem?.qitems || 0;
        dcantidad = true;
        console.log('Order Summary:', {
            scale: selectedScale,
            figures: {
                standing_man: qFiguraInicial1,
                standing_woman: qFiguraInicial2,
                sitting: qFiguraInicial3,
                walking: qFiguraInicial4
            },
            totalFigures: totalFigures,
            // totalAmount: totalFigures * costoPorFigura,
            costPerFigure: costoPorFigura
        });
        for (let i = 1; i <= 4; i++) {
        const input = document.querySelector(`#ntipo-${i}`) as HTMLInputElement;
            if (input) {
                switch (i) {
                    case 1: input.value = qFiguraInicial1.toString(); break;
                    case 2: input.value = qFiguraInicial2.toString(); break;
                    case 3: input.value = qFiguraInicial3.toString(); break;
                    case 4: input.value = qFiguraInicial4.toString(); break;
                }
            }
        };
        calculateFigurines();
    };
    function configureScaleValues(scale: string) {
        switch (scale) {
            case '1 a 50':
                qFiguraInicial1 = 3; qFiguraInicial2 = 3; qFiguraInicial3 = 2; qFiguraInicial4 = 2;
                costoPorFigura = 10;
                break;
            case '1 a 75':
                qFiguraInicial1 = 4; qFiguraInicial2 = 4; qFiguraInicial3 = 4; qFiguraInicial4 = 3;
                costoPorFigura = 7;
                break;
            case '1 a 100':
                qFiguraInicial1 = 6; qFiguraInicial2 = 6; qFiguraInicial3 = 4; qFiguraInicial4 = 4;
                costoPorFigura = 5;
                break;
            case '1 a 150': 
                qFiguraInicial1 = 9; qFiguraInicial2 = 9; qFiguraInicial3 = 9; qFiguraInicial4 = 8;
                costoPorFigura = 3;
                break;
            case '1 a 200':
                qFiguraInicial1 = 13; qFiguraInicial2 = 13; qFiguraInicial3 = 12; qFiguraInicial4 = 12;
                costoPorFigura = 2;
                break;
            default:
                qFiguraInicial1 = 1; qFiguraInicial2 = 1; qFiguraInicial3 = 1; qFiguraInicial4 = 1;
                costoPorFigura = 0;
        }
    };

    let quantityOptions = $derived(
        selectedScale === '1 a 50' || selectedScale === '1 a 75' 
        ? [1, 2, 3, 4, 5].map(value => ({ label: value.toString(), value, name: value.toString() })) 
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => ({ label: value.toString(), value, name: value.toString() }))
    );

    let defineKit = () => {
        selectedKit = (document.getElementById("fkit") as HTMLSelectElement)?.value;
        switch (selectedScale) {
            case '1 a 50':
                costoPorFigura = 10;
                break;
            case '1 a 75':
                costoPorFigura = 7;
                break;
            case '1 a 100':
                costoPorFigura = 5;
                break;
            case '1 a 150':
                costoPorFigura = 3;
                break;
            case '1 a 200':
                costoPorFigura = 2;
                break;
            default:
                costoPorFigura = 0;
        };
    };

    // Cambia las clases de las imagenes al seleccionar el tipo de figura
    let selectType = (num: number) => {
        const input = document.querySelector(`#ntipo-${num}`) as HTMLInputElement;
        if (input) {
            // Validar y corregir el valor si excede el máximo
            const value = parseInt(input.value);
            if (value > 20) {
                input.value = '20';
            }
            // Aplicar clases a la imagen
            if (input.value !== '0') {
                document.querySelector(`#tipo-${num}`)?.classList.remove("blur-xs", "grayscale");
            } else {
                document.querySelector(`#tipo-${num}`)?.classList.add("blur-xs", "grayscale");
            }
        }
        calculateFigurines();
    };

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
                         {#snippet values(img:string, id:number, altimg:string, value:number)}
                             <div class="flex flex-row items-center">
                                 <img src={img} id={`tipo-${id}`} alt={altimg} class="h-22 m-2" />
                                 <div class="flex-col">
                                     <P size="sm">{altimg}</P>
                                     <NumberInput 
                                         size="sm" 
                                         id={`ntipo-${id}`} 
                                         disabled={!dcantidad}
                                         onchange={() => selectType(id)} 
                                         min={0} 
                                         max={20} 
                                         value={value} 
                                     />
                                 </div>
                             </div>
                         {/snippet}
                         {@render values("manantiales_1.png", 1, "Manantiales 1", qFiguraInicial1)}
                         {@render values("manantiales_1.png", 2, "Manantiales 2", qFiguraInicial2)}
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
                <!-- <div class="grid grid-cols-1 gap-2"> -->
                    <Label class="mb-3">
                        Tamaño: {(vinilSize * 1.75).toFixed(1)} x {(vinilSize * 0.75).toFixed(1)}
                        <Range id="vSize" bind:value={vinilSize} max={16} min={8} step={0.25}
                        on:change={() => console.log('Configurator vinilSize:', vinilSize)} />
                    </Label>
                    <Label class="mb-3">
                        Rotación: {vinilRotation}°
                        <Range id="vSize" bind:value={vinilRotation} max={360} min={0} step={15} />
                    </Label>
            </div>
            <div class="grid grid-cols-3 gap-3 items-end">
                <Label>Cantidad:
                    <Select 
                        required 
                        size="sm" 
                        id="fcantidad" 
                        placeholder="Selecciona la cantidad..." 
                        items={[{name: 1, value: 1}, {name: 2, value: 2}]}
                        bind:value={cantidad}
                    />
                </Label>
                <Label>Total:
                    <P id="sumaSubtotal" size="xl" class="text-right font-bold h-[38px]">
                        {#if enabledOrder}
                        $ &nbsp;{totalFigures * costoPorFigura} MXN
                        {:else}
                        $ &nbsp;- MXN
                        {/if}
                    </P>
                </Label>
                <Button id="addToCart" size="lg" color="blue" disabled={!enabledOrder} onclick={handleAddToCart}>
                    Añadir
                </Button>
            </div>
        </TabItem>
    </Tabs>
</form>