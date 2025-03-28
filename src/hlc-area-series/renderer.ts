import {
	BitmapCoordinatesRenderingScope,
	CanvasRenderingTarget2D,
} from 'fancy-canvas';
import {
	ICustomSeriesPaneRenderer,
	PaneRendererCustomData,
	PriceToCoordinateConverter,
	Time,
} from 'lightweight-charts';
import { HLCAreaData } from './data';
import { HLCAreaSeriesOptions } from './options';

interface HLCAreaBarItem {
	x: number;
	high: number;
	low: number;
	close: number;
	color: string;
}

export class HLCAreaSeriesRenderer<TData extends HLCAreaData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: HLCAreaSeriesOptions | null = null;

	draw(
		target: CanvasRenderingTarget2D,
		priceConverter: PriceToCoordinateConverter
	): void {
		target.useBitmapCoordinateSpace(scope =>
			this._drawImpl(scope, priceConverter)
		);
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: HLCAreaSeriesOptions
	): void {
		this._data = data;
		this._options = options;
	}

	_drawImpl(
		renderingScope: BitmapCoordinatesRenderingScope,
		priceToCoordinate: PriceToCoordinateConverter
	): void {
		if (
			this._data === null ||
			this._data.bars.length === 0 ||
			this._data.visibleRange === null ||
			this._options === null
		) {
			return;
		}
		const options = this._options;
		const bars: HLCAreaBarItem[] = this._data.bars.map(bar => {
			return {
				x: bar.x * renderingScope.horizontalPixelRatio,
				high: priceToCoordinate(bar.originalData.high)! * renderingScope.verticalPixelRatio,
				low: priceToCoordinate(bar.originalData.low)! * renderingScope.verticalPixelRatio,
				close: priceToCoordinate(bar.originalData.close)! * renderingScope.verticalPixelRatio,
				color: bar.barColor,
			};
		});
		const ctx = renderingScope.context;
		
		for (
			let i = this._data.visibleRange.from;
			i < this._data.visibleRange.to - 1;
			i++
		) {
			ctx.beginPath();
			ctx.moveTo(bars[i].x, bars[i].low); // Move to the first point
	
			// Draw lines to each subsequent point
			ctx.lineTo(bars[i].x, bars[i].high);  // Draw line to each point
			ctx.lineTo(bars[i+1].x, bars[i+1].high);
			ctx.lineTo(bars[i+1].x, bars[i+1].low);

			ctx.closePath();  // Close the path (connect back to the first point)
	
			// Optionally, fill the shape with color
			ctx.fillStyle = bars[i].color;  // Semi-transparent blue
			ctx.fill();  // Fill the shape

		}
		ctx.beginPath();
		const closeLine = new Path2D();

		// We draw the close line in reverse so that it is
		// to reuse the Path2D to create the filled areas.
		const lastBar = bars[this._data.visibleRange.to - 1];
		closeLine.moveTo(lastBar.x, lastBar.close);
		for (
			let i = this._data.visibleRange.to - 2;
			i >= this._data.visibleRange.from;
			i--
		) {
			const bar = bars[i];
			closeLine.lineTo(bar.x, bar.close);
		}

		ctx.lineJoin = 'round';
		ctx.strokeStyle = options.closeLineColor;
		ctx.lineWidth = options.closeLineWidth * renderingScope.verticalPixelRatio;
		ctx.stroke(closeLine);
	}
}
