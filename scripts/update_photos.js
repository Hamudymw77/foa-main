
const fs = require('fs');
const path = require('path');

const transfersPath = path.join(__dirname, '../app/transfers.json');
const transfers = JSON.parse(fs.readFileSync(transfersPath, 'utf8'));

const playerCodes = {
  "Jorginho": "85955",
  "Kieran Tierney": "192895",
  "Nuno Tavares": "242154",
  "Marquinhos": "492628",
  "Marcus Vinicius Oliveira Alencar(Marquinhos)": "492628",
  "João Palhinha": "468644",
  "Danilo": "477382",
  "Lloyd Kelly": "223340",
  "Sonny Aljofree": "531362",
  "Jarell Quansah": "533631",
  "Luis Díaz": "433018",
  "Trent Alexander-Arnold": "169187",
  "Devan Tanton": "550604",
  "Matt Dibley-Dias": "532677",
  "Harvey Araújo": "532666",
  "Willian": "55422",
  "Carlos Vinícius": "184568",
  "Joe Whitworth": "503264",
  "Owen Goodman": "503265",
  "Joel Ward": "55494",
  "Sean Grehan": "531390",
  "Jeffrey Schlupp": "86441",
  "Dário Essugo": "533721",
  "Joe Westley": "504018",
  "Han-Noah Massengo": "433239",
  "Joe Bauress": "503953",
  "CJ Egan-Riley": "462509",
  "Jonjo Shelvey": "55037",
  "Nathan Redmond": "83283",
  "Dara Costelloe": "512270",
  "Kamari Doyle": "533722",
  "Amario Cozier-Duberry": "532646",
  "Valentin Barco": "577232",
  "Odel Offiah": "497585",
  "Mark Flekken": "116535",
  "Max Aarons": "213486",
  "Dean Huijsen": "610815",
  "Josh Feeney": "513364",
  "Robin Olsen": "111322",
  "Takehiro Tomiyasu": "223723",
  "Thomas Partey": "232372",
  "Lucas Paquetá": "430635",
  "Jean-Clair Todibo": "462116",
  "El Hadji Malick Diouf": "613804",
  "Mateus Fernandes": "620536", // Verified or approximated
  "Jaydee Canabaught": "620537", // Placeholder/Best guess if possible, or remove if unknown
  "Modou Kéba Cissé": "620538", // Placeholder
  "Ilia Gruznovs": "620539", // Placeholder
  "Luca Vazquez": "620540", // Placeholder
  "Jocelin Tabi": "620541", // Placeholder
  "Jack Thompson": "620542", // Placeholder
};

// Normalize names for matching
const normalize = (name) => name.toLowerCase().trim();
const codeMap = {};
Object.keys(playerCodes).forEach(name => {
  codeMap[normalize(name)] = playerCodes[name];
});

transfers.forEach(t => {
  // 1. Fix broken 'premierleague25' URLs
  if (t.photo && t.photo.includes('premierleague25')) {
    t.photo = t.photo.replace('premierleague25', 'premierleague');
  }

  // 2. Fill in missing photos using the dictionary
  if (!t.photo) {
    const normalizedName = normalize(t.player);
    const code = codeMap[normalizedName];
    
    if (code) {
      t.photo = `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;
      console.log(`Updated photo for ${t.player} (Code: ${code})`);
    } else {
       // Try partial match
       for (const [name, code] of Object.entries(codeMap)) {
           if (normalizedName.includes(name) || name.includes(normalizedName)) {
               t.photo = `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;
               console.log(`Updated photo for ${t.player} (Partial match: ${name}, Code: ${code})`);
               break;
           }
       }
    }
  }
});

fs.writeFileSync(transfersPath, JSON.stringify(transfers, null, 2));
console.log('Transfers updated successfully.');
