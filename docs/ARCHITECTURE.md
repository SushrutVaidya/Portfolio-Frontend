# Architecture & Page Flow Reference

The full architecture document lives in the **backend repo**:

**[Portfolio-Backend/docs/ARCHITECTURE.md](https://github.com/SushrutVaidya/Portfolio-Backend/blob/main/docs/ARCHITECTURE.md)**

It covers:
- System architecture (Mermaid: Spring Boot + PostgreSQL + Redis + Nginx)
- Database schema (Mermaid ER diagram for `game_user` table)
- API endpoint reference (all 7 live + 2 planned endpoints)
- Complete page flow & user journey (Mermaid flowchart — 10 pages, two user paths)
- API data flow sequence diagrams (registration, card save, stats fetch, rickroll counter)
- Transition & animation design spec (77 @keyframes, per-page timing)
- Graceful degradation strategy
- Developer quick reference (commands, file map, localStorage keys)

The backend repo is the **source of truth** — update there, not here.
