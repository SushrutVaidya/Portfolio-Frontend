# Site navigation

How a visitor moves through the site. Two hosts, one build; DevQuest is decoupled
and served standalone at `/devquest/`.

## Flow

```mermaid
flowchart TD
  V([Visitor]) --> PRE[Preloader SV] --> NAV

  subgraph NAV[Persistent nav — every page]
    SV["SV → /"]:::n
    AB["About → /about"]:::n
    IX["Index ☰ → chapter overlay"]:::n
  end

  NAV --> HOME

  subgraph APEX[sushrutvaidya.in — full portfolio]
    HOME["/ Home"] --> INTRO[Intro]
    HOME --> NOW[01 Now · live API]
    HOME --> WORK[02 Work]
    HOME --> PLAY[03 Playground: loglens live + Forge]
    HOME --> PRAC[04 Practice]
    HOME --> STACK[05 Stack]
    HOME --> PAT[06 Patent]
    HOME --> CON[07 Contact]
    ABOUT["/about — hero, traits, interests, Now+Jukebox,\nSteam shelf, gaming corner, THE TV, lore"]
  end

  SV --> HOME
  AB --> ABOUT

  WORK --> WL["/work/loglens"]
  WORK --> WF["/work/forge"]
  WORK --> WD["/work/devquest"]
  WORK --> WP["/work/portfolio-platform"]
  WORK --> WS["/work/solar-plc"]

  WL -->|Open it| LL["/loglens — product page"]
  PLAY -->|live demo| LL
  WD -->|Open it| DQ

  IX -->|DevQuest →| DQ

  subgraph SUB[loglens.sushrutvaidya.in]
    LLSUB["/ — loglens page, standalone (no home nav)"]
    LLSUB -->|back-links| HOME
  end

  subgraph DEVQUEST[DevQuest — decoupled, /devquest/ standalone]
    LAND[landing.html] -->|Enter DevQuest| CAP[captcha · shape sort]
    CAP --> DT[devtype · typing]
    DT --> INC[incident · bug hunt]
    INC --> BULB[meet the developer\ntest/bulb-loading]
    DT --> LB[test/leaderboard]
    LAND -->|View Portfolio| HOME
  end

  classDef n fill:#fff,stroke:#1d1b18,stroke-width:2px;
```

## Notes

- **loglens has three doors:** the live demo (Home › Playground), the case study
  (`/work/loglens`), and the product page (`/loglens` on the apex, or standalone on
  the `loglens.` subdomain).
- **DevQuest is decoupled:** reached via the Work card (`/work/devquest` → "Open it")
  and the Index overlay ("DevQuest →"), both landing on `/devquest/` — a self-contained
  static sub-app (landing → 3 challenges → developer reveal) with its own nav and a
  "View Portfolio" link back to the apex. It is not part of the SPA router.
- **Two hosts, one build:** the apex serves everything; `loglens.sushrutvaidya.in`
  renders the product page on its own, without the home nav.
