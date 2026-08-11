export type Movie = {
  slug: string;
  title: string;
  titleEn: string;
  year: number;
  rating: string;
  duration: string;
  type: "ภาพยนตร์" | "ซีรีส์";
  genre: string;
  description: string;
  tagline: string;
  accent: string;
  badge?: string;
  playerPageUrl?: string;
};

export const genres = ["ทั้งหมด", "แอ็กชัน", "ไซไฟ", "ดราม่า", "ทริลเลอร์", "แฟนตาซี"];

export const movies: Movie[] = [
  {
    slug: "aurora-protocol",
    title: "ภารกิจแสงเหนือ",
    titleEn: "Aurora Protocol",
    year: 2026,
    rating: "8.7",
    duration: "2ชม. 08น.",
    type: "ภาพยนตร์",
    genre: "ไซไฟ",
    tagline: "ความลับใต้แสงที่ไม่มีวันดับ",
    description: "ทีมนักบินอวกาศต้องเลือกว่าจะกลับบ้าน หรือเปิดเผยสัญญาณปริศนาที่อาจเปลี่ยนอนาคตของมนุษยชาติ",
    accent: "#ffd166, #f08c46, #4f2a16",
    badge: "มาแรง",
    playerPageUrl: "https://upload18.org//play//index//bobb-373",
  },
  {
    slug: "velvet-city",
    title: "เมืองใต้กำมะหยี่",
    titleEn: "Velvet City",
    year: 2025,
    rating: "8.3",
    duration: "1ชม. 52น.",
    type: "ภาพยนตร์",
    genre: "ทริลเลอร์",
    tagline: "ทุกความลับมีราคาที่ต้องจ่าย",
    description: "นักข่าวสาวกลับสู่เมืองเก่าหลังได้รับเทปเสียงปริศนา และพบว่าคดีหายตัวไปไม่เคยจบลงจริง ๆ",
    accent: "#f2c14e, #9b5de5, #25112e",
  },
  {
    slug: "atlas-of-us",
    title: "แผนที่ของเรา",
    titleEn: "Atlas of Us",
    year: 2025,
    rating: "8.9",
    duration: "10 ตอน",
    type: "ซีรีส์",
    genre: "ดราม่า",
    tagline: "บางคนเดินทางไกลเพื่อกลับมาที่เดิม",
    description: "เรื่องราวของคนแปลกหน้าสี่คนที่พบกันบนรถไฟสายสุดท้าย และค่อย ๆ เปลี่ยนแผนที่ชีวิตของกันและกัน",
    accent: "#ffe29a, #c58bff, #1d2342",
    badge: "ซีรีส์ใหม่",
  },
  {
    slug: "golden-hour",
    title: "ชั่วโมงสีทอง",
    titleEn: "Golden Hour",
    year: 2024,
    rating: "8.1",
    duration: "1ชม. 46น.",
    type: "ภาพยนตร์",
    genre: "แฟนตาซี",
    tagline: "เวลาหนึ่งชั่วโมงเปลี่ยนชีวิตได้ทั้งชีวิต",
    description: "ช่างภาพมือใหม่ค้นพบกล้องที่ถ่ายภาพอนาคตได้ แต่ทุกภาพที่เขาเลือกเก็บไว้จะแลกด้วยความทรงจำหนึ่งอย่าง",
    accent: "#f9dc5c, #e76f51, #211526",
  },
  {
    slug: "black-current",
    title: "กระแสมืด",
    titleEn: "Black Current",
    year: 2026,
    rating: "8.5",
    duration: "1ชม. 58น.",
    type: "ภาพยนตร์",
    genre: "แอ็กชัน",
    tagline: "เมืองทั้งเมืองกำลังถูกปิดไฟ",
    description: "อดีตวิศวกรระบบพลังงานต้องฝ่าคืนที่ยาวนานที่สุด เพื่อหยุดการโจมตีที่กำลังควบคุมโครงข่ายทั้งประเทศ",
    accent: "#ffd166, #ef476f, #171325",
    badge: "แนะนำ",
  },
  {
    slug: "paper-moons",
    title: "ดวงจันทร์กระดาษ",
    titleEn: "Paper Moons",
    year: 2023,
    rating: "7.9",
    duration: "8 ตอน",
    type: "ซีรีส์",
    genre: "ดราม่า",
    tagline: "ความทรงจำไม่เคยเดินทางคนเดียว",
    description: "สองพี่น้องกลับมาเปิดร้านหนังสือของครอบครัว และพบจดหมายที่ไม่เคยถูกส่งตลอดยี่สิบปีที่ผ่านมา",
    accent: "#f6bd60, #84a59d, #20233b",
  },
  {
    slug: "redline-zero",
    title: "เส้นแดงศูนย์",
    titleEn: "Redline Zero",
    year: 2025,
    rating: "8.0",
    duration: "2ชม. 01น.",
    type: "ภาพยนตร์",
    genre: "แอ็กชัน",
    tagline: "ไม่มีเบรกสำหรับคนที่ไม่มีทางกลับ",
    description: "นักแข่งใต้ดินได้รับภารกิจส่งข้อมูลลับข้ามเมืองก่อนระบบเฝ้าระวังจะปิดตัวลงในเวลาเที่ยงคืน",
    accent: "#fcbf49, #d62828, #1e1728",
  },
  {
    slug: "the-last-orbit",
    title: "วงโคจรสุดท้าย",
    titleEn: "The Last Orbit",
    year: 2022,
    rating: "8.6",
    duration: "1ชม. 54น.",
    type: "ภาพยนตร์",
    genre: "ไซไฟ",
    tagline: "ถ้ากลับไม่ได้ ก็ต้องสร้างบ้านบนฟ้า",
    description: "นักบินที่ติดอยู่ในวงโคจรตัดสินใจส่งยานกลับโลกด้วยตัวเอง แม้ทุกสัญญาณจะบอกว่าไม่มีใครรอเขาอยู่แล้ว",
    accent: "#ffd166, #457b9d, #121c2d",
  },
];

export function getMovie(slug: string) {
  return movies.find((movie) => movie.slug === slug);
}
