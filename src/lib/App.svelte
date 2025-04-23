<script lang="ts">
    import { Canvas } from "@threlte/core";
    import Scene from "./components/Scene.svelte";
    import Configurator from "./components/Configurator.svelte";
    import { Button, Card, Drawer, Modal, P, Spinner } from "flowbite-svelte";
    import { CaretRightSolid } from "flowbite-svelte-icons";
    import { cartItems } from "./cartStore";
    import { downloadOrderPDF } from "./pdfService";
    import { onMount } from "svelte";

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
    let configCamera: boolean = $state(false);
    let viewOrder = $state(true);
    let defaultModal = $state(false);
    let isProcessing = $state(false);
    let orderId = $state("");
    let pdfGenerated = $state(false);
    let orderSavedSuccess = $state(false);
    let orderError = $state("");
    let cerrarDisabled = $state(true);
    let preOrder = $state({
        totalAmount: 0,
        totalViniles: 0,
        selectedVinil: "",
        vinilDimensions: "",
        vinilColor: "black"
    });

    let totalAmount = $state(0);
    let dailyLimitReached = $state(false);
    cartItems.subscribe(value => { 
        items = value;
        calculateTotal(); 
    });

    onMount(async () => {
        await checkDailyLimit();
    });

    async function checkDailyLimit() {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            if (response.ok) {
                dailyLimitReached = data.limitReached;
            } else {
                console.error('Error checking daily limit:', data.error);
                // Optionally handle the error, maybe disable the button as a fallback
                dailyLimitReached = true;
            }
        } catch (error) {
            console.error('Error fetching daily limit:', error);
            // Optionally handle the error, maybe disable the button as a fallback
            dailyLimitReached = true;
        }
    }

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
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: items,
                    totalAmount: totalAmount,
                    orderId: orderId // Pass the generated orderId
                })
            });

            const result = await response.json();

            if (response.ok) {
                orderSavedSuccess = true;
                pdfGenerated = true;
                console.log("Order ID:", result.orderId);
                // After successful order, re-check the daily limit
                await checkDailyLimit();
            } else {
                orderError = result.error || "Error al guardar en base de datos";
                console.error(result.error);
            };
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
        checkDailyLimit();
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
        bind:configCamera
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
        bind:configCamera
    />
</section>
<section>
    <button class="fixed top-[52px] z-[11] rounded-r-lg bg-gray-600 py-1" onclick={() => setViewOrder(false)}>
        <CaretRightSolid class="text-white" />
    </button>
    <Drawer transitionType="fly" id="orderDrawer" class="bg-blue-600/50" bind:hidden={viewOrder}>
        {#if items.length > 0}
        {#each items as item}
        <Card class="my-2" id={`card-${item.id}`}>
            <P size="sm" align="right">Conjunto #: ... {item.id.slice(-6)}</P>
            <P>Diseño: {item.order.selectedVinil}</P>
            <P>Color: {item.order.vinilColor}</P>
            <P>Cantidad: {item.order.totalViniles}</P>
            <P>Dimensiones: {item.order.vinilDimensions}</P>
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
            <P>Diseño: {item.order.selectedVinil}; Color: {item.order.vinilColor}; Cantidad: {item.order.totalViniles};</P>
            <P>Dimensiones: {item.order.vinilDimensions}; Subtotal: ${item.order.totalAmount}</P>
            <hr />
        {/each}
    </div>
    <P id="totalAmount">Total: $ {totalAmount.toFixed(2)} MXN</P>
    
    {#if orderId}
        <div class="mt-4 p-3 bg-green-100 rounded-lg">
            {#if orderSavedSuccess}
                <P weight="bold" class="text-green-800 dark:text-gray-900">¡Orden enviada con éxito!</P>
                <P class="text-green-700 dark:text-gray-900">Tu número de pedido es: <br /> {orderId}</P>
                <P class="text-green-700 dark:text-gray-900">Descarga el PDF con los detalles para la entrega y pago.</P>
                {#if pdfGenerated}
                    <Button class="mt-2" color="blue" onclick={downloadPDF}>
                        Descargar PDF
                    </Button>
                {/if}
            {:else if orderError}
                <P weight="bold" class="text-red-800 dark:text-gray-900">Error al procesar la orden</P>
                <P class="text-red-700 dark:text-gray-900">{orderError}</P>
                <Button class="mt-2" color="blue" onclick={submitOrder}>
                    Intentar nuevamente
                </Button>
            {/if}
            
            <Button class="mt-2 ml-2" disabled={cerrarDisabled} color="primary" onclick={closeOrderAndClearCart}>
                Cerrar
            </Button>
        </div>
    {:else}
        <div class="flex justify-end mt-4">
            <Button color="alternative" class="mr-2" onclick={() => defaultModal = false}>
                Cancelar
            </Button>
            <Button id="submitOrderFinal" color="blue" onclick={submitOrder} disabled={isProcessing || dailyLimitReached}>
                {#if isProcessing}
                    <Spinner size="sm" class="mr-2" />
                    Procesando...
                {:else}
                    {#if dailyLimitReached}
                    No hay más pedidos por hoy <br /> Intenta mañana por favor
                    {:else}
                    Confirmar pedido
                    {/if}
                {/if}
            </Button>
        </div>
    {/if}
</Modal>