# frigorifico-backend

API for [frigorifico-react](https://github.com/lucianookdp/frigorifico-react), a web app built for Frigorífico Padilha as a community outreach project for Faculdade Campo Real.

Serves the product catalog (with image uploads), handles budget/quote requests, admin authentication, and a scoped chat assistant that answers customer questions about the business.

## Stack

Node.js, Express, MySQL (mysql2), JWT auth, bcrypt, Multer, OpenAI API.

## Running locally

Requires a MySQL database. The chat assistant needs an OpenAI API key — the rest of the API works without one.

```bash
cp .env.example .env   # fill in your own values
npm install
npm run dev
```

See `.env.example` for the required environment variables.

## License

MIT — see [LICENSE](./LICENSE).
