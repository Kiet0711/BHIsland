<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>Hộp thư local · GIsland</title><meta name="robots" content="noindex, nofollow" /></svelte:head>
<section class="page">
	<p class="eyebrow">Chỉ dùng trong development</p><h1>Hộp thư thử nghiệm</h1>
	<p class="muted">Liên kết bên dưới chỉ tồn tại trên máy local và được lưu trong thư mục bị Git ignore.</p>
	{#if data.messages.length === 0}
		<div class="card"><p>Chưa có email. Tạo tài khoản hoặc yêu cầu đặt lại mật khẩu để bắt đầu.</p></div>
	{:else}
		<div class="stack">
			{#each data.messages as message (message.id)}
				<article class="card stack">
					<div class="row"><strong>{message.kind === 'verify-email' ? 'Xác minh email' : 'Đặt lại mật khẩu'}</strong><span class="muted">{new Date(message.createdAt).toLocaleString('vi-VN')}</span></div>
					<a href={message.link}>{message.link}</a>
				</article>
			{/each}
		</div>
	{/if}
</section>
