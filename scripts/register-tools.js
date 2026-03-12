#!/usr/bin/env node
/**
 * register-tools.js
 *
 * Scans static/tools/*.html, checks for tool-meta comments,
 * and prompts for any missing metadata.
 *
 * Usage:
 *   node scripts/register-tools.js            # scan & prompt for missing
 *   node scripts/register-tools.js --verify   # scan only, exit 1 if any missing
 *   node scripts/register-tools.js --force    # re-register all (overwrite existing)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { createInterface } from 'readline';

// ── ANSI colour helpers ────────────────────────────────────────────────────
const c = {
  reset:  s => `\x1b[0m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  accent: s => `\x1b[38;2;200;240;96m${s}\x1b[0m`,  // #c8f060
};

const TOOLS_DIR   = join(process.cwd(), 'static', 'tools');
const META_RE     = /<!--\s*tool-meta:\s*(\{[\s\S]*?\})\s*-->/;
const VERIFY_FLAG = process.argv.includes('--verify');
const FORCE_FLAG  = process.argv.includes('--force');

// ── Helpers ────────────────────────────────────────────────────────────────
function getHtmlFiles() {
  return readdirSync(TOOLS_DIR)
    .filter(f => extname(f) === '.html')
    .sort();
}

function parseMeta(content) {
  const m = content.match(META_RE);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

function isValid(meta) {
  return meta && meta.name && meta.slug;
}

function defaultSlug(filename) {
  return basename(filename, '.html');
}

function ask(rl, question) {
  return new Promise(resolve =>
    rl.question(question, answer => resolve(answer.trim()))
  );
}

async function promptMeta(rl, filename, existing) {
  const slug = existing?.slug ?? defaultSlug(filename);
  const name = existing?.name ?? '';
  const desc = existing?.description ?? '';
  const tags = existing?.tags?.join(', ') ?? '';

  console.log('');
  console.log(c.bold(c.yellow(`  ┌ ${filename}`)));

  const nameIn = await ask(rl,   `  │ name        ${name ? c.dim(`[${name}] `) : ''}: `);
  const slugIn = await ask(rl,   `  │ slug        ${c.dim(`[${slug}] `)}: `);
  const descIn = await ask(rl,   `  │ description ${desc ? c.dim(`[${desc}] `) : ''}: `);
  const tagsIn = await ask(rl,   `  └ tags        ${tags ? c.dim(`[${tags}] `) : c.dim('[comma-separated] ')}: `);

  return {
    name:        nameIn  || name  || defaultSlug(filename),
    slug:        slugIn  || slug,
    description: descIn  || desc,
    tags:        (tagsIn || tags)
                   ? (tagsIn || tags).split(',').map(t => t.trim()).filter(Boolean)
                   : []
  };
}

function injectMeta(content, meta) {
  const comment = `<!-- tool-meta: ${JSON.stringify(meta)} -->`;

  // Remove any existing tool-meta comment first
  const cleaned = content.replace(/\n?<!--\s*tool-meta:\s*[\s\S]*?-->/g, '');

  // Insert right after the opening <head> tag (handles <head> and <head ...>)
  if (/<head[\s>]/i.test(cleaned)) {
    return cleaned.replace(/(<head[^>]*>)/i, `$1\n${comment}`);
  }

  // Fallback: prepend
  return comment + '\n' + cleaned;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log(c.accent(c.bold('  DXVIIE / TOOLS')) + c.dim('  ─  register-tools'));
  console.log('');

  if (!existsSync(TOOLS_DIR)) {
    console.error(c.red('  Error: static/tools/ directory not found.'));
    console.error(c.dim('  Create it and drop HTML tool files inside.'));
    process.exit(1);
  }

  const files = getHtmlFiles();

  if (files.length === 0) {
    console.log(c.dim('  No .html files found in static/tools/'));
    console.log(c.dim('  Drop a self-contained HTML tool there and run this script again.'));
    return;
  }

  // ── Scan ────────────────────────────────────────────────────────────────
  const valid   = [];
  const missing = [];

  for (const file of files) {
    const content = readFileSync(join(TOOLS_DIR, file), 'utf8');
    const meta    = parseMeta(content);

    if (isValid(meta) && !FORCE_FLAG) {
      valid.push({ file, meta });
      console.log(`  ${c.green('✓')} ${file.padEnd(40)} ${c.dim('→')} ${c.dim(meta.name)}`);
    } else {
      missing.push({ file, existing: meta });
      if (FORCE_FLAG && isValid(meta)) {
        console.log(`  ${c.yellow('↻')} ${file.padEnd(40)} ${c.dim('→')} ${c.dim(meta.name)} ${c.dim('(forced)')}`);
      } else {
        console.log(`  ${c.yellow('!')} ${file.padEnd(40)} ${c.dim('→')} ${c.yellow('missing metadata')}`);
      }
    }
  }

  // ── All good ─────────────────────────────────────────────────────────────
  if (missing.length === 0) {
    console.log('');
    console.log(c.green(`  All ${valid.length} tool(s) have valid metadata.`));
    return;
  }

  // ── Verify mode: report and exit ─────────────────────────────────────────
  if (VERIFY_FLAG) {
    console.log('');
    console.log(c.red(`  ${missing.length} file(s) are missing metadata.`));
    console.log(c.dim(`  Run without --verify to add it interactively.`));
    process.exit(1);
  }

  // ── Interactive prompt ───────────────────────────────────────────────────
  console.log('');
  console.log(c.cyan(`  ${missing.length} file(s) need metadata. Fill in the fields below:`));
  console.log(c.dim('  (Press Enter to accept the value shown in brackets.)'));

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  for (const { file, existing } of missing) {
    const content = readFileSync(join(TOOLS_DIR, file), 'utf8');
    const meta    = await promptMeta(rl, file, existing);
    const updated = injectMeta(content, meta);
    writeFileSync(join(TOOLS_DIR, file), updated, 'utf8');
    console.log(`  ${c.green('✓')} Saved metadata to ${c.dim(file)}`);
  }

  rl.close();
  console.log('');
  console.log(c.green('  Done.'));
  console.log(c.dim('  Restart the dev server to pick up changes.'));
}

main().catch(err => {
  console.error(c.red(`\n  Error: ${err.message}`));
  process.exit(1);
});
