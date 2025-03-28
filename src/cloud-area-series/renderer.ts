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
import { CloudAreaData } from './data';
import { CloudAreaSeriesOptions } from './options';

interface CloudAreaBarItem {
	x: number;
	top: number;
	medium: number;
	low: number;
	bottom: number;
	topColor: string;
	mediumColor: string;
	lowColor: string;
}

export class CloudAreaSeriesRenderer<TData extends CloudAreaData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: CloudAreaSeriesOptions | null = null;

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
		options: CloudAreaSeriesOptions
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
		const bars: CloudAreaBarItem[] = this._data.bars.map(bar => {
			return {
				x: bar.x * renderingScope.horizontalPixelRatio,
				top: priceToCoordinate(bar.originalData.f1)! * renderingScope.verticalPixelRatio,
				medium: priceToCoordinate(bar.originalData.f2)! * renderingScope.verticalPixelRatio,
				low: priceToCoordinate(bar.originalData.f3)! * renderingScope.verticalPixelRatio,
				bottom: priceToCoordinate(bar.originalData.f4)! * renderingScope.verticalPixelRatio,
				topColor: bar.originalData.color1,
				mediumColor: bar.originalData.color2,
				lowColor: bar.originalData.color3
			};
		});
		const ctx = renderingScope.context;
		for (
			let i = this._data.visibleRange.from;
			i < this._data.visibleRange.to - 1;
			i++
		) {
			ctx.beginPath();
			ctx.moveTo(bars[i].x, bars[i].medium); // Move to the first point	
			// Draw lines to each subsequent point
			ctx.lineTo(bars[i].x, bars[i].top);  // Draw line to each point
			ctx.lineTo(bars[i+1].x, bars[i+1].top);
			ctx.lineTo(bars[i+1].x, bars[i+1].medium);
			ctx.closePath();  // Close the path (connect back to the first point)	
			ctx.fillStyle = bars[i].topColor;  // Semi-transparent blue
			ctx.fill();  // Fill the shape

			ctx.beginPath();
			ctx.moveTo(bars[i].x, bars[i].low); // Move to the first point	
			// Draw lines to each subsequent point
			ctx.lineTo(bars[i].x, bars[i].medium);  // Draw line to each point
			ctx.lineTo(bars[i+1].x, bars[i+1].medium);
			ctx.lineTo(bars[i+1].x, bars[i+1].low);
			ctx.closePath();  // Close the path (connect back to the first point)	
			ctx.fillStyle = bars[i].mediumColor;  // Semi-transparent blue
			ctx.fill();  // Fill the shape

			ctx.beginPath();
			ctx.moveTo(bars[i].x, bars[i].bottom); // Move to the first point	
			// Draw lines to each subsequent point
			ctx.lineTo(bars[i].x, bars[i].low);  // Draw line to each point
			ctx.lineTo(bars[i+1].x, bars[i+1].low);
			ctx.lineTo(bars[i+1].x, bars[i+1].bottom);
			ctx.closePath();  // Close the path (connect back to the first point)	
			ctx.fillStyle = bars[i].lowColor;  // Semi-transparent blue
			ctx.fill();  // Fill the shape
		}
		ctx.beginPath();
		const topLine = new Path2D();
		const mediumLine = new Path2D();
		const lowLine = new Path2D();
		const bottomLine = new Path2D();
		
		// We draw the close line in reverse so that it is
		// to reuse the Path2D to create the filled areas.
		const lastBar = bars[this._data.visibleRange.to - 1];
		topLine.moveTo(lastBar.x, lastBar.top);
		mediumLine.moveTo(lastBar.x, lastBar.medium);
		lowLine.moveTo(lastBar.x, lastBar.low);
		bottomLine.moveTo(lastBar.x, lastBar.bottom);

		for (
			let i = this._data.visibleRange.to - 2;
			i >= this._data.visibleRange.from;
			i--
		) {
			const bar = bars[i];
			topLine.lineTo(bar.x, bar.top);
			mediumLine.lineTo(bar.x, bar.medium);
			lowLine.lineTo(bar.x, bar.low);
			bottomLine.lineTo(bar.x, bar.bottom);

		}
		ctx.lineJoin = 'round';
		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth * renderingScope.verticalPixelRatio;
		ctx.stroke(topLine);
		ctx.stroke(mediumLine);
		ctx.stroke(lowLine);
		ctx.stroke(bottomLine);

	}
}
