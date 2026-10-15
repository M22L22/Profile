const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'site.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// Run the real renderer against a minimal DOM; no network or CDN required.
async function rendered() {
  const elements = new Map();
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) {
    elements.set(id, { innerHTML: '', textContent: '', style: {}, classList: { add() {}, toggle() {} } });
  }
  const document = {
    title: '',
    getElementById: id => elements.get(id) || null,
    querySelectorAll: () => [],
    querySelector: () => null
  };
  const context = vm.createContext({
    document,
    fetch: async () => ({ ok: true, json: async () => structuredClone(data) }),
    lucide: { createIcons() {} },
    IntersectionObserver: class { observe() {} disconnect() {} },
    setTimeout: fn => fn(),
    console
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'main.js'), 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return { document, elements, text: [...elements.values()].map(e => e.innerHTML + e.textContent).join('\n') };
}

test('the public page reflects the questionnaire, in English only', async () => {
  const { document, elements, text } = await rendered();
  assert.equal(document.title, 'Mou Lue — Physics');
  assert.match(text, /Shandong Experimental High School/);
  assert.match(text, /Jinan, China/);
  assert.match(text, /Grade 12/);
  assert.match(text, /Physics/);
  assert.doesNotMatch(text, /[\u3400-\u9fff]|Chongqing|Chasing rigorous|example\.com/);
  assert.equal(data.hero.bg_image, 'Content/hero_pic.jpg');
  assert.match(elements.get('hero-bg').alt, /person|Mou Lue/i);
  assert.ok(fs.existsSync(path.join(root, data.hero.bg_image)));
  assert.equal(data.sections.competitions.items.length, 10);
  const competitions = elements.get('stair-container').innerHTML;
  for (const item of data.sections.competitions.items) {
    assert.ok(competitions.includes(item.name));
    assert.ok(competitions.includes(item.date));
  }
  const ap = elements.get('ap-summary');
  assert.ok(ap, 'AP results need a plain-text summary container');
  assert.match(ap.innerHTML + ap.textContent, /Precalculus/);
  assert.match(ap.innerHTML + ap.textContent, /Calculus BC/);
  assert.match(ap.innerHTML + ap.textContent, /Physics 1/);
  assert.match(ap.innerHTML + ap.textContent, /Physics 2/);
  assert.match(ap.innerHTML + ap.textContent, /Computer Science A/);
  assert.match(ap.innerHTML + ap.textContent, /Chemistry/);
  assert.match(ap.innerHTML + ap.textContent, /5/);
  assert.match(ap.innerHTML + ap.textContent, /Microeconomics.*4/);
  const research = elements.get('research-items').innerHTML;
  assert.match(research, /lithium iron phosphate/i);
  assert.match(research, /GB 51048-2025/);
  assert.match(research, /seven core modules/);
  assert.match(research, /XX University/);
  assert.match(research, /XX Laboratory/);
  assert.match(research, /Research field: XXX/);
  assert.match(research, /Supervisor: XXX/);
  assert.match(research, /June 2023.*January 2024/);
  assert.match(research, /placeholder/i);
  assert.match(research, /Content\/research_pic\.jpg/);
  assert.match(research, /HiMCM/);
  assert.match(research, /H Award/);
  assert.equal((research.match(/<img /g) || []).length, 1);
  const activities = elements.get('act-cols').innerHTML;
  const activityText = activities.replace(/<br>/g, ' ');
  assert.match(activityText, /Primary School Outreach/);
  assert.match(activityText, /SEHS College Fair/);
  assert.match(activityText, /Charity Fair/);
  assert.doesNotMatch(activities, /<img|<a\b|<button|data-lucide/);
  assert.doesNotMatch(html + text, /picsum\.photos|href="#"|id="nav-cta"|act-banner-wrap/);
  assert.doesNotMatch(JSON.stringify(data), /[\u3400-\u9fff]|mailto:|tagline_sub|circle_image|banner_image/);
});
