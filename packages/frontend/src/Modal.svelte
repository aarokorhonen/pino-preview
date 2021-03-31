<script>
    import { onDestroy } from "svelte";

    import LogEntry from "./LogEntry.svelte";

    export let openLog;
    export let filterByTimestamp;

    const close = () => {
        openLog = null;
    };

    let copied = false;

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

    const copyJson = async () => {
        await navigator.clipboard.writeText(JSON.stringify(openLog, null, 4));
        copied = true;
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
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                    <div
                        class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                    >
                        <!-- Heroicon name: outline/exclamation -->
                        <svg
                            class="h-6 w-6 text-red-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <div
                        class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-grow"
                    >
                        <h3
                            class="text-lg leading-6 font-medium text-gray-900 mb-6"
                            id="modal-headline"
                        >
                            Message details: "{openLog.msg}" &mdash;
                            {getRelativeTimestampLabel(
                                now - new Date(openLog.time),
                            )}
                        </h3>
                        <div
                            class="mt-2 bg-gray-900 text-white rounded p-6 font-mono"
                        >
                            <LogEntry logEntry={openLog} isVerbose={true} />
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
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
                    {#if copied}
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
            </div>
        </div>
    </div>
</div>
