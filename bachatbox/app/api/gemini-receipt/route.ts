import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// NEW: update to latest available model
const MODEL_NAME = process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const message = formData.get('message') as string;
    const mode = formData.get('mode') as string;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');

    // FIX: Use the latest model and apiVersion
    const model = genAI.getGenerativeModel(
      { model: MODEL_NAME },
      { apiVersion: 'v1beta' }
    );

    const prompt = `Analyze this receipt image and extract the following information in JSON format:

{
  "amount": [numeric value only, no currency symbols],
  "type": "expense" or "income" (receipts are usually expenses unless clearly showing refunds/returns),
  "description": "[merchant/store name or brief description]",
  "category": "[food, transport, shopping, entertainment, healthcare, utilities, etc.]",
  "confidence": [decimal between 0 and 1 indicating extraction confidence]
}

Rules:
- If amount is unclear, use 0
- Most receipts are expenses unless it's clearly a refund
- For merchant name, use the business name from the receipt
- Category should be one word, lowercase
- Be conservative with confidence scores

Return ONLY valid JSON, no additional text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    const text = await response.text();

    try {
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const receiptData = JSON.parse(jsonMatch[0]);

        // Validate the extracted data
        if (receiptData.amount && receiptData.type && receiptData.description) {
          return NextResponse.json({
            message: 'Receipt processed successfully',
            receiptData: receiptData,
          });
        }
      }

      return NextResponse.json({
        error: 'Could not extract reliable data from receipt',
        message: 'Please try again or add manually',
      }, { status: 400 });

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json({
        error: 'Could not parse receipt data',
        message: 'Please try again or add manually',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing receipt:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500 }
    );
  }
}
