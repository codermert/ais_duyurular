const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

const allowLegacyRenegotiationforNodeJsOptions = {
  httpsAgent: new https.Agent({
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  }),
};

async function scrapeData() {
  try {
    const response = await axios({
      url: 'https://ais.osym.gov.tr/',
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      ...allowLegacyRenegotiationforNodeJsOptions
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const results = [];
    $('tr[data-surecid]').each((index, element) => {
      const examName = $(element).find('td').eq(0).text().trim();
      const operationType = $(element).find('td').eq(1).text().trim();
      const examDate = $(element).find('td').eq(2).text().trim();
      const operationDates = $(element).find('td').eq(3).text().trim();
      const status = $(element).find('td').eq(4).text().trim();

      results.push({
        'sinav': examName,
        'islemtipi': operationType,
        'sinavtarihi': examDate,
        'islemtarihi': operationDates,
        'durum': status
      });
    });

    fs.writeFileSync('sonuc.json', JSON.stringify(results, null, 2), 'utf-8');

    console.log('Veriler başarıyla kaydedildi');
  } catch (error) {
    console.error('Error:', error);
  }
}

scrapeData();
