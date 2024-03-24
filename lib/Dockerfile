FROM node:lts-buster

RUN git clone https://github.com/Lexus-XD/EZRA-XD/ /root/X

WORKDIR /root/X

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

RUN npm install


CMD ["npm", "start"]
