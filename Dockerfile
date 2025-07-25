# Base officielle Node.js avec Debian slim
FROM node:18-slim

# Installer FFmpeg natif
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Créer dossier de travail
WORKDIR /app

# Copier package.json & package-lock.json (si existant)
COPY package*.json ./

# Installer dépendances Node.js
RUN npm install

# Copier tout le code de l'application
COPY . .

# Créer dossier tmp pour multer (autorisation + persist)
RUN mkdir -p tmp && chmod 777 tmp

# Exposer le port d'écoute de l'app
EXPOSE 8000

# Commande de lancement
CMD ["node", "server.js"]
