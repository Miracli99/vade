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
      compact?: boolean;
    }
  | {
      type: "imageText";
      imageModule?: number;
      imageUrl?: string;
      title?: string;
      text: string;
      caption?: string;
    }
  | {
      type: "entry";
      title: string;
      subtitle?: string;
      text: string;
    }
  | {
      type: "classEntry";
      title: string;
      subtitle?: string;
      text: string;
      subclasses: Array<{
        name: string;
        accent: "gold" | "crimson" | "azure" | "emerald" | "violet";
        text: string;
      }>;
    };

export type HistorySection = {
  id: string;
  title: string;
  accent?: "gold" | "violet" | "azure" | "crimson" | "emerald";
  content: HistoryContentBlock[];
};

export type HistoryPage = {
  id: "lore" | "characters" | "how-to-play";
  eyebrow: string;
  title: string;
  description: string;
  heroImageModule?: number;
  sections: HistorySection[];
};

const HISTORY_COVER = require("../../assets/history/cover.png");
const HISTORY_GARUDA = require("../../assets/history/garuda.png");
const HISTORY_BOREE = require("../../assets/history/boree.png");
const DOCX_FRACTURE = require("../../assets/history/fracture-docx.png");
const DOCX_PARADIS = require("../../assets/history/paradis-docx.png");
const DOCX_GUERRE_AUBE = require("../../assets/history/guerre-aube-docx.png");
const DOCX_RACE_HUMAIN = require("../../assets/history/race-humain-docx.png");
const DOCX_RACE_DEMI_ANGE = require("../../assets/history/race-demi-ange-docx.png");
const DOCX_RACE_DEMI_DEMON = require("../../assets/history/race-demi-demon-docx.png");
const DOCX_RACE_FORET = require("../../assets/history/race-enfant-foret-docx.png");
const DOCX_RACE_AME_ANCREE = require("../../assets/history/race-ame-ancree-docx.png");

