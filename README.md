# dummy-mock
Referenced and Thanks to : https://medium.com/@aimvec/high-performance-mocking-for-load-testing-bd6d69610cc9

### preparation:
install docker  
install caddy server  

### How to: 
`cd path/to/target/dir/with/dockerfile`  
`docker build . -t mymock`  
`docker images`  
`docker run -d --rm -p 9091:80 mymock`  
`docker ps -a | grep mymock`  

`caddy start`  

![Mock Service Response](response.png)

P.S. 
Removed unused docker images
`docker rmi -f $(docker images -f "dangling=true" -q)`

You need to rebuild your docker image if you want to change your `response.json` file
