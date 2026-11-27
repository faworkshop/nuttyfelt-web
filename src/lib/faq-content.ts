export const faqs = {
  "zh-Hant": [
    {
      q: "價錢多少？",
      a: "常規 HK$5,000。早鳥首 3 位 HK$4,250（需 IG 發文及文字評價）。海外運費與匯款手續費另計。",
    },
    {
      q: "光環多大？",
      a: "短毛約 13 cm；長毛約 15 cm。附畫架與護理蠟。",
    },
    {
      q: "要等多久？",
      a: "暫時約每月一件；製作約 3–4 星期。目標三日內回覆照片與檔期。",
    },
    {
      q: "有什麼不做？",
      a: "張口或特殊表情、頸圈／配件、加急單。",
    },
    {
      q: "點樣交收？",
      a: "香港：順豐到付，或南港島線站面交。海外：實報運費，關稅自付。",
    },
    {
      q: "可以改幾多？",
      a: "尾款後最多兩次小修改。結構比例、換貓、轉頭或改光環尺寸不屬於小修改。",
    },
  ],
  en: [
    {
      q: "How much?",
      a: "Regular HK$5,000. Early-bird HK$4,250 for the first 3 clients (IG post + written testimonial). Overseas shipping and remittance fees extra.",
    },
    {
      q: "Halo size?",
      a: "Short-hair about 13 cm; long-hair about 15 cm. Stand and protective wax included.",
    },
    {
      q: "How long?",
      a: "About one commission a month; roughly 3–4 weeks to make. We aim to reply within 3 days on photos and schedule.",
    },
    {
      q: "What is not offered?",
      a: "Open-mouth or special expressions, collars/accessories, rush orders.",
    },
    {
      q: "Delivery?",
      a: "Hong Kong: SF Express freight collect, or in-person at a South Island Line MTR station. Overseas: actual shipping; duties paid by the client.",
    },
    {
      q: "Revisions?",
      a: "Up to two minor revisions after the balance. Structure, switching cats, head direction, or halo size are not minor revisions.",
    },
  ],
} as const;

export type FaqLocale = keyof typeof faqs;
