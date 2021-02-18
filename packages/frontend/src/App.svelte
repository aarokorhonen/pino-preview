<script>
	export let name;

	const logs = [];
	const logsByPackage = new Map();

	let filterByPackage = null;
	let filterByLevel = null;

	const start = async () => {
		const socket = new WebSocket(`ws://${location.host}/api/ws`);
		socket.addEventListener("message", onMessage);
		socket.addEventListener("open", onOpen);

		for (const level of [null, 60, 50, 40, 30, 20, 10]) {
			createBtnFilterByLevel(level);
		}

		createBtnFilterByPackage(null);
	};

	const createBtnFilterByLevel = (level) => {
		const btn = document.createElement("button");
		btn.addEventListener("click", () => {
			filterByLevel = level;
			renderLogs(logs);
		});
		btn.innerHTML =
			level !== null ? formatLogLevelLabel(level) : "(Disable filter)";
		btn.className =
			"bg-gray-200 hover:bg-blue-700 font-bold py-2 px-4 rounded mb-1";
		filterByLevelContainer.appendChild(btn);
	};

	const createBtnFilterByPackage = (packageName) => {
		const btn = document.createElement("button");
		btn.addEventListener("click", () => {
			filterByPackage = packageName;
			renderLogs(
				filterByPackage !== null ? logsByPackage.get(packageName) : logs,
			);
		});
		btn.innerText =
			packageName !== null
				? getPackageBtnLabel(packageName)
				: "(Disable filter)";
		btn.className =
			"bg-gray-200 hover:bg-blue-700 font-bold py-2 px-4 rounded mb-1";
		filterByPackageContainer.appendChild(btn);
	};

	const matchesFilter = (log) => {
		return matchesFilterByPackage(log) && matchesFilterByLevel(log);
	};

	const matchesFilterByPackage = (log) => {
		if (filterByPackage === null) {
			return true;
		} else {
			return log.package === filterByPackage;
		}
	};

	const matchesFilterByLevel = (log) => {
		if (filterByLevel === null) {
			return true;
		} else if (log.level === undefined) {
			return false;
		} else {
			return log.level >= filterByLevel;
		}
	};

	const onMessage = (message) => {
		const data = JSON.parse(message.data);
		const newLogs = Array.isArray(data) ? data : [data];

		logs.push(...newLogs);

		for (const entry of newLogs) {
			const { package: packageName } = entry;
			if (!logsByPackage.has(packageName)) {
				logsByPackage.set(packageName, [entry]);
				createBtnFilterByPackage(packageName);
			} else {
				logsByPackage.get(packageName).push(entry);
			}

			if (matchesFilter(entry)) {
				const str = formatLogEntry(entry);
				mainContainer.innerHTML += `${str}\n`;
				mainContainer.parentElement.scrollTo(0, mainContainer.scrollHeight);
			}
		}
	};

	const onOpen = () => {
		mainContainer.innerHTML = "";
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


	const renderLogs = (logs) => {
		mainContainer.innerHTML = "";

		for (const entry of logs) {
			if (!matchesFilterByLevel(entry)) continue;
			const str = formatLogEntry(entry);
			mainContainer.innerHTML += `${str}\n`;
		}

		mainContainer.parentElement.scrollTo(0, mainContainer.scrollHeight);
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
				return '<span class="text-red-400">FATAL</span>';
			case 50:
				return '<span class="text-red-400">ERROR</span>';
			case 40:
				return '<span class="text-yellow-500">WARN</span>';
			case 30:
				return '<span class="text-green-400">INFO</span>';
			case 20:
				return '<span class="text-blue-400">DEBUG</span>';
			case 10:
				return '<span class="text-gray-500">TRACE</span>';
			default:
				return `${level}`;
		}
	};

	const formatMessageField = (msg) => `<span class="text-blue-400">${msg}</span>`;

	let mainContainer;
	let filterByPackageContainer;
	let filterByLevelContainer;

	window.onload = () => {
		mainContainer = document.getElementById("mainContainer");
		filterByPackageContainer = document.getElementById(
			"filterByPackageContainer",
		);
		filterByLevelContainer = document.getElementById(
			"filterByLevelContainer",
		);
		start();
	};
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<main>
	<div class="h-screen flex flex items-stretch">
		<nav class="w-3/12 p-6 border-r border-gray-200">
			<h1 class="text-2xl text-gray-800 font-bold mb-12">
				JSON Log Preview
			</h1>
			<h2 class="font-bold mb-6">Filter by level:</h2>
			<div
				id="filterByLevelContainer"
				class="mb-6 pl-6 flex flex-col"
			></div>
			<h2 class="font-bold mb-6">Filter by package:</h2>
			<div
				id="filterByPackageContainer"
				class="pl-6 flex flex-col"
			></div>
		</nav>
		<div class="w-9/12 flex-grow bg-gray-100 p-6 overflow-y-auto">
			<pre
				id="mainContainer"
				class="leading-relaxed rounded bg-gray-800 text-white p-6 overflow-x-auto"
			>
Loading...</pre
			>
		</div >
	</div>
	<script src="./scripts/index.js"></script>
</main>


<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
