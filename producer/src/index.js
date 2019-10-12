const rust = import('../pkg/hello_world');

function hello() {
  rust
  .then(m => {
    m.greet('World!')
  });
}

export { hello };

