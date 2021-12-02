# BibLogos Editor

- What if you could ask things to the Bible? 
- In which cities has Jesus been with his disciples? 
- Who has seen Paul?

This editor helps with creating a dataset that may present those facts. It is mainly based on human work. A person can login and click on words or sentences in the bible text and link that to a corresponding description of it. For example you can click on "Alternative name" or "Person".

# Technical stack:

- SPARQL
- Turtle
- Apache Jena
- TypeScript
- https://github.com/WebReflection/ube
- universal-router
- Snowpack
- Docker Compose for launching Apache Jena
- https://scripture.api.bible/

## A small demonstration of the product progress (links to YouTube)

[<img src="https://i.ytimg.com/vi_webp/XYsRmsiwMNY/maxresdefault.webp">](https://www.youtube.com/watch?v=XYsRmsiwMNY)

## Running the worker locally

- Navigate into /api
- `npx miniflare dist/api.mjs --watch --debug --modules --env ../.env`