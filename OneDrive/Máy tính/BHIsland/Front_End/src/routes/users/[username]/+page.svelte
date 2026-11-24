<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.profile.displayName} · GIsland</title>
	<meta name="description" content={data.profile.bio ?? `Hồ sơ của @${data.profile.username} trên GIsland.`} />
	<meta property="og:title" content={`${data.profile.displayName} · GIsland`} />
</svelte:head>

<section class="page narrow profile-card card">
	{#if data.profile.avatarUrl}<img class="avatar" src={data.profile.avatarUrl} alt="Ảnh đại diện của {data.profile.displayName}" />{:else}<div class="avatar avatar-fallback" aria-hidden="true">{data.profile.displayName.slice(0, 1).toUpperCase()}</div>{/if}
	<p class="eyebrow">@{data.profile.username}</p>
	<h1>{data.profile.displayName}</h1>
	{#if data.profile.bio}<p class="bio">{data.profile.bio}</p>{/if}
	<p class="muted">Tham gia {new Date(data.profile.createdAt).toLocaleDateString('vi-VN')}</p>
</section>

<style>
	.profile-card { text-align: center; }
	.avatar { width: 112px; height: 112px; margin: 0 auto 20px; border-radius: 50%; object-fit: cover; }
	.avatar-fallback { display: grid; place-items: center; background: #d8e8df; color: #174c3c; font-size: 2.8rem; font-weight: 800; }
	.profile-card h1 { font-size: 2.5rem; margin-bottom: 12px; }
	.bio { max-width: 420px; margin: 0 auto 18px; color: #40544c; white-space: pre-wrap; }
</style>
