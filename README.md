# BibLogos Editor

- What if you could ask things to the Bible? 
- In which cities has Jesus been with his disciples? 
- Who has seen Paul?

This editor helps with creating a dataset that may present those facts. It is mainly based on human work. A person can click on words or sentences in the bible text and link that to a corresponding description of it. For example you can click on "Alternative name" or "Person". After that the person can save it or send it in for review.

# Technical stack:

- SPARQL
- Turtle
- GitHub API for saving data and projects
- TypeScript
- https://github.com/WebReflection/ube
- universal-router
- Snowpack
- https://scripture.api.bible/

## A small demonstration of the product progress (links to YouTube, old version without Github integration)

[<img src="https://i.ytimg.com/vi_webp/XYsRmsiwMNY/maxresdefault.webp">](https://www.youtube.com/watch?v=XYsRmsiwMNY)

## Running the worker locally

- Navigate into /api
- `npx miniflare dist/api.mjs --watch --debug --modules --env ../.env`