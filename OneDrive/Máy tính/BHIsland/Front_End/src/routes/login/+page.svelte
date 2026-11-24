<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Đăng nhập · GIsland</title></svelte:head>

<section class="page narrow">
	<p class="eyebrow">Chào mừng trở lại</p>
	<h1>Đăng nhập</h1>
	<div class="card stack">
		{#if data.verified}<p class="notice" role="status">Email đã xác minh. Bạn có thể đăng nhập.</p>{/if}
		{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
		<form method="POST" use:enhance class="stack">
			<div class="form-field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required /></div>
			<div class="form-field"><label for="password">Mật khẩu</label><input id="password" name="password" type="password" autocomplete="current-password" required /></div>
			<button class="button" type="submit">Đăng nhập</button>
		</form>
		<p class="muted"><a href="/forgot-password">Quên mật khẩu?</a> · Chưa có tài khoản? <a href="/register">Tham gia GIsland</a></p>
	</div>
</section>
