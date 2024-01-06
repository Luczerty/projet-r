const Reverso = require('reverso-api');
const fs = require('fs');

const arguments = process.argv.slice(2);
const mot_a_traduire = arguments[0];

let language_translated = "english";
let language_of_translations = "french";

if (typeof arguments[2] !== "undefined") {
  language_of_translations = arguments[2];
}

if (typeof arguments[1] !== "undefined") {
  language_translated = arguments[1];
}

const csv_path = 'english_translations.csv';
const writer = fs.createWriteStream(csv_path, { flags: 'a' });

const reverso = new Reverso();

reverso.getTranslation(
  mot_a_traduire,
  language_translated,
  language_of_translations,
  (err, response) => {
    if (err) {
      console.error(err.message);
      return;
    }

    const traduction_francais = response.translations;
    const traduction_anglais = response.text;
    writeLine(writer, traduction_anglais, traduction_francais);

    writer.end();

    writer.on('finish', () => {
      console.log('Écriture dans le fichier CSV terminée.');
    });

    writer.on('error', (err) => {
      console.error(err);
    });
  }
);

function writeLine(writer, traduction_anglais, traduction_francais) {
  writer.write(traduction_anglais + ';');

  traduction_francais.forEach((line, index) => {
    writer.write(line);

    if (index < traduction_francais.length - 1) {
      writer.write(' / ');
    }
  });

  writer.write('\n');
  console.log('Ligne ajoutée au fichier CSV avec succès.');
  console.log(traduction_anglais + ' -> ' + traduction_francais.join(' / '));
}
