const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidHomeLauncher(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Find the main activity
    const mainActivity = androidManifest.manifest.application[0].activity.find(
      activity => activity.$['android:name'] === '.MainActivity'
    );
    
    if (mainActivity) {
      // Ensure intent-filter array exists
      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = [];
      }
      
      // Check if home intent filter already exists
      const hasHomeFilter = mainActivity['intent-filter'].some(filter => 
        filter.category?.some(cat => cat.$['android:name'] === 'android.intent.category.HOME')
      );
      
      if (!hasHomeFilter) {
        // Add new intent filter for home launcher
        mainActivity['intent-filter'].push({
          action: [{
            $: {
              'android:name': 'android.intent.action.MAIN'
            }
          }],
          category: [
            {
              $: {
                'android:name': 'android.intent.category.HOME'
              }
            },
            {
              $: {
                'android:name': 'android.intent.category.DEFAULT'
              }
            }
          ]
        });
      }
      
      // Also ensure we have the standard launcher intent filter
      const hasLauncherFilter = mainActivity['intent-filter'].some(filter => 
        filter.category?.some(cat => cat.$['android:name'] === 'android.intent.category.LAUNCHER')
      );
      
      if (!hasLauncherFilter) {
        mainActivity['intent-filter'].push({
          action: [{
            $: {
              'android:name': 'android.intent.action.MAIN'
            }
          }],
          category: [{
            $: {
              'android:name': 'android.intent.category.LAUNCHER'
            }
          }]
        });
      }
    }
    
    return config;
  });
};