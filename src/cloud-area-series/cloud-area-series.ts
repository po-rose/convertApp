import {
	CustomSeriesPricePlotValues,
	ICustomSeriesPaneView,
	PaneRendererCustomData,
	WhitespaceData,
	Time,
} from 'lightweight-charts';
import { CloudAreaSeriesOptions, defaultOptions } from './options.ts';
import { CloudAreaSeriesRenderer } from './renderer.ts';
import { CloudAreaData } from './data.ts';

export class CloudAreaSeries<TData extends CloudAreaData>
	implements ICustomSeriesPaneView<Time, TData, CloudAreaSeriesOptions>
{
	_renderer: CloudAreaSeriesRenderer<TData>;

	constructor() {
		this._renderer = new CloudAreaSeriesRenderer();
	}

	priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
		return [plotRow.f1, plotRow.f2, plotRow.f3, plotRow.f4];
	}

	isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
		return (data as Partial<TData>).f4 === undefined;
	}

	renderer(): CloudAreaSeriesRenderer<TData> {
		return this._renderer;
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: CloudAreaSeriesOptions
	): void {
		this._renderer.update(data, options);
	}

	defaultOptions() {
		return defaultOptions;
	}
}
