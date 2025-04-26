// Replace with your Moralis API key
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI3MDFkMGIzLTY4ZmEtNDAzMi04MmIwLTc2OTgwNTQ0N2Y5ZCIsIm9yZ0lkIjoiNDM5MTAzIiwidXNlcklkIjoiNDUxNzQ2IiwidHlwZUlkIjoiZDVjMDgyOTQtMTU3ZS00MWQzLTliYjktOTAyMTZiZjhmM2FkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDM1MDg2MDcsImV4cCI6NDg5OTI2ODYwN30.crJy-Cvuwn1__g-0EHPooLV95VsUB7NGmBzsG_R3KTk';

// Define the API endpoint and parameters

// Fetch OHLCV data
export async function getOHLCData(pairAddress, interval, isAdd, currency) {
  const endpoint = `https://solana-gateway.moralis.io/token/mainnet/pairs/${pairAddress}/ohlcv`;
  const isShortInterval = ['1s', '10s', '30s'].includes(interval);
  const count = isAdd ? 1 : (isShortInterval ? 200 : 1000);
  interval = interval.replace('m', 'min');
  
  let chart_data = [];
  
  if (isShortInterval && !isAdd) {
    // For short intervals, fetch 5 times with 200 records each
    let toDate = new Date().toISOString();
    const initial_data = [];
    for (let i = 0; i < 5; i++) {
      console.log(toDate);
      const params = new URLSearchParams({
        timeframe: interval,
        currency: currency,
        fromDate: '2025-01-01T00:00:00Z',
        toDate: toDate,
        limit: count,
      });
      
      const url = `${endpoint}?${params.toString()}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-API-Key': MORALIS_API_KEY,
        },
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.result);
        if (data.result.length > 0) {
          // Update toDate for next batch using the timestamp of the first record
          toDate = new Date(data.result[data.result.length-1].timestamp);            
          toDate.setTime(toDate.getTime() - 1000);
          toDate = toDate.toISOString();
          initial_data.push(...data.result);
        }  
      } catch (error) {
        console.error(`Error fetching OHLCV data for batch ${i + 1}:`, error);
      }
    }
    console.log(initial_data)
    if (initial_data.length > 2) {
      for (let j = initial_data.length - 2; j >= 0; j--) {
        let item = initial_data[j];
        chart_data.push({
          time: new Date(item.timestamp).getTime() / 1000,
          open: initial_data[j + 1].close,
          high: item.high,
          low: item.low,
          close: item.close,
        });
      }
    }
  } else {
    // For other intervals or when adding new data, fetch once
    const params = new URLSearchParams({
      timeframe: interval,
      currency: currency,
      fromDate: '2025-01-01T00:00:00Z',
      toDate: new Date().toISOString(),
      limit: count,
    });
    
    const url = `${endpoint}?${params.toString()}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': MORALIS_API_KEY,
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.result);
      
      if (!isAdd) {
        if (data.result.length > 2) {
          for (let i = data.result.length - 2; i >= 0; i--) {
            let item = data.result[i];
            chart_data.push({
              time: new Date(item.timestamp).getTime() / 1000,
              open: data.result[i + 1].close,
              high: item.high,
              low: item.low,
              close: item.close,
            });
          }
        }
      } else {
        const item = data.result[0];
        chart_data.push({
          time: new Date(item.timestamp).getTime() / 1000,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        });
      }
    } catch (error) {
      console.error('Error fetching OHLCV data:', error);
    }
  }
  return chart_data;
}

// Execute the function
// getOHLCData();
