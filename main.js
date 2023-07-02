const { Client, PrivateKey, FileContentsQuery } = require('@hashgraph/sdk');
const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const crypto = require('crypto');

// Set account ID and private key
const operatorAccountId = process.env.ACCOUNT_ID;
const operatorPrivateKey = PrivateKey.fromString(process.env.PRIVATE_KEY);

const client = Client.forTestnet();
client.setOperator(operatorAccountId, operatorPrivateKey);

const shoe = {
  size: '9',
  name: 'Nike Air Max 2023',
  material: 'Fiber',
  resellCount: 2
};

const blockID = crypto.createHash('sha256').update(JSON.stringify(shoe)).digest('hex');

(async () => {
  try {
    // File Service Hedera
    const { FileCreateTransaction } = require('@hashgraph/sdk');

    const shoeFileContents = JSON.stringify(shoe);

    const transactionId = await new FileCreateTransaction()
      .setContents(shoeFileContents)
      .execute(client);

    const receipt = await transactionId.getReceipt(client);
    const fileId = receipt.getFileId().toString();

    console.log(`Nike shoe details stored on file: ${fileId}`);

    // Retrieve file contents
    const fileContents = await new FileContentsQuery()
      .setFileId(fileId)
      .execute(client);

    const shoeData = JSON.parse(fileContents.toString());

    console.log('Shoe Information:');
    console.log('Size:', shoeData.size);
    console.log('Name:', shoeData.name);
    console.log('Material:', shoeData.material);
    console.log('Resell Count:', shoeData.resellCount);
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();

// Set up web server
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve the HTML file
});

app.get('/shoeData', (req, res) => {
  res.json(shoe); // Send the shoe data as a JSON response
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
