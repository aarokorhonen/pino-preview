<script context="module">
    export const formatLogLevelLabel = (level) => {
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
</script>

<script>
    export let logEntry;
    export let isVerbose = false;

    const prefixUnstructured = "-" + "".padStart(4, "\u00a0") + " :";

    const formatTimeField = (time) => {
        try {
            const ts = new Date(time).toISOString();
            return ts.replace(/\.\d\d\d/, "").replace("T", " ");
        } catch (err) {
            return "(Invalid timestamp)";
        }
    };
</script>

<div
    class="rounded-sm px-4 whitespace-nowrap font-mono"
    class:cursor-pointer={!isVerbose}
    class:hover:bg-gray-700={!isVerbose}
    style="height: 24px;"
    on:click
>
    {#if logEntry.package === "not-json"}
        <span class="text-gray-500">
            {formatTimeField(logEntry.time)}
            {prefixUnstructured}
            {logEntry.message}
        </span>
    {:else}
        {formatTimeField(logEntry.time)}
        <span class={formatLogLevelLabel(logEntry.level).class}>
            {formatLogLevelLabel(logEntry.level).label}</span
        >&nbsp;:
        <span class="text-blue-400">{logEntry.msg}</span>
    {/if}
</div>

{#if isVerbose}
    <div class="whitespace-pre px-4 text-yellow-200 mt-4">
        {JSON.stringify(logEntry, null, 4)}
    </div>
{/if}
