var should = require('should');
var vcfToObject = require('../index.js');
var fsp = require('fs-promise');

describe('parse vcf', () => {

    it('should return an object coherent with the vcf file', (done) => {
        const path = './test/freeman.vcf';
        fsp.readFile(path, { encoding: 'utf8' })
            .then((data) => vcfToObject.vcfToObject(data))
            .then(data => done())
            .catch((err) => {
                should.not.exist(err);
                done();
            });
    });

});