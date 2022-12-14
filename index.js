const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.juc7iml.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
    try {
        const serviceCollection = client.db('FoodDB').collection('services');
        const reviewCollection = client.db('FoodDB').collection('reviews');
        //access token added
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })
        //main service loaded
        app.get('/services', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.skip(page * size).limit(size).toArray()
            const count = await serviceCollection.estimatedDocumentCount();
            res.send({ count, services })
        });
        //only 3 item shows
        app.get('/services/count', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })
        //add services
        app.post('/services', async (req, res) => {
            const user = req.body;
            const result = await serviceCollection.insertOne(user);
            res.send(result)
            console.log(user);
        })

        //service details 1 item
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })


        app.get('/reviews', async (req, res) => {



            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        //update

        app.get('/reviews/:id', async(req ,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result =await reviewCollection.findOne(query)
            res.send(result)
        })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            
             const user = req.body;
             console.log(user);
            const option = {upsert: true};
            const updatedUser = {
                $set: {
                    review:user.review,
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })




        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service: (id) };

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })



        //delete one review

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }

}
run().catch(error => console.log(error))








app.get('/', (req, res) => {
    res.send('food server is running')
})

app.listen(port, () => {
    console.log(port);
})


//