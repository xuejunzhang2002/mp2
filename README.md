# Kanto — Pokémon Field Guide

A React + TypeScript single-page app for the original 151 Pokémon, using live PokéAPI data, Axios, and React Router. The course assignment is preserved below.

## Run locally

Requires Node.js 20.19+ (or 22.12+).

```bash
npm ci
npm run dev
```

On shared Linux servers that report `ENOSPC` file-watcher errors, run `CHOKIDAR_USEPOLLING=true npm run dev` instead.

Open http://localhost:5173/mp2/. Build with `npm run build`; serve the production build with `npm run preview`.

## Implemented features

- List view: immediate name/number search; five sort properties (number, name, height, weight, base stat total), all ascending/descending.
- Gallery view: official Pokémon artwork, multi-select type filters (matches any selected type), and search/sort controls.
- Detail view: `/pokemon/:id`, types, height, weight, abilities, six stats, and previous/next navigation that wraps within the selected results. Direct visits use the full collection.
- Search, sort, and filters persist in the URL; returning from a detail preserves the originating view. Data is cached in localStorage, with at most six concurrent Axios requests on the first visit.
- Loading, empty results, failed artwork, network errors/retry, and invalid routes have explicit UI states. Responsive desktop/mobile layouts, labeled controls, and reduced-motion support are included.
- All application styling is in an external CSS file. No inline styles, inline executable scripts, or layout tables are used.

## Verify

```bash
npm run build
npm test
npm run format:check
```

The six Playwright tests cover search, all sorts/directions, multi-select filters, navigation from both views, direct detail links/reload, wraparound, error recovery/cache, and mobile overflow. Tests mock API responses for repeatability; the app itself uses live data. Tests use `/usr/bin/google-chrome`; set `CHROME_PATH` to your Chrome/Chromium executable on other systems. A production build must exist before running the tests.

## GitHub Pages deployment

The included course workflow installs dependencies with `npm ci`, builds, and publishes `dist/`. Vite's `base` is `/mp2/` and BrowserRouter reads that same base. The build also creates `dist/404.html`, allowing GitHub Pages to render clean detail URLs on direct visits and refreshes. GitHub Pages returns HTTP 404 for these fallback requests even though the app renders correctly.

1. Create your own **public** repository named `mp2` using the course template. Do not push to the class repository.
2. Point `origin` at your new repository (the local clone initially points to the course template).
3. In the new repository, set **Settings → Pages → Source → GitHub Actions**.
4. Commit and push this project, including `package-lock.json`. The expected URL is `https://<username>.github.io/mp2/`.
5. After Actions completes, open the deployed home page and directly open `/mp2/pokemon/25` to verify both routes.

If using a different repository name, change `base` in `vite.config.ts` accordingly before deployment.

## Submission checklist / demo outline

- Record a video of the **deployed** site, at most three minutes, with the address bar visible.
- 0:00–0:30: show list items; type `saur`, then `#025`, and clear the query.
- 0:30–1:00: sort by name and weight; show both ascending and descending.
- 1:00–1:35: open Gallery; select Grass and Fire, deselect one, then clear filters.
- 1:35–2:15: enter details from a gallery card; show attributes and previous/next. Return and enter details from a list row.
- 2:15–2:40: directly visit or refresh `/mp2/pokemon/25`; briefly show the mobile layout.
- Upload the recording to Google Drive, share with the address in the assignment, and enter the link in the course submission form.
- Export and submit the **full actual AI conversation** alongside source code, as the course requires; this README is not a substitute for chatlogs. Complete the LLM-experience survey yourself.
- Course deadline: **October 6, 2026, 11:59 PM Central Time**.

## Sources and AI disclosure

Implementation was generated with OpenAI Codex in response to the student's request, then verified with TypeScript, a production build, automated browser tests, and a live API browser smoke test. Review and understand the implementation before submitting. No other student's implementation was used.

Referenced documentation and resources:

- Assignment: https://github.com/cs409-fa25/mp2
- PokéAPI documentation and Pokémon data: https://pokeapi.co/docs/v2/
- Official artwork returned by PokéAPI: https://github.com/PokeAPI/sprites
- React Router installation/routing: https://reactrouter.com/start/declarative/installation
- Vite base configuration: https://vite.dev/config/shared-options.html#base
- UI icons: Lucide (`lucide-react`, ISC license), https://lucide.dev/
- Fonts: DM Sans and Manrope via Google Fonts, https://fonts.google.com/ (SIL Open Font License).
- Dependencies used: React, React DOM, React Router, Axios, TypeScript, Vite, Playwright, and Prettier; exact versions are recorded in `package-lock.json`.

