const { default: axios } = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const worker = async (dateIn) => {
  const url = 'https://bsestarmf.in/RptNavMaster.aspx';

  const options = {
    method: 'GET',
    url: url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    params: {
      txtToDate: dateIn,
      btnSubmit: 'Submit',
    },
  };

  try {
    const response = await axios(options);
    const html = response.data;

    const $ = cheerio.load(html);

    let templist = [];
    let i = 2;

    while (true) {
      try {
        const NAV_DATE = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(1)').text();
        const SCHEME_CODE = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(2)').text();
        const SCHEME_NAME = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(3)').text();
        const RTA_SCHEME_CODE = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(4)').text();
        const DIV_REINVESTFLAG = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(5)').text();
        const ISIN = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(6)').text();
        const NAV_VALUE = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(7)').text();
        const RTA_CODE = $('#gvNavDetails > tbody > tr:nth-child(' + i + ') > td:nth-child(8)').text();

        const tableDict = {
          NAV_DATE,
          SCHEME_CODE,
          SCHEME_NAME,
          RTA_SCHEME_CODE,
          DIV_REINVESTFLAG,
          ISIN,
          NAV_VALUE,
          RTA_CODE,
        };

        templist.push(tableDict);
        const csv = parseToCSV(templist);
        fs.writeFileSync('table.csv', csv);

        i++;
      } catch (e) {
        console.log('Out of scope');
        console.error(e);
        break;
      }
    }
  } catch (e) {
    console.log('Error caught');
    console.error(e);
  }
};

const parseToCSV = (data) => {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');
      return '"' + escaped + '"';
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

const dateIn = '08-Feb-2023'; // same format as the BSE website
worker(dateIn);
