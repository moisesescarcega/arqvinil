<script lang="ts">
    import { Canvas } from "@threlte/core";
    import Scene from "./components/Scene.svelte";
    import Configurator from "./components/Configurator.svelte";
    import { Button, Card, Drawer, Modal, P, Spinner } from "flowbite-svelte";
    import { CaretRightSolid } from "flowbite-svelte-icons";
    import { cartItems } from "./cartStore";
    import { downloadOrderPDF } from "./pdfService";
    // import { saveOrderToSupabase } from "./supabaseService";

    let items: any[] = $state([]);
    let modelColor: string = $state("black");
    let vinilSize: number = $state(10);
    let vinilRotation: number = $state(0);
    let vinilX: number = $state(0);
    let vinilY: number = $state(0);
    let vinilMove: boolean = $state(false);
    let vinilImage: number = $state(1);
    let selectedDevice: number = $state(1);
    let colorDevice: number = $state(1);
    let viewOrder = $state(true);
    let defaultModal = $state(false);
    let isProcessing = $state(false);
    let orderId = $state("");
    let pdfGenerated = $state(false);
    let orderSavedSuccess = $state(false);
    let orderError = $state("");
    let cerrarDisabled = $state(true);
    let preOrder = $state({
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
    });

    let totalAmount = $state(0);
    cartItems.subscribe(value => { 
        items = value;
        calculateTotal(); 
    });

    function calculateTotal() {
        totalAmount = items.reduce((sum, item) => sum + item.order.totalAmount, 0);
    };

    function removeItem(id: string) {
        cartItems.update(items => items.filter(item => item.id !== id));
    };

    async function submitOrder() {
        try {
            isProcessing = true;
            orderSavedSuccess = false;
            orderError = "";
            orderId = `ORD-${Date.now()}`;
            // const result = await saveOrderToSupabase(items, totalAmount, orderId);
            // if (result.success) {
            //     orderSavedSuccess = true;
            //     pdfGenerated = true;
            //     console.log("Order ID:", orderId);
            // } else {
            //     orderError = "Error al guardar en base de datos";
            //     console.error(result.error);
            // };
        } catch (error) {
            console.error("Error processing order:", error);
            // alert("Error processing your order. Please try again.");
            orderError = "Error al procesar"
        } finally {
            isProcessing = false;
        }
    };
    
    function downloadPDF() {
        downloadOrderPDF(items, totalAmount, orderId);
        cerrarDisabled = false;
    };
    
    function closeOrderAndClearCart() {
        cerrarDisabled = true;
        defaultModal = false;
        cartItems.set([]);
        orderId = "";
        pdfGenerated = false;
        orderSavedSuccess = false;
        orderError = "";
    };

    const setViewOrder = (value: boolean) => {
        viewOrder = value;
    };

    const handleOrder = () => {
        calculateTotal();
        defaultModal = true;
        setViewOrder(true);
    };
</script>
<Canvas>
    <Scene 
        bind:modelColor 
        bind:vinilSize 
        bind:vinilRotation 
        bind:vinilX 
        bind:vinilY
        bind:vinilMove 
        bind:vinilImage
        bind:selectedDevice
        bind:colorDevice
    />
</Canvas>
<section class="absolute ml-3 mr-3 lg:right-3 lg:top-[5rem] bottom-[22px] max-w-[420px]">
    <Configurator 
        bind:modelColor 
        {setViewOrder} 
        bind:preOrder 
        bind:vinilSize 
        bind:vinilRotation 
        bind:vinilX 
        bind:vinilY
        bind:vinilMove 
        bind:vinilImage
        bind:selectedDevice
        bind:colorDevice
    />
</section>
<section>
    <button class="fixed top-[52px] z-[11] rounded-r-lg bg-primary-500 py-1" onclick={() => setViewOrder(false)}>
        <CaretRightSolid class="text-white" />
    </button>
    <Drawer transitionType="fly" id="orderDrawer" class="bg-blue-600/50" bind:hidden={viewOrder}>
        {#if items.length > 0}
        {#each items as item}
        <Card class="my-2" id={`card-${item.id}`}>
            <P size="sm" align="right">Conjunto #: ... {item.id.slice(-6)}</P>
            <P>Escala: {item.order.scale}</P>
            <P>Color: {item.color}</P>
            {#if item.order.figures.kit}
            <P>Kit predefinido: {item.order.figures.kit}</P>
            {/if}
            <P>Cantidad de Kits: {item.order.kits}</P>
            <P>Total de escalas: {item.order.totalFigures}</P>
            <P weight="bold" align="right">Subtotal: {item.order.totalAmount}
                &nbsp;<Button color="red" class="float-right mx-2" size="xs" onclick={() => removeItem(item.id)}>x</Button>
            </P>
        </Card>
        {/each}
        <Button id="backToOptions" class="mt-2" color="alternative" onclick={() => setViewOrder(true)}>Regresar</Button>
        <Button id="submitOrder" class="float-right mt-2" onclick={handleOrder}>Ordenar</Button>
        {:else}
        <P class="text-white">...no has añadido nada aún.</P>
        {/if}
    </Drawer>
</section>
<Modal autoclose={false} bind:open={defaultModal} title="Resumen de tu pedido">
    <div class="h-[350px] overflow-auto">
        {#each items as item}
            <P>Orden {item.id}</P>
            <P>Escala: {item.order.scale}; Color: {item.color}; Cantidad: {item.order.kits} kits;</P>
            {#if item.order.figures.kit}
            <P>Kit predefinido: {item.order.figures.kit}</P>
            <P>Total de escalas: {item.order.totalFigures}; Costo por unidad: ${item.order.costPerFigure} MXN; 
                Subtotal: ${item.order.totalAmount} MXN
            </P>
            {:else}
            <P>Total de escalas: {item.order.totalFigures}; Costo por unidad: ${item.order.costPerFigure} MXN; 
                Subtotal: ${item.order.totalAmount} MXN
            </P>
            {/if}
            <hr />
        {/each}
    </div>
    <P id="totalAmount">Total: $ {totalAmount.toFixed(2)} MXN</P>
    
    {#if orderId}
        <div class="mt-4 p-3 bg-green-100 rounded-lg">
            {#if orderSavedSuccess}
                <P weight="bold" class="text-green-800">¡Orden enviada con éxito!</P>
                <P class="text-green-700">Tu número de pedido es: <br /> {orderId}</P>
                
                {#if pdfGenerated}
                    <Button class="mt-2" color="blue" onclick={downloadPDF}>
                        Descargar PDF
                    </Button>
                {/if}
            {:else if orderError}
                <P weight="bold" class="text-red-800">Error al procesar la orden</P>
                <P class="text-red-700">{orderError}</P>
                <Button class="mt-2" color="blue" onclick={submitOrder}>
                    Intentar nuevamente
                </Button>
            {/if}
            
            <Button class="mt-2 ml-2" disabled={cerrarDisabled} color="alternative" onclick={closeOrderAndClearCart}>
                Cerrar
            </Button>
        </div>
    {:else}
        <div class="flex justify-end mt-4">
            <Button color="alternative" class="mr-2" onclick={() => defaultModal = false}>
                Cancelar
            </Button>
            <Button id="submitOrderFinal" color="blue" onclick={submitOrder} disabled={isProcessing}>
                {#if isProcessing}
                    <Spinner size="sm" class="mr-2" />
                    Procesando...
                {:else}
                    Confirmar pedido
                {/if}
            </Button>
        </div>
    {/if}
</Modal>