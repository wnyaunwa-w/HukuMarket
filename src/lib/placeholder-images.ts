import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

const imageMap = new Map(data.placeholderImages.map((image) => [image.id, image]));

export function getPlaceholderImage(id: string): ImagePlaceholder {
    const image = imageMap.get(id);
    if (!image) {
        throw new Error(`Image with id ${id} not found in placeholder-images.json`);
    }
    return image;
}
