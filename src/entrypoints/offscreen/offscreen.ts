async function captureScreen(): Promise<{ dataUrl: string }> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });

  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;

  await video.play();
  await new Promise((r) => setTimeout(r, 300)); // allow frame to render

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0);

  // stop capture
  stream.getTracks().forEach((t) => t.stop());

  const dataUrl = canvas.toDataURL('image/png', 1);
  canvas.remove();
  video.remove();

  return { dataUrl };
}

const startCapture = async () => {
  const { dataUrl } = await captureScreen();
  await sendMessage(GENERAL_MESSAGES.SHOW_EDITOR);
  await sendMessage(GENERAL_MESSAGES.CLOSE_OFFSCREEN, { dataUrl });
};

startCapture();
