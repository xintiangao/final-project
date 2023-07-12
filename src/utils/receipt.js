import { getGoogleToken } from './auth.js';

const projectId = 'teak-catalyst-391812';
const location = 'us'; // Format is 'us' or 'eu'
const processorId = '83c007cf5288d57c'; // Create processor in Cloud Console

export async function processDocument(file) {
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const endpoint = `https://documentai.googleapis.com/v1/${name}:process`;
  const accessToken = getGoogleToken();

  const reader = new FileReader();
  reader.readAsDataURL(file);

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const encodedImage = reader.result.replace(/^data:(.*;base64,)?/, '');

      const request = {
        name,
        rawDocument: {
          content: encodedImage,
          mimeType: 'image/jpeg',
        },
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(request),
        });

        const result = await response.json();
        console.log('Document processing complete.');

        const { document } = result;
        let totalAmount = null;
        let supplierName = null;
        let receiptDate = null;
        let receiptTime = null;
        let processingComplete = false;

        for (const entity of document.entities) {
          const key = entity.type;
          const textValue = entity.textAnchor?.content || '';
          const conf = entity.confidence * 100;

          console.log(
            `* ${JSON.stringify(key)}: ${JSON.stringify(textValue)} (${conf.toFixed(2)}% confident)`
          );

          if (key === 'supplier_name') {
            supplierName = textValue;
          }

          if (key === 'receipt_date') {
            receiptDate = entity.normalizedValue?.text;
          }

          if (key === 'purchase_time') {
            receiptTime = textValue;
          }

          if (key === 'total_amount') {
            totalAmount = entity.normalizedValue?.text;
          }
        }

        processingComplete = true;

        if (processingComplete) {
          resolve({
            supplierName,
            receiptDate,
            receiptTime,
            totalAmount,
          });
        } else {
          reject(new Error("Document processing failed."));
        }
      } catch (error) {
        console.error('An error occurred while processing the document:', error);
        reject(error);
      }
    };
  });
}