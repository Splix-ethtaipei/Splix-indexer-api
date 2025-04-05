import { Express } from "express";
import axios from "axios";
import { enrichWithUsdConversion } from "./utils/currencyUtils";

const apiKey = process.env.GEMMA_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;


export const scanReceiptApi = (app: Express) => {
  app.post('/scan-receipt', async (req, res) => {
    if (!req.body.image) {
      res.status(400).json({ error: 'No image data provided' });
      return;
    }

    try {
      const base64Image = req.body.image;
      const payload = {
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            },
            {
              text: "The input is a receipt image. Please extract the following information and return it in clean JSON format without markdown formatting or code blocks. Just return the raw JSON data with the following fields: restaurant_name, location, phone_number, date, time, items (including name, quantity, price for each, and also add the currency (use NTD, USD, GBP, etc to specify)), tax, and total."
            }
          ]
        }]
      };

      const response = await axios.post(
        apiUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response.data.candidates[0].content);

      // Parse the receipt data from the response
      let receiptData;
      try {
        const textContent = response.data.candidates[0].content.parts[0].text;

        // Clean up the text content by removing markdown formatting
        let cleanedContent = textContent.trim();

        // Remove markdown code block formatting if present
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        receiptData = JSON.parse(cleanedContent);
        console.log('Parsed receipt data:', JSON.stringify(receiptData, null, 2));

        // Convert NTD to USD
        const enrichedData = await enrichWithUsdConversion(receiptData);
        console.log('Enriched data with USD conversion:', JSON.stringify(enrichedData, null, 2));

        res.json(enrichedData);
      } catch (parseError) {
        console.error('Error parsing receipt data:', parseError);
        res.json(response.data);
      }

    } catch (error) {
      console.error('Error processing image:', error);
      // Provide more detailed error information
      const errorMessage = error.response ?
        `API Error: ${error.response.status} ${JSON.stringify(error.response.data)}` :
        error.message;
      res.status(500).json({ error: 'Error processing image', details: errorMessage });
    }
  })
}