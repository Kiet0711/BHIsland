<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Xác minh email · GIsland</title><meta name="referrer" content="no-referrer" /><meta name="robots" content="noindex, nofollow" /></svelte:head>
<section class="page narrow">
	<p class="eyebrow">Một bước cuối</p><h1>Xác minh email</h1>
	<div class="card stack">
		{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
		{#if data.token}
			<p class="muted">Dùng liên kết này một lần để kích hoạt tài khoản.</p>
			<form method="POST" use:enhance>
				<input type="hidden" name="token" value={data.token} />
				<button class="button" type="submit">Xác minh email</button>
			</form>
		{:else}
			<p class="muted">Thiếu token xác minh. Hãy mở liên kết trong email.</p>
		{/if}
	</div>
</section>
