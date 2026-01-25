const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const urls = [
  'https://aistorystudio.in/contact',
  'https://aistorystudio.in/privacy',
  'https://aistorystudio.in/terms',
  'https://aistorystudio.in/pricing',
  'https://aistorystudio.in',
  // Add more .in URLs as needed
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
      const location = res.headers.get('location');
      console.log(`${url} redirects (${res.status}) to ${location}`);
      if (location && (location.startsWith('https://aistorystudio.com') || location.startsWith('https://www.aistorystudio.com'))) {
        // Now check canonical on the redirected page
        const comRes = await fetch(location);
        const html = await comRes.text();
        const dom = new JSDOM(html);
        const canonical = dom.window.document.querySelector('link[rel="canonical"]');
        if (canonical && (canonical.href === location || canonical.href === location.replace('www.', ''))) {
          console.log(`  ✔ Canonical tag correct: ${canonical.href}`);
        } else {
          console.log(`  ✖ Canonical tag missing or incorrect: expected ${location} or ${location.replace('www.', '')}, got ${canonical ? canonical.href : 'none'}`);
        }
      } else {
        console.log(`  ✖ Redirect not to aistorystudio domain`);
      }
    } else {
      console.log(`${url} did not redirect (status: ${res.status})`);
    }
  } catch (error) {
    console.log(`Error checking ${url}: ${error.message}`);
  }
}

(async () => {
  console.log('Checking redirects and canonical tags...\n');
  for (const url of urls) {
    await checkUrl(url);
    // Small delay to be respectful to servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\nDone!');
})();