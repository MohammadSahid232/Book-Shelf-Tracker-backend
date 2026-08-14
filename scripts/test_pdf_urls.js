const axios = require('axios');

const candidates = [
  // arxiv papers (always accessible, many pages each, all different)
  ['arxiv attention (48pp)', 'https://arxiv.org/pdf/1706.03762'],
  ['arxiv ResNet (16pp)', 'https://arxiv.org/pdf/1512.03385'],
  ['arxiv VGGNet (14pp)', 'https://arxiv.org/pdf/1409.1556'],
  ['arxiv GAN (8pp)', 'https://arxiv.org/pdf/1406.2661'],
  ['arxiv BERT (16pp)', 'https://arxiv.org/pdf/1810.04805'],
  ['arxiv GPT3 (75pp)', 'https://arxiv.org/pdf/2005.14165'],
  ['arxiv AlphaGo (20pp)', 'https://arxiv.org/pdf/1712.01815'],
  ['arxiv AlexNet (9pp)', 'https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf'],
  ['arxiv dropout (12pp)', 'https://arxiv.org/pdf/1207.0580'],
  // Other confirmed working
  ['Brave New World (473KB)', 'https://www.plato-philosophy.org/wp-content/uploads/2016/05/BraveNewWorld-1.pdf'],
  ['tracemonkey (38pp)', 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf'],
];

async function test(label, url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/pdf,*/*' },
      maxRedirects: 5,
    });
    const bytes = Buffer.from(res.data);
    const header = bytes.slice(0, 4).toString('ascii');
    if (header === '%PDF') {
      console.log(`OK ${label.padEnd(30)} ${(bytes.length/1024).toFixed(0).padStart(6)} KB — ${url}`);
    } else {
      console.log(`NO ${label} not PDF — ${url}`);
    }
  } catch (e) {
    console.log(`NO ${label} FAILED: ${e.message}`);
  }
}

async function run() {
  for (const [label, url] of candidates) {
    await test(label, url);
  }
}
run();
