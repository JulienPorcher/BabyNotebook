import { 
  Heart, 
  Baby, 
  Smile, 
  Footprints, 
  Utensils, 
  Home, 
  Milk, 
  Bed, 
  Car, 
  BookOpen, 
  Gamepad2,
  Hand, 
  Baby as BabyIcon, 
  Sun, 
  Snowflake,
  Waves
} from "lucide-react";

export interface Milestone {
  id: string;
  title: string;
  icon: typeof Heart;
  color: string;
}

export const milestones: Milestone[] = [
  {
    id: "retour-maison",
    title: "Retour à la maison",
    icon: Home,
    color: "bg-blue-600"
  },
  {
    id: "premier-sourire",
    title: "Premier sourire",
    icon: Smile,
    color: "bg-yellow-500"
  },
  {
    id: "premiere-tetee",
    title: "Première tétée",
    icon: Milk,
    color: "bg-pink-500"
  },
  {
    id: "premier-biberon",
    title: "Premier biberon",
    icon: Utensils,
    color: "bg-orange-500"
  },
  {
    id: "decouverte-lit",
    title: "Découverte de mon lit",
    icon: Bed,
    color: "bg-purple-500"
  },
  {
    id: "premier-bain",
    title: "Premier bain",
    icon: Baby,
    color: "bg-blue-500"
  },
  {
    id: "balade-poussette",
    title: "Je me balade en poussette",
    icon: Car,
    color: "bg-green-500"
  },
  {
    id: "premier-rire",
    title: "Premier rire",
    icon: Smile,
    color: "bg-yellow-400"
  },
  {
    id: "souleve-tete",
    title: "Je soulève ma tête",
    icon: BabyIcon,
    color: "bg-indigo-500"
  },
  {
    id: "trouve-mains",
    title: "J'ai trouvé mes mains",
    icon: Hand,
    color: "bg-red-500"
  },
  {
    id: "premier-calin",
    title: "Premier calin",
    icon: Heart,
    color: "bg-pink-600"
  },
  {
    id: "tour-voiture",
    title: "Un tour en voiture",
    icon: Car,
    color: "bg-gray-600"
  },
  {
    id: "me-retourne",
    title: "Je me retourne",
    icon: BabyIcon,
    color: "bg-teal-500"
  },
  {
    id: "m-assois",
    title: "Je m'assoie",
    icon: BabyIcon,
    color: "bg-cyan-500"
  },
  {
    id: "monte-escaliers",
    title: "Je monte les escaliers",
    icon: Footprints,
    color: "bg-amber-600"
  },
  {
    id: "livre-prefere",
    title: "Mon livre préféré",
    icon: BookOpen,
    color: "bg-emerald-500"
  },
  {
    id: "jouet-prefere",
    title: "Mon jouet préféré",
    icon: Gamepad2,
    color: "bg-violet-500"
  },
  {
    id: "dors-doudou",
    title: "Je dors avec doudou",
    icon: Bed,
    color: "bg-rose-500"
  },
  {
    id: "salut-main",
    title: "Je salut de la main",
    icon: Hand,
    color: "bg-lime-500"
  },
  {
    id: "quatre-pattes",
    title: "Première fois à 4 pattes",
    icon: BabyIcon,
    color: "bg-sky-500"
  },
  {
    id: "applaudis",
    title: "J'applaudis",
    icon: Hand,
    color: "bg-orange-400"
  },
  {
    id: "attrape-pieds",
    title: "J'attrape mes pieds",
    icon: Hand,
    color: "bg-fuchsia-500"
  },
  {
    id: "tiens-debout",
    title: "Je me tiens debout",
    icon: BabyIcon,
    color: "bg-green-600"
  },
  {
    id: "premiere-dent",
    title: "Première dent",
    icon: Smile,
    color: "bg-white text-gray-800 border-2 border-gray-300"
  },
  {
    id: "saute",
    title: "Je saute",
    icon: Footprints,
    color: "bg-yellow-600"
  },
  {
    id: "rencontre-mamie",
    title: "Je rencontre mamie",
    icon: Heart,
    color: "bg-red-600"
  },
  {
    id: "rencontre-papie",
    title: "Je rencontre papie",
    icon: Heart,
    color: "bg-red-500"
  },
  {
    id: "rencontre-tata",
    title: "Je rencontre tata",
    icon: Heart,
    color: "bg-pink-600"
  },
  {
    id: "rencontre-tonton",
    title: "Je rencontre tonton",
    icon: Heart,
    color: "bg-pink-500"
  },
  {
    id: "rencontre-frere",
    title: "Je rencontre mon frère",
    icon: Heart,
    color: "bg-blue-600"
  },
  {
    id: "rencontre-soeur",
    title: "Je rencontre ma soeur",
    icon: Heart,
    color: "bg-purple-600"
  },
  {
    id: "rencontre-famille",
    title: "Je rencontre la famille",
    icon: Heart,
    color: "bg-indigo-600"
  },
  {
    id: "protege-soleil",
    title: "Je me protège du soleil",
    icon: Sun,
    color: "bg-yellow-500"
  },
  {
    id: "premiere-neige",
    title: "Première fois dans la neige",
    icon: Snowflake,
    color: "bg-blue-200 text-blue-800"
  },
  {
    id: "decouvre-sable",
    title: "Je découvre le sable",
    icon: Waves,
    color: "bg-amber-400"
  }
];