Pokémon names and artwork belong to Nintendo / Creatures / GAME FREAK. This is an unofficial educational project.

---

# MP 2: Front-end App
### Due: Tuesday, Oct 6, 2026, 11:59PM CT

## Table of Contents
1. [Assignment](#assignment)
2. [Grading Breakdown](#grading-breakdown)
3. [Tips](#tips)
4. [Rules](#rules)
5. [Getting Started](#getting-started)
6. [Submission Details](#submission-details)

## Assignment

#### Task
In this programming assignment, you will implement a front-end interface using React that consumes an API. Please read through the entire MP before you start.

#### Requirements
Create a single-page React app that lets users interact with the data from one of the following APIs.
  - [TMDB](https://www.themoviedb.org/documentation/api)
  - [Pokemon](https://pokeapi.co/)
  - [NASA](https://api.nasa.gov/index.html)
  - [Marvel](https://developer.marvel.com/)
  - [Jelly Belly Wiki](https://jelly-belly-wiki.netlify.app/)
  - [The Meal DB](https://www.themealdb.com/api.php)
  - [Art Institute of Chicago](https://api.artic.edu/docs/) 
  - More APIs if you want to explore [here](https://publicapis.dev) (please keep it class appropriate) 🫵🤨📸.

**Note that you may need to create an account and/or acquire an API key for some of the APIs. GitHub won’t restrict you from pushing API keys, but may send an email to say some keys are exposed. Because of this, please don't use any paid APIs.**

**The API you are working with may become temporarily unavailable. If/when this happens, it doesn't mean you are blocked from working on the MP. You can mock the data, i.e. create a local hard coded response and use that instead of making the request.**

**You may need to deal with APIs having rate-limiting policies. You can find ways to get around them like caching the results of large and common API calls**

**These are also good opportunities to think about how your app should handle errors.**

Your app should have the following features:
  - **A list view**:  where users can input a query into a search bar and the app returns a list of results that match the query (i.e. searching movies or pokemon). There should also be a way to sort the search results based on different properties of the results (such as the name or rank) and of specifying an ordering (ascending and descending). Also, the search bar should filter as you type. You can sort and filter in the client side.
  - **A gallery view**: that displays some kind of image media from the chosen API (gallery of movie posters). The gallery view should also have some kind filtering attribute where users can select one or many attributes and filter the gallery by them (i.e. genres of films or music).
  -  **A detail view**: When an item in the search view or the gallery view is clicked, the app should display the different attributes of the selected item. Also, this view should have previous and next buttons (can be implemented with arrows) that lets the user cycle through the list of objects. A detail view should have a specific route when navigated to. Basically, a user should be able to access the detail route through a specific url.

Here's an old example that fulfills these requirements: https://www.youtube.com/watch?v=DmDZuAr7QJE

You will also be required to use following tools:
  - Use [React Router](https://reactrouter.com/web/guides/quick-start) for routing.
  - Use [Axios](https://www.npmjs.com/package/axios) for API calls.
  - Use [TypeScript](https://www.typescriptlang.org/docs/handbook/react.html).

## Grading Breakdown
Total Points : 100

List View:
  - Does the list view display relevant items from the chosen API ? (4 points)
  - Does the search bar filter down items based on the search? (8 points)
  - Can you sort by at least 2 properties?  (8 points)
  - Can the properties be sorted in Ascending and Descending order?  (8 points)

Gallery View:
  - Is the gallery composed of item media?  (4 points)
  - Does clicking on a filter change results accordingly?  (8 points)

Details View:
  - Does clicking on an item in List View take you to the Details View?  (10 points)
  - Does clicking on an item in Gallery View take you to the Details View?  (10 points)
  - Does the Details View contain item details?  (8 points)
  - Do the PREVIOUS and NEXT buttons work correctly?  (10 points)

Other:
  - Does the implementation use React Router and TypeScript?  (12 points)
  - Design (10 points)

## Tips
  - Start early! This is first MP that uses React so start ahead.
  - Visit https://reactjs.org/docs/faq-structure.html for examples on how to structure your React files.
  - You may use a React component library for this MP.
  - We recommend using [Normalize.css](https://necolas.github.io/normalize.css/).
  - We recommend using [CSS Modules](https://vite.dev/guide/features.html#css-modules), which Vite supports out of the box via `*.module.css`.

## Rules
1. This is an individual assignment. No collaboration is permitted.
2. It is not permitted to copy/paste code that is not your own. You are, however, free to look at different code sources for inspiration and clarity. All sources (code as well as reading material) that you reference to complete this assignment must be declared in the submission.
3. There should be no use of inline styling.
4. No inline script tags should be used.
5. HTML tables cannot be used for layout.
6. If you think something you’re doing might not be acceptable, please ask on Piazza.
7. We *strongly* recommend using `Vite` to get your MP started. If you ignore this, we will not help with any environment issues.

## Getting Started
1. Use `Vite` (see below) to generate your MP starter code, then run `npm install`.
2. After running `npm run dev` open a browser and go to `http://localhost:5173/` to view your page.
3. Open up `src/App.tsx` to start building your first component. Visit https://react.dev/learn for many official, high quality resources to help get you started.

### Vite
[Vite](https://vite.dev/) generates a React starter project that requires no immediate configuration, and is one of the tools [React officially recommends](https://react.dev/link/cra) now that Create React App is deprecated. Use the **react-ts** template:

```
npm create vite@latest . -- --template react-ts
```

If Vite does **not** install dependencies for you, run `npm install` afterwards. The dev server is `npm run dev` (not `npm start`), and a production build goes to `dist/` (not `build/`).


## Submission Details

Here's what you will need to submit:
1. On the [class repo](https://github.com/cs409-fa25/mp2), click **Use this template** > **Create a new repository**. Name it `mp2` and make it **public** (GitHub Pages requires a public repo on a free account). Then clone it: `git clone git@github.com:<your-github-username>/mp2.git`
2. `cd mp2`, then scaffold a Vite + React + TypeScript project **in place**:
```
npm create vite@latest . -- --template react-ts
```
  - The directory already has `README.md` and `.github/`, so Vite will ask how to proceed. Choose **"Ignore files and continue"**. (Do NOT choose "Remove existing files" -- that deletes the deploy workflow.)
  - **Note:** Vite's template will overwrite `README.md`. Please pay attention to this and use an appropriate method to restore it if needed.
3. Install dependencies:
```
npm install
```
  - This also creates `package-lock.json`. **Commit it** -- the deploy workflow runs `npm ci`, which fails without a lockfile.
4. Set `base` in `vite.config.ts` so the deployed site can find its assets:
```ts
export default defineConfig({
  plugins: [react()],
  base: '/<your-github-repo-name>/',   // e.g. '/mp2/' -- must match the repo name
})
```
  - Getting this wrong produces a blank page with 404s on your JS/CSS, not a build error.
5. In your `BrowserRouter` or `Router` component, set the basename to match:
```
<BrowserRouter basename={import.meta.env.BASE_URL}>
  ...
</BrowserRouter>
```
  - Note: Should use `<Link/>` component instead of `<a>` to have the same basename.
6. Set GitHub Pages Deployment Source to Github Actions
   - In your Github repo, go to Settings > Pages > Build and Deployment > Source > Select "GitHub Actions"
7. Commit and push your local changes to this new repository.
```
git add . # "." adds all changed files, can also add specific files too
git commit -m "[my-commit-message]" # message should be clear and meaningful
git branch -M main
git push origin main
```
8. `.github/workflows/deploy.yml` file automatically makes a GitHub CI pipeline run to deploy your code. After the pipeline finishes, your site should be live at `https://<your-github-username>.github.io/mp2`. **It should take around 1 minute.**
9. Make a video (3 minutes max) demo-ing your deployed website and upload it to Google Drive. Share it with `uiuc.web.programming@gmail.com` and put the share link in the submission form.
- Show the url to prove you are on your deployed website. Then show all the requirement features you fulfilled in your mp.
- If you were unable to deploy your website, you can demo your mp locally for some point deduction (hard capped at 80%)
  - Just make sure you do `git status` and `git log` first so we can see your last edits.
10. Fill out and submit the form [here](https://forms.gle/PkYq9RaMFG8MaMjF7).

## Large Language Model (LLM) Usage Policy
We acknowledge the transformative potential of LLMs in generating code; however, we are still in the nascent stages of understanding how to embed LLMs in developer workflows to write code more efficiently while maintaining quality. Therefore, we will not be teaching students directly how to use LLMs to develop web applications.

As part of this class, we do encourage students to experiment with LLM services such as OpenAI's ChatGPT to generate source code for MPs. If LLMs are used to generate code for an MP, students must (1) submit their chatlogs along with their source code, and (2) answer survey questions related to their experience using LLMs in the grading form. Failure to do this will be a violation of the academic integrity policy of this course.
