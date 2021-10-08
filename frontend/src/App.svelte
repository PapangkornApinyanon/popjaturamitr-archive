<script>
	import axios from "axios";
	import { tw } from "twind";
	import count from "./lib/store";
	//import Kofi from "./lib/kofi.svelte";
	import { Howl, Howler } from "howler";
	import { onDestroy, onMount } from "svelte";
	let popup;
	let a = 1;
	let l = 0;

	$count = parseInt($count);
	
	let popUrls = [
		"https://popcat.click/img/p.1e9d00be.png",
		"https://popcat.click/img/op.353767c3.png",
	];
	let popIndex = 0;
	let totalCount = 0;
	let trueTotal;
	var intervalCount = 0;

	count.subscribe((val) => localStorage.setItem("count", val));

	let lastCount = $count || 0;
	let school = "NN";
	let debounceState = false;
	let schoolsScore = {
		DS: "Loading",
		AC: "Loading",
		SK: "Loading",
		BC: "Loading",
	};

	let imgUrls = {
		NN: "https://i.imgur.com/Mg6GolO.jpeg",
		DS: "https://upload.wikimedia.org/wikipedia/th/thumb/d/d0/%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%80%E0%B8%A2%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B2%E0%B8%A5%E0%B8%A2%E0%B9%8C%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%80%E0%B8%97%E0%B8%B4%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%81%E0%B8%B5%E0%B8%A2%E0%B8%A3%E0%B8%95%E0%B8%B4_%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A8%E0%B8%B4%E0%B8%A3%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C.jpg/1280px-%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%80%E0%B8%A2%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B2%E0%B8%A5%E0%B8%A2%E0%B9%8C%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%95%E0%B8%B6%E0%B8%81%E0%B9%80%E0%B8%97%E0%B8%B4%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%81%E0%B8%B5%E0%B8%A2%E0%B8%A3%E0%B8%95%E0%B8%B4_%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A8%E0%B8%B4%E0%B8%A3%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C.jpg",
		AC: "https://i.imgur.com/egbc61I.png",
		SK: "https://i.imgur.com/h0ePtJb.jpeg",
		BC: "https://i.imgur.com/xMNf8jW.jpeg",
	};

	let sound = new Howl({
		src: ["audio/pop.mp3"],
		volume: 0.6,
	});

	function unlockDebounce() {
		debounceState = false;
	}

	function incCount() {
		if (debounceState) {
			return;
		}
		debounceState = true;
		count.update((n) => n + 1);
		totalCount += 1;
		intervalCount += 1;
		schoolsScore[school] =
			schoolsScore[school] == "Loading" ? 1 : schoolsScore[school] + 1;
		popIndex = (popIndex + 1) % 2;
		sound.play();
	}

	function openOption() {
		popup = "flex";
	}

	function closeOption(param) {
		if (a) {
			if (school !== "NN") {
				popup = "none";
				a = 0;
			}
		} else {
			if (param.target.matches("div.popup") && school !== "NN") {
				popup = "none";
			}
		}
		//if ((school !== "NN") && ((param.target.matches("div.popup"))||a) ) //{
		//}
	}

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(";").shift();
	}

	async function getToken() {
		await axios.post("https://api.pophq.net/token").then(
			(response) => {
				document.cookie = `token=${response.data.data}`;
				console.log("token");
			},
			(error) => {
				console.log(error);
			}
		);
	}

	async function submitCount() {
		await axios
			.post(
				"https://api.pophq.net/clicks",
				{},
				{
					params: {
						click: intervalCount,
						key: school,
						token: getCookie("token"),
					},
				}
			)
			.then(
				(response) => {
					lastCount = count;
					console.log("POST");
				},
				(error) => {
					console.log(error);
				}
			);
		intervalCount = 0;
	}

	let attempt = 0;
	async function fetchLeaderboard() {
		await axios
			.get("https://api.pophq.net/leaderboards")
			.then((resp) => {
				console.log("Fetched");
				//console.log(resp)
				var teams = resp.data.data.teams;
				var total = resp.data.data.click_total;
				totalCount = total;
				schoolsScore.DS = teams[2].scores;
				schoolsScore.AC = teams[0].scores;
				schoolsScore.SK = teams[3].scores;
				schoolsScore.BC = teams[1].scores;
				attempt = 0;
			})
			.catch((err) => {
				console.log(`Fetching... x${attempt++}`);
				console.error(err);
			});
	}

	if (getCookie("token") == undefined) {
		getToken();
	}

	openOption();
	fetchLeaderboard();

	setInterval(() => {
		if (attempt) return;
		submitCount();
		fetchLeaderboard();
	}, 30000);
</script>

