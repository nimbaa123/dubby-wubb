// Client-side demo mixer: places each recording at its line's startTime and exports one WAV track.
// Server-side FFmpeg (app/api/render) can replace this later without touching the UI.
export async function mixToWav(items: { blob: Blob; start: number }[], totalSeconds: number): Promise<Blob> {
  const rate = 44100;
  const decoder = new AudioContext();
  const off = new OfflineAudioContext(1, Math.ceil(rate * totalSeconds), rate);
  for (const it of items) {
    const buf = await decoder.decodeAudioData(await it.blob.arrayBuffer());
    const src = off.createBufferSource();
    src.buffer = buf;
    src.connect(off.destination);
    src.start(it.start);
  }
  await decoder.close();
  const out = (await off.startRendering()).getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + out.length * 2));
  const w = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); view.setUint32(4, 36 + out.length * 2, true); w(8, "WAVEfmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); w(36, "data");
  view.setUint32(40, out.length * 2, true);
  out.forEach((s, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 32767, true));
  return new Blob([view], { type: "audio/wav" });
}
