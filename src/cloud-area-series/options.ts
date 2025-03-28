import {
	CustomSeriesOptions,
	customSeriesDefaultOptions,
} from 'lightweight-charts';

export interface CloudAreaSeriesOptions extends CustomSeriesOptions {
	lineColor: string;
	topColor: string;
	mediumColor: string;
	lowColor: string;
	lineWidth: number;
	lastValueVisible: boolean;
	priceLineVisible: boolean;
}

export const defaultOptions: CloudAreaSeriesOptions = {
	...customSeriesDefaultOptions,
	lineColor: 'rgba(0, 0, 0, 1)',
	topColor: 'rgba(242, 54, 69, 0.2)',
	mediumColor: 'rgba(4, 153, 129, 0.2)',
	lowColor: 'rgba(4, 153, 129, 0.2)',
	lineWidth: 2,
	lastValueVisible: false,
	priceLineVisible: false,
} as const;
