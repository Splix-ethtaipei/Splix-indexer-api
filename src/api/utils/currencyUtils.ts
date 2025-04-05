import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.CURRENCY_FREAKS_API_KEY;
const API_URL = 'https://api.currencyfreaks.com/latest';

/**
 * Cleans up the string by removing markdown code block formatting
 * @param str The string to clean (remove ```json\n|````)
 * @returns The cleaned string
 */
function cleanString(str: string): string {
  return str.replace(/```json\n|```/g, '').trim();
}

/**
 * Convert amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The source currency code
 * @param toCurrency The target currency code
 * @returns The converted amount
 */
export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  try {
    // For demo purposes, use a fixed conversion rate if API key is not available
    if (!API_KEY) {
      console.log('No API key found, using fixed conversion rate');
      // Use approximate TWD to USD rate (30 TWD ≈ 1 USD)
      // for hack reason, only TWD is used.
      if (fromCurrency === 'TWD' && toCurrency === 'USD') {
        return Number((amount / 30).toFixed(2));
      } else {
        return amount; // Return original amount if unsupported conversion
      }
    }
    
    // Make API call to get current rates
    const response = await axios.get(`${API_URL}?apikey=${API_KEY}`);
    
    if (!response.data || !response.data.rates) {
      throw new Error('Invalid API response format');
    }
    
    // CurrencyFreaks returns rates with USD as base
    const rates = response.data.rates;
    
    // Convert from source currency to USD first (if needed)
    let amountInUsd = amount;
    if (fromCurrency !== 'USD') {
      if (!rates[fromCurrency]) {
        throw new Error(`Exchange rate for ${fromCurrency} not found`);
      }
      amountInUsd = amount / Number(rates[fromCurrency]);
    }
    
    // Then convert from USD to target currency
    if (toCurrency === 'USD') {
      return Number(amountInUsd.toFixed(2));
    }
    
    if (!rates[toCurrency]) {
      throw new Error(`Exchange rate for ${toCurrency} not found`);
    }
    
    const result = amountInUsd * Number(rates[toCurrency]);
    return Number(result.toFixed(2));
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fall back to fixed conversion for TWD to USD
    if (fromCurrency === 'TWD' && toCurrency === 'USD') {
      console.log('Falling back to fixed conversion rate');
      return Number((amount / 30).toFixed(2));
    }
    return amount; // Return original amount on error
  }
}

/**
 * Enriches receipt data with USD conversion
 * @param receiptData The receipt data with NTD currency
 * @returns Receipt data with added USD conversions
 */
export async function enrichWithUsdConversion(receiptData: any): Promise<any> {
  try {
    if (!receiptData) return receiptData;
    const cleanedReceiptData = cleanString(JSON.stringify(receiptData));
    const enrichedData = { ...JSON.parse(cleanedReceiptData) };
    
    // Convert each item price
    if (Array.isArray(enrichedData.items)) {
      for (const item of enrichedData.items) {
        if (item.price && (item.currency === 'NTD' || item.currency === 'TWD')) {
          item.price_usd = await convertCurrency(item.price, 'TWD', 'USD');
        }
      }
    }
    
    // Convert total amount
    if (enrichedData.total && (enrichedData.currency === 'NTD' || enrichedData.currency === 'TWD')) {
      enrichedData.total_usd = await convertCurrency(enrichedData.total, 'TWD', 'USD');
      enrichedData.currency_usd = 'USD';
    }
    
    return enrichedData;
  } catch (error) {
    console.error('Error enriching receipt with USD conversion:', error);
    // Return original data if conversion fails
    return receiptData;
  }
}
