const fs = require('fs');

const html = fs.readFileSync('article.html', 'utf-8');
const sections = html.split(/<h[2-4][^>]*>/i);

for (let i = 1; i < sections.length; i++) {
  const parts = sections[i].split(/<\/h[2-4]>/i);
  const title = parts[0].replace(/<[^>]+>/g, '').trim();
  const rawBody = (parts[1] || '').split(/<div class="details-social/i)[0].split(/<div class="user-profile/i)[0];
  const body = rawBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (title.match(/^\d+-/) && parseInt(title) <= 8) {
    console.log('=== ' + title + ' ===');
    console.log(body);
    console.log('\n----------------------------------------\n');
  }
}
