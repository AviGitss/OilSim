import type { ParamGroup } from "@/types";

export const PARAM_GROUPS: ParamGroup[] = [
  {
    id: "sourcing",
    label: "Crude Sourcing",
    color: "#5b4fcf",
    icon: "◈",
    params: [
      {
        id: "gradeCount",
        label: "Active crude grades in basket",
        unit: "grades",
        min: 1,
        max: 60,
        def: 20,
        step: 1,
        desc:
          "Diversity of crude procurement basket — more grades increases substitution flexibility during supply disruptions",
      },
      {
        id: "spotShare",
        label: "Spot contract share",
        unit: "%",
        min: 0,
        max: 100,
        def: 30,
        step: 1,
        desc:
          "Higher spot share increases price and availability risk vs term contracts with fixed lifting schedules",
      },
      {
        id: "reserveBlock",
        label: "Reserve block release probability",
        unit: "%",
        min: 0,
        max: 100,
        def: 72,
        step: 1,
        desc:
          "Probability that allocated reserve block crude is released on schedule by the producing country — affected by quota changes, regulatory approvals, NOC priorities and geopolitical factors",
      },
      {
        id: "geoRisk",
        label: "Geopolitical disruption probability",
        unit: "% per month",
        min: 0,
        max: 50,
        def: 12,
        step: 1,
        desc:
          "Probability per month that a key supply corridor faces disruption — sanctions, armed conflict, export embargo or bilateral relationship breakdown",
      },
      {
        id: "sanctionsExp",
        label: "Sanctioned-origin exposure",
        unit: "% of basket",
        min: 0,
        max: 60,
        def: 18,
        step: 1,
        desc:
          "Share of crude basket sourced from origins facing active or potential sanctions pressure — increases grade-substitution cost and legal risk",
      },
    ],
  },
  {
    id: "maritime",
    label: "Maritime & Freight",
    color: "#0f6e56",
    icon: "◉",
    params: [
      {
        id: "vesselDelay",
        label: "Mean vessel delay",
        unit: "days",
        min: 0,
        max: 20,
        def: 3,
        step: 0.5,
        desc:
          "Average delay relative to scheduled arrival — driven by port congestion, adverse weather, charter market tightness and mechanical issues",
      },
      {
        id: "freightVol",
        label: "Freight rate volatility",
        unit: "% σ / month",
        min: 0,
        max: 40,
        def: 15,
        step: 1,
        desc:
          "Monthly standard deviation of freight rates — higher values increase landed cost uncertainty and reduce cargo scheduling confidence",
      },
      {
        id: "stsRisk",
        label: "STS transfer dependency",
        unit: "% of cargoes",
        min: 0,
        max: 80,
        def: 20,
        step: 1,
        desc:
          "Share of cargoes requiring ship-to-ship transfer — each STS operation adds 1–3 days of delay, increases insurance costs and introduces additional risk events",
      },
      {
        id: "charterTight",
        label: "Charter market tightness",
        unit: "index 0–100",
        min: 0,
        max: 100,
        def: 40,
        step: 1,
        desc:
          "0 = ample vessel availability · 100 = extreme tightness. Affects both freight cost and the ability to substitute alternative cargoes at short notice",
      },
    ],
  },
  {
    id: "port",
    label: "Port & Terminal",
    color: "#854f0b",
    icon: "◆",
    params: [
      {
        id: "jettyCong",
        label: "Jetty / berth average wait time",
        unit: "days",
        min: 0,
        max: 10,
        def: 1.5,
        step: 0.5,
        desc:
          "Average waiting time at the receiving terminal before discharge begins — driven by berth occupancy, tide windows and operational efficiency",
      },
      {
        id: "spmDowntime",
        label: "Primary terminal downtime",
        unit: "% days / year",
        min: 0,
        max: 30,
        def: 5,
        step: 1,
        desc:
          "Percentage of days per year that the primary crude receiving facility is unavailable — weather, planned maintenance, equipment failure or safety shutdowns",
      },
      {
        id: "pipeUtil",
        label: "Onshore pipeline utilisation",
        unit: "% of capacity",
        min: 50,
        max: 100,
        def: 80,
        step: 1,
        desc:
          "Pipeline throughput as % of design capacity — above 90% creates scheduling conflicts, reduces scheduling flexibility and increases delay probability",
      },
      {
        id: "tankBuffer",
        label: "Tank farm inventory buffer",
        unit: "days of cover",
        min: 5,
        max: 45,
        def: 18,
        step: 1,
        desc:
          "Crude inventory in days of refinery throughput — lower values require faster disruption response and increase stock-out risk during any supply interruption",
      },
    ],
  },
  {
    id: "refinery",
    label: "Refinery Configuration",
    color: "#185fa5",
    icon: "◇",
    params: [
      {
        id: "cduUtil",
        label: "CDU utilisation target",
        unit: "% of nameplate",
        min: 60,
        max: 110,
        def: 95,
        step: 1,
        desc:
          "Target throughput as % of nameplate capacity — above 100% leaves no buffer for feed disruptions and compounds the impact of any supply shortfall",
      },
      {
        id: "gradeFlx",
        label: "Crude grade flexibility index",
        unit: "score 0–100",
        min: 0,
        max: 100,
        def: 60,
        step: 1,
        desc:
          "Number and diversity of crude grades processable without unit modifications — higher scores enable cost-effective substitution during supply disruptions",
      },
      {
        id: "maintenance",
        label: "Planned maintenance window",
        unit: "days / year",
        min: 0,
        max: 60,
        def: 20,
        step: 1,
        desc:
          "Scheduled CDU downtime for turnarounds and maintenance — foreseeable and plannable, but reduces annual crude processing capacity",
      },
      {
        id: "secUnits",
        label: "Secondary unit availability",
        unit: "% uptime",
        min: 50,
        max: 100,
        def: 88,
        step: 1,
        desc:
          "Availability of key secondary processing units (hydrocracker, coker, VGO hydrotreater) — constrains crude slate optimisation range and GRM maximisation",
      },
    ],
  },
];

export const ALL_PARAMS = PARAM_GROUPS.flatMap((g) => g.params);

export const DEFAULT_VALUES = Object.fromEntries(
  ALL_PARAMS.map((p) => [p.id, p.def])
) as Record<string, number>;
