<script>
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import Modal from "./Modal.svelte";
    import { onMount } from "svelte";
    import LogEntry, { formatLogLevelLabel } from "./LogEntry.svelte";

    let wsState = "uninitialized";

    let logsAll = [];
    let logsByPackage = new Map();

    let filterByPackage = null;
    let filterByLevel = null;
    let filterByFreetextSearch = "";
    let filterByTimestamp = "";

    let components = [];
    let healths = new Map();

    $: logsVisible = (filterByPackage !== null
        ? logsByPackage.get(filterByPackage)
        : logsAll
    )
        .filter((l) => matchesFilterByTimestamp(filterByTimestamp, l))
        .filter((l) => matchesFilterByLevel(filterByLevel, l))
        .filter((l) =>
            matchesFilterByFreetextSearch(filterByFreetextSearch, l),
        );

    $: filterByPackage,
        filterByLevel,
        filterByFreetextSearch,
        filterByTimestamp,
        resetScroll();

    export let openLog = null;

    let viewport = null;

    onMount(async () => {
        const viewports = document.getElementsByTagName(
            "svelte-virtual-list-viewport",
        );
        if (viewports.length !== 1) {
            throw viewports;
        } else {
            viewport = viewports[0];
            viewport.classList.add("bg-gray-900");
        }
    });

    const start = async () => {
        const socket = new WebSocket(`ws://${location.host}/api/ws`);
        socket.addEventListener("message", onMessage);
        socket.addEventListener("close", onClose);
    };

    const matchesFilterByLevel = (filterByLevel, log) => {
        if (filterByLevel === null) {
            return true;
        } else if (log.level === undefined) {
            return false;
        } else {
            return log.level >= filterByLevel;
        }
    };

    const matchesFilterByTimestamp = (filterByTimestamp, log) => {
        const minimumTimestamp = new Date(filterByTimestamp).getTime();
        if (filterByTimestamp === "") {
            return true;
        } else {
            return log.time >= minimumTimestamp;
        }
    };

    const matchesFilterByFreetextSearch = (filterByFreetextSearch, log) => {
        if (filterByFreetextSearch === "") {
            return true;
        } else {
            return (
                JSON.stringify(log)
                    .toLowerCase()
                    .indexOf(filterByFreetextSearch.toLowerCase()) !== -1
            );
        }
    };

    const onMessage = (message) => {
        const data = JSON.parse(message.data);
        const newLogs = Array.isArray(data) ? data : [data];

        if (wsState === "uninitialized") wsState = "open";

        logsAll.push(...newLogs);
        logsAll = logsAll;

        for (const entry of newLogs) {
            const { package: packageName } = entry;
            if (!components.includes(packageName)) {
                components = [...components, packageName];
                logsByPackage.set(packageName, [entry]);
                logsByPackage = logsByPackage;
            } else {
                logsByPackage.get(packageName).push(entry);
                logsByPackage = logsByPackage;
            }

            updatePackageHealth(packageName, entry.healthy);
        }

        scrollIfFollowing();
    };

    const onClose = () => {
        wsState = "closed";
    };

    const updatePackageHealth = (packageName, healthy) => {
        if (!packageName || typeof healthy === "undefined") return;
        healths.set(packageName, Boolean(healthy));
        healths = healths;
    };

    const resetScroll = async () => {
        if (!viewport) return;
        viewport.scroll(0, 0);
    };

    const scrollIfFollowing = () => {
        if (!viewport) return;
        const shouldScroll =
            viewport.scrollHeight -
                (viewport.scrollTop + viewport.offsetHeight) <
            100;
        if (shouldScroll) {
            scroll();
        }
    };

    const scroll = () => {
        if (!viewport) return;
        viewport.scroll(0, viewport.scrollHeight);
    };

    const getComponentFiltetrBtnLabel = (pkg) => {
        if (pkg === null) {
            return "(Disable filter)";
        } else if (pkg === undefined) {
            return "Only show entries with no component field";
        } else if (pkg === "not-json") {
            return "Only show unstructured entries";
        } else {
            return `Only show component: "${pkg}"`;
        }
    };

    const updateHeapDiagnostics = () => {
        if (!window.performance.memory) return;
        const { usedJSHeapSize, totalJSHeapSize } = window.performance.memory;
        heapDiagnostics = `
            Used: ${(usedJSHeapSize / 1024 / 1024).toFixed(1)} MiB
            Total: ${(totalJSHeapSize / 1024 / 1024).toFixed(1)} MiB
        `;
    };

    let heapDiagnostics = "";
    updateHeapDiagnostics();
    setInterval(updateHeapDiagnostics, 5000);

    window.onload = () => {
        start();
    };
