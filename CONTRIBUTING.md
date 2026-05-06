# Contributing

Thank you for your interest in AI Skills Hub! We welcome all forms of contributions.

---

## How to Contribute

### Submit Skill Templates (Most Welcome!)

This is the simplest and most valuable way to contribute:

1. Use the "Submit Template" feature directly on the website
2. Or fork this repo, add a new Skill object in `src/lib/mock-data.ts`, and submit a PR

#### Skill Template Requirements

Each template must include:

- **Title**: Clear description of functionality, with version number (e.g., `v2.1`)
- **Subtitle**: One-line description, no more than 50 characters
- **Online Prompt**: For ChatGPT / Claude / Grok and similar platforms
- **Local Prompt**: For LM Studio / Ollama and similar local tools
- **Variable Definitions**: Variables the user needs to fill in (e.g., `{{topic}}`)
- **Before/After Example**: At least one real input/output comparison
- **Recommended Models**: Note recommended models and their use cases
- **Usage Steps**: Separate instructions for online and local usage

#### Quality Standards

- Prompts must be tested on at least 2 different models
- Output should be natural and free of obvious AI-sounding text
- Cover real productivity scenarios, not just demos

### Report Bugs

Submit bug reports in [Issues](../../issues), including:

- Problem description
- Steps to reproduce
- Expected behavior vs. actual behavior
- Browser and operating system information
- Screenshots (if applicable)

### Feature Requests

Submit feature requests in [Issues](../../issues), describing:

- What feature you'd like to see
- Why you need this feature
- Your envisioned use case

### Code Contributions

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a Pull Request

---

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/ai-skills-hub.git
cd ai-skills-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
src/
├── app/              # Page routes
├── components/       # Components
│   ├── ui/           # shadcn/ui base components
│   ├── layout/       # Layout components (Navbar, Footer)
│   ├── home/         # Homepage components
│   └── skill/        # Skill-related components
└── lib/
    ├── types.ts      # Type definitions
    ├── mock-data.ts  # Data source (add new templates here)
    └── categories.ts # Category definitions
```

---

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `style:` Code formatting (no logic change)
- `refactor:` Refactoring
- `perf:` Performance improvement
- `test:` Testing related
- `chore:` Build/toolchain related

Examples:
```
feat: add "Short Video Script Generator" skill template
fix: fix mobile nav menu not closing properly
docs: update README with deployment instructions
```

---

## Code of Conduct

- Respect every contributor
- Use friendly and inclusive language
- Accept constructive criticism
- Focus on what is best for the community

---

## Contact

- GitHub Issues: Submit bugs or suggestions
- Email: [TBD]

---

## License

This project uses the [Apache License 2.0](./LICENSE). By submitting a contribution, you agree that your code will be open-sourced under the Apache 2.0 license.