const loreSections: HistorySection[] = [
  {
    id: "genese",
    accent: "gold",
    title: "Genese",
    content: [
      {
        type: "paragraph",
        text: "L'histoire de Vade Retro ne commence pas par une verite pure, mais par un recit deja marque, transmis, arrange et conserve par ceux qui ont survecu aux premieres guerres. Les hommes ont appris l'origine du monde a travers la parole des anges, et cette parole n'a jamais ete innocente.",
      },
      {
        type: "paragraph",
        text: "Derriere chaque mythe fondateur se cache deja une lutte d'interpretation. Le sacre, la faute, la legitimite des royaumes spirituels et meme la place des mortels sont l'objet de memoires contradictoires. C'est ce flou qui donne au cadre son gout de legende dangereuse plutot que de chronique parfaitement fiable.",
      },
      {
        type: "quote",
        text: "L'histoire n'est rien d'autre que la parole des vainqueurs agrementee de quelques concessions strategiques.",
      },
    ],
  },
  {
    id: "vide",
    accent: "violet",
    title: "Le Vide",
    content: [
      {
        type: "paragraph",
        text: "Le Vide n'est pas un neant paisible. C'est une faim sans horizon, un espace au-dela du monde ou rien n'est vraiment stable sauf la violence de survivre. Il ne cree pas, il use. Il n'ordonne pas, il devore.",
      },
      {
        type: "quote",
        text: "Le Vide est un endroit morne, ou la famine regne et ou la loi du plus fort est la seule a avoir la moindre importance.",
      },
      {
        type: "paragraph",
        text: "Les etres qui y demeurent sont formes par cette absence de pitie. Dans le Vide, tout ressemble a un manque: manque de chair, de chaleur, de sens, de repos. De cette famine permanente naissent des creatures, des pulsions et des cosmologies pour lesquelles la predation tient lieu de loi naturelle.",
      },
      {
        type: "paragraph",
        text: "Le manuel le presente comme un anti-berceau. Pas l'absence de toute chose, mais une matrice hostile ou l'existence commence deja blessee. C'est un violet de cendre, de vertige et de corruption, une couleur qui ne dit pas seulement le mystere, mais le gouffre.",
      },
    ],
  },
  {
    id: "grande-fracture",
    accent: "crimson",
    title: "La Grande Fracture",
    content: [
      {
        type: "image",
        imageModule: DOCX_FRACTURE,
        caption: "Vision extraite du docx, utilisee ici pour evoquer la fracture metaphysique et les grands sceaux.",
        compact: true,
      },
      {
        type: "paragraph",
        text: "La Grande Fracture est la blessure fondatrice du cadre. A partir d'elle, le cosmos cesse d'etre une totalite lisible et devient un ensemble de royaumes, de lois incompatibles et de fidelites qui ne se recouvrent plus.",
      },
      {
        type: "paragraph",
        text: "Cette rupture n'est pas seulement un evenement ancien. Elle continue d'organiser la maniere dont les anges pensent le salut, dont les demons pensent la souverainete, et dont les mortels comprennent la faute, les pactes et les miracles. Tout ce qui est jure, scelle ou brise dans Vade Retro porte encore la marque de cette separation primitive.",
      },
      {
        type: "quote",
        text: "La creation n'est deja plus une harmonie: elle devient une succession de frontieres, d'exils et de revendications contradictoires.",
      },
    ],
  },
  {
    id: "enfer-paradis",
    accent: "azure",
    title: "Enfer Et Paradis",
    content: [
      {
        type: "image",
        imageModule: DOCX_PARADIS,
        caption: "Une vision du Paradis issue du docx, contrepoint lumineux a l'ordre infernal.",
        compact: true,
      },
      {
        type: "paragraph",
        text: "Enfer et Paradis ne sont pas de simples allegories du bien et du mal. Ce sont deux ordres complets, deux architectures du monde avec leurs hierarchies, leurs langages, leurs territoires et leurs ambitions.",
      },
      {
        type: "paragraph",
        text: "Le Paradis se pense comme mesure, loi, elevation et rayonnement. L'Enfer, lui, transforme la chute en pouvoir, l'appetit en dynastie et la violence en forme de gouvernement. Aucun des deux n'est passif: chacun cherche a imprimer sa logique au monde materiel.",
      },
      {
        type: "paragraph",
        text: "Les mortels vivent entre ces pressions. Les rites, les lignages, les possessions, les armes saintes, les pactes et les monstres ne sont que les traces visibles d'un conflit qui deborde sans cesse de ses royaumes d'origine.",
      },
    ],
  },
  {
    id: "guerre-aube",
    accent: "gold",
    title: "La Guerre De L'Aube",
    content: [
      {
        type: "image",
        imageModule: DOCX_GUERRE_AUBE,
        caption: "Image du docx utilisee pour donner une presence a la guerre premiere.",
        compact: true,
      },
      {
        type: "paragraph",
        text: "La Guerre de l'Aube est le traumatisme originel dont le monde n'a jamais vraiment gueri. Elle a fige des haines, consacre des figures, declenche des exils et laisse partout des fragments de sacre ou de damnation qui continuent d'agir des siecles plus tard.",
      },
      {
        type: "paragraph",
        text: "Anges, demons et puissances plus anciennes y ont gagne leur renommee, leurs cicatrices et parfois leur titre meme. Les fideles s'y referent encore, les cultistes en detournent les symboles, et les seigneurs infernaux gouvernent souvent comme si cette guerre n'etait jamais vraiment finie.",
      },
      {
        type: "paragraph",
        text: "Les reliques, les doctrines, les dons et les formes modernes de ferveur ou de corruption en sont les debris vivants. La Guerre de l'Aube n'est pas un chapitre clos: c'est l'ombre portee sur tout le reste.",
      },
    ],
  },
  {
    id: "situation-actuelle",
    accent: "emerald",
    title: "La Situation Actuelle",
    content: [
      {
        type: "paragraph",
        text: "Le present du jeu n'est pas une periode d'apres-guerre tranquille. Les dimensions ont laisse leurs marques sur les territoires, des cultes survivent dans l'ombre, des seigneuries infernales se surveillent, et les institutions religieuses tentent de contenir ce qui fuit de partout.",
      },
      {
        type: "paragraph",
        text: "La theologie est concrete. Les pactes changent reellement un destin, les sceaux ont un prix, les noms possedent un poids operant, et les decisions spirituelles prennent souvent la forme de guerres locales, d'enquetes, d'exorcismes ou de crimes rituels.",
      },
      {
        type: "paragraph",
        text: "Le monde actuel vit donc dans une tension permanente. Pas comme un decor post-mythique, mais comme une histoire encore active, qui saigne dans le present a travers chaque miracle, chaque corruption et chaque frontiere fragilisee.",
      },
    ],
  },
  {
    id: "vallee-boreale",
    accent: "azure",
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
    id: "tonalite",
    accent: "violet",
    title: "Tonalite",
    content: [
      {
        type: "paragraph",
        text: "Vade Retro est un univers de foi, d'exorcisme, de corruption, de guerre sainte et de survie mystique. Son ton n'est ni purement heroique, ni simplement horrifique. Il tient dans la friction entre le sublime religieux et la boue morale.",
      },
      {
        type: "paragraph",
        text: "Les personnages avancent dans un monde ou l'histoire est vivante, ou la theologie est une force reelle, et ou chaque pouvoir demande quelque chose en retour: culpabilite, dette, contamination, foi ou sacrifice.",
      },
      {
        type: "paragraph",
        text: "Le jeu fonctionne mieux quand on garde ensemble plusieurs tensions: le religieux et le brutal, le majestueux et le grotesque, l'heroisme et la compromission. C'est pour cela que certaines sections peuvent se teinter d'or sacre, d'azur glacial ou de violet abyssal sans jamais devenir confortables.",
      },
    ],
  },
];

