# Imagen de desarrollo del frontend (TRD §3.3). La versión multi-stage llega en la Instancia C.
FROM node:24-alpine

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PNPM_HOME=/pnpm \
    PATH="/pnpm:$PATH" \
    pnpm_config_store_dir=/pnpm/store

# pnpm queda fijado por el campo packageManager de package.json.
# El store vive fuera de /app para no llenar el bind mount con miles de archivos.
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install

COPY . .

EXPOSE 5173

# pnpm install sincroniza node_modules (volumen) y pnpm-lock.yaml (bind mount) antes de arrancar
CMD ["sh", "-c", "pnpm install && pnpm dev --host 0.0.0.0"]
