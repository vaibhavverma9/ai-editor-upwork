// babel.config.js
module.exports = function(api) {
    api.cache(true);
  
    return {
      // Use Expo's Babel preset
      presets: ['babel-preset-expo'],
  
      // Plugins run after presets
      plugins: [
        [
          'module-resolver',
          {
            // Allow root-relative imports starting from the project root
            root: ['./'],
            alias: {
              '@assets':     './packages/assets',
              '@ui':         './packages/ui/src',
              '@constants':  './packages/constants',
              '@components': './packages/components',
              '@functions':  './packages/functions',
              '@hooks':      './packages/hooks',
              '@scripts':    './packages/scripts',
              '@styles':     './packages/styles',
              '@supabase':   './packages/supabase'
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
          }
        ],
        // React Native Reanimated plugin must come last
        'react-native-reanimated/plugin'
      ]
    };
  };
  