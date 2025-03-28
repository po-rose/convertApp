// Function to calculate the highest value in an array
function highest(arr, length) {
    return Math.max(...arr.slice(-length));
}

// Function to calculate the lowest value in an array
function lowest(arr, length) {
    return Math.min(...arr.slice(-length));
}

const calculateMomentum = (prices, rate, smoothness) => {
    let previousMomentum = 0;
    return prices.map((price, index) => {
        if (index < rate) return 0;
        let momentum = (price - prices[index - rate]) / rate;
        let alpha = 2 / (smoothness + 1);
        previousMomentum = (alpha * momentum) + (1 - alpha) * (previousMomentum || 0);
        return previousMomentum;
    });
};

const getBands = (momentumArray, bandLength, bandMultiple) => {
    let upperBand = [];
    let lowerBand = [];
    for(let i = 0; i < bandLength; i++){        
        upperBand.push(0);
        lowerBand.push(0);
    }
    for (let i = bandLength; i < momentumArray.length; i++) {
        let highestV = highest (momentumArray.slice(i - bandLength, i), bandLength);       
        let lowestV = lowest(momentumArray.slice(i - bandLength, i), bandLength);
        let bandDiff = highestV - lowestV;
        let deviation = bandDiff * (bandMultiple / 100);
        upperBand.push(lowestV + deviation);
        lowerBand.push(highestV - deviation);
    }
    return { upperBand, lowerBand };
};

export const generateMomentumSignals = (prices, rate = 87, smoothness = 13, bandLength = 81, bandMultiple = 71, level = true ) => {
    if (prices.length < rate) return { momentumValues: [], upperBand: null, lowerBand: null, signals: [] };
    let momentumValues = calculateMomentum(prices, rate, smoothness);
    let { upperBand, lowerBand } = getBands(momentumValues, bandLength, bandMultiple);

    let color = [];
    for (let i = 1; i < momentumValues.length; i++) {
        if (momentumValues[i-1] >= upperBand[i-1] && momentumValues[i]<upperBand[i]) color.push('red');
        else if (momentumValues[i-1] <= lowerBand[i-1] && momentumValues[i]>lowerBand[i]) color.push('green');
        else color.push('teal');
    }
    return { momentumValues, color, upperBand, lowerBand };
};

// Example Usage:
// const prices = [100, 101, 102, 103, 105, 107, 110, 108, 106, 104, 102, 101, 100];
// const result = generateMomentumSignals(prices);
// console.log(result);