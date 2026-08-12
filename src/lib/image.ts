// Comprime imagens no navegador antes do envio (reduz o tamanho de fotos de
// celular, que costumam vir com vários MB). PDFs e arquivos não-imagem passam
// direto, sem alteração.
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.75
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    // Se a compressão não ajudou (arquivo já pequeno), mantém o original.
    if (blob.size >= file.size) return file;

    const novoNome = file.name.replace(/\.(heic|heif|png|jpeg)$/i, "") + ".jpg";
    return new File([blob], novoNome, { type: "image/jpeg" });
  } catch {
    // Se o navegador não conseguir processar (formato não suportado etc.),
    // envia o arquivo original mesmo.
    return file;
  }
}
