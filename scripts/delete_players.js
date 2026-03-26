
const fs = require('fs');
const path = require('path');

const transfersPath = path.join(__dirname, '../app/transfers.json');
const transfers = JSON.parse(fs.readFileSync(transfersPath, 'utf8'));

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

// Split by newlines and commas, then trim and filter empty strings
const namesToRemove = rawInput
  .split(/[\n,]/)
  .map(n => n.trim())
  .filter(n => n.length > 0)
  .map(n => n.toLowerCase()); // Normalize to lowercase for comparison

// Add variations if needed
namesToRemove.push('marcus vinicius oliveira alencar');

const initialCount = transfers.length;

const filteredTransfers = transfers.filter(t => {
  const playerName = t.player.toLowerCase();
  
  // Check exact match
  if (namesToRemove.includes(playerName)) {
    return false;
  }
  
  // Check if the name in list is contained in the player name (e.g. "Marquinhos" matching "Marcus Vinicius Oliveira Alencar(Marquinhos)")
  // Or vice versa?
  // The user input "Marcus Vinicius Oliveira Alencar(Marquinhos)" is quite specific.
  
  // Let's also check if any name in the removal list is a substring of the player name, 
  // but we must be careful not to delete "John Stone" if list has "Stone".
  // Given the specific names, exact match on full string or normalized string is safer.
  // However, "Karlsruher" was in the list. "Max Weiss" is from "Karlsruher". 
  // If "Karlsruher" is a player name, it will be removed. If it's a team, it won't match t.player.
  
  return true;
});

const removedCount = initialCount - filteredTransfers.length;

console.log(`Initial count: ${initialCount}`);
console.log(`Removed count: ${removedCount}`);
console.log(`New count: ${filteredTransfers.length}`);

// Log specifically which ones were NOT found to verify
const remainingNames = filteredTransfers.map(t => t.player.toLowerCase());
namesToRemove.forEach(name => {
    // We only care if it wasn't found (and thus not removed), but we should only log it if we expected it to be there.
    // Actually, let's just save the file.
});

fs.writeFileSync(transfersPath, JSON.stringify(filteredTransfers, null, 2));
console.log('Transfers updated (players removed).');
