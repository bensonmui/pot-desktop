// Generates update.json for the Tauri v1 updater from the current build.
// Reads the local signature produced by `tauri build -b nsis,updater` and points
// the download URL at this repo's release for the current tag.
//
// Required env:
//   GITHUB_REF_NAME  the pushed tag, e.g. v3.0.11 (provided by GitHub Actions)
// Optional env:
//   GITHUB_REPOSITORY  owner/repo (defaults to bensonmui/pot-desktop)
import fs from 'fs';
import path from 'path';

const repo = process.env.GITHUB_REPOSITORY || 'bensonmui/pot-desktop';
const tag = process.env.GITHUB_REF_NAME || '';
const version = tag.replace(/^v/, '');

if (!tag) {
    console.error('GITHUB_REF_NAME is not set; skipping update.json generation');
    process.exit(0);
}

const targets = [
    { platform: 'windows-x86_64', file: `pot_${version}_x64-setup.nsis.zip` },
    { platform: 'windows-i686', file: `pot_${version}_x86-setup.nsis.zip` },
    { platform: 'windows-aarch64', file: `pot_${version}_arm64-setup.nsis.zip` },
];

const base = `https://github.com/${repo}/releases/download/${tag}`;
const bundleDirs = [
    `src-tauri/target/release/bundle/nsis`,
    `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis`,
    `src-tauri/target/i686-pc-windows-msvc/release/bundle/nsis`,
    `src-tauri/target/aarch64-pc-windows-msvc/release/bundle/nsis`,
];

function readSignature(file) {
    for (const dir of bundleDirs) {
        const sigPath = path.join(dir, `${file}.sig`);
        if (fs.existsSync(sigPath)) {
            return fs.readFileSync(sigPath, 'utf8').trim();
        }
    }
    return '';
}

const platforms = {};
for (const { platform, file } of targets) {
    const signature = readSignature(file);
    if (signature) {
        platforms[platform] = { signature, url: `${base}/${file}` };
    }
}

if (Object.keys(platforms).length === 0) {
    console.error('No signatures found; skipping update.json');
    process.exit(0);
}

const updateData = {
    version,
    notes: `See https://github.com/${repo}/releases/tag/${tag}`,
    pub_date: new Date().toISOString(),
    platforms,
};

fs.writeFileSync('./update.json', JSON.stringify(updateData, null, 2));
console.log('update.json written for', version, '->', Object.keys(platforms).join(', '));
