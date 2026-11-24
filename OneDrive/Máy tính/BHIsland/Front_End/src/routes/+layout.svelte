<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	async function logout() {
		await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' });
		window.location.assign('/');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="site-shell">
	<header class="site-header">
		<a class="brand" href="/" aria-label="GIsland trang chủ">G<span>Island</span></a>
		<nav aria-label="Điều hướng chính">
			<a href="/">Khám phá</a>
			{#if data.user}
				<a href="/garage">Gara</a>
				<a href="/settings/profile">Hồ sơ</a>
				<button class="text-button" type="button" onclick={logout}>Đăng xuất</button>
			{:else}
				<a href="/login">Đăng nhập</a>
				<a class="button button-small" href="/register">Tham gia</a>
			{/if}
		</nav>
	</header>
	<main>{@render children()}</main>
	<footer class="site-footer">GIsland · Cộng đồng dành cho mọi hành trình.</footer>
</div>

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; background: #f4f6f7; color: #15221f; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
	:global(a) { color: inherit; text-decoration: none; }
	:global(button), :global(input), :global(select), :global(textarea) { font: inherit; }
	:global(button), :global(a), :global(input), :global(select), :global(textarea) { outline-offset: 3px; }
	:global(:focus-visible) { outline: 3px solid #c67828; }
	:global(h1), :global(h2), :global(p) { margin-top: 0; }
	:global(h1) { font-size: clamp(2rem, 5vw, 3.6rem); line-height: 1.08; letter-spacing: -0.04em; }
	:global(.page) { width: min(1120px, calc(100% - 32px)); margin: 48px auto 72px; }
	:global(.narrow) { max-width: 560px; }
	:global(.eyebrow) { color: #55736a; font-size: .78rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
	:global(.muted) { color: #63716e; }
	:global(.card) { background: #fff; border: 1px solid #e0e7e4; border-radius: 18px; padding: 24px; box-shadow: 0 8px 24px #16372b0a; }
	:global(.stack) { display: grid; gap: 16px; }
	:global(.form-field) { display: grid; gap: 7px; }
	:global(.form-field label) { color: #283c36; font-size: .9rem; font-weight: 700; }
	:global(.form-field input), :global(.form-field select), :global(.form-field textarea) { width: 100%; border: 1px solid #cad6d1; border-radius: 10px; background: #fff; padding: 12px 13px; color: #15221f; }
	:global(.form-field textarea) { min-height: 110px; resize: vertical; }
	:global(.button) { display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; padding: 12px 20px; background: #174c3c; color: #fff; font-weight: 750; cursor: pointer; }
	:global(.button:hover) { background: #103d30; }
	:global(.button-small) { padding: 9px 16px; }
	:global(.button-secondary) { border: 1px solid #b9cac3; background: #fff; color: #174c3c; }
	:global(.button-secondary:hover) { background: #eff5f2; }
	:global(.notice) { border-radius: 10px; padding: 12px 14px; background: #e8f4ed; color: #174c3c; }
	:global(.error) { border-radius: 10px; padding: 12px 14px; background: #fff0ed; color: #8b2b1e; }
	:global(.row) { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
	:global(.grid) { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
	:global(.media-preview) { display: block; max-width: 100%; max-height: 280px; border-radius: 12px; object-fit: cover; }
	.site-shell { min-height: 100vh; display: flex; flex-direction: column; }
	.site-header { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 0 max(24px, calc((100vw - 1120px) / 2)); background: #fff; border-bottom: 1px solid #e4ebe8; }
	.brand { font-size: 1.35rem; font-weight: 900; letter-spacing: -.06em; color: #174c3c; }
	.brand span { color: #202c29; }
	nav { display: flex; align-items: center; gap: clamp(10px, 2vw, 24px); font-size: .92rem; font-weight: 650; }
	.text-button { padding: 0; border: 0; background: none; color: #41524c; cursor: pointer; }
	main { flex: 1; }
	.site-footer { padding: 24px; text-align: center; color: #697873; font-size: .85rem; }
	@media (max-width: 600px) {
		.site-header { padding: 0 16px; min-height: 64px; }
		nav { gap: 12px; font-size: .82rem; }
		:global(.page) { margin-top: 32px; }
	}
</style>
