const producer = import('webpack-strangeness-producer');
producer
.then(m => {
  console.log(m);
  m.hello();
});


