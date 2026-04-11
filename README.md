# InterviewForge — AI Interview Question Generator

InterviewForge is an AI-powered web application that helps candidates and interviewers generate targeted technical and HR interview questions. By specifying a job role and an experience level, you can instantly get a curated list of questions along with expert answers, powered by the Groq API (Llama 3.3).

## Features

- **Personalized Questions**: Generate customized interview questions simply by providing a job role.
- **Difficulty Levels**: Choose from Easy (Entry level), Medium (2-4 years), and Hard (Senior/Lead level).
- **Technical & HR Sections**: Get a balanced mix of 5 technical questions and 3 HR questions with comprehensive answers.
- **Copy Functionality**: Easily copy all generated questions and answers to your clipboard with one click.
- **Modern UI**: A responsive, clean, and dynamic interface built with Vanilla JavaScript, HTML, and CSS.
- **Serverless API**: Ready to be deployed on Vercel using serverless functions to securely handle API calls.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend / API**: Node.js, Express (for local dev), Vercel Serverless Functions
- **AI Model**: Llama 3.3 70B via [Groq API](https://groq.com/)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- npm (comes with Node.js)

## Environment Variables

You need a Groq API Key to run this app. Get one for free at the [Groq Console](https://console.groq.com/keys).

Create a `.env` file in the root directory and add your API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Local Development

1. **Clone the repository** (if you haven't already).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the local server**:
   ```bash
   node server.js
   ```
4. **Open your browser** and visit `http://localhost:3000`.

## Deployment

This application is ready to be deployed on Vercel out of the box. The `vercel.json` and `api/generate.js` files are already configured for Vercel Serverless Functions.

1. Install the Vercel CLI or use the Vercel Dashboard.
2. Link your project to Vercel.
3. Make sure to add `GROQ_API_KEY` in your Vercel project's Environment Variables settings.
4. Deploy!

```bash
vercel --prod
```

## License

This project is open-source and available under the MIT License.
