import type { Selectable } from "@core/interface/Selectable";
import { SimplePixel } from "./PixelPool";

export class PixelGroup implements Selectable {
	public id: string = '';
	public pixelCount: number = 0;
	public pixels: SimplePixel[] = [];

	constructor(pixelCount = 0) {
		this.pixelCount = pixelCount;
		this.pixels = [];
	}
}
