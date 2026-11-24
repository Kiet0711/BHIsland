<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Tạo mật khẩu mới · GIsland</title><meta name="referrer" content="no-referrer" /><meta name="robots" content="noindex, nofollow" /></svelte:head>
<section class="page narrow">
	<p class="eyebrow">Khôi phục tài khoản</p><h1>Tạo mật khẩu mới</h1>
	<div class="card stack">
		{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
		{#if data.token}
			<form method="POST" use:enhance class="stack">
				<input type="hidden" name="token" value={data.token} />
				<div class="form-field"><label for="newPassword">Mật khẩu mới</label><input id="newPassword" name="newPassword" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /><small>Tối thiểu 12 ký tự.</small></div>
				<button class="button" type="submit">Đặt mật khẩu mới</button>
			</form>
		{:else}
			<p class="muted">Liên kết thiếu token. Hãy yêu cầu đặt lại mật khẩu một lần nữa.</p>
			<a class="button" href="/forgot-password">Yêu cầu liên kết mới</a>
		{/if}
	</div>
</section>
