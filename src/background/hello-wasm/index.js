const js = import('./node_modules/@mynpmusername/hello-wasm/hello_wasm.js');
js.then((js) => {
  js.greet('WebAssembly');
});
