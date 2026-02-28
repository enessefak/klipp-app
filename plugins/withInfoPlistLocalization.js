const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const LOCALES = ['en', 'tr', 'de'];

/**
 * Config plugin to add localized InfoPlist.strings files for iOS permission descriptions.
 * This enables iOS to show permission dialogs in the user's device language.
 */
const withInfoPlistLocalization = (config) => {
    return withXcodeProject(config, async (config) => {
        const project = config.modResults;
        const projectRoot = config.modRequest.projectRoot;
        const projectName = config.modRequest.projectName;
        const iosPath = path.join(projectRoot, 'ios', projectName);
        const localesDir = path.join(projectRoot, 'assets', 'locales');

        // Add known regions to the Xcode project
        const knownRegions = project.pbxProjectSection();
        const projectKey = Object.keys(knownRegions).find((k) => !k.endsWith('_comment'));
        if (projectKey) {
            const regions = knownRegions[projectKey].knownRegions || [];
            for (const locale of LOCALES) {
                if (!regions.includes(locale)) {
                    regions.push(locale);
                }
            }
            knownRegions[projectKey].knownRegions = regions;
        }

        // Create a variant group for InfoPlist.strings
        const variantGroupId = project.generateUuid();
        const variantGroupCommentKey = `${variantGroupId}_comment`;
        const children = [];

        for (const locale of LOCALES) {
            const sourceFile = path.join(localesDir, `${locale}.lproj`, 'InfoPlist.strings');
            if (!fs.existsSync(sourceFile)) {
                console.warn(`[withInfoPlistLocalization] Missing: ${sourceFile}`);
                continue;
            }

            // Create the .lproj directory in the iOS project and copy the file
            const destDir = path.join(iosPath, `${locale}.lproj`);
            fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(sourceFile, path.join(destDir, 'InfoPlist.strings'));

            // Create a file reference for this locale
            const fileRefId = project.generateUuid();
            const fileRefCommentKey = `${fileRefId}_comment`;

            // Add PBXFileReference
            const fileRefSection = project.hash.project.objects['PBXFileReference'];
            fileRefSection[fileRefId] = {
                isa: 'PBXFileReference',
                lastKnownFileType: 'text.plist.strings',
                name: locale,
                path: `${locale}.lproj/InfoPlist.strings`,
                sourceTree: '"<group>"',
            };
            fileRefSection[fileRefCommentKey] = `InfoPlist.strings`;

            children.push({ value: fileRefId, comment: `${locale}` });
        }

        if (children.length === 0) return config;

        // Add PBXVariantGroup
        const variantGroupSection = project.hash.project.objects['PBXVariantGroup'] || {};
        project.hash.project.objects['PBXVariantGroup'] = variantGroupSection;
        variantGroupSection[variantGroupId] = {
            isa: 'PBXVariantGroup',
            children,
            name: 'InfoPlist.strings',
            sourceTree: '"<group>"',
        };
        variantGroupSection[variantGroupCommentKey] = 'InfoPlist.strings';

        // Add to PBXBuildFile so it gets included in the bundle
        const buildFileId = project.generateUuid();
        const buildFileSection = project.hash.project.objects['PBXBuildFile'];
        buildFileSection[buildFileId] = {
            isa: 'PBXBuildFile',
            fileRef: variantGroupId,
            fileRef_comment: 'InfoPlist.strings',
        };
        buildFileSection[`${buildFileId}_comment`] = 'InfoPlist.strings in Resources';

        // Add to Resources build phase
        const buildPhases = project.hash.project.objects['PBXResourcesBuildPhase'];
        for (const key of Object.keys(buildPhases)) {
            if (key.endsWith('_comment')) continue;
            const phase = buildPhases[key];
            if (phase.files) {
                phase.files.push({ value: buildFileId, comment: 'InfoPlist.strings in Resources' });
            }
        }

        // Add to the project name group (e.g. "Klipp") so paths resolve relative to ios/Klipp/
        const mainGroupId = project.getFirstProject().firstProject.mainGroup;
        const groups = project.hash.project.objects['PBXGroup'];
        const mainGroup = groups[mainGroupId];

        // Find the child group matching the project name (e.g. "Klipp")
        let projectGroupId = null;
        if (mainGroup && mainGroup.children) {
            for (const child of mainGroup.children) {
                const childGroup = groups[child.value];
                if (childGroup && childGroup.name === projectName) {
                    projectGroupId = child.value;
                    break;
                }
                // Some projects use path instead of name
                if (childGroup && childGroup.path === projectName) {
                    projectGroupId = child.value;
                    break;
                }
            }
        }

        const targetGroup = projectGroupId ? groups[projectGroupId] : mainGroup;
        if (targetGroup && targetGroup.children) {
            targetGroup.children.push({ value: variantGroupId, comment: 'InfoPlist.strings' });
        }

        return config;
    });
};

module.exports = withInfoPlistLocalization;
