<script lang="ts">
	import { enhance } from '$app/forms';
	import MediaPicker from '#lib/components/MediaPicker.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let coverMediaId = $state<string | null>(null);
</script>

<svelte:head><title>Gara của tôi · GIsland</title></svelte:head>
<section class="page">
	<div class="heading row"><div><p class="eyebrow">Bộ sưu tập của bạn</p><h1>Gara phương tiện</h1></div><a class="button button-secondary" href="/settings/profile">Hồ sơ của tôi</a></div>
	{#if form?.success}<p class="notice" role="status">Phương tiện đã được thêm vào gara.</p>{/if}
	{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
	<div class="grid vehicle-grid">
		{#each data.vehicles.items as vehicle (vehicle.id)}
			<article class="card vehicle-card">
				{#if vehicle.coverUrl}<img class="media-preview" src={vehicle.coverUrl} alt="Ảnh của {vehicle.title}" />{/if}
				<p class="eyebrow">{vehicle.vehicleType}</p><h2>{vehicle.title}</h2>
				<p class="muted">{[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' · ') || 'Chưa thêm thông tin chi tiết'}</p>
				<p>{vehicle.description ?? ''}</p>
				<a class="button button-secondary" href={`/garage/${vehicle.id}/edit`}>Chỉnh sửa</a>
			</article>
		{:else}
			<div class="card empty"><h2>Gara đang chờ chuyến đi đầu tiên.</h2><p class="muted">Thêm phương tiện để gắn vào hồ sơ và câu chuyện của bạn.</p></div>
		{/each}
	</div>
	{#if data.vehicles.nextCursor}<p class="row pagination"><a class="button button-secondary" href={`/garage?limit=20&cursor=${encodeURIComponent(data.vehicles.nextCursor)}`}>Xem thêm phương tiện</a></p>{/if}
</section>

<section class="page narrow create-section">
	<h2>Thêm phương tiện</h2>
	<form method="POST" use:enhance class="card stack">
		<div class="form-field"><label for="vehicleType">Loại phương tiện</label><select id="vehicleType" name="vehicleType" required><option value="">Chọn loại</option>{#each data.types as type}<option value={type.slug}>{type.name}</option>{/each}</select></div>
		<div class="form-field"><label for="title">Tên trong gara</label><input id="title" name="title" maxlength="120" required /></div>
		<div class="form-field"><label for="make">Hãng</label><input id="make" name="make" maxlength="80" /></div>
		<div class="form-field"><label for="model">Dòng xe</label><input id="model" name="model" maxlength="100" /></div>
		<div class="form-field"><label for="year">Năm sản xuất</label><input id="year" name="year" type="number" min="1886" max="2100" /></div>
		<div class="form-field"><label for="description">Mô tả</label><textarea id="description" name="description" maxlength="2000"></textarea></div>
		<div class="form-field"><label for="visibility">Ai có thể xem?</label><select id="visibility" name="visibility"><option value="public">Công khai</option><option value="followers">Người theo dõi</option><option value="private">Chỉ mình tôi</option></select></div>
		<MediaPicker bind:value={coverMediaId} label="Ảnh phương tiện" />
		<input type="hidden" name="coverMediaId" value={coverMediaId ?? ''} />
		<button class="button" type="submit">Thêm vào gara</button>
	</form>
</section>

<style>
	.heading { justify-content: space-between; align-items: flex-end; margin-bottom: 28px; }
	.heading h1 { margin-bottom: 0; }
	.vehicle-grid { margin-bottom: 26px; }
	.vehicle-card { display: grid; align-content: start; gap: 8px; }
	.vehicle-card h2, .vehicle-card p { margin-bottom: 0; }
	.vehicle-card .media-preview { width: 100%; aspect-ratio: 16 / 10; }
	.empty { grid-column: 1 / -1; }
	.create-section { margin-top: 64px; }
	.create-section h2 { font-size: 1.6rem; }
	.pagination { justify-content: center; }
	@media (max-width: 600px) { .heading { align-items: flex-start; flex-direction: column; } }
</style>
