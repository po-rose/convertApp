// Function to calculate the highest value in an array
function highest(arr, length) {
    return Math.max(...arr.slice(-length));
}

// Function to calculate the lowest value in an array
function lowest(arr, length) {
    return Math.min(...arr.slice(-length));
}

// Function to calculate the Simple Moving Average (SMA)
function sma(arr, length) {
    let sum = 0;
    for (let i = 0; i < length; i++) {
        sum += arr[arr.length - i - 1];
    }
    return sum / length;
}

// H&L Trend Indicator Calculation
export function HLTrend(data, length = 36) {
    //@version=6
    // indicator("H&L Moving Average", "H&L Trend", overlay=true)
 
    // const close = data.map(d => parseFloat(d.close.toFixed(7)));  // Assuming 'data' contains 'close' values for each bar
    const close = data.map(d => d.close);

    const M = [];
    const M_hM = [];
    const M_lM = [];
    let chartData = [];
    let sma31="";
    for (let i = length; i < data.length; i++) {
        // Calculate H, L, and M for the current window
        const h = highest(close.slice(i - length , i ), length);
        const l = lowest(close.slice(i - length , i ), length);
        const m = (h + l) / 2;
        M.push(m);
        M_hM.push((h + m) / 2);
        M_lM.push((l + m) / 2);   
    }
    sma31 = sma(M.slice(0, 9), 9);
    for (let i = 10; i < M.length; i++) {
        // Calculate the SMAs
        const sma3 = sma(M.slice(i - 9, i), 9);
        const sma4 = sma(M_hM.slice(i - 9, i), 9);
        const sma5 = sma(M_lM.slice(i - 9, i), 9);

        // Conditions for long and short
        const long = close[i+length-1] > sma3 && sma3 > sma31; // Simplified condition
        const short = close[i+length-1] < sma3 && sma3 < sma31; // Simplified condition
        sma31 = sma3;
        chartData.push({
            time: data[i+length-3].time,
            low: sma5,
            high: sma4,
            close: sma3,
            color: long? 'rgba(76, 175, 80, 0.2)' : short? 'rgba(255, 82, 82, 0.2)' : 'rgba(255, 255, 255, 0.2)'
        })
    }
    return chartData;
}
