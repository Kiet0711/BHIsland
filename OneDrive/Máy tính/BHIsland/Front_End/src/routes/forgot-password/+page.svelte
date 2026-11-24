<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
</script>

<svelte:head><title>Đặt lại mật khẩu · GIsland</title></svelte:head>
<section class="page narrow">
	<p class="eyebrow">Khôi phục tài khoản</p><h1>Quên mật khẩu?</h1>
	<div class="card stack">
		{#if form?.success}
			<p class="notice" role="status">Nếu tài khoản tồn tại, hướng dẫn đặt lại sẽ được gửi. Môi trường local có thể xem trong <a href="/__dev/mailbox">hộp thư thử nghiệm</a>.</p>
		{:else}
			<p class="muted">Nhập email đã đăng ký. Phản hồi sẽ giống nhau dù tài khoản có tồn tại hay không.</p>
			{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
			<form method="POST" use:enhance class="stack">
				<div class="form-field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required /></div>
				<button class="button" type="submit">Gửi hướng dẫn</button>
			</form>
		{/if}
		<a class="muted" href="/login">Quay lại đăng nhập</a>
	</div>
</section>
