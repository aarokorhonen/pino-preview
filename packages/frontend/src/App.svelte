<script>
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import Modal from "./Modal.svelte";
    import { onMount } from "svelte";

    let wsState = "uninitialized";

    let logsAll = [];
    let logsByPackage = new Map();

    let filterByPackage = null;
    let filterByLevel = null;
    let filterByFreetextSearch = "";

    $: logsVisible = (filterByPackage !== null
        ? logsByPackage.get(filterByPackage)
        : logsAll
    )
        .filter((l) => matchesFilterByLevel(filterByLevel, l))
        .filter((l) =>
            matchesFilterByFreetextSearch(filterByFreetextSearch, l),
        );

    $: filterByPackage, filterByLevel, filterByFreetextSearch, resetScroll();

    let openLog = null;

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

        for (const level of [null, 60, 50, 40, 30, 20, 10]) {
            createBtnFilterByLevel(level);
        }

        createBtnFilterByPackage(null);
    };

    const createBtnFilterByLevel = (level) => {
        const btn = document.createElement("button");
        btn.addEventListener("click", () => {
            filterByLevel = level;
        });
        btn.innerHTML =
            level !== null
                ? `<span class="${formatLogLevelLabel(level).class}">${
                      formatLogLevelLabel(level).label
                  }</span>`
                : "(Disable filter)";
        btn.className =
            "bg-gray-200 hover:bg-blue-700 font-bold py-2 px-4 rounded mb-1";
        filterByLevelContainer.appendChild(btn);
    };

    const createBtnFilterByPackage = (packageName) => {
        const btn = document.createElement("button");
        btn.addEventListener("click", () => {
            filterByPackage = packageName;
        });
        btn.innerText =
            packageName !== null
                ? getPackageBtnLabel(packageName)
                : "(Disable filter)";
        btn.className =
            "bg-gray-200 hover:bg-blue-700 font-bold py-2 px-4 rounded mb-1";
        filterByPackageContainer.appendChild(btn);
    };

    const matchesFilterByPackage = (filterByPackage, log) => {
        if (filterByPackage === null) {
            return true;
        } else {
            return log.package === filterByPackage;
        }
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
            if (!logsByPackage.has(packageName)) {
                logsByPackage.set(packageName, [entry]);
                createBtnFilterByPackage(packageName);
            } else {
                logsByPackage.get(packageName).push(entry);
            }

            logsByPackage = logsByPackage;
        }

        scrollIfFollowing();
    };

    const onClose = () => {
        wsState = "closed";
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

    const getPackageBtnLabel = (pkg) => {
        if (pkg === undefined) {
            return 'Only show entries with no "package" field';
        } else if (pkg === "not-json") {
            return "Only show non-JSON entries";
        } else {
            return `Only show entries with "package" field value: "${pkg}"`;
        }
    };

    const formatLogEntry = (log) => {
        if (log.package === "not-json") {
            return `<span class="bg-gray-700">${log.message}</span>`;
        } else {
            const ts = new Date(log.time).toISOString();
            const level = formatLogLevelLabel(log.level);
            const message = formatMessageField(log.msg);
            const pretty = `[${ts}] ${level}: ${message}`;
            return pretty + "\n" + formatLogEntryObject(log);
        }
    };

    const formatLogEntryObject = (log) => {
        let str = "";
        for (const [key, val] of Object.entries(log)) {
            if (["level", "time", "msg"].includes(key)) continue;
            str += `    ${key}: ${JSON.stringify(val, null, 8)}\n`;
        }
        return str.replace(/\n$/, "");
    };

    const formatLogLevelLabel = (level) => {
        switch (level) {
            case 60:
                return { class: "text-red-400", label: "FATAL" };
            case 50:
                return { class: "text-red-400", label: "ERROR" };
            case 40:
                return { class: "text-yellow-500", label: "WARN " };
            case 30:
                return { class: "text-green-400", label: "INFO " };
            case 20:
                return { class: "text-blue-400", label: "DEBUG" };
            case 10:
                return { class: "text-gray-500", label: "TRACE" };
            default:
                return `${level}`;
        }
    };

    const formatMessageField = (msg) =>
        `<span class="text-blue-400">${msg}</span>`;

    const formatTimeField = (time) => {
        try {
            const ts = new Date(time).toISOString();
            return ts;
        } catch (err) {
            return "(Invalid timestamp)";
        }
    };

    let filterByPackageContainer;
    let filterByLevelContainer;

    window.onload = () => {
        filterByPackageContainer = document.getElementById(
            "filterByPackageContainer",
        );
        filterByLevelContainer = document.getElementById(
            "filterByLevelContainer",
        );
        start();
    };
</script>

{#if openLog !== null}
    <Modal bind:openLog />
{/if}

<main>
    <div class="h-screen flex flex items-stretch">
        <nav class="w-3/12 p-6 border-r border-gray-200">
            <h1 class="text-2xl text-gray-800 font-bold mb-12">
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
            <input
                bind:value={filterByFreetextSearch}
                placeholder="Search"
                class="mb-6 flex flex-col bg-gray-100 w-full border-gray-200
            border rounded-sm"
            />
            <h2 class="font-bold mb-6">Filter by level:</h2>
            <div id="filterByLevelContainer" class="mb-6 pl-6 flex flex-col" />
            <h2 class="font-bold mb-6">Filter by package:</h2>
            <div id="filterByPackageContainer" class="pl-6 flex flex-col" />
        </nav>
        <div class="w-9/12 flex-grow bg-gray-900 text-gray-100 p-6 font-mono">
            <VirtualList items={logsVisible} let:item itemHeight={24}>
                <div
                    class="cursor-pointer hover:bg-gray-700 rounded-sm px-4 whitespace-nowrap"
                    style="height: 24px;"
                    on:click={() => {
                        openLog = item;
                    }}
                >
                    {#if item.package === "not-json"}
                        <span class="bg-gray-700">{item.message}</span>
                    {:else}
                        {formatTimeField(item.time)}
                        <span class={formatLogLevelLabel(item.level).class}>
                            {formatLogLevelLabel(item.level).label}</span
                        >&nbsp;:
                        <span class="text-blue-400">{item.msg}</span>
                    {/if}
                </div>
            </VirtualList>
        </div>
    </div>
</main>

<style>
</style>
