<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<svelte:head><title>Tạo tài khoản · GIsland</title></svelte:head>

<section class="page narrow">
	<p class="eyebrow">Bắt đầu hành trình</p>
	<h1>Tạo tài khoản</h1>
	<div class="card stack">
		{#if form?.success}
			<p class="notice" role="status">Nếu email hợp lệ, hướng dẫn xác minh đã được tạo. Trong môi trường local, mở <a href="/__dev/mailbox">hộp thư thử nghiệm</a> để lấy liên kết.</p>
		{:else}
			{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
			<form method="POST" use:enhance class="stack">
				<div class="form-field"><label for="displayName">Tên hiển thị</label><input id="displayName" name="displayName" autocomplete="name" maxlength="80" required /></div>
				<div class="form-field"><label for="username">Tên người dùng</label><input id="username" name="username" autocomplete="username" pattern="[A-Za-z0-9_]+" minlength="3" maxlength="30" required /><small>3–30 ký tự: chữ cái, số hoặc dấu gạch dưới.</small></div>
				<div class="form-field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required /></div>
				<div class="form-field"><label for="password">Mật khẩu</label><input id="password" name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required /><small>Dùng ít nhất 12 ký tự.</small></div>
				<button class="button" type="submit">Tạo tài khoản</button>
			</form>
		{/if}
		<p class="muted">Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
	</div>
</section>
