<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>GIsland — Cộng đồng chơi mọi loại phương tiện</title>
	<meta name="description" content="Chia sẻ hành trình, giới thiệu gara và khám phá cộng đồng chơi mọi loại phương tiện." />
</svelte:head>

<section class="page hero">
	<div class="hero-copy">
		<p class="eyebrow">Cộng đồng dành cho mọi hành trình</p>
		<h1>Mỗi chiếc xe đều có một câu chuyện.</h1>
		<p class="intro">GIsland là nơi người chơi nhiều loại phương tiện cùng giới thiệu gara, chia sẻ hành trình và tìm thấy những người chung đam mê.</p>
		<div class="row">
			{#if data.user}
				<a class="button" href="/garage">Mở gara của bạn</a>
				<a class="button button-secondary" href="/settings/profile">Hoàn thiện hồ sơ</a>
			{:else}
				<a class="button" href="/register">Tạo tài khoản</a>
				<a class="button button-secondary" href="/login">Đăng nhập</a>
			{/if}
		</div>
		<p class="microcopy">Xe máy · Ô tô · Xe đạp · Xe điện · Xe địa hình · Và nhiều hơn nữa</p>
	</div>
	<div class="hero-art" aria-hidden="true">
		<div class="sun"></div>
		<div class="road"></div>
		<div class="badge badge-one">01 <span>garage</span></div>
		<div class="badge badge-two">ride <span>together</span></div>
		<div class="bike">
			<div class="wheel wheel-left"></div><div class="wheel wheel-right"></div>
			<div class="frame"></div><div class="seat"></div><div class="handle"></div>
		</div>
	</div>
</section>

<section class="page pillars">
	<div><span>01</span><h2>Gara của bạn</h2><p>Giữ bộ sưu tập phương tiện trong một hồ sơ có cấu trúc.</p></div>
	<div><span>02</span><h2>Câu chuyện của bạn</h2><p>Đăng ảnh và ghi lại từng dự án, chuyến đi hay khoảnh khắc.</p></div>
	<div><span>03</span><h2>Cộng đồng của bạn</h2><p>Khám phá, theo dõi và trò chuyện qua những chiếc xe mình yêu thích.</p></div>
</section>

<style>
	.hero { min-height: 520px; display: grid; grid-template-columns: 1.1fr .9fr; align-items: center; gap: 28px; }
	.hero-copy { max-width: 620px; }
	h1 { max-width: 640px; margin-bottom: 20px; }
	.intro { max-width: 570px; color: #596b65; font-size: 1.12rem; line-height: 1.7; }
	.microcopy { margin-top: 28px; color: #6e7d77; font-size: .85rem; }
	.hero-art { position: relative; min-height: 390px; overflow: hidden; border-radius: 36px; background: linear-gradient(145deg, #dcece1, #a9cdb8 62%, #709f89); }
	.sun { position: absolute; top: 40px; right: 52px; width: 120px; height: 120px; border-radius: 50%; background: #e7b777; opacity: .9; }
	.road { position: absolute; left: -12%; right: -12%; bottom: -105px; height: 220px; border-radius: 50% 50% 0 0; transform: rotate(-8deg); background: #253a34; }
	.road::after { content: ''; position: absolute; top: 45px; left: 45%; width: 6px; height: 140px; border-radius: 4px; background: repeating-linear-gradient(to bottom, #e8d8ad 0 20px, transparent 20px 38px); transform: rotate(8deg); }
	.bike { position: absolute; left: 20%; bottom: 80px; width: 60%; height: 130px; }
	.wheel { position: absolute; bottom: 0; width: 82px; height: 82px; border: 8px solid #14231f; border-radius: 50%; background: #b8d3c1; }
	.wheel-left { left: 4px; }.wheel-right { right: 4px; }
	.frame { position: absolute; left: 60px; right: 68px; bottom: 38px; height: 70px; border: 9px solid #c26936; border-top-color: transparent; border-radius: 25% 55% 40% 35%; transform: skew(-12deg); }
	.seat { position: absolute; left: 78px; top: 28px; width: 60px; height: 10px; border-radius: 10px; background: #172722; transform: rotate(-7deg); }
	.handle { position: absolute; right: 44px; top: 30px; width: 34px; height: 45px; border-top: 8px solid #172722; border-right: 8px solid #172722; transform: rotate(15deg); }
	.badge { position: absolute; display: grid; gap: 2px; padding: 12px 16px; border: 1px solid #ffffff80; border-radius: 14px; background: #ffffffb8; color: #174c3c; font-size: 1.1rem; font-weight: 900; box-shadow: 0 12px 30px #174c3c18; }
	.badge span { color: #62716b; font-size: .72rem; font-weight: 650; }
	.badge-one { left: 24px; top: 26px; }.badge-two { right: 20px; bottom: 80px; }
	.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding-top: 0; }
	.pillars > div { padding: 24px; border-top: 1px solid #cbd8d2; }
	.pillars span { color: #b26436; font-size: .8rem; font-weight: 850; }
	.pillars h2 { margin: 12px 0 8px; font-size: 1.2rem; }
	.pillars p { color: #66746e; line-height: 1.6; }
	@media (max-width: 780px) { .hero { grid-template-columns: 1fr; min-height: auto; } .hero-art { min-height: 300px; } .pillars { grid-template-columns: 1fr; gap: 0; } }
</style>
