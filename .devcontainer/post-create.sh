#!/usr/bin/env bash

echo "Installing global JS tooling..."

# Install Backend dependencies
cd /workspace/backend && ./mvnw install -DskipTests

# Install Frontend dependencies
cd /workspace/mobile && npm install

npm install -g \
  typescript \
  eslint \
  jest \
  expo-cli \
  eas-cli

echo "Installing React Native tooling..."
npm install -g react-native-cli

echo "Java tooling ready:"
java -version
mvn -version

echo "Node tooling ready:"
node -v
npm -v

echo "Installing Python and Locust for performance testing..."

sudo apt-get update -qq && sudo apt-get install -y python3 python3-pip python3-venv

python3 -m venv /home/vscode/.locust-env
/home/vscode/.locust-env/bin/pip install --upgrade pip
/home/vscode/.locust-env/bin/pip install locust

echo 'alias locust="/home/vscode/.locust-env/bin/locust"' >> /home/vscode/.bashrc
echo 'alias locust="/home/vscode/.locust-env/bin/locust"' >> /home/vscode/.zshrc 2>/dev/null || true

echo "Locust ready:"
/home/vscode/.locust-env/bin/locust --version

echo "Dev container ready 🚀"