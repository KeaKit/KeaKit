#!/usr/bin/env bash

echo "Installing global JS tooling..."

# Install Backend dependencies
cd /workspace/backend && ./mvnw install -DskipTests

# Install Frontend dependencies
cd /workspace/frontend && npm install

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

echo "Dev container ready 🚀"