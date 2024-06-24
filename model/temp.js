import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('66670934590c7c7e6b8902a6')
    }
  }, {
    '$group': {
      '_id': 'null', 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numberOfReviews': {
        '$sum': 1
      }
    }
  }
];

const client = await MongoClient.connect(
  ''
);
const coll = client.db('10-e-commerce').collection('reviewnews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();