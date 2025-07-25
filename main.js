// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const fs = require('fs');
// const { exec } = require('child_process');
// const path = require('path');

// const app = express();
// const PORT = 8000;
// const TMP_DIR = path.join(__dirname, 'tmp');

// if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/tmp', express.static(TMP_DIR));

// // Multer config
// const upload = multer({ dest: TMP_DIR });

// // Helper: validation format temps (hh:mm:ss ou secondes)
// function isValidTimeFormat(time) {
//   return /^(\d{1,2}:)?([0-5]?\d):([0-5]?\d)$/.test(time) || /^\d+(\.\d+)?$/.test(time);
// }

// app.post('/cut-video', upload.single('video'), (req, res) => {
//   const { start, end } = req.body;
//   if (!req.file) {
//     return res.status(400).json({ success: false, error: 'Vidéo manquante' });
//   }
//   if (!start || !end || !isValidTimeFormat(start) || !isValidTimeFormat(end)) {
//     fs.unlinkSync(req.file.path);
//     return res.status(400).json({ success: false, error: 'Paramètres start ou end invalides' });
//   }

//   const inputPath = req.file.path;
//   const timestamp = Date.now();
//   const outputFilename = `output_${timestamp}.mp4`;
//   const outputPath = path.join(TMP_DIR, outputFilename);

//   // On utilise -ss et -to avant -i pour un découpage plus rapide (seek précis), et on encode la vidéo
//   const cmd = `ffmpeg -ss ${start} -to ${end} -i "${inputPath}" -c:v libx264 -preset veryfast -crf 23 -c:a aac -movflags +faststart "${outputPath}" -y`;

//   exec(cmd, (err, stdout, stderr) => {
//     fs.unlinkSync(inputPath); // Supprimer le fichier source

//     if (err || !fs.existsSync(outputPath)) {
//       return res.status(500).json({ success: false, error: 'FFmpeg a échoué', details: stderr });
//     }

//     // URL publique vers la vidéo découpée
//     const videoUrl = `${req.protocol}://${req.headers.host}/tmp/${outputFilename}`;
//     res.json({ success: true, video_url: videoUrl });
//   });
// });




// // Route contact.php — concatène plusieurs vidéos
// app.post('/concat', upload.array('videos'), (req, res) => {
//   if (req.files.length < 2) {
//     return res.status(400).json({ error: 'Au moins deux vidéos sont nécessaires' });
//   }

//   const tmpDir = 'tmp/';
//   const listPath = path.join(tmpDir, 'videos.txt');
//   const outputFile = path.join(tmpDir, `output_${Date.now()}.mp4`);

//   const fileList = req.files.map(file => `file '${path.resolve(file.path)}'`).join('\n');
//   fs.writeFileSync(listPath, fileList);

//   const cmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputFile}" -y`;

//   exec(cmd, (err, stdout, stderr) => {
//     req.files.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
//     fs.unlinkSync(listPath);

//     if (err || !fs.existsSync(outputFile)) {
//       return res.status(500).json({ success: false, error: stderr });
//     }
//     const outputUrl = `${req.protocol}://${req.headers.host}/${outputFile}`;
//     res.json({ success: true, output: outputUrl });
//   });
// });

// // Route capture.php — dernière image d'une vidéo
// app.post('/capture', upload.single('video'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ success: false, error: 'Vidéo manquante' });
//   }

//   const timestamp = Date.now();
//   const inputPath = req.file.path;
//   const outputImage = `tmp/last_frame_${timestamp}.jpg`;

//   const cmd = `ffmpeg -sseof -1 -i "${inputPath}" -vframes 1 "${outputImage}" -y`;

//   exec(cmd, (err, stdout, stderr) => {
//     fs.unlinkSync(inputPath);
//     if (err || !fs.existsSync(outputImage)) {
//       return res.status(500).json({ success: false, error: 'FFmpeg failed', details: stderr });
//     }
//     const imageUrl = `${req.protocol}://${req.headers.host}/${outputImage}`;
//     res.json({ success: true, image_url: imageUrl });
//   });
// });

