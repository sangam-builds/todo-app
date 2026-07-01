# Todo App 

## Steps to run the application locally

1. clone the repository
2. run npm install to install the dependencies
3. run node src/server.js to start the server


## Steps to build and run the application using docker

1. clone the repository
2. run docker build -t todo-app:latest .
3. run docker run -d --name todo-container -p 3000:3000 todo-app:latest
this is the change for the jenkin polling test