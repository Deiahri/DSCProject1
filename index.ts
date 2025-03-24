import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  console.log('running');
  res.send({
    hello: 'world'
  })
});

app.listen(PORT, () => {
  console.log('Express app alive on port 3000');
});
