# Indicium: Project Description & Google Stitch Strategy

## Project Description

**Indicium** is a data-driven intelligence platform designed to empower urban planners, developers, and community stakeholders with real-time insights into the **Austin–Round Rock, TX** real estate market. By synthesizing disparate data sources (FRED, Census Bureau, HUD) into a high-performance geospatial dashboard, the project facilitates informed decision-making to address urban challenges.

### Core Value Proposition
- **High-Fidelity Geospatial Visualization**: Layered heatmaps for rent, permits, and job growth using the Google Maps JavaScript API.
- **Side-by-Side Market Comparison**: A specialized tool for benchmarking multiple geographies against key economic indicators.
- **Secure Data Access**: JWT-based authentication with social login (Google/GitHub/Microsoft) and persistent user watchlists.

### UN Sustainable Development Goals (SDGs)
1.  **SDG 11: Sustainable Cities and Communities**: Providing data to support affordable housing initiatives and sustainable urban growth.
2.  **SDG 8: Decent Work and Economic Growth**: Monitoring job growth and permit activity to identify economic opportunities and gaps.

---

## Implementing the Frontend with Google Stitch

[Google Stitch](https://stitch.google.com) (Experimental) is an AI-powered UI design tool that bridges the gap between conceptual design and functional code. For the Google Solution Challenge, leveraging Stitch demonstrates advanced usage of Google's AI ecosystem (Gemini 2.5).

### 1. Generative Layout Ideation
Use natural language prompts in Stitch to explore dashboard layouts.
- **Prompt Example**: *"Generate a dark-themed geospatial dashboard for real estate analytics. Include a sidebar for map layer controls, a top navigation bar with user profile, and a responsive grid for economic metric charts."*
- **Iteration**: Use Stitch's **Experimental Mode (Gemini 2.5 Pro)** to refine the "Premium Dark" aesthetic with glassmorphic elements.

### 2. Component Design System
Stitch can generate a consistent design system that matches our current "Premium Dark" theme.
- **Typography & Colors**: Define variables in Stitch for `--accent-glow`, `--bg-secondary`, and custom gradients.
- **Export to Figma**: Sync the generated designs to Figma to fine-tune the interactions and Auto Layout before coding.

### 3. Rapid Prototyping for the Comparison Tool
The Comparison View requires a specialized interface.
- **Prompt**: *"Design a side-by-side comparison screen for two urban markets. Show vertical bar charts for Median Rent and Job Growth. Include a 'VS' divider and a clear 'Back to Dashboard' navigation."*
- **Code Export**: Use Stitch's code export feature to generate React/TypeScript boilerplate for the `ComparisonView.tsx` and `MetricChart.tsx` components.

### 4. Accessibility & Mobile Responsiveness
Use Stitch to auto-generate responsive variations of the dashboard.
- Generate specific layouts for **iOS/Android viewports** to ensure the map and charts remain usable on small screens.
- Review the generated HTML/CSS against **WCAG compliance** helpers within the Stitch interface.

### Technical Integration Flow
1.  **Ideate**: Use Stitch to generate UI mocks.
2.  **Refine**: Export to Figma for final polish.
3.  **Implement**: Extract JSX/CSS from Stitch/Figma and integrate into the existing Vite + React project.
4.  **Verify**: Use the Google Maps API and backend FastAPI services to hydrate the generated UI with real data.
