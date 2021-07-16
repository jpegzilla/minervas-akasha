module.exports = function override(config, _env) {
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: {
      loader: 'worker-loader',
      options: {
        filename: ({ chunk }) => `${chunk.id}.[contenthash].minervaworker.js`,
        worker: {
          type: 'Worker',
          options: {
            name: 'minerva_worker',
          },
        },
      },
    },
  })
  config.externals = {
    ...config.externals,
    'react-native-fs': 'reactNativeFs',
  }
  config.output['globalObject'] = 'this'
  return config
}
