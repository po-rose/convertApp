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
import { HLLineData } from './data';
import { HLLineSeriesOptions } from './options';

interface HLLineBarItem {
	x: number;
	value: number;
	color: string;
}

export class HLLineSeriesRenderer<TData extends HLLineData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: HLLineSeriesOptions | null = null;

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
		options: HLLineSeriesOptions
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
		const bars: HLLineBarItem[] = this._data.bars.map(bar => {
			return {
				x: bar.x * renderingScope.horizontalPixelRatio,
				value: priceToCoordinate(bar.originalData.value)! * renderingScope.verticalPixelRatio,
				color: bar.barColor
			};
		});

		const ctx = renderingScope.context;
		const zero = priceToCoordinate(0)! * renderingScope.verticalPixelRatio
		
		for (
			let i = this._data.visibleRange.from + 1;
			i < this._data.visibleRange.to;
			i++
		) {
			ctx.fillStyle = bars[i].color;
			ctx.fillRect(bars[i].x, bars[i].value, options.lineWidth, zero-bars[i].value)			
		}
	}
}
