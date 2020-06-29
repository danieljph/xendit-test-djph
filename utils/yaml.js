const fs = require('fs');
const YAML = require('yaml');
const yamlPath = process.env.NODE_ENV==="production"? './config/application.yml' : `./config/application-${process.env.NODE_ENV}.yml`;

console.log('Loading Yaml: ', yamlPath);
const yaml = YAML.parse(fs.readFileSync(yamlPath, 'utf8'));

module.exports = yaml;
