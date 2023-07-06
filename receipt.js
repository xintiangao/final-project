import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { readFile } from 'fs/promises';
const client = new DocumentProcessorServiceClient();

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = 'teak-catalyst-391812';
const location = 'us'; // Format is 'us' or 'eu'
const processorId = '83c007cf5288d57c'; // Create processor in Cloud Console
const filePath = 'receipt.jpeg';
// Instantiates a client

export async function processDocument() {
  // The full resource name of the processor, e.g.:
  // projects/project-id/locations/location/processor/processor-id
  // You must create new processors in the Cloud Console first
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  // Read the file into memory.
  const imageFile = await readFile(filePath);

  // Convert the image data to a Buffer and base64 encode it.
  const encodedImage = Buffer.from(imageFile).toString('base64');

  const request = {
    name,
    rawDocument: {
      content: encodedImage,
      mimeType: 'image/jpeg',
    },
  };

  // Recognizes text entities in the PDF document
  const [result] = await client.processDocument(request);

  console.log('Document processing complete.');

  // Read fields specificly from the specalized US drivers license processor:
  // https://cloud.google.com/document-ai/docs/processors-list#processor_us-driver-license-parser
  // retriving data from other specalized processors follow a similar pattern.
  // For a complete list of processors see:
  // https://cloud.google.com/document-ai/docs/processors-list
  //
  // OCR and other data is also present in the quality processor's response.
  // Please see the OCR and other samples for how to parse other data in the
  // response.
  const {document} = result;
  
  for (const entity of document.entities) {
    // Fields detected. For a full list of fields for each processor see
    // the processor documentation:
    // https://cloud.google.com/document-ai/docs/processors-list
    const key = entity.type;
    // some other value formats in addition to text are availible
    // e.g. dates: `entity.normalizedValue.dateValue.year`
    const textValue =
      entity.textAnchor !== null ? entity.textAnchor.content : '';
    const conf = entity.confidence * 100;
    console.log(
      `* ${JSON.stringify(key)}: ${JSON.stringify(textValue)}(${conf.toFixed(
        2
      )}% confident)`
    );
  }
  
}

await processDocument()
