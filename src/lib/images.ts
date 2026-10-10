/** Redimensionne/compresse une image avant l'envoi (les photos de téléphone font souvent 5 Mo+). */
export async function prepareImage(
  file: File, maxWidth: number, keepAlpha: boolean,
): Promise<{ blob: Blob; ext: string; type: string }> {
  if (file.type === "image/svg+xml") return { blob: file, ext: "svg", type: file.type };
  const bmp = await createImageBitmap(file); // échoue pour les formats non supportés (ex. HEIC)
  const scale = Math.min(1, maxWidth / bmp.width);
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  if (!keepAlpha) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(bmp, 0, 0, w, h);
  const type = keepAlpha ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, type, 0.86));
  if (!blob) throw new Error("encode");
  return { blob, ext: keepAlpha ? "png" : "jpg", type };
}
