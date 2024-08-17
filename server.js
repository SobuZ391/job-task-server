require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
}

let productCollection;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        productCollection = client.db("ecommerce").collection("products");
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

app.get('/', (req, res) => {
    res.send('API is running...');
});


async function startServer() {
    await connectToDatabase();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

startServer();
