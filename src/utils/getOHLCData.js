// Replace with your Moralis API key
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijg1NGJmMjk0LWVjY2ItNDczOC1hOWJiLWFiMGJhZDEyMThlNyIsIm9yZ0lkIjoiNDM2MTkxIiwidXNlcklkIjoiNDQ4NzMzIiwidHlwZUlkIjoiNGI4NWQ4ZWItZGRiOS00MmNmLWFlZGItZTQ1MjNiYTcxNTgwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDE4NzkyODgsImV4cCI6NDg5NzYzOTI4OH0.9jVmj5xqrd4oU0QWdyNSLlQ6zXTO2HjfYFMJj2qc9tA';

// Define the API endpoint and parameters

// Fetch OHLCV data
export async function getOHLCData(pairAddress, interval, isAdd) {
  const endpoint = `https://solana-gateway.moralis.io/token/mainnet/pairs/${pairAddress}/ohlcv`;
  const count = isAdd? 1:250;
  interval = interval.replace('m', 'min');
  if(interval==='5s' || interval==='15s') interval = '10s';
  const params = new URLSearchParams({
    timeframe: interval, // Timeframe options: 1s, 10s, 30s, 1min, 5min, 10min, 30min, 1h, 4h, 12h, 1d, 1w, 1M
    currency: 'native', // Currency options: usd, native
    fromDate: '2025-02-17T00:00:00Z', // Start date in ISO format
    toDate: new Date().toISOString(), // End date in ISO format
    limit: count, // Number of data points to retrieve
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
    const chart_data = [];
    if(!isAdd)
    {
      for(let i = data.result.length-2; i >= 0; i--) {
        let item = data.result[i];
        chart_data.push({
          time: new Date(item.timestamp).getTime()/1000,
          open: data.result[i+1].close,
          high: item.high,
          low: item.low,
          close: item.close,
        });
      }
    }
    else {
      const item = data.result[0];
      chart_data.push({
        time: new Date(item.timestamp).getTime()/1000,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      });
    }
    console.log(chart_data);

    return chart_data;
  } catch (error) {
    console.error('Error fetching OHLCV data:', error);
  }
}

// Execute the function
// getOHLCData();
