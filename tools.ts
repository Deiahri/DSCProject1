import fs from "fs";

export function readStringFromFile(filename: string) {
  try {
    const data = fs.readFileSync(filename, "utf8").trim();
    return data;
  } catch (err) {
    console.error("Error reading file:", err);
    return '';
  }
}

export function writeToFile(filePath: string, data: any) {
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Successfully wrote to file:', filePath);
    }
  });
};