</script>

{#if openLog !== null}
    <Modal bind:openLog bind:filterByTimestamp />
{/if}

<main>
    <div class="h-screen flex flex items-stretch">
        <nav class="w-3/12 p-6 border-r border-gray-200 overflow-y-auto">
            <h1
                class="text-2xl text-gray-800 font-bold mb-12"
                data-test-app-title
            >
                JSON Log Preview
            </h1>
            {#if wsState === "closed"}
                <div
                    class="p-2 bg-red-800 items-center text-red-100 leading-none lg:rounded-full flex mb-6"
                    role="alert"
                >
                    <span
                        class="flex rounded-full bg-red-500 uppercase px-2 py-1 text-xs font-bold mr-3"
                        >Note</span
                    >
                    <span class="font-semibold mr-2 text-left flex-auto"
                        >Log stream terminated</span
                    >
                </div>
            {/if}
            <h2 class="font-bold mb-6">Filter by freetext search:</h2>
            <div class="mb-6 pl-6">
                <input
                    bind:value={filterByFreetextSearch}
                    placeholder="&#x1F50D; – Search"
                    class="p-2 flex flex-col bg-gray-100 w-full border-gray-200
            border rounded"
                />
            </div>
            <h2 class="font-bold mb-6">Filter by timestamp (on or after):</h2>
            <div class="mb-6 pl-6">
                <input
                    bind:value={filterByTimestamp}
                    placeholder="e.g. 2021-03-23 15:10:15Z"
                    class="p-2 flex flex-col bg-gray-100 w-full border-gray-200
            border rounded"
                />
            </div>
            <h2 class="font-bold mb-6">Filter by level:</h2>
            <div class="mb-6 pl-6 flex flex-col">
                {#each [null, 60, 50, 40, 30, 20, 10] as level}
                    <button
                        class="bg-gray-200 hover:bg-blue-700 font-bold py-2 px-4 rounded mb-1"
                        class:bg-blue-200={filterByLevel === level}
                        on:click={() => {
                            filterByLevel = level;
                        }}
                    >
                        {#if level !== null}
                            <span class={formatLogLevelLabel(level).class}>
                                {formatLogLevelLabel(level).label}
                            </span>
                        {:else}
                            (Disable filter)
                        {/if}
                    </button>
                {/each}
            </div>
            <h2 class="font-bold mb-6">Filter by component:</h2>
            <div class="mb-6 pl-6 flex flex-col">
                {#each [null, ...components] as comp}
                    <button
                        class="bg-gray-200 hover:bg-blue-700 font-bold py-2 px-4 rounded mb-1 border-r-8"
                        class:bg-blue-200={filterByPackage === comp}
                        class:border-red-400={healths.get(comp) === false}
                        class:border-green-400={healths.get(comp) === true}
                        on:click={() => {
                            filterByPackage = comp;
                        }}
                    >
                        <span
                            class="float-right inline-flex items-center justify-center w-8 ml-4 px-2 py-1 text-xs font-bold leading-none text-gray-500 bg-gray-300 rounded-full"
                        >
                            {(logsByPackage.get(comp) || logsAll).length}
                        </span>
                        <div class="text-left">
                            {getComponentFiltetrBtnLabel(comp)}
                        </div>
                    </button>
                {/each}
            </div>
            {#if heapDiagnostics}
                <div class="mb-6 text-gray-300">
                    <p>Heap:</p>
                    <p class="ml-3">
                        {heapDiagnostics}
                    </p>
                </div>
            {/if}
        </nav>
        <div class="w-9/12 flex-grow bg-gray-900 text-gray-100 p-6 font-mono">
            <VirtualList items={logsVisible} let:item itemHeight={24}>
                <LogEntry
                    logEntry={item}
                    isVerbose={false}
                    on:click={() => {
                        openLog = item;
                    }}
                />
            </VirtualList>
            <div
                class="absolute w-12 h-12 right-12 bottom-6 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-4xl cursor-pointer"
                on:click={scroll}
            >
                &#8595;
            </div>
        </div>
    </div>
</main>

<style>
</style>
