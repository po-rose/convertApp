import {
	CustomSeriesOptions,
	customSeriesDefaultOptions,
} from 'lightweight-charts';

export interface HLAreaSeriesOptions extends CustomSeriesOptions {
	highLineColor: string;
	lowLineColor: string;
	highLineWidth: number;
	lowLineWidth: number;
	lastValueVisible: boolean;
	priceLineVisible: boolean;
}

export const defaultOptions: HLAreaSeriesOptions = {
	...customSeriesDefaultOptions,
	highLineColor: '#049981',
	lowLineColor: '#F23645',
	highLineWidth: 2,
	lowLineWidth: 2,
	lastValueVisible: false,
	priceLineVisible: false
} as const;