// app.listen(PORT, () => console.log(`✅ Server ready at http://localhost:${PORT}`));




const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 8000;
const TMP_DIR = path.join(__dirname, 'tmp');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/tmp', express.static(TMP_DIR));

const upload = multer({ dest: TMP_DIR });

// ✔ Validation format de temps
function isValidTimeFormat(time) {
  return /^(\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2}|\d+(\.\d+)?)$/.test(time);
}

// ✔ Conversion d’un temps HH:MM:SS en secondes
function timeToSeconds(t) {
  if (/^\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  const parts = t.split(':').map(Number).reverse();
  return parts.reduce((acc, val, idx) => acc + val * Math.pow(60, idx), 0);
}

// 🚀 Découpage vidéo
app.post('/cut-video', upload.single('video'), (req, res) => {
  const { start, end } = req.body;
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Vidéo manquante' });
  }

  if (!start || !end || !isValidTimeFormat(start) || !isValidTimeFormat(end)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, error: 'Paramètres start ou end invalides' });
  }

  const startSec = timeToSeconds(start);
  const endSec = timeToSeconds(end);

  if (startSec >= endSec) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, error: 'Le temps de fin doit être supérieur au début' });
  }

  const inputPath = req.file.path;
  const timestamp = Date.now();
  const outputFilename = `output_${timestamp}.mp4`;
  const outputPath = path.join(TMP_DIR, outputFilename);

  const cmd = `ffmpeg -ss ${start} -to ${end} -i "${inputPath}" -c:v libx264 -preset veryfast -crf 23 -c:a aac -movflags +faststart "${outputPath}" -y`;

  exec(cmd, (err, stdout, stderr) => {
    fs.unlinkSync(inputPath);
    if (err || !fs.existsSync(outputPath)) {
      return res.status(500).json({ success: false, error: 'FFmpeg a échoué', details: stderr });
    }

    const videoUrl = `${req.protocol}://${req.headers.host}/tmp/${outputFilename}`;
    res.json({ success: true, video_url: videoUrl });
  });
});

// 🔗 Concaténation de vidéos
app.post('/concat', upload.array('videos'), (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ success: false, error: 'Au moins deux vidéos sont nécessaires' });
  }

  const listPath = path.join(TMP_DIR, 'videos.txt');
  const outputFile = path.join(TMP_DIR, `output_${Date.now()}.mp4`);

  const fileList = req.files.map(file => `file '${path.resolve(file.path)}'`).join('\n');
  fs.writeFileSync(listPath, fileList);

  const cmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputFile}" -y`;

  exec(cmd, (err, stdout, stderr) => {
    req.files.forEach(file => fs.existsSync(file.path) && fs.unlinkSync(file.path));
    fs.unlinkSync(listPath);

    if (err || !fs.existsSync(outputFile)) {
      return res.status(500).json({ success: false, error: 'FFmpeg concat échoué', details: stderr });
    }

    const outputUrl = `${req.protocol}://${req.headers.host}/tmp/${path.basename(outputFile)}`;
    res.json({ success: true, output: outputUrl });
  });
});

// 🖼 Capture dernière image
app.post('/capture', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Vidéo manquante' });
  }

  const timestamp = Date.now();
  const inputPath = req.file.path;
  const outputImage = path.join(TMP_DIR, `last_frame_${timestamp}.jpg`);

  const cmd = `ffmpeg -sseof -1 -i "${inputPath}" -vframes 1 "${outputImage}" -y`;

  exec(cmd, (err, stdout, stderr) => {
    fs.unlinkSync(inputPath);
    if (err || !fs.existsSync(outputImage)) {
      return res.status(500).json({ success: false, error: 'FFmpeg capture échoué', details: stderr });
    }

    const imageUrl = `${req.protocol}://${req.headers.host}/tmp/${path.basename(outputImage)}`;
    res.json({ success: true, image_url: imageUrl });
  });
});

app.listen(PORT, () => console.log(`✅ Serveur prêt sur http://localhost:${PORT}`));