<svelte:head>
	<title>POPจตุรมิตร</title>
	<meta name="title" content="POPจตุรมิตร" />
	<meta name="description" content="POPจตุรมิตร" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta property="og:url" content="https://popjaturamitr.vercel.app" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="POPจตุรมิตร" />
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1, maximum-scale=1,user-scalable=0"
	/>
	<meta
		property="og:description"
		content="'ในเมื่อไม่มีจตุรมิตรในปีนี้ ทำไมเราไม่ทำแข่งคลิ๊กระหว่าง 4 โรงเรียนกันหล่ะครับ โรงเรียนไหนจะว่างมาคลิ๊กมากที่สุด'"
	/>
	<meta property="og:image" content="" />
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script
		async
		src="https://www.googletagmanager.com/gtag/js?id=G-K29MB7ZWZV"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag("js", new Date());
		gtag("config", "G-K29MB7ZWZV");
	</script>
</svelte:head>

<svelte:body
	on:keydown={incCount}
	on:keyup={unlockDebounce}
	on:mousedown={incCount}
	on:mouseup={unlockDebounce} />

<main
	class={tw`w-full h-screen flex flex-col items-center justify-center bg-gray-200 select-none`}
	style="background: url({imgUrls[
		school
	]}) center center / cover; touch-action: manipulation;"
>
	<div class="translucent">
		<div
			class={tw`text-4xl bg-gray-900 text-white p-2 rounded-sm title text-center`}
		>
			<p>POP จตุรมิตร<sub class={tw`text-sm`}>beta</sub></p>
		</div>

		<div class={tw`m-4`}>
			<div
				class={tw`text-4xl bg-gray-900 text-white p-2 rounded-sm text-center`}
			>
				<p>{$count}</p>
			</div>
			<br />
			<div
				class={tw`text-4xl bg-gray-900 text-white p-2 rounded-sm text-center`}
			>
				<p>Total: {totalCount}</p>
			</div>
		</div>

		<div class={tw`m-4`}>
			<div class={tw`text-2xl bg-gray-900 text-white p-2 rounded-md`}>
				คุณอยู่โรงเรียน
				{#if school == "DS"}
					เทพศิรินทร์
				{:else if school == "AC"}
					อัสสัมชัญ
				{:else if school == "SK"}
					สวนกุหลาบ
				{:else if school == "BC"}
					กรุงเทพคริสเตียน
				{/if}
			</div>
		</div>

		<div class={tw`rounded-lg bg-white text-xl text-gray-900 p-2 m-4`}>
			<p>เทพศิรินทร์ : {schoolsScore.DS}</p>
			<p>อัสสัมชัญ : {schoolsScore.AC}</p>
			<p>สวนกุหลาบ : {schoolsScore.SK}</p>
			<p>กรุงเทพคริสเตียน : {schoolsScore.BC}</p>
		</div>
	</div>
</main>

<div id="popcat" class={tw`select-none `} on:click={incCount}>
	<img src={popUrls[popIndex]} alt="popcat" draggable="false" />
</div>

<div class="overlay noselect" on:click={incCount}>
	<div
		on:click={openOption}
		class="menu bg-gray-900 text-white p-2 text-2xl rounded-sm text-center"
	>
		<p class="text-center">☰ School</p>
	</div>
</div>

<div class="popup text-xl" on:click={closeOption} style="display: {popup}">
	<select
		bind:value={school}
		class={tw`rounded-sm bg-gray-900 text-white p-2 m-4 text-2xl`}
	>
		<option value="NN" id="NN">เลือกโรงเรียน</option>
		<option value="DS" id="DS">เทพศิรินทร์</option>
		<option value="AC" id="AC">อัสสัมชัญ</option>
		<option value="SK" id="SK">สวนกุหลาบ</option>
		<option value="BC" id="BC">กรุงเทพคริสเตียน</option>
	</select>
</div>

<style>
	@import url("https://fonts.googleapis.com/css2?family=Prompt&display=swap");

	* {
		font-family: Prompt;
		box-sizing: border-box;
		touch-action: manipulation;
	}

	p,
	img {
		pointer-events: none;
	}

	.noselect {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	#popcat {
		position: absolute;
		height: auto;
		width: 35vw;
		top: 0px;
		right: 0px;
		user-select: none;
		-moz-transform: scale(-1, -1);
		-o-transform: scale(-1, -1);
		-webkit-transform: scale(-1, -1);
		transform: scale(-1, -1);
		max-width: 500px;
	}

	.menu {
		background: #000;
		padding: 10px;
		width: auto;
	}
	.popup select {
		transform: translateY(-250%);
	}
	.score {
		width: 50vw;
		max-width: 500px;
	}
	.title {
		width: 50vw;
		max-width: 500px;
	}

	.translucent {
		background: rgba(0, 0, 0, 0.5);
		padding: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
</style>
