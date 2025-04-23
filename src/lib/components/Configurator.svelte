<script lang="ts">
	import { Button, Label, P, Range, Select, TabItem, Tabs, Toggle } from "flowbite-svelte";
    import { viniles, kitsColores, devices, colorDevices } from "./variantes";
    import { cartItems } from "$lib/cartStore";
    let { 
        vinilImage = $bindable(),
        modelColor = $bindable(),
        vinilSize = $bindable(),
        vinilRotation = $bindable(),
        vinilX = $bindable(),
        vinilY = $bindable(),
        vinilMove = $bindable(),
        selectedDevice = $bindable(),
        colorDevice = $bindable(),
        setViewOrder = () => {},
        preOrder = $bindable({
			totalAmount: 0,
            totalViniles: 0,
            selectedVinil: "",
            vinilDimensions: "",
            vinilColor: "black"
		})
    }: { 
        vinilImage: number,
        modelColor: string,
        vinilSize: number,
        vinilRotation: number,
        vinilX: number,
        vinilY: number,
        vinilMove: boolean,
        selectedDevice: number,
        colorDevice: number,
        setViewOrder: (value: boolean) => void,
        preOrder: {
            totalAmount: number;
            totalViniles: number;
            selectedVinil: string;
            vinilDimensions: string;
            vinilColor: string;
        }
    } = $props();
    let cantidad = $state(1); // cantidad de kits
    let selectedColor = $derived(modelColor);
    let enabledOrder = $state(true); // el botón de agregar se habilita si se cumplen los criterios
    const colorName = kitsColores.find(color => color.value === modelColor)?.name || modelColor;
    const vinilName = viniles.find(vinil => vinil.value === vinilImage)?.name || vinilImage;

    const handleColorChange = () => {
        modelColor = selectedColor;
    }

    let setVinilImage = (n: number) => {vinilImage = n;}

    const handleAddToCart = () => {
        preOrder = {
            totalAmount: vinilSize * cantidad * 10,
            totalViniles: cantidad,
            selectedVinil: vinilName.toString(),
            vinilDimensions: ((vinilSize * 0.1) * viniles[vinilImage - 1].dX).toFixed(1).toString().concat(" x ", ((vinilSize * 0.1) * viniles[vinilImage - 1].dY).toFixed(1).toString()),
            vinilColor: colorName
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
    <Tabs 
        tabStyle="full" 
        contentClass="p-2 bg-gray-50 rounded-lg dark:bg-gray-800 mt-1" 
        defaultClass='grid grid-cols-2 w-full space-x-1'
    >
        <TabItem open>
            <span slot="title" id="tab1">Selecciona tu vinil</span>
             <div id="seleccionVinil" class="w-[calc(100vw-56px)] w-full max-w-[420px] grid grid-cols-10">
                 <Label class="h-[180px] lg:h-auto overflow-auto mb-3 col-span-4">
                     <div class="grid grid-cols-1 gap-2 bg-white">
                        {#snippet values(img:string, id:number, altimg:string)}
                            <button onclick={() => setVinilImage(id)} class="flex flex-col items-center">
                                <img src={`m_${img}`} id={`tipo-${id}`} alt={altimg} class="w-32 object-contain m-2" />
                                <div>
                                    <P size="sm" style="color:black">{altimg}</P>
                                </div>
                            </button>
                        {/snippet}
                        {#each viniles as vinil}
                            {@render values(vinil.file, vinil.value, vinil.name)}
                        {/each}
                     </div>
                 </Label>
                 <div class="col-span-6 pl-2">
                     <Tabs tabStyle="full" defaultClass='grid grid-cols-2 w-full space-x-1'>
                        <TabItem open>
                            <div slot="title" class="gap-2">
                                Laptop
                            </div>
                            <div class="w-full grid grid-cols-2 gap-2">
                                <Button class="col-span-1" size="sm" onclick={() => selectedDevice = 0}>13"</Button>
                                <Button class="col-span-1" size="sm" onclick={() => selectedDevice = 1}>15"</Button>
                            </div>
                        </TabItem>
                        <TabItem>
                            <div slot="title" class="gap-2">
                                Tablet/Cel
                            </div>
                            <div class="w-full grid grid-cols-2 gap-2">
                                <Button class="col-span-1" size="sm" onclick={() => selectedDevice = 3}>iPad</Button>
                                <Button class="col-span-1" size="sm" onclick={() => selectedDevice = 2}>Cel</Button>
                            </div>
                        </TabItem>
                    </Tabs>
                    <Label class="px-2">Color de dispositivo:
                        <Select
                        size="sm" 
                        id="dcolor" 
                        placeholder="Color de superficie" 
                        items={colorDevices}
                        bind:value={colorDevice} 
                        />
                    </Label>
                 </div>
             </div>
        </TabItem>
        <TabItem>
            <span slot="title">Configura tu vinil</span>
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
                        <Range id="vSize" bind:value={vinilSize} max={20} min={6} step={0.25}
                    />
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
                        items={[
                            {name: 1, value: 1}, 
                            {name: 2, value: 2},
                            {name: 3, value: 3},
                            {name: 4, value: 4},
                            {name: 5, value: 5}
                        ]}
                        bind:value={cantidad}
                    />
                </Label>
                <Label class="col-span-4 justify-items-end-safe">Total:
                    <P id="sumaSubtotal" size="lg" class="text-right font-bold h-[38px]">
                        $ &nbsp;{(vinilSize * cantidad * 10).toFixed(2)} MXN
                    </P>
                </Label>
                <Button id="addToCart" class="col-span-4" size="lg" color="blue" disabled={!enabledOrder} onclick={handleAddToCart}>
                    Añadir
                </Button>
            </div>
        </TabItem>
    </Tabs>
</form>
