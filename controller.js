import fs from 'node:fs';

// Function for reading data:
export const readData = (callback) => {
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) callback(err)

    try {
      const recipes = JSON.parse(data)
      callback(null, recipes);
    } catch (error) {
      callback(error)
    }
  });
}

// Function for writing data:
export const writeData = (value, callback) => {
  fs.writeFile('./data.json', JSON.stringify(value, null, 2), 
    (err) => {
      if (err) {
        callback(err)
      } else {
        callback(null);
      }
    }
  );
}