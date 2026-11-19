// Facts for the homepage. Source: veon/client.json (fact ids in comments). Nothing here is invented.

export const clinic = {
  name: "Vidnova Clinic", // company.name
  city: "Львів",
  address: "вул. Івана-Теодозія Куровця, 10", // B-F011
  addressShort: "вул. Куровця, 10",
  hoursShort: "пн–сб 9:00–19:00", // B-F011, B-F013
  hoursLong: "Понеділок — субота: 9:00–19:00",
  dayOff: "Неділя — вихідний", // B-F013
  license: "АД № 063827", // B-F003
  email: "vidnova33@gmail.com", // B-F014
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Vidnova Clinic, вул. Івана-Теодозія Куровця, 10, Львів"),
} as const;

/** Booking channels in one fixed order everywhere: phone → Viber → Telegram (ux/demo-home.md §10.5). */
export const channels = {
  phone: { href: "tel:+380962140333", label: "+38 096 214 03 33" }, // B-F012, C-001
  viber: { href: "viber://chat?number=%2B380682140333", label: "068 214 03 33" }, // C-001
  telegram: { href: "https://t.me/vidnova_clinic_bot", label: "@vidnova_clinic_bot" }, // B-F017
} as const;

/** Confirmed profiles only (client.json → socials, status confirmed). */
export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/vidnova.ua", handle: "vidnova.ua" },
  { name: "YouTube", href: "https://www.youtube.com/c/Vidnova", handle: "Клініка Vidnova" },
] as const;

export type DirectionKey = "plastic" | "dental" | "laser" | "medcos" | "gyn" | "doctors";

/** Six directions (B-F004) with subgroups (B-F005); plastic surgery first (UX-R004). */
export const directions: { key: DirectionKey; title: string; groups: string[]; alt: string }[] = [
  { key: "plastic", title: "Пластична хірургія", groups: ["Пластика грудей", "Пластика обличчя", "Пластика тіла"], alt: "Пластичний хірург Світлана Работенко на курсі ендоскопічної хірургії обличчя у Стамбулі" },
  { key: "dental", title: "Сучасна стоматологія", groups: ["Лікування зубів", "Хірургія", "Естетика"], alt: "Стоматологія: лікарка Vidnova у стоматологічному кабінеті" },
  { key: "laser", title: "Лазерна косметологія", groups: ["Лазерне омолодження", "Лазерне лікування", "Видалення пігментації"], alt: "Лазерна косметологія: процедура в кабінеті Vidnova" },
  { key: "medcos", title: "Медична косметологія", groups: ["Доглядові процедури", "Апаратні процедури", "Ін’єкційні процедури"], alt: "Медична косметологія: консультація косметолога Vidnova" },
  { key: "gyn", title: "Гінекологія", groups: ["Гінекологічне лікування", "Естетична гінекологія"], alt: "Гінекологія" },
  { key: "doctors", title: "Прийом лікарів", groups: ["Консультації профільних спеціалістів"], alt: "Зона очікування клініки Vidnova у Львові" },
];

/** B-F025 */
export const oneDayFacts = [
  "Трансфер до клініки",
  "Комфортні палати",
  "Візуалізація результату на 3D Vectra",
  "Медичний туризм",
] as const;

/** B-F026, grouped by purpose (grouping to be agreed with the clinic). */
export const equipment = [
  { group: "Хірургія", items: ["3D Vectra", "ERBE VIO 300S", "MAQUET Hanaulux 3000"] },
  { group: "Стоматологія", items: ["мікроскоп Carl Zeiss Extaro 300", "КТ Axeos", "3Shape"] },
  { group: "Лазер і косметологія", items: ["Fotona SP Dynamis", "Lumenis LightSheer DESIRE", "Stellar M22"] },
] as const;

/** B-F007 — the clinic's own numbers, always shown with the caption «дані клініки». */
export const clinicNumbers = [
  { value: "4720", label: "виконаних операцій" },
  { value: "3624", label: "проепільованих ніжок" },
  { value: "8325", label: "гарних усмішок" },
  { value: "7125", label: "відновлених фігур" },
] as const;

/** B-F010 */
export const otherCities = ["Київ", "Дніпро", "Запоріжжя"] as const;

export const navItems = [
  { href: "#directions", label: "Напрями" },
  { href: "#one-day", label: "Операція за 1 день" },
  { href: "#doctors", label: "Лікарі" },
  { href: "#equipment", label: "Обладнання" },
  { href: "#trust", label: "Про клініку" },
  { href: "#contacts", label: "Контакти" },
] as const;

export const FUTURE_NOTE = "Розділ у розробці";
