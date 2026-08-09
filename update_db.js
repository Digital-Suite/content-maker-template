const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('C:/Users/CodeHead/Desktop/htdocs/DigitalSuite/apps/desktop/src-tauri/data/voicebox.db');
db.run("UPDATE profiles SET preset_engine='kokoro';", function(err) {
  if (err) console.error(err);
  else console.log("Updated rows:", this.changes);
  db.close();
});
