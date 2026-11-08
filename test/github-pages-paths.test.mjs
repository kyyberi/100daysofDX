import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const ignoredDirectories = new Set(['.git', '_site', 'docs', 'node_modules', 'test']);
const sourceExtensions = new Set(['.css', '.html', '.md']);
const localUrlPatterns = [
  { pattern: /\b(?:href|src)\s*=\s*(["'])(\/(?!\/)[^"']*)\1/g, pathIndex: 2 },
  { pattern: /url\(\s*(["']?)(\/(?!\/)[^\s)'"']*)\1\s*\)/g, pathIndex: 2 },
  { pattern: /\]\((\/(?!\/)[^)]+)\)/g, pathIndex: 1 },
];

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : sourceFiles(entryPath);
    return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : [];
  });
}

function rootRelativeUrls(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return localUrlPatterns.flatMap(({ pattern, pathIndex }) =>
    [...content.matchAll(pattern)].map((match) => `${path.relative(root, filePath)}: ${match[pathIndex]}`),
  );
}

test('source contains no root-relative first-party paths', () => {
  const invalidUrls = sourceFiles(root).flatMap(rootRelativeUrls);
  assert.deepEqual(invalidUrls, []);
});

test('configuration and navigation target the project GitHub Pages URL', () => {
  const config = fs.readFileSync(path.join(root, '_config.yml'), 'utf8');
  const menu = fs.readFileSync(path.join(root, '_includes/menu-search.html'), 'utf8');
  assert.match(config, /^baseurl: "\/100daysofDX"$/m);
  assert.match(config, /^url: "https:\/\/kyyberi\.github\.io"$/m);
  assert.match(menu, /link\.url \| relative_url/);
});

test('Liquid-generated href and src attributes are quoted', () => {
  const malformedAttributes = sourceFiles(root).flatMap((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return [...content.matchAll(/\b(?:href|src)\s*=\s*"\{\{.*?\| relative_url }}(?!")/g)].map(
      (match) => `${path.relative(root, filePath)}: ${match[0]}`,
    );
  });
  assert.deepEqual(malformedAttributes, []);
});
