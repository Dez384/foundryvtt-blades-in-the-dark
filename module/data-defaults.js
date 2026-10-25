/** Defaults migrated from the original template.json. */
export const systemDataDefaults = {
  "Actor": {
    "🕛 clock": {
      "name": "",
      "type": 4,
      "value": "0",
      "owner": "",
      "color": "black"
    },
    "character": {
      "alias": "",
      "look": "",
      "heritage": "",
      "background": "",
      "background-details": "",
      "vice": "",
      "vice-purveyor": "",
      "playbook": "",
      "crew": [],
      "edge": {
        "value": 0,
        "max": 1
      },
      "acquaintances": [],
      "acquaintances_label": "BITD.Acquaintances",
      "stress": {
        "value": [
          0
        ],
        "max": 9,
        "max_default": 9,
        "name_default": "BITD.Stress",
        "name": "BITD.Stress"
      },
      "trauma": {
        "max": 4,
        "max_default": 4,
        "value": [
          0
        ],
        "name": "BITD.Trauma",
        "name_default": "BITD.Trauma",
        "options": [
          "BITD.TraumaCold",
          "BITD.TraumaHaunted",
          "BITD.TraumaObsessed",
          "BITD.TraumaParanoid",
          "BITD.TraumaReckless",
          "BITD.TraumaSoft",
          "BITD.TraumaUnstable",
          "BITD.TraumaVicious"
        ],
        "list": []
      },
      "healing-clock": [
        0
      ],
      "healing_clock": {
        "value": [
          0
        ],
        "max": 4,
        "min": 0
      },
      "experience": [
        0
      ],
      "experience_max": 8,
      "experience_clues": [
        "BITD.ClassExpClue3",
        "BITD.ClassExpClue2"
      ],
      "exp_clock": {
        "value": 0,
        "number": 0,
        "size": 6,
        "color": "black"
      },
      "coins": [
        0
      ],
      "coins_stashed": [
        0
      ],
      "coins_max": {
        "hand": 4,
        "stash": 40
      },
      "special_abilities": [],
      "loadout": 0,
      "load_level": "",
      "selected_load_level": "",
      "base_max_load": 0,
      "harm": {
        "light": {
          "one": "",
          "two": ""
        },
        "medium": {
          "one": "",
          "two": ""
        },
        "heavy": {
          "one": ""
        },
        "deadly": {
          "one": ""
        }
      },
      "armor-uses": {
        "armor": 0,
        "heavy": 0,
        "special": 0
      },
      "attributes": {
        "insight": {
          "exp": 0,
          "exp_max": 6,
          "bonus": 0,
          "label": "BITD.SkillsInsight",
          "skills": {
            "hunt": {
              "label": "BITD.SkillsHunt",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "study": {
              "label": "BITD.SkillsStudy",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "survey": {
              "label": "BITD.SkillsSurvey",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "tinker": {
              "label": "BITD.SkillsTinker",
              "value": 0,
              "max": 3,
              "min": 0
            }
          }
        },
        "prowess": {
          "exp": 0,
          "exp_max": 6,
          "bonus": 0,
          "label": "BITD.SkillsProwess",
          "skills": {
            "finesse": {
              "label": "BITD.SkillsFinesse",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "prowl": {
              "label": "BITD.SkillsProwl",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "skirmish": {
              "label": "BITD.SkillsSkirmish",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "wreck": {
              "label": "BITD.SkillsWreck",
              "value": 0,
              "max": 3,
              "min": 0
            }
          }
        },
        "resolve": {
          "exp": 0,
          "exp_max": 6,
          "bonus": 0,
          "label": "BITD.SkillsResolve",
          "skills": {
            "attune": {
              "label": "BITD.SkillsAttune",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "command": {
              "label": "BITD.SkillsCommand",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "consort": {
              "label": "BITD.SkillsConsort",
              "value": 0,
              "max": 3,
              "min": 0
            },
            "sway": {
              "label": "BITD.SkillsSway",
              "value": 0,
              "max": 3,
              "min": 0
            }
          }
        }
      }
    },
    "npc": {
      "name": "",
      "description_short": "",
      "description": "",
      "associated_class": "",
      "associated_faction": "",
      "associated_crew_type": "",
      "notes": ""
    },
    "crew": {
      "name": "",
      "reputation": [
        0
      ],
      "lair": "",
      "tier": 0,
      "deity": "",
      "rep2": {
        "value": "",
        "visible": false,
        "label": "BITD.Description"
      },
      "hold": [
        "strong"
      ],
      "experience": [
        0
      ],
      "exp_clock": {
        "value": 0,
        "number": 0,
        "size": 6,
        "color": "black"
      },
      "hold_types": [
        "weak",
        "strong"
      ],
      "coins": {
        "max": 4,
        "value": [
          0
        ]
      },
      "vault": {
        "value": [
          0
        ],
        "max": 0
      },
      "turf": {
        "descriptions": [],
        "max": 6,
        "bonus": 0
      },
      "features": [],
      "heat": [
        0
      ],
      "wanted": [
        0
      ],
      "acquaintances": [],
      "acquaintances_label": "BITD.Contacts",
      "hunting_grounds": [],
      "hunting_grounds_label": "BITD.HuntingGrounds",
      "scoundrel": {
        "add_trauma": 0,
        "add_stress": 0,
        "mastery": false
      },
      "max": {
        "heat": 9,
        "tier": 4,
        "wanted": 4,
        "rep": 12,
        "exp": 10
      }
    },
    "factions": {
      "name": ""
    }
  },
  "Item": {
    "faction": {
      "description": "",
      "type": "",
      "tier": 0,
      "goal_1": "",
      "goal_1_clock_max": 0,
      "goal_2": "",
      "goal_2_clock_max": 0,
      "turf": "",
      "assets": "",
      "quirks": "",
      "notables": "",
      "allies": "",
      "enemies": "",
      "situation": "",
      "goal_clock": 0,
      "notes": "",
      "hold": {
        "value": [
          1
        ],
        "max": 2,
        "max_default": 2,
        "name_default": "BITD.Hold",
        "name": "BITD.Hold"
      },
      "status": {
        "value": [
          4
        ],
        "max": 7,
        "max_default": 7,
        "name_default": "BITD.Status",
        "name": "BITD.Status"
      }
    },
    "item": {
      "description": "",
      "logic": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": 1,
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      },
      "class": "",
      "load": 0,
      "additional_info": "",
      "equipped": false,
      "num_available": 1
    },
    "class": {
      "description": "",
      "logic": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      },
      "experience_clues": [],
      "base_skills": {
        "hunt": [
          0
        ],
        "study": [
          0
        ],
        "survey": [
          0
        ],
        "tinker": [
          0
        ],
        "finesse": [
          0
        ],
        "prowl": [
          0
        ],
        "skirmish": [
          0
        ],
        "wreck": [
          0
        ],
        "attune": [
          0
        ],
        "command": [
          0
        ],
        "consort": [
          0
        ],
        "sway": [
          0
        ]
      }
    },
    "ability": {
      "description": "",
      "class": "",
      "price": 1,
      "purchased": false,
      "class_default": false,
      "logic": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      }
    },
    "heritage": {
      "description": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      }
    },
    "background": {
      "description": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      }
    },
    "vice": {
      "description": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      }
    },
    "hunting_grounds": {
      "description": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      },
      "class": ""
    },
    "crew_upgrade": {
      "description": "",
      "class": "",
      "price": 1,
      "purchased": false,
      "class_default": false,
      "logic": "",
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      },
      "crew_type": ""
    },
    "cohort": {
      "description": "",
      "cohort": [
        "Gang"
      ],
      "scale": 0,
      "quality": 0,
      "cohort_list": {
        "Gang": {
          "label": "BITD.Gang"
        },
        "Expert": {
          "label": "BITD.Expert"
        }
      },
      "gang_type": [
        "Adepts"
      ],
      "gang_type_list": {
        "Adepts": {
          "label": "BITD.GangTypeAdepts",
          "description": "BITD.GangTypeAdeptsDescription"
        },
        "Rooks": {
          "label": "BITD.GangTypeRooks",
          "description": "BITD.GangTypeRooksDescription"
        },
        "Rovers": {
          "label": "BITD.GangTypeRovers",
          "description": "BITD.GangTypeRoversDescription"
        },
        "Skulks": {
          "label": "BITD.GangTypeSkulks",
          "description": "BITD.GangTypeSkulksDescription"
        },
        "Thugs": {
          "label": "BITD.GangTypeThugs",
          "description": "BITD.GangTypeThugsDescription"
        }
      },
      "expert_type": "",
      "status": [],
      "statuses": [],
      "edges": [],
      "edges_list": {
        "Fearsome": {
          "label": "BITD.EdgesFearsome",
          "description": "BITD.EdgesFearsomeDescription",
          "selected": false
        },
        "Independent": {
          "label": "BITD.EdgesIndependent",
          "description": "BITD.EdgesIndependentDescription",
          "selected": false
        },
        "Loyal": {
          "label": "BITD.EdgesLoyal",
          "description": "BITD.EdgesLoyalDescription",
          "selected": false
        },
        "Tenacious": {
          "label": "BITD.EdgesTenacious",
          "description": "BITD.EdgesTenaciousDescription",
          "selected": false
        }
      },
      "flaws": [],
      "flaws_list": {
        "Principled": {
          "label": "BITD.FlawsPrincipled",
          "description": "BITD.FlawsPrincipledDescription",
          "selected": false
        },
        "Savage": {
          "label": "BITD.FlawsSavage",
          "description": "BITD.FlawsSavageDescription",
          "selected": false
        },
        "Unreliable": {
          "label": "BITD.FlawsUnreliable",
          "description": "BITD.FlawsUnreliableDescription",
          "selected": false
        },
        "Wild": {
          "label": "BITD.FlawsWild",
          "description": "BITD.FlawsWildDescription",
          "selected": false
        }
      },
      "harm": [
        "No"
      ],
      "harm_list": {
        "No": {
          "label": "BITD.HarmNoHarm",
          "description": "BITD.HarmNoHarmDescription",
          "value": 0
        },
        "Weakened": {
          "label": "BITD.HarmWeakened",
          "description": "BITD.HarmWeakenedDescription",
          "value": 1
        },
        "Impaired": {
          "label": "BITD.HarmImpaired",
          "description": "BITD.HarmImpairedDescription",
          "value": 2
        },
        "Broken": {
          "label": "BITD.HarmBroken",
          "description": "BITD.HarmBrokenDescription",
          "value": 3
        },
        "Dead": {
          "label": "BITD.HarmDead",
          "description": "BITD.HarmDeadDescription",
          "value": 4
        }
      },
      "armor": false
    },
    "crew_type": {
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      },
      "description": "",
      "experience_clues": "",
      "turfs": {
        "1": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "2": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "3": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "4": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "5": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "6": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "7": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "8": {
          "name": "BITD.Lair",
          "value": 1,
          "description": "",
          "connects": []
        },
        "9": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "10": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "11": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "12": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "13": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "14": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "15": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        }
      }
    },
    "crew_reputation": {
      "description": ""
    },
    "crew_ability": {
      "description": "",
      "class": "",
      "price": 1,
      "purchased": false,
      "class_default": false,
      "activation": {
        "type": "",
        "cost": 0,
        "condition": ""
      },
      "duration": {
        "value": null,
        "units": ""
      },
      "target": {
        "value": null,
        "width": null,
        "units": "",
        "type": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": ""
      },
      "uses": {
        "value": 0,
        "max": 0,
        "per": null
      },
      "consume": {
        "type": "",
        "target": null,
        "amount": null
      }
    },
    "prison": {
      "description": "",
      "turfs": {
        "1": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "2": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "3": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "4": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "5": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "6": {
          "name": "BITD.Prison",
          "value": 1,
          "description": "",
          "connects": []
        },
        "7": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "8": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "9": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "10": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "11": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        },
        "12": {
          "name": "",
          "value": "",
          "description": "",
          "connects": []
        }
      }
    }
  }
};
