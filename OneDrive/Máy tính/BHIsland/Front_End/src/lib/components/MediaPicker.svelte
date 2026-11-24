<script lang="ts">
	type Props = {
		value?: string | null;
		label?: string;
		currentUrl?: string | null;
	};
	let { value = $bindable(null), label = 'Chọn ảnh', currentUrl = null }: Props = $props();
	let status = $state('');
	let uploading = $state(false);
	let cleared = $state(false);
	let previewUrl = $derived(value ? `/api/v1/media/${value}/content` : cleared ? null : currentUrl);

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (file.size > 15 * 1024 * 1024) {
			status = 'Ảnh không được vượt quá 15 MB.';
			input.value = '';
			return;
		}
		if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
			status = 'Chọn ảnh JPEG, PNG, WebP hoặc AVIF.';
			input.value = '';
			return;
		}

		uploading = true;
		status = 'Đang chuẩn bị upload…';
		try {
			const intentResponse = await fetch('/api/v1/media/upload-intents', {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ filename: file.name, mimeType: file.type, byteSize: file.size })
			});
			if (!intentResponse.ok) throw new Error(await errorMessage(intentResponse));
			const intent = await intentResponse.json() as { mediaId: string; uploadUrl: string; method: 'PUT'; headers: Record<string, string> };
			status = 'Đang tải ảnh lên…';
			const uploadResponse = await fetch(intent.uploadUrl, {
				method: intent.method,
				credentials: 'same-origin',
				headers: intent.headers,
				body: file
			});
			if (!uploadResponse.ok) throw new Error(await errorMessage(uploadResponse));
			status = 'Đang kiểm tra và tối ưu ảnh…';
			const completeResponse = await fetch(`/api/v1/media/${intent.mediaId}/complete`, {
				method: 'POST',
				credentials: 'same-origin'
			});
			if (!completeResponse.ok) throw new Error(await errorMessage(completeResponse));
			value = intent.mediaId;
			cleared = false;
			status = 'Ảnh đã sẵn sàng.';
		} catch (error) {
			status = error instanceof Error ? error.message : 'Không thể tải ảnh lên.';
		} finally {
			uploading = false;
			input.value = '';
		}
	}

	async function errorMessage(response: Response): Promise<string> {
		try {
			const problem = await response.json() as { detail?: string; title?: string };
			return problem.detail ?? problem.title ?? 'Upload thất bại.';
		} catch {
			return 'Upload thất bại.';
		}
	}

	function clear() {
		value = null;
		cleared = true;
		status = 'Ảnh đã được bỏ khỏi biểu mẫu.';
	}
</script>

<div class="picker">
	<label class="form-field">
		<span>{label}</span>
		<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onchange={upload} disabled={uploading} />
	</label>
	{#if previewUrl}
		<img class="media-preview" src={previewUrl} alt="Ảnh xem trước" />
		<button class="button button-secondary" type="button" onclick={clear} disabled={uploading}>Bỏ ảnh</button>
	{/if}
	<p class="status" aria-live="polite">{status}</p>
</div>

<style>
	.picker { display: grid; gap: 10px; }
	.status { min-height: 1.2em; margin: 0; color: #65736e; font-size: .86rem; }
	input[type='file'] { border: 1px dashed #aebfb7; border-radius: 10px; padding: 10px; background: #f8faf9; }
</style>
