docker rm -f chat-gpt-ui || echo 'Not found container'

docker build . -t chat-gpt-ui
docker run -d -p 40000:80 --name chat-gpt-ui chat-gpt-ui