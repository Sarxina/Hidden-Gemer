module.exports = {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }], // This targets the current version of Node
      '@babel/preset-react'  // This adds support for JSX
    ]
};
