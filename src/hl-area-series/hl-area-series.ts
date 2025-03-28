import {
	CustomSeriesPricePlotValues,
	ICustomSeriesPaneView,
	PaneRendererCustomData,
	WhitespaceData,
	Time,
} from 'lightweight-charts';
import { HLAreaSeriesOptions, defaultOptions } from './options.ts';
import { HLAreaSeriesRenderer } from './renderer.ts';
import { HLAreaData } from './data.ts';

export class HLAreaSeries<TData extends HLAreaData>
	implements ICustomSeriesPaneView<Time, TData, HLAreaSeriesOptions>
{
	_renderer: HLAreaSeriesRenderer<TData>;

	constructor() {
		this._renderer = new HLAreaSeriesRenderer();
	}

	priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
		return [plotRow.low, plotRow.high];
	}

	isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
		return (data as Partial<TData>).low === undefined;
	}

	renderer(): HLAreaSeriesRenderer<TData> {
		return this._renderer;
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: HLAreaSeriesOptions
	): void {
		this._renderer.update(data, options);
	}

	defaultOptions() {
		return defaultOptions;
	}
}
