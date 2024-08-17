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

app.get('/products', async (req, res) => {
  const {
      page = 1, limit = 10, search = '',
      category, brand, priceRange, sortBy = 'dateAdded_desc'
  } = req.query;

  // Validate input
  if (parseInt(page) < 1 || parseInt(limit) < 1) {
      return res.status(400).json({ error: 'Invalid page or limit value' });
  }

  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' }; // Ensure this line exists

  if (category) query.category = category;
  if (brand) query.brand = brand;
  
  try {
      const totalProducts = await productCollection.countDocuments(query);
      const products = await productCollection.find(query)
          .sort(sortOptions)
          .skip((parseInt(page) - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .toArray();

      res.json({
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          currentPage: parseInt(page),
          totalProducts,
          products
      });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});


async function startServer() {
    await connectToDatabase();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

startServer();
