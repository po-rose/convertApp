import {
	CustomSeriesPricePlotValues,
	ICustomSeriesPaneView,
	PaneRendererCustomData,
	WhitespaceData,
	Time,
} from 'lightweight-charts';
import { HLLineSeriesOptions, defaultOptions } from './options.ts';
import { HLLineSeriesRenderer } from './renderer.ts';
import { HLLineData } from './data.ts';

export class HLLineSeries<TData extends HLLineData>
	implements ICustomSeriesPaneView<Time, TData, HLLineSeriesOptions>
{
	_renderer: HLLineSeriesRenderer<TData>;

	constructor() {
		this._renderer = new HLLineSeriesRenderer();
	}

	priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
		return [plotRow.value];
	}

	isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
		return (data as Partial<TData>).value === undefined;
	}

	renderer(): HLLineSeriesRenderer<TData> {
		return this._renderer;
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: HLLineSeriesOptions
	): void {
		this._renderer.update(data, options);
	}

	defaultOptions() {
		return defaultOptions;
	}
}
