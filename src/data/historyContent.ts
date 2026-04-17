export type HistoryContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "image";
      imageModule?: number;
      imageUrl?: string;
      caption?: string;
    };

export type HistorySection = {
  id: string;
  title: string;
  content: HistoryContentBlock[];
};

const HISTORY_COVER = require("../../assets/history/cover.png");
const HISTORY_GARUDA = require("../../assets/history/garuda.png");
const HISTORY_BOREE = require("../../assets/history/boree.png");

export const historySections: HistorySection[] = [
  {
    id: "genese",
    title: "Genese",
    content: [
      {
        type: "image",
        imageModule: HISTORY_COVER,
        caption: "Frontispice extrait du manuel Vade Retro Angelis.",
      },
      {
        type: "paragraph",
        text: "Afin de comprendre l'univers de Vade Retro, il faut accepter une genese incomplete, partiale et transmise par des vainqueurs. Les anges ont raconte la grande guerre de l'aube aux hommes, mais leur version n'est pas neutre.",
      },
      {
        type: "paragraph",
        text: "Le monde n'est donc pas presente comme une verite absolue. Il est deja charge d'interpretations, de biais, de silences et de conflits theologiques.",
      },
      {
        type: "quote",
        text: "L'histoire n'est rien d'autre que la parole des vainqueurs agrementee de quelques concessions strategiques.",
      },
    ],
  },
  {
    id: "vide",
    title: "Le Vide",
    content: [
      {
        type: "paragraph",
        text: "Le Vide n'est pas un simple neant sterile. C'est un lieu morne, affame et brutal, situe au-dela de l'espace et du temps, ou seule la loi du plus fort semble conserver un sens.",
      },
      {
        type: "quote",
        text: "Le Vide est un endroit morne, ou la famine regne et ou la loi du plus fort est la seule a avoir la moindre importance.",
      },
      {
        type: "paragraph",
        text: "Les etres qui l'habitent se dechirent pour survivre. Cet environnement de famine et de predation constitue l'un des terreaux fondamentaux de l'univers.",
      },
      {
        type: "paragraph",
        text: "Les recits du manuel presentent le Vide comme un anti-berceau: pas un neant sterile, mais une matrice violente ou la faim, la force et la predation remplacent toute idee d'ordre juste ou de creation apaisee.",
      },
    ],
  },
  {
    id: "grande-fracture",
    title: "La Grande Fracture",
    content: [
      {
        type: "paragraph",
        text: "Le cadre de Vade Retro repose sur une fracture originelle entre puissances celestes, infernales et forces premieres. Cette rupture n'est pas seulement mythique: elle continue de modeler la metaphysique, les serments, les sceaux et la maniere dont les differentes entites se comprennent entre elles.",
      },
      {
        type: "paragraph",
        text: "A partir de cette separation, le monde cesse d'etre un tout stable. Chaque camp forge sa propre memoire, sa propre legitimite et sa propre lecture du salut, de la faute et du pouvoir.",
      },
      {
        type: "quote",
        text: "La creation n'est deja plus une harmonie: elle devient une succession de frontieres, d'exils et de revendications contradictoires.",
      },
    ],
  },
  {
    id: "enfer-paradis",
    title: "Enfer Et Paradis",
    content: [
      {
        type: "paragraph",
        text: "Le manuel oppose et relie a la fois Enfer et Paradis. Ces dimensions ne sont pas de simples decors moraux: elles sont des ordres complets, avec leurs hierarchies, leurs lois, leurs habitants, leurs guerres et leurs raisons d'agir.",
      },
      {
        type: "paragraph",
        text: "Le Paradis transmet aux hommes un recit de la victoire et du droit. L'Enfer, lui, concentre la chute, la faim, la rage, mais aussi des logiques de puissance, de royaumes et d'alliances qui depassent largement une vision simpliste du mal absolu.",
      },
      {
        type: "paragraph",
        text: "Dans Vade Retro, les dimensions spirituelles restent proches du monde des mortels: elles l'influencent, le traversent et laissent des traces concretes dans les rites, les lignages, les pactes et les monstres.",
      },
    ],
  },
  {
    id: "guerre-aube",
    title: "La Guerre De L'Aube",
    content: [
      {
        type: "paragraph",
        text: "La Guerre de l'Aube est l'un des pivots du monde. Elle structure encore le present, parce qu'elle a fixe des ennemis, defini des fidelites, provoque des exils et laisse derriere elle des fragments de sacre et de damnation.",
      },
      {
        type: "paragraph",
        text: "Les anges, les demons et d'autres puissances y ont forge leurs reputations, leurs pertes et leurs legitimites. Ce n'est pas seulement une guerre ancienne: c'est le traumatisme fondateur auquel se rattachent encore les croyants, les cultistes, les exorcistes et les seigneurs infernaux.",
      },
      {
        type: "paragraph",
        text: "Les dons, les reliques, les pratiques rituelles et meme certaines ideologies contemporaines sont decrits comme des prolongements ou des residus de cette guerre premiere.",
      },
    ],
  },
  {
    id: "humains-primordiaux",
    title: "Les Humains Primordiaux",
    content: [
      {
        type: "paragraph",
        text: "Les mortels n'occupent pas simplement un role passif dans la cosmologie du jeu. Le manuel leur donne une place fragile mais decisive: ils vivent au milieu des restes du sacre, de la corruption et des ambitions infernales, sans jamais etre totalement insignifiants.",
      },
      {
        type: "paragraph",
        text: "Les humains primordiaux portent deja cette ambiguite. Ils sont exposes aux influences superieures, instrumentalises par certaines puissances, proteges par d'autres, mais capables aussi de foi, de choix et de survivance au milieu de forces qui les depassent.",
      },
      {
        type: "quote",
        text: "Les humains ne dominent pas le monde: ils y persistent, coincés entre exorcisme, compromis et survie.",
      },
    ],
  },
  {
    id: "guerre-zenith",
    title: "La Guerre Du Zenith",
    content: [
      {
        type: "paragraph",
        text: "Apres les premiers grands affrontements, le monde ne retrouve pas la paix. La Guerre du Zenith prolonge les tensions et montre que les conflits metaphysiques ne s'eteignent pas avec une seule victoire legendaire.",
      },
      {
        type: "paragraph",
        text: "Cette guerre approfondit les lignes de fracture, use les puissances en place et prepare de nouvelles chutes. Elle contribue aussi a expliquer pourquoi tant d'entites, d'ordres et de seigneuries modernes vivent encore dans le sillage de vieux traumatismes et d'anciennes fidelites.",
      },
    ],
  },
  {
    id: "sitiel",
    title: "Sitiel",
    content: [
      {
        type: "paragraph",
        text: "Sitiel apparait dans le manuel comme une figure centrale des basculements du monde. Son nom est lie a des moments de rupture, a des changements d'equilibre et a des ramifications qui touchent autant les spheres celestes qu'infernales.",
      },
      {
        type: "paragraph",
        text: "Dans la page histoire de l'app, Sitiel peut etre lu comme un noeud narratif: une figure a laquelle rattacher une partie des ambiguïtés du cadre, entre devotion, violence, conflit de legitimite et recomposition des alliances.",
      },
    ],
  },
  {
    id: "chute",
    title: "La Chute",
    content: [
      {
        type: "paragraph",
        text: "La chute n'est pas seulement une punition symbolique. Dans Vade Retro, elle reconfigure des identites entieres. Des anges deviennent seigneurs demons, des royaumes changent de nature, des fidelites anciennes survivent sous forme de regrets, de rivalites ou de parodies de l'ordre perdu.",
      },
      {
        type: "paragraph",
        text: "Certains personnages du manuel, comme Gaziel, incarnent cette melancolie tres particuliere: ils ont accepte leur nouvel etat sans cesser de regarder en arriere. D'autres ont embrasse pleinement le pouvoir, le territoire ou l'adoration que leur nouvelle condition leur offre.",
      },
      {
        type: "quote",
        text: "Etre damne ne signifie pas cesser d'avoir une memoire, une nostalgie ou une idee de ce que l'on aurait voulu rester.",
      },
    ],
  },
  {
    id: "situation-actuelle",
    title: "La Situation Actuelle",
    content: [
      {
        type: "paragraph",
        text: "Le present du jeu n'est pas un monde stabilise. Les dimensions ont laisse des traces sur le territoire, des cultes persistent, des seigneuries se surveillent, et les mortels vivent au contact de forces qu'ils comprennent mal mais qu'ils ne peuvent pas ignorer.",
      },
      {
        type: "paragraph",
        text: "La theologie y est concrete. Les pactes produisent des effets reels, les sceaux ont un prix, les noms comptent, et la lutte entre sacre et corruption prend la forme de conflits politiques, spirituels et militaires.",
      },
      {
        type: "paragraph",
        text: "Le monde actuel est donc un monde de tensions permanentes: pas un decor post-mythique, mais une histoire toujours en train d'agir sur le present.",
      },
    ],
  },
  {
    id: "vallee-boreale",
    title: "La Vallee Boreale",
    content: [
      {
        type: "paragraph",
        text: "La Vallee Boreale est l'un des theatres majeurs du cadre. Elle est composee de pics, de tombeaux, de deserts, de forets glacees et de domaines soumis a des seigneurs demons, des puissances elementaires ou d'anciens anges dechus.",
      },
      {
        type: "image",
        imageModule: HISTORY_GARUDA,
        caption: "Garuda, dame des tempetes, figure marquante de la Vallee Boreale dans le manuel.",
      },
      {
        type: "paragraph",
        text: "Le royaume n'est pas uniforme. Il s'agit plutot d'un echiquier de seigneuries et d'influences. Azrael y regne, mais autour de lui gravitent des figures fortes comme Gaziel, Garuda ou Boree, chacune portant son territoire, ses legions, ses rites, ses alliances et sa propre vision du pouvoir.",
      },
      {
        type: "image",
        imageModule: HISTORY_BOREE,
        caption: "Boree, seigneur glacial et puissance primordiale associee a la glace et a l'isolement.",
      },
      {
        type: "paragraph",
        text: "La Vallee Boreale concentre donc une bonne partie de la saveur du jeu: royaumes infernaux, fidelites mouvantes, puissances anciennes et coexistence souvent tendue entre forces qui ne se supportent qu'a condition de conserver un equilibre instable.",
      },
    ],
  },
  {
    id: "ordre",
    title: "L'Ordre",
    content: [
      {
        type: "paragraph",
        text: "L'Ordre represente la reponse organisee des mortels et des fideles face au chaos metaphysique du monde. Il structure l'exorcisme, la doctrine, la protection des faibles et l'encadrement des pratiques dangereuses.",
      },
      {
        type: "paragraph",
        text: "Mais, comme souvent dans Vade Retro, l'institution ne se resume pas a une pure force du bien. L'Ordre porte aussi ses rigidites, ses zones d'ombre, ses interpretations et ses propres tensions internes entre foi, pragmatisme et violence legitimee.",
      },
    ],
  },
  {
    id: "debut-campagne",
    title: "Debut De Campagne",
    content: [
      {
        type: "paragraph",
        text: "Le manuel presente ce cadre historique comme un point d'appui pour la campagne: les personnages evoluent dans un monde deja vieux, traverse par des guerres saintes, des chutes, des pactes et des rancunes qui les precedent de tres loin.",
      },
      {
        type: "paragraph",
        text: "Un debut de campagne efficace dans Vade Retro part donc souvent d'un desequilibre local: une possession, un culte discret, un artefact ancien, une seigneurie qui s'agite, un rituel qui attire l'attention ou un territoire ou la frontiere entre les mondes se fragilise.",
      },
      {
        type: "quote",
        text: "Les personnages n'arrivent pas dans un monde neuf: ils arrivent au milieu d'une histoire deja chargee, et chaque pouvoir qu'ils touchent a deja un passe.",
      },
    ],
  },
  {
    id: "tonalite",
    title: "Tonalite",
    content: [
      {
        type: "paragraph",
        text: "Vade Retro est un univers de foi, d'exorcisme, de corruption, de guerre sainte et de survie mystique. Le ton n'est ni purement manicheen ni simplement horrorifique: il repose sur la tension entre sacre, damnation, nostalgie et pragmatisme.",
      },
      {
        type: "paragraph",
        text: "Les personnages avancent dans un monde ou l'histoire est vivante, ou la theologie est une force reelle, et ou chaque pouvoir peut avoir un prix.",
      },
      {
        type: "paragraph",
        text: "Le jeu fonctionne mieux quand on garde ensemble plusieurs tensions: le religieux et le brutal, le sublime et le grotesque, l'heroisme et la compromission, la ferveur sincere et la manipulation rituelle.",
      },
    ],
  },
];
