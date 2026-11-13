export const processStudentImage = (
  file: File,
  maxSize: number = 102400,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Please select a valid image"));
    }

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;
      if (typeof result !== "string") {
        return reject(new Error("Failed to read file as data URL."));
      }

      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          return reject(new Error("Could not get canvas rendering context."));
        }

        canvas.width = 150;
        canvas.height = 150;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 150, 150);

        const scale = Math.min(150 / img.width, 150 / img.height);
        const x = (150 - img.width * scale) / 2;
        const y = (150 - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Image processing failed"));
            }
            if (blob.size > maxSize) {
              return reject(
                new Error("Please upload an image that is under 100 KB."),
              );
            }
            const processedFile = new File([blob], file.name, {
              type: "image/jpeg",
            });
            resolve(processedFile);
          },
          "image/jpeg",
          0.9,
        );
      };

      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = result;
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
};
