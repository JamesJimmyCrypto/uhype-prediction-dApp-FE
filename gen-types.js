const { generateApi } = require('swagger-typescript-api');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000/api-json';
const OUTPUT_DIR = path.resolve(__dirname, 'src/types');

async function generateTypes() {
  try {
    const response = await fetch(API_URL);
    const openApiSpec = await response.json();

    await generateApi({
      name: 'api.ts',
      output: OUTPUT_DIR,
      spec: openApiSpec,
    });

    console.log('Types generated successfully');
  } catch (error) {
    console.error('Error generating types:', error);
  }
}

generateTypes();