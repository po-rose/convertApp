import {
	CustomSeriesOptions,
	customSeriesDefaultOptions,
} from 'lightweight-charts';

export interface HLLineSeriesOptions extends CustomSeriesOptions {
	lineColor: string;
	lineWidth: number;
	lastValueVisible: boolean;
	priceLineVisible: boolean;
}

export const defaultOptions: HLLineSeriesOptions = {
	...customSeriesDefaultOptions,
	lineColor: '#049981',
	lineWidth: 2,
	lastValueVisible: false,
	priceLineVisible: false
} as const;
