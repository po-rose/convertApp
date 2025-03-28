import { CustomData } from 'lightweight-charts';

/**
 * HLArea Series Data
 */
export interface HLAreaData extends CustomData {
	high: number;
	low: number;
	color: string;
}
