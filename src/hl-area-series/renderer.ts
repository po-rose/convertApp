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
import { HLAreaData } from './data';
import { HLAreaSeriesOptions } from './options';

interface HLAreaBarItem {
	x: number;
	high: number;
	low: number;
	color: string;
}

export class HLAreaSeriesRenderer<TData extends HLAreaData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: HLAreaSeriesOptions | null = null;

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
		options: HLAreaSeriesOptions
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
		const bars: HLAreaBarItem[] = this._data.bars.map(bar => {
			return {
				x: bar.x * renderingScope.horizontalPixelRatio,
				high: priceToCoordinate(bar.originalData.high)! * renderingScope.verticalPixelRatio,
				low: priceToCoordinate(bar.originalData.low)! * renderingScope.verticalPixelRatio,
				color: bar.originalData.color
			};
		});

		const ctx = renderingScope.context;
		ctx.beginPath();
		const lowLine = new Path2D();
		const highLine = new Path2D();
		const firstBar = bars[this._data.visibleRange.from];
		highLine.moveTo(firstBar.x, firstBar.high);
		for (
			let i = this._data.visibleRange.from + 1;
			i < this._data.visibleRange.to;
			i++
		) {
			const bar = bars[i];
			highLine.lineTo(bar.x, bar.high);
		}

		// We draw the close line in reverse so that it is
		// to reuse the Path2D to create the filled areas.
		const lastBar = bars[this._data.visibleRange.to - 1];
		lowLine.moveTo(lastBar.x, lastBar.low);
		for (
			let i = this._data.visibleRange.to - 2;
			i >= this._data.visibleRange.from;
			i--
		) {
			const bar = bars[i];
			lowLine.lineTo(bar.x, bar.low);
		}

		const topArea = new Path2D(highLine);
		topArea.lineTo(lastBar.x, lastBar.low);
		topArea.addPath(lowLine);
		topArea.lineTo(firstBar.x, firstBar.high);
		topArea.closePath();
		ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
		ctx.fill(topArea);

		ctx.lineJoin = 'round';
		ctx.strokeStyle = options.lowLineColor;
		ctx.lineWidth = options.lowLineWidth * renderingScope.verticalPixelRatio;
		ctx.stroke(lowLine);
		ctx.strokeStyle = options.highLineColor;
		ctx.lineWidth = options.highLineWidth * renderingScope.verticalPixelRatio;
		ctx.stroke(highLine);
	}
}
