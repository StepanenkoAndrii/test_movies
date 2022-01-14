Docker build: `docker build . -t mefta007/movies`  
Docker run: `docker run --name movies -p 8000:8080 -e APP_PORT=8080 mefta007/movies`  
Docker hub: https://hub.docker.com/repository/docker/mefta007/movies 

URLS:  
1. GET `localhost:8000/api/v1/movies` - to get all movies (with default limit of 20)  
   GET `localhost:8000/api/v1/movies?title=Gladiator&actor=Joaquin Phoenix&sort=title&limit=30&order=DESC&offset=5` -
   to get all filtered movies (parameters are title, actor, sort, limit, order, offset and search)  
2. POST `localhost:8000/api/v1/movies` - to create a new movie
3. PATCH `localhost:8000/api/v1/movies/234` - to update a movie with id 234   
4. DELETE `localhost:8000/api/v1/movies/234` - to delete a movie with id 234
5. GET `localhost:8000/api/v1/movies/235` - to get a movie with id 235
6. POST `localhost:8000/api/v1/movies/imported` - to import movies from downloaded file
   (file is in `./text/sample_movies.txt`)
7. POST `localhost:8000/api/v1/users` - to register a new user
8. POST `localhost:8000/api/v1/sessions` - to authorize a user 

If you use search parameter in the first url, put movie's title and actor's name separately
with comma (for example, `Gladiator, Joaquin Phoenix`)

Also, you need to put a JWT in header if using 1-6 urls 
(token will be given after user registration or authorization).
For example, in Postman, you have to specify header key as `Authorization`
and value as `Bearer <JWT>`, where `<JWT>` is given token. Also, if using
`body raw` creation, put in a header `Content-Type` as a key and `application/json`
as a value.  
Database is located in `./db/database.sqlite` if needed.  

I hope, everything will work properly :)

