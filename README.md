# Elasticsearch Engineering Academy · Interactive Portal

A beautiful, dependency-light static dashboard that automatically discovers new lessons.

## Quick start

Requirements: Node.js >= 20 and optionally Python 3.

```bash
npm run check
python -m http.server 8000 -d site
```

Open <http://localhost:8000/>. `npm run build` rebuilds `site/data/catalog.json`; `npm test` validates lesson IDs, HTML existence, roadmap counts and URL paths. You can also open `site/index.html` directly from disk: the generator embeds an offline catalog in `site/data/catalog.js` as well as writing `site/data/catalog.json`. For testing actual hosting paths use the local HTTP server.

## Publish a lesson (the only supported workflow)

1. Choose its reserved ID (e.g. `M02-L01`) and verify the module exists in `site/data/roadmap.json`.
2. Create `site/lessons/M02-L01/index.html` (HTML, visual diagram, hands-on tasks, sources and self-check).
3. Create `site/lessons/M02-L01/lesson.json` with this metadata:

```json
{
  "id": "M02-L01",
  "moduleId": "M02",
  "title": "Docker & Elasticsearch — первая лаборатория",
  "summary": "Локальная среда, healthcheck и первые REST-запросы",
  "durationMinutes": 90,
  "kind": "Interactive lesson",
  "tags": ["Docker", "Kibana", "REST"],
  "publishedAt": "2026-11-18"
}
```

4. Run `npm run check`. You should see the new count in `site/data/catalog.json`.
5. Commit both files and the regenerated catalog. On CI, the catalog is **rebuilt** from the actual lesson folders before deployment.
6. Dashboard navigation automatically shows the new lesson; no manual changes to `index.html` or `dashboard.js`.

**Do not create empty placeholder HTML files.** Future modules are visible through the roadmap, while only published lessons become clickable.

## Information boundaries

| Where | What | Never place here |
| --- | --- | --- |
| GitHub repo | HTML lessons, code, tests, source references, and publication catalog | passwords, private data, secret tokens |
| Google Sheets | personal educational progress, scores, weak areas, code-review evidence | API keys |
| Dashboard | module & lesson navigation, number of *published lessons* | fabricated skill mastery |

The dashboard displays **publication readiness**, not the learner's verified educational progress. To show private scores in the website later, we need an explicitly authorized authenticated backend or sanitized private data flow; no Google Sheets API key is embedded in frontend code.

## Hosting

`.github/workflows/academy-pages.yml` automatically builds, tests and deploys the `site/` directory to GitHub Pages when Pages is enabled, supported by the GitHub plan, and repository Actions variable `ENABLE_PAGES` is set to `true`. The deployment is public even for eligible private repositories. Do not publish private scores or secrets into the site. Until you deliberately set `ENABLE_PAGES=true`, GitHub Actions runs validation only and does not publish the website. If the current GitHub plan does not permit Pages for private repos, use the localhost workflow or a suitably access-controlled static hosting solution, and keep the repository private.

## Initial modules

M00–M18 live in `site/data/roadmap.json`. The initial set contains 19 modules, 137 planned lessons and 3 published HTML lessons. Modules are added to dashboard through the roadmap; lessons are added from their metadata and HTML files.

## Quality gate (before merging)

- Clear learning objectives, prerequisites and step-by-step explanation
- Rich but accurate diagrams / interactive simulations (label approximations)
- Runnable or clearly versioned code examples
- Lab assignment with acceptance criteria and self-check
- Accessibility: responsive, keyboard navigation, semantic HTML and reduced-motion option
- Security: synthetic data, no credentials, no implicit production settings
- `npm run check` passes
- Manual browser review at desktop and mobile widths
- Review of lesson code and conceptual correctness by mentor

## Tracker

<https://docs.google.com/spreadsheets/d/1RAOCwPvpiUlYKvzrWvx7bxCZuvduTQ9TslzMvbG4WKM/edit>

## Lesson design system

New module chats should start from `templates/lesson-template.html` and adapt all explanations, simulators, quizzes and code to the actual subject. The placeholder example is **not** published to the navigation. Always create a new `lesson.json` next to the final HTML. Each lesson can use inline CSS/JS for offline portability, or reusable JS/CSS assets as the course grows. Do not distribute an unfinished template as a lesson.
