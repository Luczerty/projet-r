class ReversoTranslator {
  constructor() {
    this._url = "https://api.reverso.net/translate/v1/translation";
    this._languageDetection = false;
    this._languageFrom = "eng";
    this._languageTo = "fra";
    this._input = "";
    this._session = new XMLHttpRequest();
    this._payload = {
      format: "text",
      from: this._languageFrom,
      to: this._languageTo,
      input: "",
      options: {
        languageDetection: this._languageDetection,
        sentenceSplitter: true,
        origin: "translation.web",
        contextResults: true
      }
    };
  }

  setLanguageFrom(language) {
    this._languageFrom = language;
    this._payload.from = this._languageFrom;
    return this;
  }

  setLanguageTo(language) {
    this._languageTo = language;
    this._payload.to = this._languageTo;
    return this;
  }

  setLanguageDetection(value) {
    this._languageDetection = value;
    this._payload.options.languageDetection = this._languageDetection;
    return this;
  }

  translate(inputText) {
    return new Promise((resolve, reject) => {
      this._input = inputText;
      this._payload.input = inputText;

      this._session.open('POST', this._url, true); // Ouvrez la session
      this._session.setRequestHeader('Content-Type', 'application/json');
      this._session.setRequestHeader('X-Reverso-Origin', 'translation.web');

      this._session.onreadystatechange = () => {
        if (this._session.readyState === 4) {
          if (this._session.status === 200) {
            try {
              const response = JSON.parse(this._session.responseText);
              const translatedText = response.translation[0];
              resolve(translatedText);
            } catch (error) {
              reject(new ReversoTranslateError());
            }
          } else {
            reject(new ReversoTranslateError());
          }
        }
      };

      this._session.send(JSON.stringify(this._payload));
    });
  }
}

// Define the ReversoTranslateError class
class ReversoTranslateError extends Error {
  constructor() {
    super("An error has occurred, you probably didn't specify a translation language.");
    this.name = "ReversoTranslateError";
  }
}

// Event listener for the "Add to CSV" button
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('generateBtn').addEventListener('click', generateCSV);
  document.getElementById('addBtn').addEventListener('click', addToCSV);
  document.getElementById('deleteBtn').addEventListener('click' , deleteall);
});

// Fonction pour supprimer toutes les données de la mémoire locale
function deleteall() {
  const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer toutes les données locales ? Cette action est irréversible.");
  if (confirmDelete) {
    localStorage.clear();
    alert("Toutes les données locales ont été supprimées avec succès.");
  }
}

// Function to add data to CSV
function addToCSV() {
  const inputData = document.getElementById('dataInput').value;
  if (!inputData) {
    alert('Please enter data before adding to CSV.');
    return;
  }

  const translator = new ReversoTranslator();
  translator.setLanguageFrom("eng").setLanguageTo("fra").setLanguageDetection(false);

  // Translate the input data
  translator.translate(inputData)
    .then(translatedText => {
      const translatedData = translatedText;

      document.getElementById('wordFrench').textContent = inputData;
      document.getElementById('wordEnglish').textContent = translatedData;
      document.getElementById('translationTable').style.display = "block";
      

      const csvContent = `${inputData};"${translatedData}"\n`;


      localStorage.setItem(`csvDataEntry_${localStorage.length + 1}`, csvContent);
    })
    .catch(error => {
      console.error(error.message);
    });
}


function generateCSV() {
  let csvContent = `\n`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('csvDataEntry_')) {
      csvContent += localStorage.getItem(key);
    }
  }

  if (!csvContent) {
    alert('No data to generate CSV.');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'generated.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
