import { getPooledPixel, SimplePixel } from "./PixelPool";

export class PixelGroup {
	public id: string = '';
	public pixelCount: number = 0;
	public pixels: SimplePixel[] = [];

	constructor(pixelCount = 0) {
		this.pixelCount = pixelCount;
		this.pixels = [];
	}
}
