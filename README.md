# dummy-mock
Referenced and Thanks to : https://medium.com/@aimvec/high-performance-mocking-for-load-testing-bd6d69610cc9

### preparation:
install docker  
install caddy server  

### How to: 
`cd path/to/target/dir/with/dockerfile`  
`docker build . -t dummymock`  
`docker images`  
`docker run -d --rm -p 9091:80 dummymock`  
`docker ps -a | grep dummymock`  

`caddy start`  

start to send request to dummymock service and customize the API response time(in milliseconds):  
`http://localhost:8020/?duration=300`


![Mock Service Workflow](dummymock.png)
![Mock Service Response](response.png)

P.S. 
Removed unused docker images
`docker rmi -f $(docker images -f "dangling=true" -q)`

You need to rebuild your docker image if you want to change your `response.json` file
