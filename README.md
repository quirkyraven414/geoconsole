This is a project to create a fullstack website where user could select AOI and then accordingly return the AOI tiles.

MongoDB is used as a database

To test the code:

1. Pull the project
2. Dockerize the frontend and backend using
    - docker-compose up -d
    - docker-compose build
3. Make sure the geojson data is added to the mongodb in a db called geoDB with collection geoCollection
4. Open the frontend and then select your AOI and the corresponding intersecting tiles can be visualized
5. Note :
    - If not working, try with your backend not as a docker and running it as node application
    - As there can be issues with mongoDB connections
    - The project only dealt with selection of tiles (no other functionalities have been added)

