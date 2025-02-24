FROM node:18

# 安装基础依赖
RUN apt-get update \
    && apt-get install -y \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    wget \
    gnupg \
    --no-install-recommends

# 根据架构安装 Chromium
RUN if [ "$(uname -m)" = "x86_64" ]; then \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends; \
    else \
    apt-get update \
    && apt-get install -y chromium --no-install-recommends; \
    fi

# 清理 apt 缓存
RUN rm -rf /var/lib/apt/lists/*

# 设置环境变量
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
ENV CHROME_PATH=/usr/bin/google-chrome
ENV CHROMIUM_PATH=/usr/bin/chromium

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 设置环境变量
COPY .env .

# 暴露应用程序端口（假设是3000）
EXPOSE 3000

# 启动命令
CMD [ "npm", "start" ] 