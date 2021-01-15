export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'Deberts',
      file: 'dist/deberts.bundle.umd.js',
      format: 'umd',
    },
  },
];