const characterSections: HistorySection[] = [
  {
    id: "races",
    title: "Races Jouables",
    content: [
      {
        type: "imageText",
        imageModule: DOCX_RACE_HUMAIN,
        title: "Humain",
        text: "Race majoritaire au sein de l'Ordre, l'humain represente la norme sociale et politique du monde. Cette position dominante lui donne de la marge, mais nourrit aussi un rapport souvent mefiant ou intolerant envers les heritages juges impurs ou trop proches du surnaturel.",
        caption: "Portrait extrait du docx.",
      },
      {
        type: "imageText",
        imageModule: DOCX_RACE_DEMI_ANGE,
        title: "Demi-ange",
        text: "Un demi-ange est un ange dechu incarne dans un corps humain comme peine supreme. Il conserve une nostalgie du Paradis, une melancolie constante et un lien profond avec l'autorite celeste, meme quand il tente de s'en affranchir.",
        caption: "Portrait extrait du docx.",
      },
      {
        type: "imageText",
        imageModule: DOCX_RACE_DEMI_DEMON,
        title: "Demi-demon",
        text: "Heritier d'un lignage infernal, le demi-demon porte en lui une proximite concrete avec l'Enfer et ses puissances. Il peut assumer cet heritage, le subir ou le combattre, mais il reste toujours percu comme quelqu'un que l'on surveille de pres.",
        caption: "Portrait extrait du docx.",
      },
      {
        type: "imageText",
        imageModule: DOCX_RACE_FORET,
        title: "Enfant de la foret",
        text: "Lie aux recits feeriques et aux mondes oniriques, l'enfant de la foret evoque un etre plus intuitif, plus ancien et plus sensible aux presences spirituelles. Sa force vient moins de la domination que de la perception, du lien au vivant et d'un sentiment de danger presque instinctif.",
        caption: "Portrait extrait du docx.",
      },
      {
        type: "imageText",
        imageModule: DOCX_RACE_AME_ANCREE,
        title: "Ame ancree",
        text: "Une ame ancree est une ame damnee rattachee a un support materiel par necromancie. C'est une existence taboue, fragile et fascinante, a la frontiere entre survie, malediction et seconde chance, toujours marquee par l'idee d'un arrachement au cycle naturel.",
        caption: "Portrait extrait du docx.",
      },
      {
        type: "paragraph",
        text: "Le systeme presente plusieurs races jouables qui determinent autant l'esthetique que la place du personnage dans le monde: humain, demi-ange, demi-demon, enfant de la foret et ame ancree.",
      },
      {
        type: "paragraph",
        text: "Chaque origine sert surtout a orienter les tensions de jeu: foi contre corruption, humanite contre heritage surnaturel, adaptation contre stigmates metaphysiques.",
      },
      {
        type: "quote",
        text: "Une race dans Vade Retro n'est pas qu'un bonus. C'est une maniere d'etre regarde, craint, desire ou traque.",
      },
    ],
  },
  {
    id: "archetypes",
    title: "Archetypes De Classe",
    content: [
      {
        type: "paragraph",
        text: "Les grandes familles de classe organisees dans le manuel sont le Paladin, le Tireur, le Dresseur, le Lecteur de versets, le Guerisseur et le Receptacle. Chacune definit un role de groupe clair, puis se precise avec deux sous-classes.",
      },
      {
        type: "classEntry",
        title: "Paladin",
        subtitle: "Role: tenir la ligne, proteger et imposer une presence martiale consacree.",
        text: "Le Paladin est l'ancre du front. Il protege, sanctifie l'engagement et transforme sa simple presence en point d'appui pour le groupe.",
        subclasses: [
          {
            name: "Collectionneur d'ames",
            accent: "violet",
            text: "Sous-classe centree sur la capture, la sanction spirituelle et une lecture plus mystique du combat.",
          },
          {
            name: "Chevalier",
            accent: "gold",
            text: "Sous-classe plus frontale, construite pour encaisser, verrouiller la melee et maintenir le front ouvert pour le groupe.",
          },
        ],
      },
      {
        type: "classEntry",
        title: "Tireur",
        subtitle: "Role: ouvrir la scene a distance et punir les erreurs adverses.",
        text: "Le Tireur cree les angles, impose la distance juste et punit les ouvertures avec un tempo que les autres classes n'ont pas.",
        subclasses: [
          {
            name: "Ritualiste",
            accent: "azure",
            text: "Sous-classe de preparation, de zones et de sceaux qui controle le terrain avant l'impact.",
          },
          {
            name: "Pistolero",
            accent: "crimson",
            text: "Sous-classe de rythme, de precision et de pression mobile, plus agressive et plus nerveuse dans sa facon d'engager.",
          },
        ],
      },
      {
        type: "classEntry",
        title: "Dresseur",
        subtitle: "Role: construire sa force par le lien avec une creature ou une puissance auxiliaire.",
        text: "Le Dresseur ne combat jamais vraiment seul. Sa force passe par un lien vivant, invoque ou pactise, qui modifie toute sa presence en scene.",
        subclasses: [
          {
            name: "Demoniste",
            accent: "crimson",
            text: "Sous-classe de pacte, d'invocation et de compromission infernale, avec une identite plus dangereuse et plus corruptrice.",
          },
          {
            name: "Maitre des betes",
            accent: "emerald",
            text: "Sous-classe plus instinctive et organique, tournee vers l'alliance avec les creatures, la chasse et le controle de presence.",
          },
        ],
      },
      {
        type: "classEntry",
        title: "Lecteur de versets",
        subtitle: "Role: canaliser la parole, les rites et l'autorite symbolique.",
        text: "Le Lecteur de versets agit par la parole juste, le rite et l'autorite du symbole. Il fait plier la scene par ce qui est prononce ou incarne.",
        subclasses: [
          {
            name: "Aria",
            accent: "gold",
            text: "Sous-classe fondee sur la voix, le souffle et la projection du sacre par le chant ou la diction.",
          },
          {
            name: "Moine",
            accent: "azure",
            text: "Sous-classe plus sobre et interieure, centree sur la discipline, la maitrise de soi et l'incarnation physique des versets.",
          },
        ],
      },
      {
        type: "classEntry",
        title: "Guerisseur",
        subtitle: "Role: stabiliser le groupe, soigner et retirer les effets dangereux.",
        text: "Le Guerisseur decide qui tient, qui tombe et combien de temps le groupe peut continuer avant de payer le vrai prix de la scene.",
        subclasses: [
          {
            name: "Pretre",
            accent: "gold",
            text: "Sous-classe de benediction, de soutien direct et de protection devote.",
          },
          {
            name: "Alchimiste",
            accent: "emerald",
            text: "Sous-classe de preparation, de mixtures et de solutions techniques, souvent moins pures mais extremement adaptables.",
          },
        ],
      },
      {
        type: "classEntry",
        title: "Receptacle",
        subtitle: "Role: heberger, contenir ou manipuler une puissance qui depasse l'humain.",
        text: "Le Receptacle accepte de devenir un seuil vivant. Il absorbe, contient ou libere une puissance que d'autres n'oseraient meme pas approcher.",
        subclasses: [
          {
            name: "Pandemoniste",
            accent: "violet",
            text: "Sous-classe de debordement, de contamination et de pouvoir assume au bord de la rupture.",
          },
          {
            name: "Gardien",
            accent: "azure",
            text: "Sous-classe plus controlee, centree sur la contention, la protection et l'absorption du risque pour epargner les autres.",
          },
        ],
      },
      {
        type: "quote",
        text: "La sous-classe ne sert pas seulement a varier les pouvoirs. Elle dit comment ton personnage entre dans le conflit et ce qu'il accepte de devenir pour gagner.",
      },
    ],
  },
  {
    id: "creer-un-personnage",
    title: "Composer Un Personnage",
    content: [
      {
        type: "image",
        imageModule: DOCX_RACE_DEMI_ANGE,
        caption: "Le choix d'une origine et d'une posture donne deja une identite forte.",
        compact: true,
      },
      {
        type: "paragraph",
        text: "Pour creer un personnage lisible dans l'app, pars d'abord d'une tension simple: exorciste zealote, chasseur pragmatique, survivant marque par le Vide, heritier demoniaque, mystique forestier ou receptacle au bord de la rupture.",
      },
      {
        type: "paragraph",
        text: "Ensuite, choisis une race, un archetype, puis une specialisation qui renforcent cette promesse. Le trio doit raconter quelque chose de clair avant meme la premiere scene.",
      },
      {
        type: "paragraph",
        text: "Enfin, donne-lui une posture de jeu: tenir la ligne, proteger, enqueter, poser des rites, survivre a la corruption ou exploiter une force dangereuse.",
      },
    ],
  },
];

