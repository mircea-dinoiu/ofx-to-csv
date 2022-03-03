const {argv} = require('yargs');
const ofx = require('ofx');
const path = require('path');
const fs = require('fs');
const isPlainObject = require('lodash.isplainobject');
const {stringify} = require('csv-stringify/sync');
const moment = require('moment');

const main = () => {
    const filePath = argv.file;

    const fileContents = fs.readFileSync(filePath, 'utf-8')
    const ofxContents = ofx.parse(fileContents.toString());

    const transactions = mapOfxToTransactions(ofxContents);
    const accountName = mapOfxToAccountName(ofxContents);
    const output = stringify([
        [
            'Date',
            'Description',
            'Original Description',
            'Amount',
            'Transaction Type',
            'Category',
            'Account Name',
            'Labels',
            'Notes',
        ],
        ...transactions.map((attrs) => {
            const {TRNTYPE, DTPOSTED, TRNAMT, FITID, NAME} = attrs;
            const sum = Number(TRNAMT);

            return [
                moment(DTPOSTED, 'YYYYMMDDHHmmss')
                    .parseZone().format('M/D/YYYY'),
                NAME,
                NAME,
                Math.abs(sum),
                sum < 0 ? 'debit' : 'credit',
                '',
                accountName,
                '',
                '',
            ];
        }),
    ]);

    const fileParsed = path.parse(filePath);
    const outputFile = path.join(fileParsed.root, fileParsed.dir, fileParsed.name + '.csv');

    fs.writeFileSync(outputFile, output);

    console.log(output);
}

const mapOfxToTransactions = (data) => {
    if (data && data.BANKTRANLIST) {
        return data.BANKTRANLIST.STMTTRN;
    }

    if (isPlainObject(data)) {
        return Object.values(data).reduce((acc, each) => {
            return acc.concat(mapOfxToTransactions(each));
        }, []);
    }

    return [];
};

const mapOfxToAccountName = (data) => {
    if (data && data.FI) {
        return data.FI.ORG;
    }

    if (isPlainObject(data)) {
        return Object.values(data).reduce((acc, each) => {
            return acc.concat(mapOfxToAccountName(each));
        }, []).filter(Boolean)[0] || '';
    }

    return '';
};


main();