const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Extend transformer configuration
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'], // For hashing assets
  babelTransformerPath: require.resolve('react-native-svg-transformer'), // For SVG support
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

// Extend resolver configuration
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: [
    ...defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'), // Remove svg
    'gif', // Explicitly add gif support
  ],
  sourceExts: [
    ...defaultConfig.resolver.sourceExts,
    'svg', // Add svg as source
  ],
};

module.exports = defaultConfig;
