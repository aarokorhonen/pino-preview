<script>
    import { onDestroy, createEventDispatcher } from "svelte";

    import LogEntry from "./LogEntry.svelte";

    export let openLog;
    export let filterByTimestamp;

    const dispatch = createEventDispatcher();

    const close = () => {
        openLog = null;
    };

    let now = new Date();

    const interval = setInterval(() => {
        now = new Date();
    }, 1000);

    onDestroy(() => {
        clearInterval(interval);
    });

    const getRelativeTimestampLabel = (ms) => {
        if (ms < 60_000) {
            return `${(ms / 1_000).toFixed(0)} second(s) ago`;
        } else {
            return `${(ms / 60_000).toFixed(0)} minute(s) ago`;
        }
    };

    let copiedAll = false;

    const copyJson = async () => {
        await navigator.clipboard.writeText(JSON.stringify(openLog, null, 4));
        copiedAll = true;
    };

    let copiedValue = false;

    const onCopyValue = () => {
        if (typeof copiedValue === "number") {
            clearTimeout(copiedValue);
        }
        copiedValue = setTimeout(() => {
            copiedValue = false;
        }, 2000);
    };

    const hideOlderLogs = async () => {
        filterByTimestamp = new Date(openLog.time).toISOString();
    };
</script>

<!-- https://tailwindui.com/components/application-ui/overlays/modals -->
<!-- This example requires Tailwind CSS v2.0+ -->
<div class="fixed z-10 inset-0 overflow-y-auto">
    <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
        <div
            class="fixed inset-0 transition-opacity"
            aria-hidden="true"
            on:click={close}
        >
            <div class="absolute inset-0 bg-gray-500 opacity-75" />
        </div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
            class="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true">&#8203;</span
        >
        <div
            class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg lg:max-w-5xl sm:w-full overflow-x-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
        >
            <div
                class="bg-gray-200 px-4 py-3 sm:px-6 h-16 border-b-2 border-gray-300"
            >
                <h3
                    class="h-full text-lg leading-6 font-medium text-gray-700 sm:ml-4 flex items-center"
                    id="modal-headline"
                >
                    <span> Message details </span>
                    <span class="ml-auto">
                        {getRelativeTimestampLabel(
                            now - new Date(openLog.time),
                        )}
                    </span>
                </h3>
            </div>
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                    <div
                        class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-grow overflow-x-hidden bg-gray-900 rounded"
                        style="height: 60vh"
                    >
                        <div
                            class="mt-2 bg-gray-900 text-white rounded p-6 font-mono"
                        >
                            <LogEntry
                                logEntry={openLog}
                                isVerbose={true}
                                on:copy={onCopyValue}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse h-16"
            >
                <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    on:click={close}
                >
                    Close
                </button>
                <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    on:click={copyJson}
                >
                    {#if copiedAll}
                        Copied JSON to clipboard!
                    {:else}
                        Copy JSON
                    {/if}
                </button>
                <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    on:click={hideOlderLogs}
                >
                    Hide older logs
                </button>
                <span
                    class="flex items-center text-green-600 font-medium mr-2 transition-opacity"
                    class:opacity-0={typeof copiedValue !== "number"}
                    class:opacity-100={typeof copiedValue === "number"}
                >
                    Copied value to clipboard!
                </span>
                <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm mr-auto"
                    on:click={() =>
                        dispatch("navigateByOffset", { offset: +1 })}
                >
                    &#129047; Next
                </button>
                <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    on:click={() =>
                        dispatch("navigateByOffset", { offset: -1 })}
                >
                    &#129045; Previous
                </button>
            </div>
        </div>
    </div>
</div>
