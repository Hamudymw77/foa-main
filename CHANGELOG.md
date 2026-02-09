# Changelog

## [Unreleased] - 2026-02-04

### New Features
- **Transfers Overview**:
    - Created `TransfersPanel` component to display 2025/2026 Premier League transfers.
    - Implemented filtering by transfer type (Permanent, Loan, Free).
    - Added search functionality for players and clubs.
    - Added pagination for large lists of transfers.
    - Displays detailed transfer info: Fee, Contract Length, Date, and Transfer Type.
- **Data Caching & Persistence**:
    - Implemented `DataService` using `idb` (IndexedDB) for offline caching of scorers and transfers.
    - Added 15-minute auto-refresh policy for data.
    - Implemented `useTransferData` hook for data fetching and state management.
- **Top Scorers Updates**:
    - Integrated `flag-icons` library to replace text country codes with official SVG flags.
    - Updated `StatisticsPanel` to show detailed stats: Assists, Goals per Match Ratio, Minutes Played.
    - Implemented auto-refresh for top scorers data.

### UI Improvements
- **StatisticsPanel**:
    - Completely redesigned the player score and defense statistics display.
    - Removed `<br>` elements and improved layout structure using Flexbox and Grid.
    - Added visual country flags (emojis) for top scorers.
    - Implemented `lucide-react` icons (Trophy, Shield, Medal, Goal) for better visual hierarchy.
    - Added aesthetic improvements:
        - Modern card design with backdrop blur and sticky headers.
        - Rank badges with dynamic styling based on position (Gold, Silver, Bronze).
        - Hover effects and animations (fade-in).
    - Improved responsiveness for mobile, tablet, and desktop devices.
    - Enhanced accessibility with `aria-label` for flags.
    - Prepared text strings for localization.

### Refactor
- **Component Extraction**: Extracted inline UI logic from `app/page.tsx` into reusable components:
    - `MatchDetail`: Handles the detailed view of a selected match.
    - `FormationView`: Displays team formations.
    - `MatchEvents`: Shows the timeline of match events.
    - `MatchStatistics`: Displays match statistics.
    - `RecentResults`: Sidebar component for recent match results.
    - `UpcomingMatches`: Sidebar component for upcoming matches.
    - `LeagueTable`: Displays the league standings.
    - `StatisticsPanel`: Shows top scorers and best defense stats.
    - `MatchList`: Displays the list of matches.
    - `TransfersPanel`: Displays the list of transfers.
- **State Management**:
    - Created custom hooks to separate logic from UI:
        - `useFootballData`: Handles data fetching for standings and matches.
        - `useDashboardState`: Handles UI state (selected match, active tab, etc.).
        - `useStatisticsData`: Handles static statistics data (top scorers, best defense).
        - `useTransferData`: Handles transfer data.
    - Refactored `app/page.tsx` to use these hooks, significantly reducing complexity and cleaning up the main page.
- **File Organization**:
    - Created `app/components/` directory for better project structure.
    - Created `app/hooks/` directory for custom hooks.
    - Created `app/services/` directory for data services.
- **Layout Fixes**:
    - Fixed grid layout issues in `app/page.tsx` to properly align the match detail and sidebar components.

### Tests
- Added test files for verifying component and hook logic:
    - `app/components/__tests__/MatchDetail.test.tsx`: Tests for `MatchDetail` component.
    - `app/components/__tests__/LeagueTable.test.tsx`: Tests for `LeagueTable` component.
    - `app/components/__tests__/StatisticsPanel.test.tsx`: Tests for `StatisticsPanel` component.
    - `app/components/__tests__/TransfersPanel.test.tsx`: Tests for `TransfersPanel` component.
    - `app/hooks/__tests__/useDashboardState.test.ts`: Tests for `useDashboardState` hook.
    - `app/hooks/__tests__/useFootballData.test.ts`: Tests for `useFootballData` hook.
    - `app/hooks/__tests__/useStatisticsData.test.ts`: Tests for `useStatisticsData` hook.
- Configured Vitest for the project:
    - Renamed `vitest.config.ts` to `vitest.config.mts` for ESM compatibility.
    - Switched test environment to `happy-dom`.
    - Added `"test": "vitest"` script to `package.json`.

### Improvements
- Centralized data fetching logic.
- Improved code readability and maintainability by adhering to Single Responsibility Principle.
- Prepared the codebase for easier testing and future feature expansion.
