import express from 'express';
import { readStringFromFile, writeToFile } from './tools';

const app = express();
const PORT = 3000;

let access_count = 0;
app.get('/', (_, res) => {
  console.log('running');
  res.send({
    hello: 'world'
  });
  writeToFile('./out.txt', `${access_count++}`);
});

app.get('/count', (_, res) => {
  try {
    const count = readStringFromFile('./out.txt');
    res.send({
      count: count.trim()
    });
  } catch (err) {
    if (err instanceof Error) {
      res.send({
        error: 'something went wrong '+err.message
      });
    } else {
      res.send({
        error: 'something went wrong, no error available.'
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Express app alive on port 3000');
});
