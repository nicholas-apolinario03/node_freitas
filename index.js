const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(express.json());
app.use(express.json());
app.use(cors());

// Middleware para servir arquivos estáticos
app.use(express.static('public'));
const connectDB = require('./connectMongo');
const { MongoClient } = require('mongodb');
app.use(cors());



async function startServer() {
    try {
        await connectDB();
        console.log("Connected to MongoDB successfully");

        app.get('/getData', async (req, res) => {
            try {
                const client = new MongoClient(process.env.MONGO_URI);
                await client.connect();
                console.log("Connected to MongoDB successfully");

                const collections = ['data'];
                const data = {};

                for (let i = 0; i < collections.length; i++) {
                    const collection = client.db('sensor_data').collection(collections[i]);
                    const dataItems = await collection.find({}).toArray();
                    data[`umidade${i + 1}`] = dataItems.map(item => item.umidade);
                    data[`luminosidade${i + 1}`] = dataItems.map(item => item.luminosidade);
                    data[`temperatura${i + 1}`] = dataItems.map(item => item.temperatura);
                }

                await client.close();
                res.json(data);
            } catch (error) {
                console.error('Erro ao buscar dados no MongoDB:', error);
                res.status(500).json({ error: 'Erro ao buscar dados no MongoDB' });
            }
        });
        app.use((req, res, next) => {
          // Verifica se a rota solicitada corresponde a uma página existente
          if (req.url === '/' || req.url === '/index.html') {
              res.sendFile(__dirname +  req.url + '.html');
          } else {
              next();
          }
      });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Server is running on port " + PORT);
        });
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
    }
}

startServer();
