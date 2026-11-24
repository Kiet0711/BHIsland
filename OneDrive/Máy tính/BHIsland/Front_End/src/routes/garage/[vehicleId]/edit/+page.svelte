<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '#lib/components/MediaPicker.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let coverMediaId = $state<string | null>(data.vehicle.coverMediaId);
</script>

<svelte:head><title>Chỉnh sửa phương tiện · GIsland</title></svelte:head>
<section class="page narrow">
	<p class="eyebrow"><a href="/garage">Gara của tôi</a></p><h1>Chỉnh sửa phương tiện</h1>
	<div class="card stack">
		{#if form?.success}<p class="notice" role="status">Đã lưu thay đổi.</p>{/if}
		{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
		<form method="POST" use:enhance class="stack">
			<div class="form-field"><label for="vehicleType">Loại phương tiện</label><input id="vehicleType" name="vehicleType" value={data.vehicle.vehicleType} pattern="[a-z0-9-]+" required /></div>
			<div class="form-field"><label for="title">Tên trong gara</label><input id="title" name="title" maxlength="120" value={data.vehicle.title} required /></div>
			<div class="form-field"><label for="make">Hãng</label><input id="make" name="make" maxlength="80" value={data.vehicle.make ?? ''} /></div>
			<div class="form-field"><label for="model">Dòng xe</label><input id="model" name="model" maxlength="100" value={data.vehicle.model ?? ''} /></div>
			<div class="form-field"><label for="year">Năm sản xuất</label><input id="year" name="year" type="number" min="1886" max="2100" value={data.vehicle.year ?? ''} /></div>
			<div class="form-field"><label for="description">Mô tả</label><textarea id="description" name="description" maxlength="2000">{data.vehicle.description ?? ''}</textarea></div>
			<div class="form-field"><label for="visibility">Ai có thể xem?</label><select id="visibility" name="visibility" value={data.vehicle.visibility}><option value="public">Công khai</option><option value="followers">Người theo dõi</option><option value="private">Chỉ mình tôi</option></select></div>
			<MediaPicker bind:value={coverMediaId} currentUrl={data.vehicle.coverUrl} label="Ảnh phương tiện" />
			<input type="hidden" name="coverMediaId" value={coverMediaId ?? ''} />
			<button class="button" type="submit">Lưu thay đổi</button>
		</form>
		<form method="POST" action="?/delete" onsubmit={(event) => { if (!confirm('Xóa phương tiện này khỏi gara?')) event.preventDefault(); }}>
			<button class="button button-secondary" type="submit">Xóa phương tiện</button>
		</form>
	</div>
</section>
