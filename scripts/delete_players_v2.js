
const fs = require('fs');
const path = require('path');

const transfersPath = path.join(__dirname, '../app/transfers.json');
const transfers = JSON.parse(fs.readFileSync(transfersPath, 'utf8'));

// The raw list from the user
const rawInput = `Jorginho Kieran Tierney Nuno Tavares Marquinhos, Mateus Fernandes,João Palhinha,Danilo,Cuiabano,Lloyd Kelly 
 Sonny Aljofree,Sverre Nypan,Jarell Quansah,Luis Díaz,Trent Alexander-Arnold,Lemar Gordon,Devan Tanton 
 Matt Dibley-Dias,Harvey Araújo,Willian 
 Carlos Vinícius 
 Danny Imray Joe Whitworth Franco Umeh 
 Owen Goodman Joel Ward Sean Grehan 
 Jeffrey Schlupp Jaydee Canabaught 
 Enzo Kana-Biyik,Mamadou Sarr,Mamadou Sarr,Dário Essugo,Joe Westley 
 Han-Noah Massengo 
 Joe Bauress,Andreas Hountondji 
 ,Sam Walker CJ Egan-Riley,Jonjo Shelvey 
 Nathan Redmond Dara Costelloe 
 Karlsruher,Kamari Doyle 
 Eiran Cashin,Amario Cozier-Duberry 
 Valentin Barco,Odel Offiah 
 Yoon Do-young Mark Flekken 
 Max Aarons 
 Dean Huijsen 
 Josh Feeney 
 Rico Richards 
 Modou Kéba Cissé 
 Kaine Kesler-Hayden 
 Robin Olsen 
 Takehiro Tomiyasu 
 
 Zepiqueno Redmond 
 Thomas Partey 
 
 Yasin Özcan 
 Ismaël Kabia 
 Marcus Vinicius Oliveira Alencar(Marquinhos) 
 
 Nuno Tavares 
 Jorginho 
 
 Kieran Tierney`;

// Normalize names to handle spaces, special chars, etc.
const namesToRemove = rawInput
  .split(/[\n,]/)
  .map(n => n.trim())
  .filter(n => n.length > 0)
  .map(n => n.toLowerCase());

// Additional check for variations
namesToRemove.push('marcus vinicius oliveira alencar');

const initialCount = transfers.length;

// Filter out the players
const filteredTransfers = transfers.filter(t => {
  const pName = t.player.toLowerCase();
  
  // Exact match check
  if (namesToRemove.includes(pName)) {
    return false;
  }
  
  // Also check if the player name contains any of the names in the removal list (substring match)
  // This helps catch cases like "Jorginho (Arsenal)" if the list has "Jorginho"
  // BUT we must be careful. "Sonny Aljofree" vs "Sonny".
  // The user list is specific enough.
  
  // Check specifically for "Marcus Vinicius Oliveira Alencar(Marquinhos)"
  // The JSON might have "Marquinhos" or the full name.
  // The user provided "Marcus Vinicius Oliveira Alencar(Marquinhos)".
  // If JSON has "Marquinhos", and list has "Marquinhos", it's caught above.
  
  return true;
});

const removedCount = initialCount - filteredTransfers.length;

console.log(`Initial count: ${initialCount}`);
console.log(`Removed count: ${removedCount}`);
console.log(`New count: ${filteredTransfers.length}`);

fs.writeFileSync(transfersPath, JSON.stringify(filteredTransfers, null, 2));
console.log('Transfers updated (players removed).');
