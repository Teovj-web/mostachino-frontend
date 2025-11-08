# --- ETAPA 1: El Constructor (Node.js + Gulp) ---
# --- ETAPA 1: El Constructor (Node.js + Gulp) ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos solo lo necesario para instalar dependencias
COPY package.json package-lock.json ./
RUN npm install


# Ahora copiamos todo el código fuente
COPY . .

# Corremos la tarea "build" que definimos en gulpfile.js
RUN node ./node_modules/gulp/bin/gulp.js build

# --- ETAPA 2: El Servidor (Nginx) ---
FROM nginx:alpine

# Copiamos nuestra configuración personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiamos los archivos listos (de la Etapa 1)
# COPY --from=builder /app/public /usr/share/nginx/html
COPY --from=builder /app/public/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
