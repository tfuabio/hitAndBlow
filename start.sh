# Webサーバー起動スクリプト

# Dockerfileからコンテナをビルド
docker build -t hit-and-blow-app .

# Dockerコンテナを起動（停止時に自動で削除）
docker run --rm -d --name hit-and-blow-app -p 8080:80 hit-and-blow-app