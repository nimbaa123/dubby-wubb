export type Line = { id: string; character: string; text: string; startTime: number; endTime: number };
export type Pack = {
  slug: string; title: string; description: string; category: string; language: string;
  duration: number; difficulty: "Амархан" | "Дунд" | "Хэцүү"; videoUrl: string;
  emoji: string; color: string; isNew: boolean; characters: string[]; lines: Line[];
};
export const CATEGORIES = ["Бүгд", "Кино", "Анимэ", "Хүүхэлдэйн кино", "Монгол", "Meme", "Viral"];

// Demo media: open-licensed Blender films hosted by Google's sample bucket.
// Admins replace videoUrl + line timings with their own content later.
const B = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/";
const mk = (
  slug: string, title: string, description: string, category: string, emoji: string, color: string,
  file: string, offset: number, chars: [string, string], texts: string[], isNew = false,
  difficulty: Pack["difficulty"] = "Амархан",
): Pack => ({
  slug, title, description, category, emoji, color, isNew, difficulty,
  language: "Монгол", videoUrl: B + file, characters: chars,
  duration: texts.length * 3,
  lines: texts.map((text, i) => ({
    id: `${slug}-${i + 1}`, character: chars[i % 2], text,
    startTime: offset + i * 3, endTime: offset + i * 3 + 2.5,
  })),
});

export const PACKS: Pack[] = [
  mk("tsagaan-tsuvraa", "Цагаан туулай", "Хөөрхөн туулайн өглөө. Хоёр дүрийн хөгжилтэй яриа.", "Хүүхэлдэйн кино", "🐰", "#ffc93c",
    "BigBuckBunny.mp4", 20, ["Туулай", "Тэнэг тагтаа"],
    ["Өө, өнөөдөр ямар сайхан өглөө вэ!", "Чи яагаад үргэлж эрт босдог юм бэ?", "Учир нь өглөөний нар хамгийн сайхан!", "Тэгвэл надад бас нэг цаг өгөөч."], true),
  mk("gobiin-shid", "Говийн шидтэн", "Шидэт ертөнцөд төөрсөн хоёр найзын адал явдал.", "Кино", "🧙", "#19c3b1",
    "Sintel.mp4", 30, ["Шидтэн", "Аялагч"],
    ["Чи энд ирэх ёсгүй байсан.", "Гэхдээ би замаа төөрчихсөн юм.", "Тэгвэл миний хойноос ир.", "Баярлалаа, чи миний аврагч байна!", "Хэн ч мэдэхгүй байг, за юу?"], true, "Дунд"),
  mk("robot-tolgoi", "Робот толгой", "Ирээдүйн хотод робот, хүн хоёр маргалдана.", "Анимэ", "🤖", "#ff5a4e",
    "TearsOfSteel.mp4", 45, ["Робот", "Инженер"],
    ["Системийн алдаа илэрлээ!", "Чи зүгээр л цэнэглэх хэрэгтэй.", "Цэнэг гэж юу вэ?", "Ойлгомжтой, би чамд кофе авчирья."], false, "Дунд"),
  mk("meme-ded", "Мемний дэд шүүгч", "Интернетийн хамгийн инээдтэй мем хэлэлцүүлэг.", "Meme", "😹", "#ffc93c",
    "ElephantsDream.mp4", 60, ["Шүүгч", "Яллагч"],
    ["Шүүх хуралдаан эхэллээ!", "Ноён шүүгч, тэр миний талхыг идсэн!", "Талх гэж үү? Бодит нотолгоо байна уу?", "Тийм ээ, бяслагтай байсан!"], false, "Амархан"),
  mk("ulaan-baatar-viral", "Улаанбаатарын өглөө", "Замын түгжрэл дунд өрнөх viral хошин шог.", "Viral", "🚗", "#19c3b1",
    "BigBuckBunny.mp4", 120, ["Жолооч", "Зорчигч"],
    ["Дахиад л түгжрэл!", "Би 5 минутын дараа ажил дээр байх ёстой.", "Алхаад явсан бол хурдан байх байсан.", "Тийм ч дээ, гэхдээ бороо орж байна."], true),
  mk("nomad-quest", "Нүүдэлчний аялал", "Монгол нутгийн зэрэглээнд өрнөх аяллын түүх.", "Монгол", "🐎", "#ff5a4e",
    "Sintel.mp4", 100, ["Хөтөч", "Жуулчин"],
    ["Тавтай морилно уу, аялагч минь.", "Энд үнэхээр уудам байна шүү!", "Бид өдрийн эцэс хүртэл давхина.", "Морь маань бэлэн үү?", "Бэлэн, явцгаая!"], false, "Хэцүү"),
];
export const getPack = (slug: string) => PACKS.find((p) => p.slug === slug);
