import { sanitize } from "./sanitize";

export function convertToWebp(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            canvas.getContext('2d')!.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            canvas.toBlob(blob => {
                if (!blob) return reject(new Error('Conversion failed'));

                const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
                const sanitizedName = sanitize(nameWithoutExt) + '.webp';

                resolve(new File([blob], sanitizedName, { type: 'image/webp' }));
            }, 'image/webp', 0.85);
        };

        img.onerror = () => reject(new Error(`Cannot load image: ${file.name}`));
        img.src = url;
    });
}