function wildMA(src, period, prevWMA) {
    // Calculate the new Wilders Moving Average
    let newWMA = prevWMA + ((src - prevWMA) / period);
    return newWMA;
}

// Function to calculate Simple Moving Average (SMA)
function sma(values_1, values_2,  period) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += values_1[i] - values_2[i];
    }
    return sum / period;
}

// Function to replace 'nz' logic (return 0 if value is NaN)
function nz(value) {
    return isNaN(value) ? 0 : value;
}

function trueRange(norm_h, norm_l, norm_c, ATRPeriod = 28, trailType = "modified") {
    const trueRange = [];
    for(let i = ATRPeriod; i < norm_h.length; i++) {
        const HiLo = Math.min(norm_h[i] - norm_l[i], 1.5 * nz(sma(norm_h.slice(i-ATRPeriod, i), norm_l.slice(i-ATRPeriod, i), ATRPeriod)));
        const HRef = norm_l[i] <= norm_h[i-1] ? norm_h[i] - norm_c[i-1] : (norm_h[i] - norm_c[i-1]) - 0.5 * (norm_l[i] - norm_h[i-1]);
        const LRef = norm_h[i] >= norm_l[i-1] ? norm_c[i-1] - norm_l[i] : (norm_c[i-1] - norm_l[i]) - 0.5 * (norm_l[i-1] - norm_h[i]);
        
        trueRange.push( (trailType === "modified") ? Math.max(HiLo, HRef, LRef) : Math.max(norm_h[i] - norm_l[i], Math.abs(norm_h[i] - norm_c[i-1]), Math.abs(norm_l[i] - norm_c[i-1])));
    }
    return trueRange;

}

export function generateSupportResistance(data, ATRPeriod = 28, ATRFactor = 5, trailType = "modified") {    
    const results = [];
    const norm_h = data.map((item)=> item.high);
    const norm_l = data.map((item)=> item.low);
    const norm_c = data.map((item)=> item.close);
    const trueRangeData = trueRange(norm_h, norm_l, norm_c);
    const trendUp = [];
    const trendDown = [];
    const trend = [];
    const trail = [];
    const ex = [];
    const fib1Level = 61.8, fib2Level = 78.6, fib3Level = 88.6;
    let preWildMA = 0;
    for (let i = ATRPeriod; i < data.length; i++) {
        let len = trend.length;
        let wildMAV = wildMA(trueRangeData[len], ATRPeriod, preWildMA);
        let loss = ATRFactor * wildMAV;
        let Up = norm_c[i] - loss;
        let Dn = norm_c[i] + loss;        
        preWildMA = wildMAV;
        // console.log(wildMAV)
        if(len===0){ 
            trendUp.push(Up);
            trendDown.push(Dn);
            trend.push(1);
            trail.push(Up);
            ex.push(0.0);
            continue;
        }
        // trend.push(norm_c[i] > trendDown[len-1]? 1 : norm_c[i] < trendUp[len-1]? -1 : trend[len-1]);
        trendUp.push(norm_c[i-1] > trendUp[len-1]? Math.max(Up, trendUp[len-1]) : Up );
        trendDown.push(norm_c[i-1] < trendDown[len-1]? Math.min(Dn, trendDown[len-1]) : Dn ); 
        trend.push(norm_c[i] > trendDown[len-1]? 1 : norm_c[i] < trendUp[len-1]? -1 : trend[len-1]);

        trail.push(trend[len-1]===1 ? trendUp[len-1] : trendDown[len-1]);
        ex.push(trend[len]-trend[len-1]===2? norm_h[i] : 
                trend[len-1]-trend[len]===2? norm_l[i] : 
                trend[len]===1? Math.max(ex[len-1], norm_c[i]) : 
                trend[len]===-1? Math.min(ex[len-1], norm_l[i]) : ex[len-1]);

        let f1 = ex[len] + (trail[len] - ex[len]) * fib1Level / 100;
        let f2 = ex[len] + (trail[len] - ex[len]) * fib2Level / 100;
        let f3 = ex[len] + (trail[len] - ex[len]) * fib3Level / 100;
        
        results.push({
            time: data[i].time,
            f1:f1,
            f2:f2,
            f3:f3,
            f4: trail[len],
            color3: trend[len]===1? 'rgba(45, 90, 33, 0.8)' : 'rgba(140, 52, 50, 0.8)',
            color2: trend[len]===1? 'rgba(45, 90, 33, 0.6)' : 'rgba(140, 52, 50, 0.6)',
            color1: trend[len]===1? 'rgba(45, 90, 33, 0.4)' : 'rgba(140, 52, 50, 0.4)'
        });        
    }
    return results;
}