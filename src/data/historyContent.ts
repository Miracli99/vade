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
const HISTORY_FRACTURE = require("../../assets/history/fracture.png");
const HISTORY_PARADIS = require("../../assets/history/paradis.png");
const HISTORY_GUERRE_AUBE = require("../../assets/history/guerre-aube.png");
const HISTORY_RACE_HUMAIN = require("../../assets/history/race-humain.png");
const HISTORY_RACE_DEMI_ANGE = require("../../assets/history/race-demi-ange.png");
const HISTORY_RACE_DEMI_DEMON = require("../../assets/history/race-demi-demon.png");
const HISTORY_RACE_FORET = require("../../assets/history/race-enfant-foret.png");
const HISTORY_RACE_AME_ANCREE = require("../../assets/history/race-ame-ancree.png");

const loreSections: HistorySection[] = [
  {
    id: "genese",
    accent: "gold",
    title: "Genèse",
    content: [
      {
        type: "paragraph",
        text: "Afin de comprendre au mieux cette histoire, il convient de poser certaines bases théologiques. Néanmoins, il est important de garder à l’esprit que cette genèse n’est en rien exhaustive. Elle manque donc bien entendu d’une grande quantité de détails et est parfaitement partiale. L’histoire de la grande guerre de l’aube a été transmise aux hommes par les anges. Et comme toute personne suffisamment critique le sait, l’histoire n’est rien d’autre que la parole des vainqueurs agrémentée de quelques concessions stratégiques.",
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
        text: "La plupart des grands récits commencent dans un vide spatial stérile et désespérément ennuyeux. Fort heureusement, notre histoire ne prendra pas racine dans ce type de terreau.",
      },
      {
        type: "paragraph",
        text: "Le Vide est un endroit morne, ce qui en fait déjà une raison suffisante pour ne pas le conseiller comme destination de vacances en famille. Mais il s’agit également d’un endroit où la famine règne et où la loi du plus fort est la seule à avoir la moindre espèce d’importance. Les êtres faméliques qui le peuplent se déchirent entre eux dans le but de survivre au sein de cet endroit au-delà de l’espace et du temps.",
      },
      {
        type: "paragraph",
        text: "Les néantins, tels qu’on les appellera plus tard sans se soucier de leur avis sur la question, se sont rapidement organisés sous la tutelle de leurs pairs ayant le plus à offrir. Les guerres intestines entre les milliers de clans ont enfin cessé quand des dirigeants plus stables ont fini par s’établir et par fédérer le Vide sous leurs couleurs : Lazar, le dragon de cristal ; Aztis, la dame des larmes et Hélion le cavalier vermillion. Ce nouveau panthéon régent n’avait pas l’intention de renier les vieilles traditions de leur peuple, le Vide est donc encore aujourd’hui au cœur d’un conflit éternel. Néanmoins cette guerre est menée de façon bien plus raisonnable et organisée, il faut tout de même leur laisser un certain mérite. Les nouveaux Empereurs du Vide se battaient alors principalement pour assurer le contrôle d’une ressource rare et précieuse, une communauté bien particulière de néantins, les Avatars Primordiaux. En tant que source d’énergie, ils étaient vitaux aux autres créatures et exercer une autorité sur ces derniers revenait à obtenir un pouvoir presque illimité sur le peuple en dépendant.",
      },
      {
        type: "paragraph",
        text: "Au delà de ce royaume en éternelle décomposition se trouve un salut, un manne céleste brillant au loin comme le reflet des premiers rayons du jour : l'Éther. Ce flot de magie pure, infini et parfaitement inutilisable pour la quasi-totalité des habitants du néant semblait fait pour narguer ces derniers. Du moins jusqu’au premier événement de notre chronologie.",
      },
    ],
  },
  {
    id: "grande-fracture",
    accent: "crimson",
    title: "La grande fracture",
    content: [
      {
        type: "imageText",
        imageModule: HISTORY_FRACTURE,
        title: "La grande fracture",
        text: "Vous voyez cette fameuse histoire de l’œuf et la poule où on se demande toujours qui est arrivé le premier ? Elle agace tout le monde et au final c’est soit un exercice de pensée soit une question qu’on règle en parlant d’évolution. Je propose une version qui colle nettement plus à l’ambiance : qui est arrivé le premier, Dieu ou Satan ?",
        caption: "La grande fracture.",
      },
      {
        type: "paragraph",
        text: "Ils seraient arrivés en bloc, l’un ayant besoin de l’autre pour exister et inversement. En fait, c'est à cet instant précis que les points de vue divergent parmi les rares spectateurs. Personne ne sait se mettre d’accord pour dire s’ils sont nés de l'Éther comme une divine progéniture destinée à bousculer l’ordre établi, si ils étaient des étrangers venu d’un autre univers dont l’éther ne fut qu’une fenêtre, si ils s’étaient donnés naissance mutuellement en tant que force opposée venue apporter la diversité dans une dimension grise et mourante… Ou peut-être même tout ça à la fois. Une chose cependant met tout le monde parfaitement d’accord : La mère de la nuit et le père du jour étaient d’une force suffisante pour ridiculiser les Empereurs et ont tôt fait de s’approprier une grande part de ce qu’était alors le Vide. Cette prise de pouvoir tyrannique, n’ayant fait qu’arracher du pouvoir à des tyrans plus petits, est le commencement de ce que l’on nomme la Création.",
      },
    ],
  },
  {
    id: "enfer-paradis",
    accent: "azure",
    title: "Enfer et Paradis",
    content: [
      {
        type: "imageText",
        imageModule: HISTORY_PARADIS,
        title: "Enfer et Paradis",
        text: "Les nouveaux maîtres de la création se sont retroussés les manches, ils devaient chacun mettre un royaume au monde et ils avaient besoin d’aide pour ça.",
        caption: "Enfer et Paradis.",
      },
      {
        type: "paragraph",
        text: "Dieu, malgré l’égocentrisme que lui prêtent certains athés, a décidé de partager son âme en fragments comme l’on sépare la lumière à l’aide d’un prisme. Le créateur avait accepté de s’abolir du privilège d’être le seul en capacité de créer, il avait donné naissance aux Djinns Primordiaux. Les 12 djinns étaient des incarnations des 6 éléments primordiaux et des 6 concepts majeurs de l’existence, leur essence même était de créer avec leur Dieu, alors ils créèrent, pierre après pierre. Cette poche de réalité arrachée de force à l’influence du Vide commença à se remplir de vie et de beautés infinies toutes dédiée à la gloire du père de la lumière qui ne désirait rien plus que la foi et l’adoration de tous, personne ne pouvant mettre en doute sa magnificence.",
      },
      {
        type: "paragraph",
        text: "La Djinn de lumière, nommée Ether en hommage au flux de vie d’où le créateur avait émergé, était venue au monde avec une mission très différente de celle de ces frères et sœurs. Son seigneur plaça entre ses mains expertes plus de pouvoir qu’elle n’aurait pu l’imaginer afin de forger des êtres capables de protéger l’Eden, pas des créateurs comme les Djinns Primordiaux, des Protecteurs et des Guerriers : des Archanges qui seraient chacun dotés d’un commandement de leur père.",
      },
      {
        type: "paragraph",
        text: "Ces derniers étaient grands, forts et parfaits aux yeux de leur père. Une fois au nombre de 10, les Djinns comprirent bien vite qu’ils n’avaient servi qu’à l'avènement de leurs petits frères et de leurs petites sœurs. Ils étaient devenus… gênants.",
      },
      {
        type: "paragraph",
        text: "Ce n’est là qu’une version parmi d’autres mais selon les esprits les plus critiques, les Djinns étaient un rappel constant au créateur qu’il avait eu besoin d’aide pour mettre en place son paradis, un blasphème vivant, un aveu de faiblesse.",
      },
      {
        type: "paragraph",
        text: "Sentant le vent tourner, les Djinns prirent la décision de prendre certaines des plus belles créations qui avaient vu le jour grâce à eux et de fuir l’Eden jusqu’à un endroit reculé du cosmos.",
      },
      {
        type: "paragraph",
        text: "Suite à leur désertion, on dit que Dieu par pur esprit de démonstration voulu montrer qu’il n’avait pas besoin d’eux pour mettre au monde des êtres parfaits.",
      },
      {
        type: "paragraph",
        text: "Chaque échec successif ne donnant que des anges moins puissants que les précédents malgré l’aide d’une nouvelle Djinn de lumière, Héméra la fille du jour.",
      },
      {
        type: "paragraph",
        text: "Cette situation aurait conduit Dieu à se retirer au sommet de sa création et à cesser de prendre part activement au destin du cosmos",
      },
      {
        type: "paragraph",
        text: "Satan a eu une approche très différente, se contentant de laisser son énergie spirituelle donner naissance à l’Enfer sur la base de formes aléatoires. C’est les différentes formes qu’aurait prise cette essence, préfigurant les royaumes infernaux actuels, qui auraient inspiré le diable dans la mise au monde de ses 8 démons primordiaux. Elle condensa sa noirceur en la mêlant aux différents royaumes déjà existants pour donner naissances à des rois, ou des princes tels qu’ils s’appelaient à l’époque, aptes à régner.",
      },
      {
        type: "paragraph",
        text: "Les princes démons étaient plus faibles que les Archanges de Dieu mais leur marche de manœuvre était bien plus grande. Leur existence ne suivait pas de dessin précis ou de plan dicté par leur mère. Elle leur avait fait présent des 8 péchés et ne leur avait donné qu’un seul ordre : “faites comme bon vous semblera”.",
      },
      {
        type: "paragraph",
        text: "Le reste de son action fût surtout consacrée à chuchoter des opportunités à d’autres puissances, vraisemblablement afin de la rallier à son royaume. Ce fût le cas avec les Avatars Primordiaux et les Cavaliers de l’Apocalypse, tous venant du Vide à différents niveaux. Plus tard, on n'hésitera pas à affirmer qu’elle sera à l’origine du départ de certains Archanges en continuant de chuchoter depuis les ombres.",
      },
      {
        type: "paragraph",
        text: "A la suite de la grande guerre de l’Aube, Satan suivra l’exemple de Dieu et partira se terrer dans les profondeurs de l’Enfer, le Maeström d’où émerge les démons.",
      },
    ],
  },
  {
    id: "guerre-aube",
    accent: "gold",
    title: "La guerre de l’Aube",
    content: [
      {
        type: "imageText",
        imageModule: HISTORY_GUERRE_AUBE,
        title: "La guerre de l’Aube",
        text: "Dieu et Satan n’étaient pas seulement des tyrans, figures d'autorité dans le cosmos actuel, ils font partie d’un club très fermé : les Sources. L’Ether, source de magie dans l’univers, a le désavantage d’être non seulement complexe à capter mais également toxique s’il est utilisé dans sa forme pure. Seuls les êtres divins peuvent aspirer à se l’approprier. Leur nature leur permet de transformer l'Éther en flux de magie exploitable par les autres êtres spirituels. La nature exacte de la dépendance qui s’installe entre les sources et ceux qui en bénéficient reste encore aujourd’hui très mal connue. Bien que chaque flux puisse être utilisé pour mettre en place n’importe quelle magie en théorie, ils semblent s’opposer et refléter la nature profonde de leurs Sources.",
        caption: "La guerre de l’Aube.",
      },
      {
        type: "paragraph",
        text: "Ainsi, aux frontières du paradis et de l’enfer, le flux stagnant et stabilisant du père de lumière s’est mêlé à celui de la mère obscure. Lentement, sans volonté, le mélange de ces forces opposées et complémentaires a aboutit à un miracle : la matière. La création jusque-là purement composée d’énergie spirituelle voyait ses premiers fragments de matière s’agréger en îles, puis en contrées, puis en mondes. Cette poche de réalité vibrante d’énergie devenait le théâtre de toutes les convoitises, le Vide ne voulait pas laisser cette richesse inattendue tomber entre les mains des Êtres supérieurs qui leur avaient déjà tant pris et ces derniers comptaient bien l’annexer pour leur profit personnel.",
      },
      {
        type: "paragraph",
        text: "C’est le conflit qu’on appellera bien plus tard la guerre de l’aube.",
      },
      {
        type: "paragraph",
        text: "On dit souvent qu’il n’y a pas de vainqueur dans une véritable guerre, seulement des rescapés haineux et meurtris… C’est sûrement pour ça que l’enfer et le paradis ont fini par signer une paix blanche. Le Vide avait été banni de ces terres, les cieux avaient subi de nombreuses pertes et le royaume infernal était en proie à l’anarchie suite aux changements incessants de figures au pouvoir des différents territoires. Seule Léviathan, la dame des eaux profonde, le prince démon de la gourmandise, a su garder son trône depuis la première aube de sang à avoir caressé l’enfer.",
      },
      {
        type: "paragraph",
        text: "Les dirigeants des deux partis décidèrent de se retirer de la scène en laissant une barrière censée empêcher la majeure partie de chaque armée d’investir le plan matériel afin que ce dernier ne puisse plus redevenir un champ de bataille sanglant.",
      },
      {
        type: "paragraph",
        text: "A la suite de cette issue amère, le cosmos étant à nouveau plongé dans un calme relatif, un événement vînt à nouveau changer la donne : l’humanité",
      },
    ],
  },
  {
    id: "humains-primordiaux",
    accent: "emerald",
    title: "Les humains primordiaux",
    content: [
      {
        type: "paragraph",
        text: "Ce n’est pas glorieux mais c’est la triste vérité, les humains sont des déchets. Enfin attention, des déchets de guerre… Ce qui est pire je suppose ? L’avis sur la question est finalement très personnel.",
      },
      {
        type: "paragraph",
        text: "Pour ce qui semble être des faits, la guerre de l’aube a bien risqué de raser le plan matériel, la matière était facilement soumise aux caprices des sortilèges dévastateurs utilisés lors des différents affrontements. Mais si notre plan a survécu, il semble avoir fait bien plus que cela, ayant absorbé une part de l’énergie absurde qui l’a tant ravagé, il a fini par s’enrichir suffisamment pour donner naissance à des âmes sans volonté supérieure pour le décider. Des âmes neutres, non soumises à un flux en particulier, les propriétés uniques du plan matériel ont naturellement amenées ses âmes à s’incarner.",
      },
      {
        type: "paragraph",
        text: "Les humains primordiaux était un peuple peu dérangeant, ils n’avaient pas de soutien de la part d’un être cosmique et ne semblaient pas avoir assez de pouvoir pour réellement inquiéter le paradis ou l’enfer. Mais la première humaine, après l’équivalent de plusieurs vies, fit une découverte qui changea le destin de son peuple à jamais : elle se trouva capable de puiser dans l’Ether.",
      },
      {
        type: "paragraph",
        text: "Cela semble absurde et pourtant c’était vrai, les humains des temps anciens avaient en eux la capacité de puiser dans la manne céleste sans restriction, faisant d’eux une menace absolue aux yeux des hautes instances du paradis qui considéraient cela comme un blasphème outrageux.",
      },
      {
        type: "paragraph",
        text: "En peu de temps, les hommes créèrent un alphabet de runes, leur permettant d’exploiter le pouvoir de l’Ether pour se défendre et pour se développer et il ne fallut pas longtemps avant qu’ils deviennent une force avec laquelle il fallait composer.",
      },
      {
        type: "paragraph",
        text: "Les choses finirent par dégénérer dans des circonstances peu compréhensibles ou identifiables, amenant le début d’une seconde guerre que l’on appela la guerre du zénith.",
      },
    ],
  },
  {
    id: "guerre-zenith",
    accent: "crimson",
    title: "La guerre du zénith",
    content: [
      {
        type: "paragraph",
        text: "Si l’on appelle cet événement par le nom d’une guerre, ce n’est que par commodité pour la dignité du paradis, il conviendrait probablement mieux d’appeler cela “le génocide du zénith”.",
      },
      {
        type: "paragraph",
        text: "Les humains primordiaux se faisaient massacrer sans réelle chance de victoire et c’est finalement l’exaspération du plus haut sommet du commandement céleste qui mit un terme au massacre.",
      },
      {
        type: "paragraph",
        text: "En l’absence de Dieu, c’est Samaël, l’archange du destin et le premier de ses frères et sœurs, qui avait la plus grande autorité au sein du conseil qu’ils formaient et qui remplaçait Dieu en tant qu’organe décisionnel de l’Eden. Sous son influence, et à l’aide de sa propre magie, l’humanité fût sauvée en échange d’un coût à payer. Les humains perdirent leur capacité naturelle à utiliser la magie sous toutes ses formes et devinrent mortels sous l’influence de la malédiction de la chair.",
      },
      {
        type: "paragraph",
        text: "Après cet événement terrible qui amena le retour de la paix dans l’univers, Samaël était ravagé par les remords et par les horreurs que son propre peuple avait accompli au nom de son père. Il déroba un artefact divin, le Cœur, laissé par Dieu en son absence et permettant à son possesseur d’atteindre à son tour la divinité. En possession du Coeur le rendant pratiquement invulnérable, il réunit les anges fidèles à sa cause et partit en exil volontaire dans le Vide, où il règne depuis en maître absolu.",
      },
    ],
  },
  {
    id: "sitiel",
    accent: "violet",
    title: "Sitiel",
    content: [
      {
        type: "paragraph",
        text: "Samaël a établi sa résidence dans un lieu nommé le Palais Gris au sein du Vide et y a naturellement installé sa nouvelle cour composée des néantins désireux de le suivre pour profiter de l’énergie qu’il accordait et de ses anciens anges. Parmi ses anges, l’on note en premier lieu ses trois séraphins, ses plus proches subordonnés d’un rang à peine inférieur à celui des archanges : Mettatron, le scribe; Asriel, le gardien des flux et celui qui deviendra tristement célèbre, Sitiel le tailleur de cristal.",
      },
      {
        type: "paragraph",
        text: "Ils avaient tous un rôle précis à jouer pour servir Samaël à l’époque où ce dernier était archange du temps. Si Mettatron était tourné vers le passé et Asriel sur le présent, c’est à Sitiel qu’incombait la tâche de scruter l’avenir. Il était considéré comme un novateur, l’un des seuls au sein du paradis, et cette passion ne le quitta pas une fois dans le Vide. C’est même tout l’inverse, il avait maintenant à sa disposition un panel de magie bien plus varié et bien moins de règles à suivre.",
      },
      {
        type: "paragraph",
        text: "Un jour sombre cependant, il franchit un tabou et commis ce que l’histoire a retenu comme le péché originel, même si à la vue du sang versé pour en arriver là ce statut était plus que discutable. Sitiel captura une âme humaine, son sujet d’étude favori, et lui fît subir une liste abominablement longue de supplices et de châtiments dans le but bêtement cruel de briser son ego. Après un temps qui dû sembler une éternité pour ce pauvre hère, sa conscience sombra dans le néant et son âme… se vicia. Sitiel développa alors la capacité unique de transformer ces âmes viciées en énergie assimilable permettant d’augmenter de façon définitive sa propre force. Ne réalisant pas le caractère profondément contre nature de sa démarche, il présenta fièrement son travail à son maître, espérant ses louanges.",
      },
      {
        type: "paragraph",
        text: "Il fût accueilli par un mélange de rage et de froideur et Samaël laissa sous-entendre que s’il avait l’audace de recommencer son expérience, c’est son âme qui finirait sur une table d’étude.",
      },
      {
        type: "paragraph",
        text: "Profondément blessé par le manque d’ouverture d’esprit du nouveau Dieu du Vide, Sitiel prit la décision de retourner au paradis pour faire la démonstration de sa découverte et enfin recevoir les félicitations qu’il pensait mériter.",
      },
      {
        type: "paragraph",
        text: "Ce n’est que par respect pour son ancien statut de séraphin qu’il ne fût pas réduit à néant sur l’instant quand les archanges comprirent le potentiel monstrueux du sortilège.",
      },
      {
        type: "paragraph",
        text: "Une fois de plus mis à la porte et traité guère mieux qu’un démon, Sitiel décida naturellement de se tourner vers la seule porte qui lui restait.",
      },
      {
        type: "paragraph",
        text: "L’enfer l'accueillit à bras ouvert, voyant là le moyen d’un jour devenir assez puissant pour abattre l’Eden. Depuis ce jour, Sitiel a pris place à l'assemblée des rois démons en tant que prince de l’avarice et roi démon du chaos. Seul roi entièrement neutre et n’ayant aucun intérêt pour les jeux de pouvoir fratricide de sa nouvelle famille, il partage avec eux sa capacité à transformer les âmes humaines en pouvoir en échange d’une partie de leurs gains et d’une totale protection contre quiconque viendrait à le menacer.",
      },
    ],
  },
  {
    id: "chute",
    accent: "crimson",
    title: "La Chute",
    content: [
      {
        type: "paragraph",
        text: "La découverte de Sitiel changeant pour toujours l’équilibre, le cycle de réincarnation qui était maintenue jusque là par Samaël commença à se polariser, les démons trouvèrent jour après jour plus de moyens pour remplir leur enfer d’âmes humaines et ces derniers se changèrent alors en lieux de torture pour suivre la demande croissante.",
      },
      {
        type: "paragraph",
        text: "Nombreux sont les anges qui décidèrent de chuter pour rejoindre le camp qui allait selon toute logique finir par devenir plus puissant que le paradis, la première perte réellement terrible fût indubitablement Lucifer, l’archange de l’illumination. Ce dernier décidant que si son grand frère Michael l’archange de la vaillance et nouveau meneur du paradis n’était pas enclin à s’adapter pour suivre la cadence, il devrait se passer de lui.",
      },
      {
        type: "paragraph",
        text: "Le départ de Lucifer ébranla suffisamment les convictions de certains anges pour lancer une vague de paranoïa aboutissant à un événement connu sous le nom du pogrom du petit peuple qui a mené au massacre d’une grande partie de la communauté féérique, alors affiliée au paradis et à l’archange de la justice, Azraël qui les avait prit en affection. Ce massacre plongea ce dernier dans une telle rage qu’il décida à son tour de déserter et de prendre, comme son grand frère Lucifer, une place de roi démon au sein du royaume de Satan.",
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
        text: "L’enfer compte actuellement huit rois démons et quatres seigneurs démons pour servir chacun d’entre eux tandis que le paradis est réduit à sept archanges et trois séraphins sous chacune de leurs bannières. Si l’on reste sensé, la seule chose qui empêche l’enfer de marcher sur le paradis, c’est l’incapacité totale des rois démons à coopérer, tous voulant s’assoir sur le trône noir et devenir la nouvelle divinité de l’enfer en l’absence de Satan. Les archanges, bien qu’ayant des différents, font eux front commun et gardent donc une suprématie de façade… pour l’instant. Le jour où les rois démons auront soit amassé assez de pouvoir, soit mis en place une trêve, alors la guerre du crépuscule pourra débuter, et personne ne pourra échapper à l’obscurité qu’elle amènera dans son sillage.",
      },
    ],
  },
  {
    id: "ordre",
    accent: "gold",
    title: "L’ordre",
    content: [
      {
        type: "paragraph",
        text: "Les humains sont certes devenus faibles, mais ils n’ont pas perdu espoir. Si une grande majorité d’entre eux sont toujours incapables d’utiliser la magie, au point de ne pas voir les êtres spirituels, ceux qui ont été en contact avec des anges ou des démons semblent réveiller ce don et deviennent alors capables de puiser dans les différents flux parcourant le monde. Au fil du temps, les hommes ont à nouveau développé leur magie dans des cercles d’initiés et ont appris à manipuler leur aura, l’énergie spirituelle émanant de leur âme et se rechargeant passivement grâce aux ressources miraculeuses du plan matériel.",
      },
      {
        type: "paragraph",
        text: "Ces cercles occultistes poussés par la soif de savoir et par le désir d’émanciper l’humanité des anges et des démons pour pouvoir un jour réclamer ce monde comme appartenant au genre humain se sont progressivement fusionnés les uns aux autres.",
      },
      {
        type: "paragraph",
        text: "Peu avant l’an mille, en 910 après J.C selon certaines sources, ces différentes sociétés occultes signèrent un pacte en terre sainte de Rome et décidèrent de créer l’Umbra Ordinis, ou Ordre de l’ombre pour assurer l'hégémonie de l’humanité et lutter contre les ingérences du paradis et de l’enfer.",
      },
      {
        type: "paragraph",
        text: "Les choses ont depuis bien évolué, l’Ordre est reconnu mondialement, possède des branches dans tous les pays en ayant gardé son siège au Vatican à proximité du palais papale et est considérée comme une organisation paragouvernementale avec le soutien financier qui en découle.",
      },
      {
        type: "paragraph",
        text: "Les exorcistes qui la composent sont donc des fonctionnaires, bien que d’un genre plus qu’atypique.",
      },
      {
        type: "paragraph",
        text: "Les jeunes recrues qui arrivent chaque année au sein de l’ordre n’ont encore qu’une idée très vague de cet équilibre précaire dans lequel l’univers est plongé, comme une bombe sur le point d’exploser. Alors quelle voie suivre ?",
      },
      {
        type: "paragraph",
        text: "Faire confiance à l’ordre qui cloisonne toutes les informations en fonction des grades et des niveaux d'accréditation et qui ne semble pas toujours avoir été sur une route des plus radieuses ?",
      },
      {
        type: "paragraph",
        text: "Suivre la foi et se battre pour assurer la dominance du paradis sur l’enfer avec toutes les répercussions que cela peut avoir ?",
      },
      {
        type: "paragraph",
        text: "Se laisser tenter par les murmures de velours d’un démon à notre oreille, nous proposant un pacte ne pouvant bien entendu que nous avantager ?",
      },
      {
        type: "paragraph",
        text: "Suivre la voix des êtres mystérieux qui se terrent dans les recoins sombres de notre monde et bien au-delà ?",
      },
      {
        type: "paragraph",
        text: "Ou encore simplement tracer votre propre route sans aucune influence ? Si vous pensez vraiment ne pas être en train de marcher dans la paume de quelqu’un d’autre bien sûr…",
      },
      {
        type: "paragraph",
        text: "Le choix est à vous, bienvenue dans Vade Retro Angelis.",
      },
    ],
  },
  {
    id: "debut-campagne",
    accent: "emerald",
    title: "Début de campagne",
    content: [
      {
        type: "paragraph",
        text: "Ce détail est bien entendu à l’entière discrétion du MJ et de son envie, ce qui suit n’est qu’un exemple pratique servant d’introduction à la formation d’un groupe cohérent de jeunes recrues.",
      },
      {
        type: "paragraph",
        text: "Elias Brown, un exorciste anglais faisant partie de la prestigieuse caste des Thaumaturges, les 12 meilleurs exorcistes de l’ordre, a eu une vision grâce à ses dons de prophète. Dans celle-ci, il voit une menace terrifiante planner sur l’ordre et même à plus grande échelle, sur le monde. Cette prophétie floue et peu rassurante lui vient cependant avec une touche d’espoir, vous. Il est convaincu que votre groupe, aussi inexpérimenté et hétéroclite soit-il, présente en lui la solution au défi qu’il sent venir depuis l’avenir.",
      },
      {
        type: "paragraph",
        text: "Dans ce but, il a recruté chacun d’entre vous et a pu devenir une figure de mentor plus ou moins proche au sein de votre formation.",
      },
      {
        type: "paragraph",
        text: "A la sortie de l’école des jeunes recrues, vous avez donc été placé sous son commandement provisoire et sous la tutelle du directeur de la branche anglaise de l’ordre : Alexander Anderson. Cet ancien agent de terrain, aujourd’hui ayant gradé dans l’administration au point d’être à la tête d’une des branches européennes les plus importantes, a toute la confiance d’Elias avec qui il partage une histoire d’amitié depuis de longues années.",
      },
      {
        type: "paragraph",
        text: "Présenté comme étant une jeune équipe de choc ne demandant qu’à faire ses preuves, vous voilà tous réunis. Vous vous connaissez de vue ou plus si affinité mais vous n’avez pas obligatoirement développé une relation profonde pendant votre formation.",
      },
      {
        type: "paragraph",
        text: "Vous êtes tous exorcistes de rang 5, autrement dit le rang le plus bas qui vous identifie comme des bleusailles n’ayant pas encore accompli une réelle mission sans la supervision d’un exorciste de rang 3 ou plus.",
      },
      {
        type: "paragraph",
        text: "C’est donc à votre stupéfaction générale que vous vous voyez confier votre première mission par Anderson… avec la forte désapprobation d’Elias.",
      },
      {
        type: "paragraph",
        text: "Lui ayant toujours été particulièrement soutenant à votre égard, vous doutez qu’il ait perdu confiance en vos capacités. Seulement il a un mauvais pressentiment concernant cette mission et a semble-t-il supplié Anderson d’envoyer d’autres agents mais l’affaire tombe mal. Vous êtes à l’approche du solstice d’hiver, cette date fatidique, correspondant à l’augmentation de la durée de chaque nuit, va de paire avec une augmentation du pouvoir d’Asmodeus, le roi de l’Enfer président aux démons de la nuit et des ténèbres. En conséquence, comme chaque année, cette période voit les démons de son règne particulièrement actifs et les exorcistes sont débordés.",
      },
      {
        type: "paragraph",
        text: "Anderson ne peut donc décemment pas envoyer des équipes chevronnées s’occuper d’une simple affaire de disparition de pêcheurs dans le petit village de Clovelly sur la côte anglaise. D’autant plus qu’une exorciste de rang 1 experte des démons aquatiques du règne de Léviathan, Sasha Walter, est déjà sur place pour enquêter et n’a fait qu’une demande de soutien au cas où les choses devaient se gâter.",
      },
      {
        type: "paragraph",
        text: "Après un rapide briefing et un passage à l’armurerie pour vous équiper en conséquence, vous êtes désormais à bord de votre camionnette de service, en direction du village de Clovelly vous ressentez un mélange flou d'inquiétude pour certain, d’excitation pour d’autres et vous vous apprêtez enfin à réellement commencer votre aventure.",
      },
    ],
  },
  {
    id: "barriere",
    accent: "violet",
    title: "La Barrière",
    content: [
      {
        type: "paragraph",
        text: `La barrière est le plus grand sortilège connu devant la malédiction de la chaire ayant réduit l’humanité à un peuple privé de magie.`,
      },
      {
        type: "paragraph",
        text: `Il s’agit en réalité du sceau entourant le plan matériel et le protégeant des démons et des anges. A l’origine de Dieu et de Satan, on peut dire qu’il s’agit là de leur dernier coup d’éclat avant de se retirer.`,
      },
      {
        type: "paragraph",
        text: `Le fonctionnement de la barrière en réalité quelque peu comparable à un filet, un sortilège d’aussi grande envergure et destiné à retenir une telle quantité d’énergie ne peut décemment pas être impénétrable, celà serait trop coûteux. Le compromis ayant visiblement été trouvé est donc que seuls les êtres de faible pouvoir peuvent la traverser librement. Les démons et les anges nobles sont donc à peine assez faibles pour pouvoir se manifester sur le plan matériel même si celà leur demande une grande quantité d’énergie. Notre plan est en revanche interdit d’accès aux séraphins, aux seigneurs démons, aux archanges et aux rois démons. C’est à cause de cette barrière que ces derniers doivent se résoudre à laisser passer une partie de leur pouvoir sous forme d’avatar où de possession humaine mais ne peuvent en aucun cas se manifester physiquement parmis nous. Si une roi démon ou une archange devait utiliser plus d’un dixième de son pouvoir par le vaisseau d’un humain sans aucune prédisposition à accueillir son essence, ce dernier se consumerait en quelques instants, laissant l’entité sans réceptacle et condamnée à retourner au sein de son plan d’origine. Les démons et les anges cherchent activement à se débarrasser de la barrière, car sa fin signerait l’annexion immédiate du plan matériel par le premier des deux camps à ouvrir une brèche. De son côté le Vide, bien que tenu à distance aussi bien par le Paradis que par l’Enfer, tente aussi de s’infiltrer au sein du plan matériel pour profiter de la quantité d’énergie démentielle dont il dispose, surtout comparé à leur dimension.`,
      },
    ],
  },
  {
    id: "paradis-approfondi",
    accent: "gold",
    title: "Le Paradis",
    content: [
      {
        type: "paragraph",
        text: `Le plan spirituel divin, plus communément appelé Paradis ou Eden, correspond à la portion de l’univers aménagé et régi par Dieu. Son infrastructure, majoritairement composée de temples et de matériaux nobles pour un œil humain, est décomposée en différents îlots séparant naturellement le domaine de chaque archange et de chaque séraphin à un échelon plus bas. Cependant cette séparation ne fait en rien l’objet de guerres de territoire comme c’est le cas en Enfer, ici le Paradis a toujours été séparé de la sorte et le sera toujours, les archanges suivant des commandements très stricts (quand ils ne sont pas occupés à chercher un moyen de suivre leurs intérêts sans aller à l’encontre de ces mêmes commandements).`,
      },
      {
        type: "paragraph",
        text: `Bien sûr le Paradis à tout de même subi quelques changements forcés suite au départ de 3 de ses archanges. L’essence de chacun d’entre eux était tellement liée à un pan de paradis que ces mêmes fragments se sont envolés avec eux ou ont sombré en Enfer pour s’amalgamer avec le territoire dont ils s’étaient déclarés maîtres.`,
      },
      {
        type: "paragraph",
        text: `L’organisation très militaire de l’Eden a pour chef suprême le Dieu créateur, mais en son absence quelques ajustements ont dû être faits. Le Consilium Angelorum est la plus haute instance dirigeante en l'absence de Dieu, composé des 10 archanges à son origine et maintenant des 7 restants, il permet au Paradis de prendre les décisions importantes et nécessitant un accord au seins des anges pour éviter un conflit et une scission. Pour autant, le système de vote et de débat n’est pas totalement démocratique. Les archanges sont nés dans un ordre précis et connu qui les place en rang, de l'aîné à la benjamine. Plus un archange est vieux et plus sa voix à de l’importance au sein du conseil. Ainsi, dans l’ordre de leurs naissances et donc dans l’ordre de leur autorité, on pouvait les classer comme suit : Samaël, l’archange de la destiné et le commandement du silence ; Michael, l’archange de la vaillance et le commandement de la piété ; Lucifer, l’archange de l’illumination et le commandement de la foi ; Gabriel, l’archange de la miséricorde et le commandement de l’altruisme ; Raphaël, l’archange de la compréhension et le commandement de la paix ; Azrael, l’archange de la justice et le commandement de la vérité ; Sariel, l’archange du savoir et le commandement de la patience ; Uriel, l’archange du châtiment et le commandement de la pureté ; Raguel, l’archange de l’ordre et le commandement du respect ; Ramiel, l’archange de la résurrection et le commandement du repos. Aujourd’hui il convient bien évidemment d’enlever Samaël, Lucifer et Azrael de cette liste.`,
      },
      {
        type: "paragraph",
        text: `Contrairement aux démons, les anges ne se nourrissent pas des âmes des damnées et n’ont par ailleurs pas un accès total aux âmes des mortels, peu importe leur niveau de conformisme aux commandements prônés par les différentes religions. Cela ne veut pas dire que les anges n’ont aucun moyen de gagner en force bien qu’il s’agisse d’un moyen visiblement bien moins efficace. En effet, si l’on mélange la paroles de certains experts et de plusieurs anges, le Paradis semble se nourrir de la dévotion et de la foi que l’on porte en lui. La mise en place de différents cultes par les humains semble donc bien inspirée par les anges eux-mêmes dans le but de renforcer l’Eden par des moyens encore inconnus.`,
      },
      {
        type: "paragraph",
        text: `Comme dit plus tôt, les âmes vertueuses ne se rendent pas naturellement au Paradis, elles suivent le cycle classique de la réincarnation et prennent une nouvelle enveloppe physique. Cependant, dans le cas où une âme aurait une valeur particulière pour le Paradis, Orphael le séraphin des rêves garderait ses âmes en réserve dans sa dimension onirique jusqu’à ce que son archange, Ramiel, la lui réclame et lui redonne une enveloppe physique si besoin.`,
      },
      {
        type: "paragraph",
        text: `Les anges de bas rang semblent se comporter comme des drônes, des être sans réel ego dont le seul but est d'accomplir leur mission et de respecter leurs ordres. Bien que ce respect de l’ordre reste une caractéristique importante même chez les archanges, le niveau d’autonomie et la liberté d’action augmentent progressivement plus l’ange observé est d’un rang élevé. Contrairement aux démons mineurs qui ont une pensée purement bestiale, les anges mineurs sont néanmoins tous doués de parole. La hiérarchie angélique est bien plus simple et uniforme que celle des démons. Ainsi, si parmis les anges de bas rang on peut démarquer des anges de haut rang servant souvent de commandant de bataillon ou avec de plus grandes responsabilités, de plus grands pouvoirs ou une plus grande marge d’action, il n’existe pas réellement de rangs jusqu’à atteindre les séraphins et les archanges. On parle donc souvent des “anges nobles” ou des “anges majeurs” même s’il s’agit d’un abus de langage contrairement aux démons pour lesquels ces catégories existent et viennent des légions infernales elles-mêmes.`,
      },
      {
        type: "paragraph",
        text: `Au sommet du Paradis se situe une colonne de lumière menant au palais blanc. On dit de ce lieu sacré qu’il s’agit de la retraite spirituelle de Dieu, le déranger serait considéré comme un péché suprême, s’agissant là du dernier ordre que le créateur avait donné à ses enfants avant de s’y retirer. Il s’agit également de l’endroit au sein duquel l’essence des anges morts se régénère pour finalement leur permettre de retrouver leur forme d’origine après un temps dépendant grandement du rang de l’ange en question et de la gravité des blessures ayant mené à sa destruction. Une fois l’essence de ces anges reconstitués, ils sont condensés au sein du Lac Cardinal de Gabriel pour ne émerger indemnes de toute blessure.`,
      },
    ],
  },
  {
    id: "dieu",
    accent: "azure",
    title: "Dieu",
    content: [
      {
        type: "paragraph",
        text: `Être transcendant dont on ne sait que très peu de choses, il s’agit vraisemblablement d’un des êtres, si ce n’est l’être, le plus puissant du cosmos. Son pouvoir serait au moins équivalent à la somme de tous ses anges, simple exagération ou fond de vérité ? Nous n’avons pas les éléments pour trancher. Nous savons néanmoins qu’il a donné naissance aux 12 djinns primordiaux et qu’avec Ether la Djinn de lumière il a forgé les 10 archanges. A la suite du départ d'Éther et du reste de sa fratrie, sûr que cette dernière n’était qu’un outil reproductible, il a donné naissance au Djinn du jour, Héméra, sa remplaçante. On dit que c’est suite à la déception qu’il aurait ressenti en constatant la baisse de qualité de ses créations sans le soutien d’Ether qu’il aurait décidé de se retirer au coeur du Palais Blanc pour réfléchir à la situation. Il y serait toujours avec l’interdiction formelle d’être dérangé peu importe le prétexte. C’est lui qui a fait don à ses 10 archanges de 10 commandements, des capacités divines qui sont en réalité des parties de lui-même et qui leur donne des pouvoirs extraordinaires tant qu’ils restent en accord avec les vertus de leur Père. Il est également à l’origine du Coeur, un artefact divin surpuissant permettant à son possesseur, s’il est en capacité de le manier, d’augmenter son pouvoir jusqu’à un niveau quasi-divin. C’est Samaël qui en a actuellement l’usage au sein du Vide.`,
      },
    ],
  },
  {
    id: "archanges",
    accent: "crimson",
    title: "Les archanges",
    content: [
      {
        type: "paragraph",
        text: `Les leaders et organisateurs de l’Eden, bien qu’ils restent avant tout des guerriers. Dieu les a d’abord créées à l’aide d'Éther la Djinn primordiale, cette dernière forgeant la lumière divine pour leur donner naissance. Cela dans une pensée d’armée parfaitement organisée, chacun ayant les capacités de combler les faiblesses de ses frères et sœurs. De plus, chacun d’entre eux possède un artefact archangélique créé sur mesure par leur mère en fonction de leurs capacités et un commandement divin leur octroyant un grand pouvoir à condition de suivre les préceptes du Paradis. Avec le temps et la paix, ces mêmes capacités sont devenus principalement des outils de gestion et chacun à un rôle bien précis dans le maintien de l’ordre et dans le bon fonctionnement du Paradis. Comme tous les anges, dans leur forme la plus pur ils pourraient apparaître comme des sphères de lumière sans le moindre artifices mais ils prennent plaisir à se démarquer et prennent donc chacun une apparence leur étant propre avec des couleurs et des matériaux leur étant rituellement associé et devenant alors des symboles puissant pour les mortels souhaitant établir un contact avec eux. Comme la quasi-totalité des anges, ils ne possèdent pas de visage à proprement parler mais assez régulièrement un casque, un masque ou d’autres attributs plus atypiques.`,
      },
    ],
  },
  {
    id: "cour-michael",
    accent: "gold",
    title: "La Cour De Michael",
    content: [
      {
        type: "entry",
        title: "Michael",
        text: `Le plus souvent décrit comme l’Archange de la Vaillance, on peut effectivement voir Michael comme un guerrier, il a de tout temps été un général pour le paradis étant probablement l’archange avec le plus d’attrait pour l’art de la guerre et pour le combat au sens large. Si sa puissance ne fait aucun doute et fait de lui l’ange le plus craint par l’intégralité du cosmos, on ne peut pas en dire autant de son ouverture d’esprit.

Prenant l’apparence d’un guerrier de platine titanesque coiffé d’un heaume de guerre et d’une auréole de foudre dorée, Michael est la représentation même du guerrier divin. S’il apprécie les symboles d’autorité, il reste un soldat avant d’être un général et ne portera jamais rien qui risquerait de le gêner un tant soit peu au combat. Il convient cependant de lui laisser qu’il possède un talent certain pour agencer son équipement afin d’allier l’impressionnant au fonctionnel.

Actuel meneur du Paradis en l’absence de Dieu et de Samaël. Devenant l’archange le plus âgé suite au départ de son frère aîné, il possède en conséquence la plus grande autorité au sein du conseil bien que plusieurs de ses frères et sœurs n'hésitent pas à s’opposer à sa vision des choses. Longtemps considéré comme l’éternel second et vivant dans l’ombre de son frère Samaël jouissant d’une sagesse bien supérieur, nombreux sont ceux qui n’hésitent pas à accuser l’archange de la vaillance d’avoir nourri une profonde jalousie à l’égard de ce dernier. Ayant un point de vue radicalement différent vis à vis du symbole que la Paradis se devait d’incarner pour le reste du cosmos, il n'hésita pas un instant à changer en profondeur l’héritage de l’ancien Archange du Destin au grand regret de certains des membres de sa famille céleste.

Campant sur ses positions assez radicales, il est celui qui avait proposé puis majoritairement soutenu le projet d’éradication de l’espèce humaine lorsque cette dernière commençait à devenir une menace potentielle lors des temps anciens où les humains primordiaux foulaient encore le sol. Encore aujourd’hui on ne peut pas dire que son regard soit tendre envers l’humanité, dans le meilleur des cas il considère les humains avec un désintérêt global et dans le pire on peut sentir chez lui un dégoût comparable à celui que l’on pourrait ressentir face à un nuisible à l’apparence disgracieuse. La faiblesse semble l’irriter grandement et cela même au sein de ses propres rangs même si son mépris pour les démons l’emporte largement.

Ne supportant pas le principe même de négociation avec les démons ou tout ce qui s’en approche de près ou de loin, il est principalement connu pour son mauvais caractère et ses grandes démonstrations de force si l’un des membres de sa famille semble tenter une approche plus subtile ou impliquant le dialogue. Il incarne à la perfection la frange du Paradis n’étant en aucun cas satisfait de la guerre froide et non assumée dans laquelle les Hauts Cieux se sont enlisés avec les Enfers. Favorable à une guerre ouverte, il cherche donc logiquement à mettre un terme au frein que lui impose la barrière dans le but de lancer une large offensive sur les royaumes infernaux avant que ceux-ci ne soient trop puissants ou organisés pour résister à l’armée céleste.

Même si sa haine ne saurait être remise en doute, il est cependant de notoriété publique qu’il n’arrive pas réellement à se résoudre à haïr son frère Lucifer dont il était très proche avant la chute de ce dernier. Les deux entités se rejoignent encore aujourd’hui dans leur dégoût envers les mortels et leur envie de voir cette engeance disparaître ainsi que dans leur détestation des démons. S' ils ne se croisent désormais qu’en tant qu’adversaires, ils ne s’affrontent pourtant jamais directement, ce qui est en réalité assez louche au vu des habitudes des deux frères qui n'hésitent jamais vraiment à croiser le fer en d’autres circonstances. Il n’a cependant pas la même douceur pour son frère Azrael qu’il considère comme un traître ayant renié tous les liens qu’il pouvait avoir avec le Paradis et blasphémant la perfection de leur père.

Malgré ses nombreux défauts, Michael porte tout de même une certaine estime aux héros et aux êtres courageux. On dit même qu’il les inspire dans leur plus grand moment de vaillance et qu’il n’hésite pas à prêter sa force aux êtres suffisamment purs qui la demanderaient au cœur d’un combat à l’aide d’une simple prière. De la même manière, les moines guerriers lui sont régulièrement dévoués pour la force qu’il prête sans concession ni contrepartie tant que la cause lui paraît juste et qu’elle implique de combattre le mal sous toutes les formes qu’il pourrait assumer en provenance de l’Enfer. Les mortels l’ayant particulièrement impressionné par leur héroisme et leur dévouement au combat de leur vivant peuvent être accueillis dans son Arène du Tonnerre, une arène de nuages d’orage et de platine dans laquelle la foudre divine de l’archange semble toujours prête à s'abattre et qui voit s’affronter les légions d’anges en quête d'entraînement et les guerriers reconnus par le Paradis. On raconte que si une âme se montre particulièrement impressionnante, Michael peut sortir de sa contemplation et se lever de son trône pour défier lui-même en duel le vaillant adversaire. Bien qu’aucun mortel n'ait jamais pu le mettre en difficulté, il s'agit tout de même du plus grand honneur imaginable pour un véritable guerrier.

D’une façon très logique, Michael est donc principalement chargé de la protection de l’Eden et du bon fonctionnement de l’armée des Haut Cieux. Il guette avec attention la moindre faille du côté de l’Enfer ou du Vide et n’hésite pas à bondir quand une opportunité se présente. Il serait cependant dangereux de le croire impulsif et facile à berner, il est sans nul doute le plus grand stratège militaire sur lequel les Cieux peuvent compter. Les archanges sont assurément nés pour être des guerriers mais Michael était l’enfant de Dieu dans lequel il avait placé toute sa rage guerrière. La foudre dorée qui bat comme sans cesse comme un battement de cœur sous sa peau de platine le mène constamment sur les champs de bataille et le pousse à amener l’Eden dans son sillage.

Ses attributs rituels majeurs sont la foudre, le platine dont son corps d’armure est presque intégralement composé ainsi que la couleur dorée qui caractérise son aura. On le dit capable de commander à la foudre au point qu’il deviendrait lui-même une masse d’éclairs au cœur de la bataille mais peu de gens sauraient affirmer s’il ne s’agit pas là d’une simple exagération due aux réflexes fulgurants de Michael. Il est également en possession d’un artefact archangélique reçu en cadeau de naissance de la part de sa mère, Ether, les Arcs Célestes. Prenant la forme de gantelets de foudre forgée au cœur même du métal, ils donnent à son porteur la capacité prodigieuse de manipuler l’électricité quelle que soit son intensité et de rendre la foudre stable alors qu’il s’agit par nature de la manifestation la plus chaotique de l’arcane. Michael devient alors capable de condenser des chaînes entières d’éclairs en une lance de lumière vibrante qui, une fois lancée, devient un projectile au pouvoir de destruction incommensurable.

Son Commandement de la Piété lui octroie la capacité de transformer sa confiance en lui et en sa cause en énergie radiante qui vient directement alimenter ses éclairs sacrés. Plus son combat est parfaitement en accord avec l’ambition de son père et plus sa force sera grande au point de lui permettre de manifester des portions de Paradis ou des formes angéliques éthérées comme des extensions de son propre corps et uniquement maintenues par sa foi. Bien entendu le contrecoup de ce don et qu’il ne peut pas dévier des règles sans perdre une partie de ses capacités ce qui ne fait que renforcer son dogmatisme et participe à rendre sa façon d’agir relativement prévisible pour ses adversaires.`,
      },
      {
        type: "entry",
        title: "Hamiel",
        text: `Le cavalier blanc qui sillone les champs de bataille en menant les troupes qui méritent de vaincrent, il est prié comme le séraphin de la victoire, ainsi que l’un des guerriers les plus puissants du Paradis.

Cavalier de lumière et de pierre taillée, il est en réalité tout autant le cavalier que sa monture. Les mortels auraient tendance à voir dans ses traits une représentation des personnes les ayant inspirés ou encouragés au cours de leur vie.

Il est connu pour être le bras droit de Michael, celui auquel il fait le plus confiance pour diriger ses troupes angéliques et pour faire passer ses ordres le long de la chaîne de commandement, tout particulièrement les Trônes et les anges de la charge céleste qui sont sous l’autorité directe d’Hamiel. On dit que partout où il passe, il laisse derrière lui une traînée dorée qui a le pouvoir de rendre aussi rapide que lui n’importe qui qui poursuivrait le même objectif que lui. Il serait par ailleurs un grand amateur de courses qu’il aurait pour habitude d’organiser dans son domaine, l’Hippodrome des Sables d’Or, une vaste plaine de sable dorée parcouru par des cavaliers angéliques prêts à la guerre. Certains lui prêtent également un pouvoir de prescience vis-à-vis de son propre destin, ce qui lui permettrait d’anticiper les mouvements de ses adversaires et de façon plus large de toujours trouver la meilleure stratégie pour mener ses troupes à la victoire.

Il fait preuve d’une admiration et d’une dévotion sans borne envers son archange peu importe ses décisions ou ses prises de décisions. A titre personnel il ne semble nourrir ni admiration ni rancœur envers l’humanité ou les démons, il se contente de laisser son être se consumer dans la chaleur du combat et de faire plier n’importe quel ennemi désigné par Michael. Certains meneurs d’hommes ou militaires émérites ont néanmoins pu réveiller une once d’admiration chez lui. Dans ce cas, il n'hésite pas à leur accorder la capacité de galvaniser les troupes, tout comme lui. Ces fidèles les plus fervents héritent également de sa capacité à se déplacer à des vitesses inhumaines et à emporter ses alliés avec eux.

Certaines mauvaises langues évoquent cependant une facette plus sombre du séraphin. Selon eux, il se serait vendu il y a de cela des millénaires à la cause de l'un des quatres cavaliers de l’apocalypse : Conquête. S’il faut bien admettre que des similitudes troublantes existent entre les deux entités, aucun élément sérieux ne permet de soutenir cette accusation. Cependant les cavaliers sont célèbres pour leur essence corruptrice et des êtres plus valeureux encore y ont déjà succombé.`,
      },
    ],
  },
  {
    id: "cour-gabriel",
    accent: "azure",
    title: "La Cour De Gabriel",
    content: [
      {
        type: "entry",
        title: "Veral",
        text: `Vénéré par de nombreux croyants en quête de puissance pour servir leurs dessins, Veral est prié en tant que séraphin du pouvoir.

Prenant l’apparence d’un géant de pierre sombre au visage composé de nuages d’orage, il ne sépare jamais de son titanesque marteau de guerre, Châtiment, qui aurait le pouvoir de détruire des cités entières en un seul coup entre ses mains.

Le séraphin du pouvoir est par définition le séraphin possédant la plus grande puissance brute parmi ses pairs : il incarne le concept même de la force et du pouvoir. Ainsi bien que limité en termes de moyens et de diversité, il y a en réalité peu de problèmes qu’il ne peut pas résoudre à l’aide de sa force brute.

Il passe une partie de son temps au sein de son Creuset de la Domination, un gigantesque cratère de sable sombre entouré de colonnes de marbre blanc, au cœur duquel il n’hésite pas à violemment éprouver ses troupes afin d’en faire les soldats les plus dignes possibles à présenter à son archange.

Quand Michael ne peut pas se déplacer en personne, c’est régulièrement lui qu’il envoie s’il trouve un quelconque intérêt à impressionner son audience.`,
      },
      {
        type: "entry",
        title: "Essaïm",
        text: `Séraphin de la noblesse, il est de loin le plus pacifique et réfléchi des trois séraphins de Michael. Épéiste émérite, probablement le meilleur du Paradis, il est d’un caractère calme et mesuré.

Prenant l’apparence d’une silhouette osseuse et décharnée qui semble briller d’un éclat intérieur et possédant une couronne d’ossement faisant partie intégrante de son être, Essaïm impose le respect par sa simple présence.

S’il est pacifique et réfléchi comparé au reste des anges de Michael, il n’en reste pas moins profondément orgueilleux et considère comme étant parfaitement inutiles les êtres qu’il juge comme lui étant inférieur.

Ses talents à l'épée sont si légendaires qu’il peut atteindre et blesser gravement une âme sans endommager son réceptacle. Il agit officiellement en tant que façade diplomatique auprès des autres archanges et en tant que chef des commandos d’élite de Michael.`,
      },
      {
        type: "entry",
        title: "Gabriel",
        text: `En tant qu’Archange de la Miséricorde, Gabriel a toujours été un soutien de poids de l’humanité. Plaidant régulièrement la cause des mortels si ces derniers devaient se retrouver au cœur des mouvements militaires de l’Eden, elle est partisane de l’idée selon laquelle les être supérieurs tels qu’elle et les autres archanges ont un devoir envers les plus faibles.

Gabriel se manifeste sous une apparence éthérée, semblant constituée de lumières chatoyantes et d’arcs-en-ciel. Cette formation lumineuse représente une tête d’oiseau de proie au regard paradoxalement doux avec un corps composé d’ailes et de plumes flottant sans but précis.

Grande sœur des archanges, elle a toujours pu bénéficier d’une aura particulière en tant que principal soutien de Samaël à l’époque où il présidait le conseil puis en tant qu’héritière de sa volonté à la suite de son départ. Si elle ne lève que rarement la voix et repousse constamment l’usage de la violence, il serait pure folie d’imaginer là un signe de faiblesse.

Son domaine, situé au cœur de l’Eden, prend la forme d’un lac d’énergie pure, chatoyant d’un millier de couleurs, entouré d’un champ de fleurs éternelles : le Lac Cardinal. C’est là que se réunit le conseil des vertus cardinales et que les anges reconstitués émergent indemnes.

L’archange de la miséricorde a un attrait prononcé pour les guérisseurs dont elle est la sainte patronne. Elle est parfois mal vue au Paradis à cause de sa souplesse non seulement envers les humains, mais également à l’encontre de certains démons.

Ses symboles majeurs sont l’énergie pure, la soie et un mélange de couleur harmonieux ou le bleu ciel. Son artefact archangélique, le Souffle de Vie, prend la forme d’un cor massif qui donne la capacité d’échanger librement la vitalité de ceux qui l’entendent. Son Commandement de l’Altruisme lui donne la capacité de recharger l’aura des autres sans limite au prix de la sienne.`,
      },
      {
        type: "entry",
        title: "Aniel",
        text: `Le séraphin de la bonté est une puissante guérisseuse et une grande protectrice. Aniel est depuis l’aube des temps l’une des représentations angéliques apparaissant le plus dans l’esprit des mortels.

Prenant la forme d’un être lumineux évoquant vaguement un papillon, elle est en réalité plus souvent perceptible comme une orbe de lumière éblouissante. Elle possède le pouvoir d’émettre une lumière divine qui brûle les maladies, les malédictions et les peurs.

Aniel est probablement l’ange qui est le plus proche soutien de Gabriel au quotidien, l’épaulant comme un fidèle bras droit dans ses tâches célestes.

Le séraphin de la bonté passe le plus clair de son temps dans son domaine, le Berceau du Clair de Lune, un lieu essentiel au bon fonctionnement du Paradis car les essences blessées des anges s’y régénèrent.`,
      },
      {
        type: "entry",
        title: "Abarim",
        text: `Le séraphin de l’égide est affectueusement surnommé le bouclier du Paradis par ses pairs. Expert en protection, Abarim est de loin l’ange capable d’ériger la plus grande défense au sein des cieux.

Prenant l’apparence d’une véritable montagne qui aurait pris vie, la façade massive du séraphin de l’égide est couverte d’or et de pierres aux reflets irisés.

Il veille sans relâche depuis sa Vigie Céleste, une montagne de pierre blanche immaculée surplombant le domaine de Gabriel. Cette particularité permet à Abarim de mener au mieux son rôle de protecteur de l’Eden.

Ce dernier est chargé des différentes barrières entourant le Paradis ainsi que des anges gardiens. Il a une véritable affection pour les personnes capables d’un fort sens du sacrifice et il n’hésite pas à venir appuyer toute personne décidant de se sacrifier dans le but de sauver ses proches.`,
      },
      {
        type: "entry",
        title: "Tsadkiel",
        text: `Tsadkiel est un ange très particulier, même au sein des séraphins. Prenant le rôle du séraphin du sacrifice, elle est connue pour être particulièrement lunatique et pour dénoter au milieu de ses pairs.

Prenant l’apparence d’un gigantesque loup à la fourrure de nuit constellée d’étoiles dorées, ses yeux et l’intérieur de sa gueule laissent entrevoir une lumière douce et tamisée. Des plaies apparaissent périodiquement sur son corps, faisant couler un ichor doré.

Tsadkiel se distingue par sa capacité unique à absorber la douleur, les blessures et les malédictions dont les autres pourraient souffrir. Une fois que ces dernières se mettent à ravager son être, elle a la capacité d’en guérir bien mieux que n’importe quel ange.

Elle peut être trouvée sur son Autel des Sacrifiés, un vaste temple couleur de nuit où elle accueille les souffrances des croyants dans la mesure du raisonnable.`,
      },
    ],
  },
  {
    id: "cour-raphael-sariel",
    accent: "violet",
    title: "Les Cours De Raphaël Et Sariel",
    content: [
      {
        type: "entry",
        title: "Raphaël",
        text: `Connu comme étant l’Archange de la Compréhension, Raphaël est avant tout un être mystérieux dont l’existence échappe à la plupart des mortels, des démons et même des anges. Pratiquement mutique et peu démonstratif, ses apparitions publiques sont rares.

Prenant la forme d’un homme encapuchonné avec deux paires de bras couverts d’une armure sombre, il est facilement reconnaissable avec les traces de pas qu’il laisse derrière lui un bref instant et qui laissent voir la voie lactée.

Fortement lié aux étoiles, il est connu comme l’ange de l’espace et enseigne aux mortels l’art de l’astronomie ainsi que la lecture des constellations. Il fait partie des archanges “bienveillants” avec Gabriel et Ramiel.

Son domaine, la Plage Astrale, est une gigantesque étendue de nuit étoilée. Les astronomes constituent la majorité de ses troupes, destinés à scruter l’univers en tant qu'œil omniscient et omniprésent du Paradis.

Ses symboles majeurs sont l’indigo, le plomb et la magie spatiale. Il possède l’artefact archangélique de la Clé de l’Infini. Son Commandement de la Paix fait de lui le seul être de son rang à pouvoir voyager librement sur le plan matériel, au Paradis, en Enfer, dans le Vide et même dans d’autres univers, au prix de l’interdiction de blesser autrui.`,
      },
      {
        type: "entry",
        title: "Danael",
        text: `Le Séraphin du Chemin est souvent plus connu sous le sobriquet du Vagabond.

Ange couvert d’une cape en haillons, ses nombreuses mains semblent toujours affairées dans un pli de réalité. Il est probablement l’ange le plus proche de Raphaël.

Il a la charge titanesque du bon fonctionnement des différents portails angéliques permettant de se déplacer avec aisance au sein du Paradis. C’est également lui qui se charge du maintien des transports magiques des mortels ayant invoqué la protection de Raphaël.

Danael a également reçu une mission plus confidentielle : explorer les courants de magies à la recherche d’un passage permettant de contourner la barrière empêchant les anges de haut rang de se rendre sur le plan matériel.`,
      },
      {
        type: "entry",
        title: "Ephitael",
        text: `Ephitael est une ancienne séraphin de Lucifer ayant décidé de rester au Paradis malgré le départ de son archange. Aujourd’hui connue en tant que Séraphin des Martyres, elle se sent responsable du départ de Lucifer.

Constamment en habits de deuil, la lueur surnaturelle qui émane en permanence de son être fait qu’elle est également connue comme la séraphin du clair de lune.

Raphaël l’a recueillie suite au départ d’Amiel. Elle l’aide dans sa tâche la plus délicate vis-à-vis du Paradis : l’aide des âmes pures. Son domaine, le Cœur d’Argent, est empli de fragments d’esprits et d’aura perdus qu’elle tente de sauver.

Elle porte une colère et une haine farouche envers les anges déchus ayant décidé de se tourner vers l’Enfer et tout particulièrement envers Amy.`,
      },
      {
        type: "entry",
        title: "Meruem",
        text: `Prophétesse de Raphaël, elle est connue en tant que Séraphin des Signes. Ancienne proche de Samaël, elle avait toujours semblé représenter le lien l’unissant à Raphaël.

Prenant l’apparence d’une femme faite d’écorce de bouleau blanc, sa tête semble mimer un bec d’oiseau en feu. Elle lie l’avenir en observant les flammes et en absorbant leur reflet jusqu’à entrer dans une transe prophétique.

Elle a pour tâche d’envoyer des visions et des connaissances aux mortels que le Paradis jugerait utile d’aider. Elle incarne le sens du dangers des mortels, cette petite voix qui les avertit quand leurs actions pourraient les mener à se détruire eux-mêmes.

Son domaine, l’Arche d'Émeraude, est la seule partie restante de l’ancien domaine de Samaël encore présente au Paradis.`,
      },
      {
        type: "entry",
        title: "Sariel",
        text: `L’Archange de l’Esprit est un être complexe à cerner. Si Sariel est parfois connue en tant qu’archange du savoir elle n’apporte qu’un intérêt très mineur aux titres et aux honneurs. Très loin d’être une guerrière, Sariel est au contraire la sainte patronne des savants, des chercheurs et de toute personne en quête d’une vérité cachée.

Prenant le plus souvent la forme d’une brume violacée emplie de reflets argentés, elle se manifeste par le biais de tentacules mauves couverts d’yeux semblant tous regarder dans une direction différente.

Au contraire de la plupart de ses frères et sœurs, Sariel n’apporte pas d’intérêt particulier aux affaires du Paradis ou à la vénération des mortels. Son activité favorite consiste à agrandir sa Bibliothèque Sans Fin, son domaine au sein du Paradis, qui est à la fois son territoire et une représentation de son esprit.

Grande collectionneuse, elle prend un plaisir presque maladif à collecter toutes sortes de savoirs afin d’enrichir sa collection. Elle resta proche de Sitiel et il n’est pas rare de voir leurs forces se retrouver à suivre le même objectif à la recherche d’un artefact ou d’un sortilège oublié.

Ses symboles majeurs sont la couleur mauve, l’argent, la brume et tout objet ou écrit secret. Son artefact archangélique, le Sceptre des Secrets, lui donne un regard omniprésent et la capacité de connaître l’emplacement de l’objet de ses désirs. Son Commandement de la Patience lui permet de voler une partie de la rapidité de pensée, de perception et de mouvement de ses victimes pendant une durée limitée.`,
      },
      {
        type: "entry",
        title: "Chûd",
        text: `Chûd est connu comme étant le Séraphin des Archives et ce titre n’est en rien usurpé, il peut sans problème être vu comme étant la mémoire du Paradis.

Prenant la forme d’un homme élégant, son corps est intégralement composé de papier et de pages de manuscrits qui semblent se remplir progressivement.

Gardien de la grande bibliothèque de Sariel, il coordonne les efforts des anges bibliothécaires afin d’assurer la croissance perpétuelle de ce labyrinthe de l’esprit. Ne faisant pratiquement qu’un avec la structure profonde du domaine, il est capable d’y trouver presque toutes les informations qu’elle contient.

Il est logiquement le saint patron des gardiens du savoir, qu’il s'agisse des professeurs, des prêtres ou des héritiers d’une volonté ancienne.`,
      },
      {
        type: "entry",
        title: "Rachel",
        text: `Le Séraphin du Jugement était dans le passé sous le commandement d’Azrael qu’elle tenait en très haute estime. Suite à son départ et ayant décidé de ne pas le suivre en Enfer, c’est auprès de Sariel qu’elle trouva refuge.

Prenant la forme d’un gigantesque serpent ailé couvert d’yeux, ses multiples paires d’ailes et son corps imposant en font l’un des séraphins les plus impressionnants physiquement.

Possédant une grande puissance brute, elle a également le don de lire les pensées et de faire remonter la culpabilité des tréfonds de l’âme. Cette capacité a attiré l’attention de Sariel et l’a amené à lui faire une place au sein de ses rangs.

Rachel est devenue le poing armé de Sariel en remplacement d'Abaddon. Depuis son Tribunal de la Conscience, elle dirige les rares anges guerriers du règne de l’archange de l’esprit.`,
      },
      {
        type: "entry",
        title: "Asharah",
        text: `La plus souvent priée en tant que Séraphin de l’Oubli, Asharah est un être d’exception ayant réussi un exploit presque inconcevable : se faire aimer de la très misanthrope Sariel.

Prenant la forme d’une silhouette massive composée de brume mauve sombre, elle est en réalité constituée en majorité de souvenirs et de secrets qui s'amalgament en brume sombre.

Asharah est capable de faire sombrer les choses dans l’oubli : des mots, de la magie, des rituels, des objets, des sentiments, des secrets ou même des personnes. Ce qui finit aspiré au cœur des brumes d’Asharah en refait rarement surface et finit par disparaître de la mémoire collective.

Elle est la gardienne intransigeante des Étages Interdits, la partie la plus profonde de la Bibliothèque Sans Fin qui comprend les secrets les plus sombres de Sariel.`,
      },
    ],
  },
  {
    id: "cour-uriel",
    accent: "crimson",
    title: "La Cour D’Uriel",
    content: [
      {
        type: "entry",
        title: "Uriel",
        text: `Si Michael est l’ange le plus craint du cosmos pour sa puissance martiale, dire qu’il est réellement celui inspirant la plus grande crainte est un léger abus de langage, ce titre revenant en réalité sans contestation possible à Uriel. Cette dernière a appris à se faire connaître des mortels en tant qu’Archange du Châtiment, la responsable de l’expiation et de la rédemption nécessaire à ceux qui voudraient suivre la voie pavée de vertues du Paradis.

Prenant l’apparence d’un lion de feu ailé portant une couronne de flammes sombres et de rubie, sa posture, sa voix et son apparence font trembler les anges de plus bas rang et même la plupart de ses frères et sœurs archanges. Née pour incarner la colère divine, elle dégage une aura brûlante faisant fondre la roche et les métaux. Si elle peut paraître sinistre, elle dégage également un grand sentiment de majesté qui pousse les damnés à se plier de bonne grâce à son jugement rédempteur.

Dieu aurait voulu s’assurer que le cosmos ne prendrait pas à la légère le risque pris en provoquant ses foudres, c’est en allant au bout de ce processus qu’Uriel aurait vu le jour. Si Gabriel représente la miséricorde divine ou Michael le génie martial, Uriel est la fureur des Hauts Cieux incarnée. Elle chasse la corruption et voue une haine sans limites envers les démons. Si elle n’est pas la plus virulente à l’égard de l’humanité, il ne faut s’attendre à aucun compromis de sa part envers l’Enfer et ses monarques.

Son domaine, les Catacombes de Pénitence et de Rédemption, se trouve au plus bas du Paradis. Cela s’explique facilement de part les activités s’y déroulant, Uriel ayant beau être un archange majestueux elle reste néanmoins l’archange du châtiment. Son territoire prend la forme de catacombes gigantesque au murs d’obsidienne éclairés de larges braseros de pierre rouges à l’éclat précieux, le sol y serait fait de verre et laisserait couler sous lui des rivières de sang portant une lumière pourpre. Le sang, liquide sacré, est tout particulièrement l’attribut d’Uriel. Pour elle, il symbolise la pénitence à laquelle les âmes acceptent de se prêter pour accéder à la pureté divine.

En tant qu’ange du châtiment, sa tâche est de châtier les hérétiques et de purifier les pénitents. D’une façon très concrète, elle intervient pour laver les mortels des corruptions démoniaques et pour permettre aux anges déchus de se racheter et ainsi de revenir en grâce au sein du Paradis. Elle assure pour ainsi dire un certain niveau de pureté au sein de l’Eden et cela passe parfois par des moyens d’allure un peu moins pure.

Grande inquisitrice du Paradis, ses flammes ont la capacité de laver les âmes de leurs péchés via des sessions, ayant la réputation d’être particulièrement douloureuses, de bûchers sur lesquels les damnés monte d’eux même ou avec un peu d’aide des anges inquisiteurs dans le cas d’une trop grande… timidité. Elle a également la réputation de soutenir le fanatisme surtout si celui-ci prend la forme de sacrifices de sang ou de transes guerrières amenant les croyants la vénérant à détruire tous ceux sur leurs chemins, alliés comme ennemis.

Ses symboles majeurs sont le feu, le sang, le rubie et la couleur rouge. Son artefact archangélique, l’Epée Ardente, est d’ailleurs une représentation parfaite de ses attributs. Lame de rubie et d’or sombre entourée d’une flamme éternelle, elle lui donne la capacité de déchiqueter ses victimes avec une précision redoutable tout en brûlant de l’intérieur ses cibles à la moindre égratignure.

Son commandement de pureté lui donne la capacité de changer la souffrance en pouvoir. La douleur qu’elle inflige à ses ennemis vient donc directement alimenter ses capacités et peut dans des cas extrêmes lui permettre de déchaîner des sortilèges colossaux. Si elle peut absorber la douleur de ses ennemis, sa propre douleur est le carburant le plus efficace, ce qui l’amène parfois à se laisser toucher ou dans d’autres circonstances à s’auto-mutiler.`,
      },
      {
        type: "entry",
        title: "Myriam",
        text: `Le Séraphin de la Pénitence et le bras droit d’Uriel en l’absence d’Andariel, elle incarne la rédemption des anges. Elle s’occupe donc de superviser la pénitence de ceux d’entre eux qui auraient péché, qui se seraient détournés du chemin de Dieu au profit de l’Enfer ou encore des demi-anges.

Prenant l’apparence d’une femme au corps recouvert d’or vieilli, elle porte une cape d’un blanc immaculé formé de ses ailes malgré le sang qu’elle laisse derrière elle. Ce sang laisse suggérer que sous son masque et son armure elle est couverte de plaies laissant en permanence couler le divin liquide. Elle porte une lame d’or en permanence ensanglantée qu’elle a pour habitude de faire passer sur le corps des pénitents comme une bénédiction carmin.

Ange en charge de l’inquisition, elle porte le titre de grande inquisitrice par intérim quand Uriel elle-même ne peut pas s’en charger. Elle s'assure du bon déroulement des pénitences et de l’organisation des chambres de souffrance au sein des catacombes. Guerrière émérite, elle est à la tête des anges inquisiteurs et des valkyries dont elle partage la passion pour le combat et les champs de batailles sanglants et crépusculaires. Elle mène à bien ses activités depuis son domaine, le Confessionnal Carmin.

C’est souvent elle qui, en observant la repentance des anges damnés présents dans les catacombes, décide du moment où ils se sont suffisamment repentis pour reprendre leur place angélique. De la même façon, elle supervise l’évolution des demi-anges sur le plan matériel et décide si oui ou non ils ont suffisamment expié leurs fautes pour retrouver leur pleine nature angélique et être libérés du fardeau de la chair.`,
      },
      {
        type: "entry",
        title: "Rizel",
        text: `Adoré en tant que Séraphin de la Purification, Rizel n’a pas toujours été au service d’Uriel, au début de son existence il était l’un des séraphins composant la suite de Lucifer. Ayant décidé de rester au Paradis à la suite de son départ, ses compétences très spécifiques ont vite intéressé Uriel qui a décidé de lui offrir asile.

Prenant la forme d’un corbeau géant d’une blancheur immaculée, son corps semble émettre une vive lumière chassant les ombres et brûlant les êtres impures à proximité de son être. Son regard emplie d’un feu laiteux réduirait en cendre quiconque oserait le croiser.

Désormais séraphin de l’archange du châtiment, ce rôle semble lui convenir comme un gant tant il dispose d’un arsenal adapté à ses nouvelles fonctions. Son corps lui-même exalte une lumière brûlant la corruption des âmes soumises à son jugement et son regard perçant libère une clarté d’aurore banissant les péchés, les sombres dessins et les maléfices.

Il peut cependant arriver que sa simple présence et son regard ne suffisent pas à accélérer la rédemption des anges rebelles ou des âmes souillées. Dans ce cas, Rizel peut compter sur une arme plus radicale : ses larmes. Ces dernières ont le pouvoir de laver les âmes qui les absorbent ou qui entrent simplement en contact avec elles. Cette solution est cependant à garder en dernier recours tant ce liquide est corrosif.`,
      },
      {
        type: "entry",
        title: "Aurine",
        text: `Aurine est tristement célèbre parmi les anges comme étant le séraphin le plus craint. Même Uriel dont le tempérament impétueux n’est inconnu de personne reste d’un calme pleinement mesuré face à elle. Peu attachée aux titres, elle n’est de toute façon pas vraiment priée par la communauté religieuse ni par les mortels en général.

Silhouette éternellement en deuil, elle semble absorber les couleurs de l’univers sur son passage au point de rendre le monde l’entourant constamment noir et blanc. Elle dégage une aura profondément sinistre et pourrait être ce qui se rapproche le plus d’un ange de la mort pour les êtres immortels au sein du Paradis.

Créée dans le but d’apporter une alternative au cycle de vie des anges dans le cas ou un élément du système se révèlerait défectueux, elle possède le pouvoir de fissurer une âme au point de la rendre parfaitement irréparable. Peu d’anges ont eu à subir sa sentence mais ces quelques exemples auront suffi à faire d’elle une figure terrifiante et porteuse de mort au sein même des immortels pour qui ce concept aurait dû rester étranger.

Elle intervient parfois si un ange a vacillé trop loin du droit chemin pour espérer la rédemption. Dans d’autres cas il s’agit plutôt d’anges dont l’intégrité n’a pas survécu aux tourments imposés par Uriel et qui doivent donc être achevés plus par miséricorde que par cruauté.`,
      },
    ],
  },
  {
    id: "cour-raguel",
    accent: "azure",
    title: "La Cour De Raguel",
    content: [
      {
        type: "entry",
        title: "Raguel",
        text: `Archange de l’Ordre, Raguel a toujours nourri une admiration sans borne pour son grand frère Michael qui lui rend la pareil avec un amour débordant. Incarnation physique de la consistance et de la structure du Paradis, elle est la garante de ses lois et du respect de la voix divine.

Prenant la forme d’une statue titanesque à plusieurs visages et membres, son corps lui-même semble être un mélange d’architectures changeant régulièrement au gré de ses envies. Une constante peut néanmoins être observée de tout temps : la parfaite symétrie de son être peu importe les bâtiments fleurissants sur son corps de marbre et de cuivre.

En tant que représentante de l’ordre aux cieux comme sur Terre, elle veille avec un soin presque maniaque au bon respect des règles et punit sévèrement ceux qui s’en écartent. Elle est accompagnée d’un grand nombre nombre d'adeptes ayant pour mission sacrée d’identifier les pécheurs, les infidèles et les parjures.

Son domaine est en réalité le plus étendu au sein du Paradis puisqu’il prend la forme d’une large collection d'îlots faisant le tour de l’Eden comme pour l’englober d’un noyau protecteur. Cette ligne, souvent nommée l’anneau de loi, est avant tout un avant poste permettant d’établir la plupart des défenses du Paradis.

Les symboles rituels de Raguel sont le cuivre, la couleur orange et l’organisation symétrique d’un système défini dans les règles. Son artefact archangélique, la Croix de Domination, lui donne le pouvoir de réordonner le chaos à volonté. Son commandement du respect lui permet d’étiqueter des commandements divins pour une durée limitée à laquelle personne, pas même elle, ne peut se soustraire.`,
      },
      {
        type: "entry",
        title: "Arathim",
        text: `Le séraphin de la loi est l’ange le plus proche de Raguel, partageant sa passion sans limite pour l’ordre et l'organisation optimisée de l’univers, il l’aide dans sa tâche et dans le maintien des règles du Paradis.

Son corps est couvert de plaques d’or gravées changeant régulièrement leur contenu pour afficher une à une les lois de l’univers régi par Dieu. N’ayant pas réellement d’ailes, il porte derrière lui à leur place un immense cadran doré à douze sections. Son visage prends la forme d’un globe de cristal iridescent au coeur duquel trône un oeil unique dont le pupille est marquée du symbole phi (Φ).

S’il aide son archange au quotidien dans l’observation du respect des règles divines, sa mission plus personnelle est de s’occuper de la surveillance des dieux mineurs. Ces derniers, liés au Paradis par un contrat mystérieux, semblent bénéficier de la protection des archanges dans certaines situations.

Le séraphin des lois n’a qu’un intérêt limité pour les humains même s’il est régulièrement prié et bénéficie d’une communauté religieuse conséquente parmi les croyants les plus dogmatiques.`,
      },
      {
        type: "entry",
        title: "Lionnes",
        text: `Le séraphin des geôles est souvent perçu comme une silhouette pâle et émaciée, le corps parcouru de barreaux sombres et entouré de sphères de couleurs différentes. Cependant il est rapidement évident que cette forme fantomatique n’est qu’une manifestation permettant de communiquer plus aisément. Son corps véritable étant les geôles du Paradis elles mêmes.

Domaine se situant le long des anneaux externes du Paradis, elles sont cependant lourdement protégées. Le problème ici vient plus de la nature des prisonniers, des entités souvent particulièrement retors et corruptrices, ce qui rend impossible leur incarcération au cœur du Paradis pour des raisons de sécurité de l’Eden.

Lionnes accomplit à lui seul un travail titanesque qu’aucun ange, archange compris, ne lui envie : il retient l’essence corruptrice des prisonniers en se servant de son propre corps. Les sphères gravitant autour de sa manifestation physique représentent donc en réalité les geôles et leurs occupants.

Pleinement dédié à sa tâche, il est cependant parfois prié et n’hésite pas à accorder son soutien à ceux qui désirent garder sous contrôle des pulsions sembres. Il est aussi régulièrement sollicité par des exorcistes désirant sceller des êtres malfaisants.`,
      },
      {
        type: "entry",
        title: "Malachiel",
        text: `Être obscure et complexe, Malachiel est la plus souvent priée en tant que séraphin de la pesanteur. Elle est le plus souvent visible comme un masque violacé au cœur d’une portion d’espace étoilée, comme une déchirure dans la réalité.

Si elle est elle aussi chargée de règles de l’univers, il s’agit pour sa part des règles fondamentales. Elle s’assure que le Paradis reste parfaitement stable au niveau de son ancrage dans l’espace-temps et dans la réalité.

Capable d’augmenter temporairement certaines constantes universelles, elle peut par exemple écraser ses adversaires sous leur propre poids. Dans un cadre plus abstrait, elle peut aussi augmenter le poids de certaines émotions ce qui fait que ses victimes perdent toute volonté ou capacité à combattre.

Elle est parfois priée par les mortels pour se recentrer sur les points essentiels de l’existence. Elle apporte à ses fidèles une quasi immunité aux invasions chaotiques et aux pensées perturbatrices, ce qui leur accorde une concentration inébranlable.`,
      },
    ],
  },
  {
    id: "cour-ramiel",
    accent: "emerald",
    title: "La Cour De Ramiel",
    content: [
      {
        type: "entry",
        title: "Ramiel",
        text: `L’archange de la résurrection est certainement la membre du haut conseil du Paradis la plus passive et détachée des affaires liées au plan matériel et au grand conflit concernant les anges et les démons. Elle est également de loin celle ayant l’apparence la plus massive.

Prenant la forme d’une baleine volante gigantesque, tout son corps est composé de verdure et de fleuves au point qu’une faune et une flore unique semble se développer sur son organisme suivant un rythme basé sur ses battements de cœurs.

En tant qu’archange de la résurrection, Ramiel est chargée de conserver les consciences des mortels qui peuvent avoir un intérêt stratégique pour le Paradis afin de les rematérialiser sur le plan matériel si cela semble pertinent.

Son domaine, la mer de rêve, se situe en réalité en dessous du domaine de Raphaël qui baigne dans la partie émergée de ses eaux. Au contraire, les rivières de rêves coulant de son royaume s'écoulent dans la totalité du Paradis, alimentant tous les domaines archangéliques, et finissent leurs cours dans le lac cardinal de sa grande sœur Gabriel.

Les symboles rituels de Ramiel sont la terre fertile, le vert sombre et toute forme de magie aspirant à faire naître ou renaître la vie. Son artefact archangélique, la Balance de Résurrection, lui octroie le pouvoir de canaliser l'essence, l’énergie et l’égo d’un être vivant jusqu’à ce que son être soit jugé comme complet et prêt à être ressuscité. Son commandement du repos lui permet de dépasser les limites de son aura pour en stocker une quantité bien plus grande que ce qui devrait normalement lui être possible.`,
      },
      {
        type: "entry",
        title: "Sealiah",
        text: `Le séraphin de la création est un être très particulier, même en prenant en compte les standards de la cour de Ramiel qui est déjà relativement atypique.

Être sylvestre à l’allure clairement féminine, elle est parfois appelée “tisseuse de vie” pour sa tendance à donner naissance à des âmes en amalgamant les différents fragments d’énergie éthéré à sa portée. Son visage, composé d’un amas de racines et de feuillages, exprime en permanence une vague expression mélangeant tristesse et compassion, sans oublier un amour infini pour ses nombreux enfants.

Capable d’innover, de créer et de donner la vie, sa simple existence relève presque de l’hérésie pour certaines hautes figures du Paradis. Aussi, malgré son statut, elle serait actuellement consignée dans son domaine au sein de la mer de rêve vraisemblablement à la suite d’une transgression inconnue qui aurait provoqué l’ire des archanges.

Quand elle en a l’opportunité, elle sauve la vie de ses créations en les faisant chuter sur le plan matériel où ils ont des destins divers et variés. Si la plupart s'incarnent en humains ordinaires, il arrive que certains d’en eux héritent de quelques traits de leur mère ce qui les destine à devenir des êtres d'exception.`,
      },
      {
        type: "entry",
        title: "Orphael",
        text: `Orphael est souvent connu comme étant le séraphin des songes ou plus sobrement “le rêveur”. Prenant l’apparence d’un gigantesque poisson éthéré flottant aussi bien dans l’espace environnant que dans la mère de rêve de son archange.

Orphael a accès à sa propre dimension onirique qui semble être à la fois un monde indépendant et une partie de lui.

Régulièrement mis à contribution par Ramiel, son rôle est d’être le gardien des âmes que cette dernière devrait potentiellement réincarner à un moment encore indéfini. Il les plonge donc dans son monde interne, là bas ces dernières vivront dans un état de songe incompréhensible pour les mortels.

On le dit capable d’influencer les rêves des hommes dans des proportions assez impressionnantes. Si le Paradis a un message à faire passer à ses croyants, c’est généralement par ce biais qu’il s’adresse à eux. Orphael est alors capable de transmettre des messages ou des visions par les rêves de plusieurs milliers de croyants en une seule nuit si nécessaire.`,
      },
      {
        type: "entry",
        title: "Eliah",
        text: `Si l’on ne peut pas réellement la considérer comme un “ange de la mort”, elle se partage néanmoins en quelque sorte ce rôle avec Aurine, le séraphin de l’abandon. Néanmoins, si cette dernière fait figure d’une mort dure et froide, Eliah est une psychopompe rassurante qui fait office de visage souriant au moment du trépas.

Prenant la forme d’un oiseau de nuit couvert d’un masque d'albâtre, elle est la plus souvent priée en tant que séraphin du deuil. Contrairement à ce que l’on pourrait s’imaginer, et bien au contraire de sa binôme Aurine, elle fait l’objet de nombreux cultes et possède une vaste communauté religieuse pour les encadrer.

Elle est également souvent investie d’un rôle de gardienne, elle tente de protéger et de garder en vie les individus qui ont un réel intérêt vivant pour le paradis. Dans le cas où la mort d’une personne serait au contraire préférable, c’est aussi elle qui s’assure que le trépas soit le plus délicat possible.

Bénéficiant de son propre ordre, les prêtres gris, ce dernier s’occupe régulièrement des funérailles et des derniers rites des croyants. Elle est souvent priée au moment du trépas, comme pour s’assurer un aller vers le Paradis, et par les familles afin de réussir à surmonter leur chagrin et à vivre sereinement leur deuil.`,
      },
    ],
  },
  {
    id: "enfer-approfondi",
    accent: "violet",
    title: "L’Enfer",
    content: [
      {
        type: "paragraph",
        text: `Décrire l’Enfer n’est pas une tâche aisée, bien que de nombreux poètes s’y soient essayés avec plus ou moins de succès. Il s’agit en réalité du plan spirituel inférieur créé par Satan suite à la grande fracture en parallèle de la création du Paradis par Dieu.`,
      },
      {
        type: "paragraph",
        text: `Aujourd’hui connu comme une terre de souffrance par delà l’imagination humaine, cela n’a pas toujours été la nature de l’Enfer et de ses nombreux royaumes. S’agissant en premier lieu d’une collection de matérialisation des différents aspects élémentaires de la magie, les monarques les dirigeant ainsi que les démons les peuplant se sont petit à petit adaptés au climat régnant dans chaque domaine. C’est seulement à la suite de l'arrivée de Sitiel parmi l’assemblée des rois démons que les peuplades démoniaque ont acquis la capacité d’absorber les âmes des mortels. A la suite de cet événement, les domaines se sont pratiquement transformés en usines ayant pour but de torturer le plus d’âmes possibles afin de continuer à alimenter la montée en puissance de l’Enfer dans sa quête de dépasser le Paradis.`,
      },
      {
        type: "paragraph",
        text: `Chaque domaine a bien entendu sa propre “recette” pour transformer les âmes en énergie assimilable. Au contraire du Paradis, dirigé par une assemblée plus ou moins unie d’archanges, l’Enfer est le théâtre d’une guerre perpétuelle entre les rois démons pour tenter de s'asseoir sur le trône d'ébène laissé vaquant par Satan suite à son départ au coeur du maelstrom.`,
      },
      {
        type: "paragraph",
        text: `L’assemblée des rois démons compte 8 membres, 9 si l’on accepte de considérer Behemoth comme un souverain légitime, ce qui est hautement conseillé en la présence de sa sœur Léviathan. Ce groupe se compose des membres suivants : Lucifer, le roi des démons de lumière et le prince de l'orgueil ; Léviathan, la reine des démons aquatiques et la princesse de la gourmandise ; Asmodeus, le roi des démons de ténèbre et le prince de la paresse ; Belzébuth, la reine des démons insectes, des parasites et des maladies et la princesse de l’envie ; Lilith, la reine des pactes et des fantasme et la princesse de la luxure ; Azraël, le roi des démons de l’air et des esprits et le prince de la colère ; Sitiel, le roi chaotique et le prince de l’avarice ; Bélial, le roi des démons de feu et le prince de la destruction ; Behemoth, le prince des démons terrestre et des seigneurs libres.`,
      },
      {
        type: "paragraph",
        text: `Les démons de plus bas rang, contrairement aux anges de bas rang, ne sont pas doués de paroles et se contentent d’être des créatures bestiales régies par leurs plus bas instincts : la soif de sang et la peur des démons de rang supérieur les poussant à l’obéissance.`,
      },
      {
        type: "paragraph",
        text: `Contrairement au Paradis, l’Enfer jouit d’une hiérarchie complexe et de systèmes politiques variés au sein des différents domaines. Les démons sont grossièrement séparés en ces différentes classes : les démons mineurs ; les démons alpha ou intermédiaire ; les démons majeurs ; les démons nobles ; les seigneurs démons ; les rois démons.`,
      },
      {
        type: "paragraph",
        text: `Encore situé en dessous des royaumes infernaux se trouvent les profondeurs, un abysse de ténèbres dans lequel se terrent des êtres innommables et des créatures au pouvoir de destruction incomparable comme les cavaliers de l’apocalypse. L’on sait néanmoins qu’il prend la forme d’une gorge avec en son centre une cascade de nuit, isolée du reste, par laquelle les âmes de démons remontent jusqu’à leurs royaumes respectifs sans avoir à interagir avec les habitants des profondeurs. A la base de cette cascade inversée, on trouve le Maelstrom. Véritable mer d’obscurité chaotique, il s’agit d’un mélange d’âmes de démons en cours de formation, de résidus de démons n’ayant jamais réussi à se reconstituer et de potentiels presques infinis laissés là en attente d’une âme avec un ego assez fort pour les saisir sans se perdre. Satan serait tapie dans ses profondeurs.`,
      },
    ],
  },
  {
    id: "satan-rois",
    accent: "crimson",
    title: "Satan Et Les Rois Démons",
    content: [
      {
        type: "paragraph",
        text: `Être transcendant au même niveau que Dieu, elle est la mère des démons primordiaux et celle qui a fait s’épanouir l’Enfer à partir des différents aspects de la magie présente dans la part du Vide qu’elle a arraché à ses régents d’origine. Léviathan, en tant que dernière membre des rois démons primordiaux et enfants de Satan, est la seule qui peut encore témoigner de cette époque.`,
      },
      {
        type: "paragraph",
        text: `C’est également elle qui a fourni 8 péchés aux rois démons, de véritables morceaux de son âme comparables aux commandements des archanges. Ses fragments accordent des pouvoirs exceptionnels aux rois et font office de couronne, assurant à leur détenteur l’autorité sur leur royaume.`,
      },
      {
        type: "paragraph",
        text: `Les rois démons, pendant démoniaque des archanges de Dieu, sont les monarques qui dirigent les différents royaumes infernaux. Bien qu’ils soient tous plus ou moins en compétition pour le titre de Roi ou Reine des Enfers, cela ne les empêche pas de travailler ensemble régulièrement au gré d’alliances plus ou moins éphémères. A de très rares occasions de leur histoire, ils ont pu se réunir au cours de légendaires Conseils de Minuit. Chaque roi démon, à l'exception notable de Behemoth, possède un péché capital de Satan en guise de couronne. Contrairement au titre d’archange, le titre de roi démon n’est pas définitif, un roi pouvant très bien être destitué de son titre pour être remplacé par un nouveau prétendant au trône.`,
      },
    ],
  },
  {
    id: "royaume-lucifer",
    accent: "gold",
    title: "Le Royaume De Lucifer",
    content: [
      {
        type: "entry",
        title: "Lucifer",
        text: `L’Etoile du Matin, le Porteur de Lumière, le Seigneur de l’Aube, Lucifer a eu de nombreux titres et de nombreux noms et il a toujours su se glorifier de chacun d’entre eux. Jadis connu comme l’archange de l’illumination, il est désormais révéré en tant que monarque des démons de lumières et en tant que prince de l'orgueil.

Prenant la forme d’un torse humanoïde constitué d’or et de diamant, le bas de son corps, son dos et son visage sont chacuns recouverts respectivement par une paire d’ailes d’or et de lumière. Lucifer met un point d’honneur à garder l’apparence la plus angélique possible.

Son règne est une assez mauvaise représentation de l’Enfer étant donné qu’il est majoritairement composé d’anges déchus, d’avatars primordiaux et d’autres entités anciennes qui se sont affiliées à l’Enfer en ayant des origines différentes. Même son domaine démoniaque, New Heaven, est une reproduction corrompue du Paradis. Cet état de fait s’explique en réalité par une vérité très simple : Lucifer méprise les démons.

Comme chaque monarque infernal, Lucifer est pourtant adoré par de nombreux cultistes malgré son mépris des être humains. Il accepte de leur accorder une part de ses pouvoirs s’ils font preuve d’une dévotion suffisamment grande. Il fait d’ailleurs partie d’une alliance relativement stable avec Belzebuth et Belial.

Son royaume démoniaque, New Heaven, est majoritairement composé de son ancien domaine archangélique, tellement lié à son être qu’il a sombré avec lui en Enfer lors de sa trahison et de son palais, l’Astre Véritable. Aujourd’hui prenant la forme d’une vaste cité bâtie à l’aide de métaux précieux et de pierres rares, les bâtiments démesurés laissent une impression de vide et de malaise.

Les attributs rituels de Lucifer sont l’or et le diamant ; le blanc ou tout autre symbole de lumière et de pureté et bien sûr la lumière elle même. Son artefact, le Prisme de l’Aube, lui permet de rendre réelles ses illusions. Son commandement de la foi lui donne le pouvoir d’altérer la façon de penser des autres pour qu’elle correspondent à ses préceptes. Son péché de l'orgueil lui accorde la capacité exceptionnelle d’ébrécher de façon permanente les capacités que n’importe quel adversaire voudrait utiliser contre lui.`,
      },
      {
        type: "entry",
        title: "Ezekiel",
        text: `Le Seigneur de la Corruption est souvent considéré comme le bras droit de Lucifer. Ancien Séraphin de l'Éloquence, il a suivi son archange jusqu’en Enfer aussi bien par loyauté que par conviction personnelle y voyant là une meilleure utilisation de ses talents particuliers.

Prenant l’apparence d’une parodie d’ange, son corps nacré est majoritairement composé d’un métal argenté et d’ivoire. Poussant le vice jusqu’à afficher des ailes d'albâtre, il dégage une forte impression de noblesse.

Son rôle est principalement de relayer l'autorité de son roi à ses esprits primordiaux. Ayant la capacité de charger sa voix de puissance, il peut à la fois s’en servir pour contrôler l’âme des personnes sensibles à son influence et pour altérer la réalité dans une certaine mesure à son avantage. Il est donc également responsable de la propagande du royaume et de l’enrôlement des fidèles.

Démon manipulateur et cruel, il prend un plaisir pervers à faire sombrer les hommes dans le désespoir le plus complet en leur susurrant des désirs qu’ils n’auraient pas eu en temps normal.`,
      },
      {
        type: "entry",
        title: "Haagenti",
        text: `Connue comme étant le Seigneur du Reflet, Haagenti est aussi reconnue par la plupart comme la compagne et donc la reine de Lucifer.

La véritable apparence d’Haagenti est inconnue, en tant que démone du reflet elle peut adapter cette dernière à volontée pour celui qui la regarde. Elle possède cependant une apparence principale qui correspond le plus possible aux désirs de Lucifer : une apparence angélique arborant 3 paires d’ailes et une palette de couleurs blanches et dorées.

La reine du miroir est une démone très ancienne qui avait déjà une position de pouvoir très importante avant l’arrivée de Lucifer en Enfer. En tant que seigneur du reflet, Haagenti est capable d’assumer n’importe quelle apparence et surtout de produire des reflets, autrement dit des copies déformées de la réalité. Elle possède également sa propre dimension de poche, le monde des miroirs, qui lui permet de se connecter à chaque reflet pour se déplacer, espionner et piéger ses victimes.`,
      },
      {
        type: "entry",
        title: "Amy",
        text: `Jadis connue en tant qu’Amiel le Séraphin Astral, elle est désormais vénérée en tant qu’Amy le Seigneur des Astres. On la surnomme aussi parfois la maîtresse des étoiles filantes en références aux anges déchus sous son autorité.

Prenant la forme d'une silhouette de nuit violacée dont les ailes forment une cape sombre, elle possède 3 paires de bras aux longs doigts recouverts de griffes de métal doré. La majorité de son apparence trahit son allégeance passée pour Raphaël.

Lucifer n’a pas eu besoin de la convaincre longtemps pour qu’elle se joigne à son armée au sein de l’Enfer lors de sa trahison. Elle suit en réalité davantage son roi par profit que par fanatisme. Elle assume la charge des anges déchus qui composent une part non négligeable des troupes de Lucifer.

En tant que seigneur des astres, elle peut invoquer ces derniers à une échelle réduite, avec le feu stellaire qui les accompagne. Cette capacité est notamment dû à son artefact : les Larmes de Nyx, le collier d’étoiles pendu en permanence à son cou.`,
      },
      {
        type: "entry",
        title: "Zagam",
        text: `Principalement révéré en tant que seigneur de la transmutation et maître des avatars, Zagam est un être ancien ayant une relation très particulière avec son roi, davantage proche d’un partenariat que d’une réelle soumission.

Grande silhouette humanoïde, il apparaît comme un être d’ombre et de lumière au multiples bras et constamment entouré d’une aura lumineuse qui semble irradier de son être et semer la vie partout où ses pas foulent le sol.

S’agissant d’un avatar primordial, il est né au sein du Vide avant même que Dieu et Satan émergent de l'Éther. Lui et ses semblables auraient même inspiré Dieu dans la création de ses Djinns Primordiaux. Bien que moins puissant que son roi, il n’a pas particulièrement peur de lui et lui accorde juste le respect qui lui est dû.

Il fédère la plupart des avatars primordiaux sous le joug du seigneur de l’aube afin de s’assurer une place de choix à sa cour et un statut assez élevé parmi les autres démons.`,
      },
      {
        type: "entry",
        title: "Léviathan",
        text: `La Dame des Eaux Profondes, la Mère de Toutes les Mers, la Dévoreuse, Léviathan a eu le temps d’accumuler les titres en étant la dernière des rois démons primordiaux encore en vie.

Prenant notamment la forme d’un serpent de mer titanesque, cette description n’approche que vaguement ce qu’est réellement l’entité. Davantage comparable à une masse d’eau et d’énergie métamorphe se mouvant afin de prendre une forme toujours plus meurtrière, elle peut également prendre une apparence presque humaine si elle le désire.

Léviathan est la princesse de la gourmandise et la reine des démons aquatiques. Aucun autre démon n’a jamais porté ce titre. Faisant partie des premiers nés de Satan, elle est la seule membre de sa fratrie à avoir survécu aux guerres intestines de l’Enfer et à avoir gardé son titre pendant tout ce temps.

Si les perdants sont habituellement privés de leurs pouvoirs, humiliés et torturés aux yeux de tous pour rendre évidente leur déchéance… dans le cas de la dame des eaux profondes, ces derniers ont simplement été dévorés.

Son grand instinct maternel se traduit également dans ses relations avec ses très nombreux cultistes. Il n’y a encore une fois rien de surprenant dans l’idée qu’elle soit le monarque infernal ayant le culte le plus étendu et comptant le plus grand nombre d’adeptes. Elle accorde également ses bénédictions avec facilité et n'hésite pas à accorder de nombreux pouvoirs très variés à ses fidèles.`,
      },
    ],
  },
  {
    id: "royaume-leviathan",
    accent: "azure",
    title: "Le Royaume De Léviathan",
    content: [
      {
        type: "entry",
        title: "Léviathan",
        text: `Son domaine démoniaque, l’Océan Infini, est à la fois le royaume le plus vaste et le plus profond de l’Enfer, et ce même en comptant qu’elle en a cédé une large portion à son frère Behemoth qu’elle aime d’un amour réciproque. Divisée en différentes strates en fonction de sa profondeur, elle laisse ses enfants aînés, ses seigneurs démons, administrer les différentes régions de son large domaine. Son palais, la Cathédrale du Silence, se trouve au-dessus de la strate la plus profonde du royaume, l’abysse, et vient marquer une frontière nette pour contenir ses démons les plus anciens et dangereux. Sa façon de torturer les âmes est tout aussi simple que l’on pourrait s’y attendre, elle les laisse simplement souffrir de la pression démentiel des profondeurs et de la noyade.

Probablement le monarque infernal le plus ouvert à l’humanité, Léviathan est une admiratrice des mortels, elle dit elle-même régulièrement qu’elle est impressionnée par leur capacité de résilience et d'adaptation malgré leur faiblesse. Cette état fait d’elle une membre des rois démons “modérés” en compagnie d’Azrael et de Lilith.

Souvent considérée comme la candidate la plus proche du titre de reine de l’Enfer, en compétition avec Lucifer, elle possède de nombreux atouts asseyant sa position de pouvoir. Son péché de la gourmandise lui permet de s’approprier des magies, de l’énergie ou du savoir en les dévorant. Plus encore, elle peut directement s'approprier les capacités et la puissance des êtres qu’elle dévore. C’est ce pouvoir qui fait de Léviathan la démone la plus versatile de l’Enfer.

Ses symboles rituels sont l’eau, le bleu sombre et le lapis lazuli. Elle est connue pour avoir créé plusieurs artefacts, la plus connue d’entre eux restant la Pierre des Profondeurs. Cet artefact donne à son utilisateur le pouvoir de faire subir directement la pression des abysses à ses victimes en restant à la surface.`,
      },
      {
        type: "entry",
        title: "Calypso",
        text: `Benjamine de Léviathan parmi ses seigneurs, elle est souvent priée en tant que seigneur des ruisseaux ou dame des cours d’eau calme.

Elle se présente la plupart du temps aux mortels comme une femme d’une beauté à couper le souffle. Son corps est majoritairement composé d’eau et comporte des marques évidentes de sa nature aquatique.

Être doux et passif, elle est principalement connue comme le seigneur des océanides et des sirènes. Elle est également chargée des démons des marais et autres créatures alternant régulièrement entre les eaux peu profondes et les zones humides. Son rôle est de relayer l’influence de Léviathan bien au-delà des mers et des océans.

Elle passe une grande partie de son temps sur le plan matériel pour flâner et passer de nouveaux pactes en son nom ou au nom de sa mère. Elle mène en réalité à la perfection la mission que sa mère lui a confiée : la gestion de son image et la diplomatie. Son domaine s’étend de la surface proche des côtes jusqu’à l’intérieur des terres du royaume de Behemoth. On appelle cette zone marécageuse et veinée de rivières La Dentelle.`,
      },
      {
        type: "entry",
        title: "Charybde",
        text: `Le tristement célèbre seigneur des naufrages qui a inspiré de nombreux mythes et dont les démons ont terrifié les marins pendant des siècles.

Principalement visible en tant que tourbillon d’eau armé de dents acérés, Charybde est un monstre marin terrifiant qui est le maître incontesté de la surface et des eaux peu profondes en haute mer.

Seigneur mystérieux, il est principalement connu pour son appétit vorace qu’il a sans aucun doute hérité de sa mère. Il a pour tâche de maintenir sous contrôle les démons les plus violents du règne de Léviathan. Ainsi la plupart des monstres marins connus des mortels sont sous sa responsabilité.

Il préfère laisser le contact des mortels à ses sœurs. De rares fidèles le vénèrent tout de même à l’aide de rituels sanglants et de sacrifices afin d’obtenir un fragment de son aptitude à absorber l’univers environnant. Son domaine, l’Horizon Vorace, se situe à la surface du royaume de Léviathan et prend la forme d’une mer déchaînée.`,
      },
      {
        type: "entry",
        title: "Bassara",
        text: `Le seigneur des damnées est considéré comme la fille aînée de Léviathan et son bras droit.

Mère des sirènes, elle aborde elle-même l’apparence d’une sirène abyssale couverte de parures fluorescentes mimant notamment une couronne d’ossements.

Très populaire auprès des mortels et possédant un vaste culte autour de sa personne, ce statut s’explique facilement par le fait qu’elle soit l’un des très rares démons à être en mesure d’accorder le don de nécromancie à ses cultistes. Elle garde à ses côtés comme sa garde rapprochée les âmes de ses nécromants les plus fidèles comme son corps armé personnel.

Son domaine, la Mer de Cadavres, s'étend entre ceux de ses frères Fornéus et Charybde et compose les alentours de la Cathédrale du Silence. Nécromancienne de grand talent, elle est à l’origine de la plupart des créatures mortes-vivantes aquatiques comme les noyées et elle a également de nombreux démons nécrophages sous ses ordres.`,
      },
      {
        type: "entry",
        title: "Fornéus",
        text: `Fornéus est le fils aîné de Léviathan. Si Bassara incarne davantage la facette humaine et magicienne de leur mère, le seigneur de l’abysse incarne quant à lui à la perfection l’aspect de la bête ancienne.

Monstruosité tentaculaire, le corps véritable de Fornéus est en permanence plongé dans les ténèbres abyssales rendant sa silhouette difficile à délimiter. Il joue volontiers de cette imprécision pour donner l'impression que l’intégralité de l’abysse est une partie intégrante de son corps.

Son domaine, l’Abysse, désigne les ténèbres présentent sous le palais de sa mère, la Cathédrale du Silence. Cet endroit cauchemardesque découlerait directement sur les Profondeurs.

Fornéus n’a absolument aucun intérêt pour les mortels. Être lovecraftien, il est presque plus proche des standards du royaume d'Asmodeus. Il possède un grand pouvoir sur l’esprit et peut créer artificiellement de la peur, une impression de noyade ou une sensation de pression titanesque.`,
      },
    ],
  },
  {
    id: "royaume-asmodeus",
    accent: "violet",
    title: "Le Royaume D’Asmodeus",
    content: [
      {
        type: "entry",
        title: "Asmodeus",
        text: `Le Tyran Noir, le Seigneur des Cauchemars, le Père des Malédictions et tout autre titre pompeux qu’on peut lui donner n’intéresse en aucun cas Asmodeus. Le roi des ténèbres n’a besoin d’aucun surnom pour être craint par l’intégralité des démons de l’Enfer à la simple mention de son nom.

Élémentaire de ténèbres polymorphe aux proportions dantesques, il donne l’impression de faire face à une tempête de sable noir et rouge contenue dans un mince champ de force changeant de forme et de taille avec une facilité déconcertante. Il passe néanmoins la majorité de son temps sous l’apparence d’un dragon noir.

La place et l’influence du roi des ténèbres au sein de l’assemblée des rois démons est très dépendante de la période de l’année. Son pouvoir fluctue grandement en fonction de la durée de la nuit par rapport à celle du jour.

Son domaine infernal, Le Cœur du Cauchemar, est un royaume très particulier dans la mesure où il se compose presque de deux royaumes interconnectés : la Surface et l’Ombre. Au sud du domaine, au cœur d’un marécage d’ombre, se trouve le Hurlement d’Obsidienne, le palais d’Asmodeus.

Ses symboles rituels sont la couleur noire, l’obscurité, l’obsidienne et tout objet maudit d’un enchantement suffisamment complexe. En tant que roi des ténèbres, Asmodeus possède un contrôle absolu sur ces dernières qui se manifeste notamment par le biais de puissantes malédictions. Il est de très loin le démon le plus productif en matière de création d’artefact maudits. Les plus connus de ces artefacts sont les Liens de Nyx.

Son péché de la paresse lui accorde la bénédiction de voir son pouvoir augmenter en fonction de la durée de la nuit du plan matériel. La nuit du solstice d’hiver à minuit, son pouvoir dépasse très largement ses limites standard. En contrepartie, il devient le roi démon le plus faible de l’Enfer au zénith du solstice d’été.`,
      },
      {
        type: "entry",
        title: "Alastor",
        text: `Le terrible seigneur de la souffrance, l'exécuteur de Satan et le bourreau des Enfers. Démon très ancien et respecté, son simple nom suffit à imposer le silence.

Seigneur d'albâtre à l’allure noble, Alastor prend l’apparence d’un homme albinos gravé de runes sombres. Sa tête est ornée d’une paire de cornes ensanglantées et d’une collection de cristaux d’obsidienne comme d’une couronne.

L’aura du seigneur est si forte qu’elle seule suffit à servir d'outil de persuasion exceptionnel au service d’Asmodeus. Son titre d’exécuteur de Satan lui vient de l’époque où la dame des ombres elle-même arpentait l’Enfer.

Aussi doué pour la torture physique que psychologiques, il ne manque jamais d’idée sur le sujet et se voit lui-même comme un esthète. Il garde les âmes de ses victimes dans un étât de torture perpétuelle sans espoir de délivrance.`,
      },
      {
        type: "entry",
        title: "Hécate",
        text: `Jouissant d’un cercle de servants très étendu, elle est parfois vénérée comme la déesse aux 3 visages, la mère des vampires, la reine des sorcières, la dame de la pleine lune ou encore en Enfer le seigneur du sang.

Démone à la beauté fatale, elle est connue pour changer régulièrement de forme en fonction de la facette d'elle-même que l’on invoque. On note quelques constantes : elle prend toujours une apparence féminine ; elle arbore régulièrement le rouge, le noir et le blanc.

Avec ses nombreuses facettes et ses très nombreux cultes il s’agit probablement du seigneur démon ayant le plus grand nombre de fidèles exclusivement dédiés à elle. Hécate est connue pour glorifier le sang, presque autant qu’Uriel, et le considérer comme un nectar divin dont elle se délecte dans ses Catacombes Pourpres.

Sa large popularité et son contact facile avec les mortels fait d’elle le “visage” du royaume d’Asmodeus lors de ses interactions avec le plan matériel.`,
      },
      {
        type: "entry",
        title: "Lycas",
        text: `Le seigneur de la métamorphose, le père des lycans et même le dieu de la chasse dans certaines régions reculées.

Figure titanesque à l’allure vaguement humanoïde, son apparence est constamment secouée de mutations faisant apparaître et disparaître des attributs lupins.

Bien qu’il soit principalement connu comme étant le père des lycans et autre loup-garou, il est aussi chargé des entités métamorphes comme les changelins ou les doppelgangers. Son statut de dieu de la chasse lui vient de sa passion concernant ce passe temps l’amenant à régulièrement lancer de grandes traques de damnés dans son domaine, La Plaine des Crocs d’Ombre.

Seigneur le plus guerrier d’Asmodeus, c’est à lui qu’il incombe de mener ses armées au combat quand c’est nécessaire.`,
      },
      {
        type: "entry",
        title: "Umbakrail",
        text: `Le bonhomme sept heures, le croque mitaine, ou autre surnom ne font que recouvrir la même créature qui se tapit dans les ombres et se nourrit de cauchemars : Umbakrail, le seigneur de la peur.

Bien que son apparence varie systématiquement légèrement pour incorporer des éléments correspondants aux peurs de chaque personne le contemplant, certains éléments ne changent pas. Il apparaît comme un être squelettique au visage composé d’un crane de bouc d’un noir d’obsidienne.

Umbakrail est le plus jeune seigneur démon d’Asmodeus et même de l’intégralité de l’Enfer. Son ambition démesurée l’a fait passer d’ancien mortel à spectre puis à seigneur démon.

Les dons d’Umbakrail sont chers mais ils peuvent donner à quiconque le pouvoir d’exploiter la peur vibrant au sein de n'importe quelle âme, aussi courageuse soit elle. C’est sa clairvoyance qui lui donne toute sa valeur aux yeux d’Asmodeus.`,
      },
    ],
  },
  {
    id: "royaume-belzebuth",
    accent: "crimson",
    title: "Le Royaume De Belzébuth",
    content: [
      {
        type: "entry",
        title: "Belzébuth",
        text: `La Princesse des Rampants, la Corruption Grouillante, la Dame des Fléaux et ses autres titres ne sont que des euphémismes de la destruction que Belzébuth apporterait à l’humanité si l’univers lui en laissait l’occasion.

Prenant la forme d’une idôle divine corrompue et chitineuse, on peut deviner une véritable beauté dans ses courbes attirantes et son visage aux traits impériaux.

Belzébuth est une reine cruelle qui prend un plaisir pervers à torturer les âmes des mortels afin d’en retirer l’essence la plus pure possible. Son sens de la planification renommé parmi l’ensemble des immortels en fait assez naturellement une grande amatrice de complots en tout genre.

Reine des démons mortifères, elle préside aux maladies, aux morts vivants et aux insectoïdes depuis son royaume pestiféré : La Fosse des Rampants. Son royaume, le plus densément peuplé de l’Enfer, n’est qu’une vaste fosse pourrissante menant inévitablement vers son cœur, Le Nid.

Ses symboles rituels sont la couleur jaune, la pourriture et le poison. Belzébuth est la maîtresse incontestée des toxines. Son péché d’envie lui donne la capacité de copier temporairement le péché d’un autre monarque de l’Enfer ou le commandement d’un archange.`,
      },
      {
        type: "entry",
        title: "Astaroth",
        text: `Démon ancien ayant eu l’occasion d’acquérir de nombreux titres, il est le plus souvent connu sous le surnom de Porte-Peste ou de Seigneur Putride.

Silhouette sombre aux allures de médecin de la peste médiévale, son visage est un crâne d’oiseau légèrement jauni aux orbites infectées d’une lumière malsaine.

Le père des maladies est un démon restant le plus clair de son temps au cœur de son domaine, le Jardin Pourrissant, à récolter les fruits malsains qu’il y fait pousser. Jouissant de pouvoirs terrifiants et d’une influence particulièrement grande auprès du reste des démons, il est presque malgré lui le bras droit de Belzébuth.

Contrairement à ce que l’on pourrait croire, Astaroth est un être ouvertement pacifiste qui respecte l’idée selon laquelle toute forme de vie mérite d’être chérie. Seulement sa logique s’applique également aux bactéries et aux nuisibles.`,
      },
      {
        type: "entry",
        title: "Arachnée",
        text: `Seigneur ancestral, elle est régulièrement adorée en tant que Mère Araignées ou Grande Empoisonneuse mais en Enfer on la révère en tant que Seigneur des Drames.

Au premier coup d’oeil, Arachnée peut apparaitre comme une femme magnifique entrain de jouer un air mélancolique à l’aide d’une harpe gigantesque juchée sur une colline. Mais plus l’on accorde d’attention aux détails, plus l’horreur de la scène se révèle.

Démone au caractère passif, elle était la compagne d’Aklys, le roi en titre avant qu’il ne soit destitué par Belzébuth. Préférant rester loin des conflits et des intrigues, elle suit la volonté du plus fort par désir de tranquillité.

Mère de l’ensemble des démons arachnides, elle peut compter sur la loyauté indéfectible de ses enfants qui lui ramènent constamment de nouvelles âmes qui finiront piégées au cœur de sa toile macabre, La Maison des Fils.`,
      },
      {
        type: "entry",
        title: "Eurynome",
        text: `Autoproclamé Maître de la Mort, le Seigneur des Carcasses n’a que peu d’intérêt envers le reste du royaume, préférant se faire adorer comme une divinité.

Gigantesque golem nécromantique, son corps de titan est maintenu par une armure d’ossements participant à lui donner une stature imposante.

Seigneur aux tendances mégalomanes, il est réputé pour être particulièrement attiré par l’adoration. Avec Bassara, il est le seul seigneur démon possédant une maîtrise suffisante de la nécromancie afin de transmettre ce pouvoir aux mortels.

Resté pendant longtemps un seigneur indépendant, il a choisi de rejoindre la Fosse des Rampants afin de ne plus être inquiété par les autres rois démons.`,
      },
      {
        type: "entry",
        title: "Nybbas",
        text: `Sous-estimer le Seigneur de l’Essaim serait une erreur regrettable qui se soldera dans la majorité des cas par une mort lente et extrêmement douloureuse.

Gigantesque centipède aux dimensions dantesques, le haut de son corps semble davantage imiter celui d’un crabe titanesque. Véritable monstruosité de pattes et de crocs acérés, Nybbas est digne de se tenir à la tête de l’Essaim, l’armée de démons insectoïdes de Belzébuth.

Grand rival de Belzébuth à l’époque de sa montée au pouvoir, il était le seul à avoir à la fois la volonté de devenir le nouveau roi et assez de pouvoir pour y parvenir. Incapable de tenir le rythme bien longtemps, il a été obligé de s’incliner de mauvaise grâce.

Son domaine, la Forêt des Cocons, sert de lieu de naissance et de réincarnations pour l’écrasante majorité des démons composant le règne de Belzébuth.`,
      },
    ],
  },
  {
    id: "royaume-lilith",
    accent: "emerald",
    title: "Le Royaume De Lilith",
    content: [
      {
        type: "entry",
        title: "Lilith",
        text: `La Marchande de Destin, La Reine des Croisements, La Sainte Rouge et tout autre nom ne sont que des parures venant souligner la majesté de Lilith, la reine des désirs.

Icône féminine, son corps semble s’adapter aux préférences de celui ou celle qui la regarde afin d’être continuellement la personne la plus désirable possible. Chacune de ses bandes de cuir est en réalité gravée de nombreux pactes passés par Lilith avec le reste de l’univers connu.

Reine des démons pactisants et dévoreurs d’émotions, elle est célèbre pour être une épicurienne notoire et pour imposer son style de vie décadent au reste de son royaume. Elle est la seule membre de l’assemblée des monarques infernaux à avoir réussi l’exploit de se hisser à cette position prestigieuse en tant qu’ancienne âme damnée.

Son royaume, le Monde Peint, est une forêt irréelle dont la nature est ouvertement trompeuse. Partout dans le royaume, on peut voir des damnés en liesse en train d'expérimenter un plaisir indicible sous toutes ses formes. Pour que la magie de Sitiel opère et qu’une âme puisse être assimilable, son égo doit d’abord être brisé ; une jouissance excessive et la vacuité d’une éternité sans contrainte sont un moyen tout aussi efficace.

Lilith fait partie des rois démons les plus favorables à l’humanité avec Léviathan et Azraël. Considérant les mortels comme des partenaires commerciaux, elle prend un plaisir assumé à les observer et à les voir essayer de tirer leur épingle du jeu.

Ses symboles rituels sont la couleur argentée, le spinel, n’importe quel contrat signé par au moins deux parties et un acte de désir passionné. Ayant hérité du péché de Luxure, plus un être reste à proximité de Lilith et plus sa motivation à satisfaire les envies de cette dernière sera forte.`,
      },
      {
        type: "entry",
        title: "Adramalech",
        text: `Démone très respectée dans tous les royaumes de l’Enfer, elle est connue en tant que Seigneur de l’Art.

Amas de fragments de vitraux multicolores volant en masse, Adramalech change constamment de forme en fonction de ses préférences du moment. Sa forme de prédilection reste cependant un gigantesque paon cristallin.

Elle est la première démone de haut rang à avoir décidé de suivre Lilith lors des Dix Jours de Sang. Elle est depuis considérée comme la Voix de Lilith, titre honorifique impliquant que chaque ordre qu’elle prononce est un relai de l’autorité de sa reine.

Assez populaire auprès des mortels, elle est connue pour avoir inspiré de nombreux artistes en herbes, dont elle est la patronne, ayant prié pour recevoir sa bénédiction. Certains mages lui voue également un culte afin d’avoir accès à sa magie artistique qui permet de matérialiser le produit même de son imagination.`,
      },
      {
        type: "entry",
        title: "Iblis",
        text: `Jadis Djinn des Failles, l’une des premières créations de Dieu, il a depuis sa trahison envers les siens prit le titre de Seigneur des Voeux.

Géant de plusieurs mètres ayant deux paires de bras puissants et une peau d’obsidienne dont semble couler une aura sombre, il est constamment couvert de parures nobles et de bijoux d’or pur.

Membre des douzes Djinns Primordiaux, il trahit les siens avant de chercher refuge au sein de la cour de Lilith. Deuxième plus grand conseiller de la reine avec Adramalech, il est en charge de la plupart des transactions ayant lieu au sein du royaume depuis son domaine, Le Grand Marché.

Père des Djinns Mineurs, il a à coeur d’accorder à ses fidèles ce qu’ils désirent et possède de nombreuses capacitées à offrir comme celle de créer des pactes et surtout d’identifier les failles présentent en chaque sortilège ou adversaire et de les amplifier à volonté.`,
      },
      {
        type: "entry",
        title: "Cerwiden",
        text: `Bien que ce titre puisse être contesté par Hécate, Cerwiden est le Seigneur de la Sorcellerie. Patronne des sorcières celtes et des sorcières empathes, elle veille sur ses ouailles avec dévotion.

Idôle à la chevelure de feu et au corps sylvestre, le corps de la Dame des Humeurs semble composé de magie à l’état pur.

Ancienne mortelle, elle était une sorcière zélée de son vivant sous le patronage de Sélène. Ayant rejoint Le Bosquet après sa mort, elle a rapidement déploré la façon dont les âmes de sorcières étaient traitées par son ancienne maîtresse. Après de nombreuses manipulations et un marché passé avec Lilith, elle réussit à devenir à son tour le seigneur tutélaire des sorcières.

Seigneur très proche de ses fidèles, Cerwiden est une maîtresse généreuse qui accorde sa bénédiction à un grand nombre de sorcières plus ou moins avancées dans leur apprentissage de l’arcane.`,
      },
      {
        type: "entry",
        title: "Astarée",
        text: `La Dame des Plaisirs est une démone influente qui se plaît à être adorée sous divers noms au sein de différentes cultures mais en Enfer elle porte le sobriquet de Seigneur du Désir.

Succube à l’allure faussement angélique, sa peau est faite d’un satin carmin ensorcelant au toucher. Des ailes semblent jaillir de certaines coutures décousues, mimant la forme d’un ange.

Maîtresse incontestée de la Vallée du Jeu, elle trône au cœur de cet ensemble organique de maisons closes et de casinos s'étendant à perte de vue. Véritable quartier des plaisirs à une échelle absurde, tous les désirs approuvés par Lilith peuvent y être satisfaits.

Capable de manipuler le hasard à son avantage et d’augmenter les désirs des autres, elle est très populaire auprès des mortels dont elle apprécie fortement l’adoration.`,
      },
      {
        type: "entry",
        title: "Pandore",
        text: `Démone ancienne se faisant la parte parole des démons refusant de suivre la voix de Lilith au sein de son propre royaume, elle est vénérée en tant que Seigneur de la Tentation.

Le corps véritable de Pandore est un enchevêtrement presque infini de racines, de ronces et de lianes s’étendant à perte de vue. Néanmoins les vapeurs qu’elle répand amènent quiconque les respirant à voir à la place l’objet de ses désirs.

Pandore n’a jamais réussi à réellement accepter la régence de Lilith. Incapable de l’accepter elle se rebella contre la reine. A la surprise générale, Lilith lui offrit une alternative satisfaisante : elle et les démons n’acceptant pas le nouveau régime avaient le droit de conserver leurs moeurs tant qu’ils restaient en bordure du royaume et assuraient un devoir de garde-frontières.

Elle gère désormais une vaste cour de démons rebelles la vénérant au sein de son domaine, le Jardin des Tentations.`,
      },
    ],
  },
  {
    id: "royaume-belial",
    accent: "crimson",
    title: "Le Royaume De Bélial",
    content: [
      {
        type: "entry",
        title: "Bélial",
        text: `Le Pourfendeur de Mondes, le Guerrier Ardent, le Prince de la Fournaise ou encore le Traître, autant de sobriquets dont s’affuble Bélial depuis son accession au trône de braise.

Véritable tempête de feu et de lave en fusion, Bélial est un colosse ardent qui sème la destruction sur son passage sans même avoir besoin d’y penser consciemment.

Belzébuth réussit à corrompre Bélial et à organiser son coup d'État pour lui permettre de devenir le nouveau roi des démons de flammes. Il reste l’un de ses alliés les plus puissants.

Son péché de destruction lui octroie la capacité de maintenir en l'état tout ce qu’il a détruit. Il donne à Bélial le pouvoir de rendre des blessures permanente tant qu’il n’a pas décidé du contraire, de rendre impossible la résurrection de mortels, d’anges ou de démons qu’il aurait tué de sa main et même de garder certains objets détruits.`,
      },
      {
        type: "entry",
        title: "Abaddon",
        text: `Jadis connue comme l’ange de l’apocalypse, elle est désormais crainte et adorée en tant que seigneur de la destruction.

Figure sinistre, elle inspire malgré tout une certaine majesté. Prenant la forme d’une femme gigantesque au visage couvert d’un linceuil, ce qu’on voit de sa peau semble être soit brûlé soit parcouru d’un feu intérieur.

Dans le passé, elle était l'exécutrice de la volonté de Sariel. Profondément impressionnée par Baal, elle choisit de quitter le Paradis afin de rentrer à son service. Elle est probablement le seigneur démon s’étant sentie la plus lésée par la trahison de Bélial.

Depuis son domaine à la frontière ouest, le Champ de la Fin du Monde, elle dirige d’une main de fer la Horde, les agents de la destruction et du chaos qui peuvent être déchaînés par Bélial.`,
      },
      {
        type: "entry",
        title: "Halphas",
        text: `Grand général de l’Enfer Ardent, Halphas a de tous temps armé les mortels dans leurs luttes fratricides. Ce rôle singulier l’a naturellement amené à prendre son rôle de seigneur de la guerre.

Colosse ardent au corps d’acier styxien et de braises incandescentes, sa stature fait de lui l’un des guerriers les plus impressionnants de l’Enfer.

Véritable seigneur de guerre antique, Halphas est un guerrier et un meneur d’hommes. Ce statut fait de lui le bras droit de Bélial ainsi que son principal conseiller dans la guerre perpétuelle qu’il entreprend depuis son accession au trône.

Il est secrètement très populaire chez les militaires et chez les différents dépositaires de la défense, se plaçant comme un concurrent à l’archange Michael.`,
      },
      {
        type: "entry",
        title: "Girra",
        text: `La dame qui sommeille dans les cendres est une entité ancienne qui a su se forger une solide réputation par delà le cosmos. Elle est adorée en tant que Seigneur des Flammes.

Girra est connue comme étant la mère des dragons et de ce fait elle peut librement passer de la forme d’un dragon de magma gigantesque à un avatar aux proportions plus humaines.

Démone très ancienne, elle serait la fille de Prométhée, le premier roi du royaume. Son engeance démoniaque, les dragons, forment les démons les plus puissants du royaume sans aucun débat possible.

Elle préside à sa horde depuis un tertre de magma au cœur d’une zone de volcans en activité au sud de la Citadelle de Cuivre, la Plaine des Griffes Pourpres.`,
      },
      {
        type: "entry",
        title: "Asial",
        text: `Le très jeune seigneur de l’erreur, protégé de Bélial et ne quittant jamais bien longtemps son ombre.

Être androgyne, son corps à l’allure frèle semble fait de cendres et de fumées, créant un contraste frappant de noir et de blanc.

Étant il y a encore peu de temps un simple démon majeur, son cauchemar aurait commencé suite à l'ascension de Bélial. Ce dernier cherchant à remplacer le vide qu’avait laissé sa promotion par un seigneur lui étant totalement dévoué, il aurait plongé plusieurs démons au Maelstrom. Asial eu la malchance d’être différent et absorba malgré lui les capacités de ses camarades.

L’être qui résultat de cette expérience fut donc un seigneur artificiel, le regard fuyant et semblant plongé dans une détresse permanente. Ayant développé la capacité exceptionnelle et unique d’altérer les capacités des autres et de manipuler le succès de chaque action, son roi le garde jalousement près de lui.`,
      },
    ],
  },
  {
    id: "royaume-azrael",
    accent: "azure",
    title: "Le Royaume D’Azrael",
    content: [
      {
        type: "imageText",
        imageModule: HISTORY_GARUDA,
        title: "Garuda",
        text: `Démone violente adorée encore aujourd’hui comme une divinité païenne dans de nombreuses régions du monde, Garuda détient le titre de seigneur des tempêtes et Vent de l’Ouest. Grande femme au port altier, son corps tient au moins autant de l’aigle que de l’être humain. Elle vit au sommet du Pic Décharné et mène les vents de l’ouest, les esprits de la tempête et les sylphides sous l’autorité d’Azrael. Ayant un goût prononcé pour l’adoration, elle répond volontiers aux prières accompagnées d’un sacrifice ayant une véritable valeur pour celui qui l’offre.`,
        caption: "Garuda, Vent de l’Ouest.",
      },
      {
        type: "imageText",
        imageModule: HISTORY_BOREE,
        title: "Borée",
        text: `Seigneur démon primordial existant depuis l’aube de l’Enfer, Borée est vénéré en tant que Seigneur Glacial. Ses apparitions se font si rares et sont si mortelles que même son apparence reste sujette à interprétation, bien qu’on lui prête une forme de cerf humanoïde au corps émacié et gelé. Installé dans la Galerie des Glaces du Pic Blanc, il scrute le reste de l’univers et différentes époques au travers d’une infinité de miroirs de glace. Azrael respecte son désir d’isolement et fait appel à lui pour ses dons de divination.`,
        caption: "Borée, Vent du Nord.",
      },
      {
        type: "entry",
        title: "Azrael",
        text: `Le Dieu des Ouragans, le Juge, la Rage Céleste sont pour la plupart des titres qu’Azrael avait d’ors et déjà mérité ou acquis en tant qu’archange de la justice, ils ne les a cependant pas démérité en devenant le roi démon de l’air et des esprits.

Gigantesque serpent ailé, son corps est fait de nuages d’orages et de vents violents et contraires. Jadis le très respecté archange de la justice, il était une représentation même de celle-ci et un allié naturel des plus faibles et des plus démunis.

Le Pogrome du Petit Peuple provoqua sa chute. Amère et empli de haine et de dégoût pour ses frères et sœurs, il décida de suivre à son tour le chemin qu’avait emprunté Lucifer et partit en Enfer avec ses anges fidèles. Il ne lui fallu qu’un effort dérisoire pour prendre la place de Belphégor.

Souverain exigeant mais juste, il fait respecter l’ordre au sein de son royaume infernal, La Vallée Boréale. Le pic central abrite le palais du roi, Le Tribunal des Quatres Vents, véritable tribunal qui accueille régulièrement des procès jugés par le maître des lieux en personne.

Le roi de l’air ne cache pas une certaine affection envers les mortels. Ses symboles rituels sont le vent, l’acier, la couleur grise et la vérité. Ayant conservé son commandement de la vérité, toute personne présente à proximité du roi de l’air se voit obligée de dire la vérité. En tant que roi démon de l’air, Azrael est aussi entré en possession du péché de la colère.`,
      },
      {
        type: "entry",
        title: "Azazel",
        text: `Bras droit d’Azrael et Vent du sud, Azazel est considéré comme le seigneur protecteur des elfes et est également adoré en tant que seigneur du désert et comme prince des soies chatoyantes.

Prenant l’apparence d’un haut elfe à la peau d’ivoire, il est facilement reconnaissable à ses cheveux d’un rouge éclatant et à ses gigantesques ailes de papillon multicolore.

Jadis vénéré en tant que séraphin de l’innocence, Azazel était le protecteur du petit peuple. A la suite du Pogrom des Petits Peuples, sa douleur fût au moins aussi grande que celle de l’archange de la justice mais il sut calmer Azrael avant de prendre avec lui le chemin de l’Enfer.

Capable de faire croître la vie ou au contraire de la réduire à l’état de poussière, il est le maître des démons arides des vents du sud et des dévoreurs d’eau qui assèchent des régions entières. Il réside au sommet du Pic Érodé.`,
      },
      {
        type: "entry",
        title: "Gaziel",
        text: `Si Azazel est le bras droit d’Azrael, Gaziel est sans peine son bras gauche. Parfois adoré en tant que maître des fantômes, il est principalement désigné sous le titre de seigneur de la brume et Vent de l’Est.

Prenant l’apparence d’un géant au corps spectral, son corps est couvert de voiles de brume blanche et bleutée emplie de bruine. Un nuage de plus le suit partout en toute circonstance, le laissant en permanence sous une pluie d’automne.

Gaziel réside au sommet du Pic Orageux, à l’est de la vallée, et y donne ses ordres depuis son Tombeau de Larmes où il a pour habitude de communier avec ses légions de fantômes. Il se reconnaît dans leurs remords, dans leur mélancolie sans laisser ces derniers obscurcir son jugement.

Gaziel est probablement le seul ancien ange de haut rang à regretter le Paradis. Ayant suivi Azrael par loyauté et dans le but d’apaiser sa rage, il n’a jamais réellement pu supporter d’avoir dû quitter sa dimension d’origine. Il continue cependant son ancien rôle en participant au processus de jugement de son roi comme une parodie de son ancienne vie.

Capable de comprendre en un instant les failles profondes de toutes les personnes qu’il rencontre, il a le pouvoir d’appuyer sur ces faiblesses au point de rendre quiconque parfaitement impotent tant le poids des regrets se fera lourd.`,
      },
    ],
  },
  {
    id: "royaume-sitiel",
    accent: "violet",
    title: "Le Royaume De Sitiel",
    content: [
      {
        type: "entry",
        title: "Sitiel",
        text: `Le Tailleur de Cristal, le Voleur d’Âme ou encore le Collectionneur sont autant de noms qui permettent d’éviter de parler directement de Sitiel, le roi du chaos et prince démon de l’avarice.

Véritable titan de cristal sombre et de bismuth aux reflets iridescent, il ne reste plus beaucoup de traces de l’ancienne ascendance angélique de Sitiel. Doté d’une multitude de bras, ceux-ci semblent constamment affairés sur diverses tâches.

S’il est aujourd’hui le rouage le plus important de l’Enfer dans sa marche vers la domination de tout ce qui existe, il n’était jadis qu’un séraphin des Cieux. La corruption d’âme, forme de magie inédite mise au point par Sitiel, lui permet de transformer une âme mortelle en énergie pure, assimilable sans risques.

L’assemblée des rois démons décida de lui céder le domaine de chaos de Mammon et de signer un pacte de non-agression autour de lui. Désormais roi démon, le tailleur de cristal fait don de son sortilège de corruption d’âmes à ses nouveaux frères et sœurs en échange d’un pourcentage de la puissance récoltée.

Le Royaume Démentiel, le territoire de Sitiel, est un lieu mystérieux dont il est impossible de réaliser une carte. Il réside dans son Palais, les Archives de Cristal, une gigantesque tour de cristal sombre qui tords les règles de l’espace temps.

Les symboles rituels de Sitiel sont le bismuth, le cristal, la connaissance et la couleur lavande. Le roi du chaos est un véritable dieu de la magie, maîtrisant toutes ses formes les plus élaborées. Il est à l’origine de la plupart des sortilèges de scellements aujourd’hui utilisés par l’humanité, des pierres d’âmes et de nombreux artefacts comme la fameuse Pierre d’Ascendance.

Le péché d’avarice de Sitiel lui donne le pouvoir de créer des dimensions de poche à volonté lui permettant de garder en stase n’importe quel objet ou essence à l’abri du temps.`,
      },
      {
        type: "entry",
        title: "Nebo",
        text: `Le grand artificier est un démon presque aussi mystérieux que son roi. Il est le plus souvent révéré en tant que seigneur méchanique ou seigneur des sciences.

Son corps serait un plasma bleu électrique pouvant se déplacer dans l’espace sans avoir à adopter une forme fixe. Il possède une vaste collection de pantins composés de toutes les matières possibles et imaginables qu’il peut posséder à volonté.

Il est l’assistant personnel de Sitiel, dont il partage amplement le goût pour la recherche et l’expérimentation. Il ne quitte le laboratoire de son roi que pour rejoindre le sien, l’Usine Irréelle, un atelier virtuellement infini où s’affairent constamment des automates nées de sa main.

Le seigneur mécanique est fasciné par l’humanité. Il suit avec intérêt tous les progrès technologiques de l’humanité, n’hésitant pas à inspirer les chercheurs prometteurs de ses nouvelles trouvailles.`,
      },
      {
        type: "entry",
        title: "Pan",
        text: `Pan a eu bien des noms et bien des titres parmi les nombreuses cultures ayant fait le choix plus que discutable de le vénérer. Lui porter un culte en tant que seigneur de la folie fait le plus souvent consensus.

Le seigneur des déments est célèbre pour son visage de bouc aux yeux brûlant d’un pouvoir corrompu. Le corps de Pan est perceptible comme une ombre mouvante desquels peuvent émerger des membres au gré des envies de son propriétaire.

Seigneur démon primordial, certaines légendes narrent une époque où il aurait été suffisamment puissant pour se déclarer indépendant et roi de son propre domaine. D’autres soutiennent qu’il a au contraire de tout temps été l’incarnation de la démence.

Bien qu’il soit terriblement puissant, sa folie et son instabilité le rendent incapable d’assurer les devoirs classiques qu’un seigneur démon se doit d’honorer. En conséquence ce sont ses trois filles, les Manias, qui occupent en réalité son poste au quotidien.`,
      },
      {
        type: "entry",
        title: "Aritane",
        text: `Aritane est adorée en tant que seigneur du temps par sa cour, mais le reste de l’univers se réfère davantage à elle en tant que seigneur du passé.

Pourvue d’un visage de pie aux multiples yeux, ses trois paires de bras semblent fouiller en permanence l’espace en cherchant à se saisir d’un fil de causalité lisible.

La voleuse de temps est capable de voir les fils de causalité correspondants à tous les possibles futurs et parfois capable de les interpréter. Le fait qu’un seigneur démon soit capable d’un tel exploit force un certain respect.

Le seigneur du passé passe le plus clair de son temps dans la Plaine des Lendemains Incertains, un îlot flottant au gré de flux spatio-temporel semblant à la lisière de la réalité.`,
      },
      {
        type: "entry",
        title: "Dantalion",
        text: `Bien qu’il n’apporte aucun intérêt à la vénération que l’on peut lui porter, son comportement et ses motivations on finit par accorder naturellement à Dantalion le surnom de seigneur chaotique.

Titan de sable rouge, son corps est fait de roche et de métal écarlate décoré de divers motifs d’yeux rougeoyants.

Dantalion est une anomalie parmi les seigneurs démons dans la mesure où il est un être intégralement artificiel. Il est une création de Sitiel et de Nebo, née de leur envie de donner naissance à une copie du Djinn primordial du chaos, Seth.

Être violent et retors, il n’en reste pas moins très intelligent et capable de prouesses magiques impossibles aux autres démons. Son goût pour le chaos sous sa forme la plus primaire fait de lui le leader rêvé pour diriger les démons immatériels et l’infinité de monstruosité qui naissent jour après jours des expériences du roi.`,
      },
    ],
  },
  {
    id: "royaume-behemoth",
    accent: "emerald",
    title: "Le Royaume De Behemoth",
    content: [
      {
        type: "entry",
        title: "Behemoth",
        text: `Le Prince, l'Élu, le Haut Seigneur du Rivage et encore bien d’autres ne sont que des noms de mépris, mais bien plus souvent d’adoration, qui ont été donnés à Behemoth, le roi démon de la terre.

Titan terrestre au corps couvert de végétation, il nourrit de nombreuses ressemblances avec l’archange Ramiel. Une pierre précieuse gigantesque luit sur son torse imposant et semble générer en continue des fleuves qui parcourent son corps.

Behemoth est le petit frère bien aimé de Léviathan. Le territoire semi-indépendant de Behemoth, le Récif, a commencé à voir le jour comme une anomalie parmi les standards infernaux. Il voulut proposer une alternative aux démons qui n’étaient pas convaincus par les autres monarques infernaux.

Avec l’aide de seigneurs indépendants, il fit du Récif non seulement un véritable domaine infernal à part entière, mais aussi le seul à être entièrement dédié au bien être des démons qui le peuple. Cette irrégularité créa un précédent dangereux pour la stabilité des Enfers et attira l’hostilité des autres rois.

Bien que sa priorité reste le bien être de son peuple, il n’est pas hostile à l’humanité et fait même partie des rois démons les plus ouverts à l’idée d’aider les mortels. Au sein de son palais taillé à même la roche de bord de mer, le Fort de Sel, il mène régulièrement de longues séances de doléances.

Les symboles rituels du prince sont la terre, le sel, la couleur brune et la magie végétale. Capable de générer des tremblements de terre ou des ondes sismiques gargantuesques, il est également connu pour être le géomancien le plus puissant de la création. Parmi ses artefacts, la Couronne de Roche est l’un des plus célèbres.`,
      },
      {
        type: "entry",
        title: "Amaymon",
        text: `Parfois surnommé le Vieil homme sous la montagne ou l’Ermite, Amaymon est un démon très ancien qui a depuis longtemps pris l’habitude d’être servi en tant que Seigneur Souterrain.

Silhouette obscure, son corps est composé d’un mélange d’ossements grisâtres et de pierres sombres. Il est connu pour être à la tête de légions de démons des cavernes et de démons rocheux.

Rapidement séduit par la proposition de Behemoth, il voyait au début une simple opportunité de se mettre à l'abri de l’avidité grandissante des autres monarques infernaux. Il devint ensuite un conseiller de choix pour son roi.

Il veille sans faille depuis ses Archives Ensevelies d’où il centralise toutes les informations qui lui parviennent dans le but d’aider son roi au mieux de ses capacités.`,
      },
      {
        type: "entry",
        title: "Méphistophélès",
        text: `Assez célèbre malgré sa relative jeunesse, il a été craint et vénéré comme le patron des alchimistes ou le dieu de l’or. Il est désormais plus communément reconnu comme étant le seigneur du métal.

Prenant l’aspect d’un homme élégant en tenue riche taillée de soie et d’autres étoffes rares, son corps est caché derrière un masque et des gants dorés. Les différentes failles de cette tenue laissent apercevoir un alliage fluide et doré.

Les idées les plus sérieuses convergent toutes vers l’idée que Méphistophélès soit un ancien roi humain qui aurait artificiellement rallongé sa vie grâce à ses connaissances poussées en alchimie. Il trouva refuge dans la cour de Behemoth à qui il reste depuis réellement dévoué.

Capable de créer des merveilles dans une forge, il s'entend particulièrement bien avec les nains. Il est évidemment très populaire chez les mortels, accordant la longévité ou la richesse à qui le vénère suffisamment.`,
      },
      {
        type: "entry",
        title: "Florietty",
        text: `Il peut parfois être complexe de considérer Florietty comme un démon tant il incarne le rôle d’un dieu sylvestre. Il est donc logique qu’il soit aujourd’hui adoré en tant que seigneur de la nature.

Prenant l’apparence d’un gigantesque centaure végétal, il déborde de vie au point de faire naître la flore et la faune sous ses pas.

Le seigneur de la nature est en réalité un ami de longue date de Behemoth. Premier seigneur démon à le rejoindre, il a aidé le Prince à fonder le royaume du Récif et à recruter les différents seigneurs démons et les différents peuples des Enfers s’étant ralliés à sa cause.

Maître des démons de la flore, il possède une vaste cour et de très nombreux cultistes qui l'ont adoré en tant que divinité des récoltes au fil des siècles. Il mène aussi la tâche primordiale de maintenir des relations commerciales et diplomatiques avec les autres royaumes afin que le Récif soit vu comme un véritable royaume.`,
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
        imageModule: HISTORY_RACE_HUMAIN,
        title: "Humain",
        text: "Race majoritaire au sein de l'Ordre, l'humain represente la norme sociale et politique du monde. Cette position dominante lui donne de la marge, mais nourrit aussi un rapport souvent mefiant ou intolerant envers les heritages juges impurs ou trop proches du surnaturel.",
        caption: "Humain.",
      },
      {
        type: "imageText",
        imageModule: HISTORY_RACE_DEMI_ANGE,
        title: "Demi-ange",
        text: "Un demi-ange est un ange dechu incarne dans un corps humain comme peine supreme. Il conserve une nostalgie du Paradis, une melancolie constante et un lien profond avec l'autorite celeste, meme quand il tente de s'en affranchir.",
        caption: "Demi-ange.",
      },
      {
        type: "imageText",
        imageModule: HISTORY_RACE_DEMI_DEMON,
        title: "Demi-demon",
        text: "Heritier d'un lignage infernal, le demi-demon porte en lui une proximite concrete avec l'Enfer et ses puissances. Il peut assumer cet heritage, le subir ou le combattre, mais il reste toujours percu comme quelqu'un que l'on surveille de pres.",
        caption: "Demi-demon.",
      },
      {
        type: "imageText",
        imageModule: HISTORY_RACE_FORET,
        title: "Enfant de la foret",
        text: "Lie aux recits feeriques et aux mondes oniriques, l'enfant de la foret evoque un etre plus intuitif, plus ancien et plus sensible aux presences spirituelles. Sa force vient moins de la domination que de la perception, du lien au vivant et d'un sentiment de danger presque instinctif.",
        caption: "Enfant de la foret.",
      },
      {
        type: "imageText",
        imageModule: HISTORY_RACE_AME_ANCREE,
        title: "Ame ancree",
        text: "Une ame ancree est une ame damnee rattachee a un support materiel par necromancie. C'est une existence taboue, fragile et fascinante, a la frontiere entre survie, malediction et seconde chance, toujours marquee par l'idee d'un arrachement au cycle naturel.",
        caption: "Ame ancree.",
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
        text: "Les grandes familles de classe sont le Paladin, le Tireur, le Dresseur, le Lecteur de versets, le Guerisseur et le Receptacle. Chacune definit un role de groupe clair, puis se precise avec deux sous-classes.",
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
        imageModule: HISTORY_RACE_DEMI_ANGE,
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