const howToPlaySections: HistorySection[] = [
  {
    id: "boucle",
    title: "Boucle De Jeu",
    content: [
      {
        type: "paragraph",
        text: "Vade Retro se joue comme une alternance entre fiction tendue, resolution d'actions, gestion de ressources et impact narratif. On lit une situation, on choisit une approche, on engage ses moyens, puis on assume les consequences.",
      },
      {
        type: "paragraph",
        text: "Les affrontements ne sont qu'une partie du jeu. L'enquete, les rites, les pactes, les concessions morales et la pression spirituelle sont aussi importantes que les coups portes.",
      },
      {
        type: "quote",
        text: "On ne joue pas seulement pour vaincre. On joue pour savoir ce qu'il faudra sacrifier pour tenir.",
      },
    ],
  },
  {
    id: "stats-ressources",
    title: "Stats Et Ressources",
    content: [
      {
        type: "paragraph",
        text: "Dans l'app, les piliers immediats sont les stats, les competences et trois jauges principales: PV pour l'endurance physique, PSY pour le cout mental et spirituel, ARMURE pour l'absorption defensive.",
      },
      {
        type: "paragraph",
        text: "Les bonus, effets actifs, resistances et faiblesses viennent ensuite nuancer la lecture d'une action. Ils ne remplacent pas la fiction: ils la cadrent.",
      },
      {
        type: "paragraph",
        text: "Un bon tour de jeu consiste souvent a choisir quelle ressource tu acceptes d'entamer. Encaisser, depenser du PSY, rompre ta posture ou exposer ton equipe n'ont pas le meme prix.",
      },
    ],
  },
  {
    id: "sorts-equipement",
    title: "Sorts, Equipements Et Effets",
    content: [
      {
        type: "paragraph",
        text: "Les sorts ont un cout de PSY, parfois reductible ou augmentable. Les equipements peuvent offrir des usages actifs, des passifs permanents ou meme des sorts accordes par l'objet.",
      },
      {
        type: "paragraph",
        text: "L'app est donc concue pour rendre visibles les options de scene: quoi activer, quoi garder, quelle protection maintenir, quel outil sortir et quand accepter une depense lourde.",
      },
      {
        type: "paragraph",
        text: "En pratique, essaie de lire chaque pouvoir comme une decision tactique. Pas comme un bouton automatique.",
      },
    ],
  },
  {
    id: "demarrer-partie",
    title: "Demarrer Une Partie",
    content: [
      {
        type: "paragraph",
        text: "Pour lancer une session, le plus simple est de partir d'un desequilibre local: possession, relique, culte, seigneurie en mouvement, quartier marque par une corruption ou frontiere fragilisee entre les mondes.",
      },
      {
        type: "paragraph",
        text: "Le groupe gagne vite en lisibilite si chaque personnage arrive avec une raison d'etre la: foi, dette, mission, curiosite interdite, chasse, protection ou quete de savoir.",
      },
      {
        type: "paragraph",
        text: "Ensuite, fais monter la pression. Plus le probleme dure, plus il coute quelque chose: blessures, fatigue mentale, reputation, corruption, perte d'innocents ou concessions rituelles.",
      },
    ],
  },
];

export const historyPages: HistoryPage[] = [
  {
    id: "lore",
    eyebrow: "Univers",
    title: "Chroniques de Vade Retro",
    description: "Le cadre general du monde, sa genese, ses fractures metaphysiques et la tonalite de campagne.",
    heroImageModule: HISTORY_COVER,
    sections: loreSections,
  },
  {
    id: "characters",
    eyebrow: "Reference",
    title: "Personnages et classes",
    description: "Une lecture compacte des races, archetypes et promesses de gameplay pour construire un personnage solide.",
    heroImageModule: HISTORY_GARUDA,
    sections: characterSections,
  },
  {
    id: "how-to-play",
    eyebrow: "Guide",
    title: "Comment jouer",
    description: "Les reperes de prise en main: boucle de jeu, ressources, sorts, equipement et mise en route d'une session.",
    heroImageModule: HISTORY_BOREE,
    sections: howToPlaySections,
  },
];
