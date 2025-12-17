
const { withPodfile, createRunOncePlugin } = require('@expo/config-plugins');

const withPodfileDeploymentTarget = (config, { target = '16.1' } = {}) => {
    return withPodfile(config, (config) => {
        const podfileContents = config.modResults.contents;

        // Check if checks are already added
        if (podfileContents.includes("config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']")) {
            return config;
        }

        // Pattern to find the end of the post_install block
        // We look for 'react_native_post_install(' and then its closing parenthesis and the end of the block
        // But it's safer to look for the react_native_post_install call and insert after it.

        const patch = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${target}'
      end
    end
`;

        // Insert after react_native_post_install(...)
        // The typical structure is:
        //    react_native_post_install(
        //      installer,
        //      config[:reactNativePath],
        //      :mac_catalyst_enabled => false,
        //      :ccache_enabled => ccache_enabled?(podfile_properties),
        //    )

        // We can just append to the end of the post_install block?
        // Finding the specific closing 'end' of post_install is tricky with regex.
        // However, usually it's the last 'end' in the file or indented?
        // Let's replace 'react_native_post_install(' block with itself + out patch.

        // A safer match:
        const anchor = /:ccache_enabled => ccache_enabled\?\(podfile_properties\),\s*\)\s*end/m;

        // Wait, the 'end' after ')' closes 'react_native_post_install' (if it was a block? no it's a method call).
        // The 'end' closes 'post_install do |installer|'.

        // In Podfile we saw:
        //    react_native_post_install(
        //      ...
        //    )
        //  end

        // So we match match the closing parenthesis of react_native_post_install call, AND the following 'end'.

        // Let's try to match the string directly as we saw it in the file usually.
        // Or just append our block before the last 'end' of the file, assuming it closes the post_install? 
        // No, there is also the outer 'target' block.

        // Let's look for `react_native_post_install` and assume standard indentation?
        // Better: split by `react_native_post_install` and reconstruct.

        // Actually, simple string replacement of the specific known closing sequence is safest for this specific project.
        const search = /:ccache_enabled => ccache_enabled\?\(podfile_properties\),\n\s*\)/;
        const replace = `:ccache_enabled => ccache_enabled?(podfile_properties),\n    )\n${patch}`;

        if (podfileContents.match(search)) {
            config.modResults.contents = podfileContents.replace(search, replace);
        } else {
            // Fallback or warning?
            console.warn("Could not find anchor to patch Podfile. Check withPodfileDeploymentTarget.js");
        }

        return config;
    });
};

module.exports = createRunOncePlugin(withPodfileDeploymentTarget, 'withPodfileDeploymentTarget', '1.0.0');
