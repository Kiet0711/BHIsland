<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '#lib/components/MediaPicker.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let avatarMediaId = $state<string | null>(data.profile.avatarMediaId);
</script>

<svelte:head><title>Hồ sơ của tôi · GIsland</title></svelte:head>
<section class="page narrow">
	<p class="eyebrow">Tài khoản của bạn</p><h1>Chỉnh sửa hồ sơ</h1>
	<div class="card stack">
		{#if form?.success}<p class="notice" role="status">Hồ sơ đã được cập nhật.</p>{/if}
		{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
		<form method="POST" use:enhance class="stack">
			<div class="form-field"><label for="username">Tên đăng nhập</label><input id="username" value="@{data.profile.username}" disabled /></div>
			<div class="form-field"><label for="displayName">Tên hiển thị</label><input id="displayName" name="displayName" maxlength="80" value={data.profile.displayName} required /></div>
			<div class="form-field"><label for="bio">Giới thiệu</label><textarea id="bio" name="bio" maxlength="500">{data.profile.bio ?? ''}</textarea></div>
			<div class="form-field"><label for="locationText">Khu vực</label><input id="locationText" name="locationText" maxlength="120" value={data.profile.locationText ?? ''} /></div>
			<div class="form-field"><label for="websiteUrl">Website</label><input id="websiteUrl" name="websiteUrl" type="url" maxlength="2048" value={data.profile.websiteUrl ?? ''} /></div>
			<div class="form-field"><label for="privacy">Quyền riêng tư hồ sơ</label><select id="privacy" name="privacy" value={data.profile.privacy}><option value="public">Công khai</option><option value="private">Riêng tư</option></select></div>
			<MediaPicker bind:value={avatarMediaId} currentUrl={data.profile.avatarUrl} label="Ảnh đại diện" />
			<input type="hidden" name="avatarMediaId" value={avatarMediaId ?? ''} />
			<button class="button" type="submit">Lưu hồ sơ</button>
		</form>
		<p class="muted">Email: {data.profile.email} {data.profile.emailVerifiedAt ? '· Đã xác minh' : '· Chưa xác minh'}</p>
	</div>
</section>
