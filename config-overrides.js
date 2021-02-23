module.exports = function override(config, _env) {
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
  })
  config.externals = {
    ...config.externals,
    'react-native-fs': 'reactNativeFs',
  }
  config.output['globalObject'] = 'this'
  return config
}
