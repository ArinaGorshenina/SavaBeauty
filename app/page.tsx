"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowRight, Check, ExternalLink, Flower2, Heart, MapPin, Menu, Phone, ShieldCheck, Sparkles, X } from "lucide-react";
import { serviceDetails } from "./services-data";
import "swiper/css";

const assetPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

const services = [
  { name: "Маникюр", text: "Аккуратное покрытие, уход и идеальные детали.", image: assetPath("/images/nails.png"), cls: "service-a" },
  { name: "Женский зал", text: "Стрижки, укладки и работа с образом.", image: assetPath("/images/hair.png"), cls: "service-b" },
  { name: "Брови и ресницы", text: "Естественная красота и выразительность взгляда.", image: assetPath("/images/brows.png"), cls: "service-c" },
  { name: "Педикюр", text: "Комфорт и ухоженность в каждой детали.", image: assetPath("/images/nails.png"), cls: "service-d" },
  { name: "Окрашивание волос", text: "Современные техники и индивидуальный оттенок.", image: assetPath("/images/hair.png"), cls: "service-e" },
  { name: "Уход за волосами", text: "Гладкость, мягкость и здоровый вид волос.", image: assetPath("/images/tools.png"), cls: "service-f" },
  { name: "Мужской зал", text: "Аккуратные формы и профессиональный уход.", image: assetPath("/images/interior.png"), cls: "service-g" },
  { name: "Макияж", text: "Образ для события, съёмки или особенного вечера.", image: assetPath("/images/hero.png"), cls: "service-h" },
  { name: "Детский зал", text: "Комфортные услуги для маленьких гостей.", image: assetPath("/images/interior.png"), cls: "service-i" },
  { name: "Солярий", text: "Ровный оттенок кожи круглый год.", image: assetPath("/images/cta.png"), cls: "service-j" },
];

const reviews = [
  { name: "Наталия", text: "Отличный салон на протяжении многих лет. Всегда внимательное отношение и качественная работа." },
  { name: "Амаль", text: "Мастер внимательно выслушала пожелания, всё подробно объяснила и аккуратно выполнила работу." },
  { name: "Эльвира", text: "Не первый раз прихожу в этот салон. Мастера профессиональные, а сервис всегда на высоком уровне." },
];

const formSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Укажите имя")
    .max(60, "Имя слишком длинное")
    .regex(/^[A-Za-zА-Яа-яЁё]+(?:[ '-][A-Za-zА-Яа-яЁё]+)*$/, "Используйте только кириллицу или латиницу"),
  phone: z.string().refine((value) => /^7\d{10}$/.test(value.replace(/\D/g, "")), "Укажите корректный телефон"),
  service: z.string().refine((value) => services.some((service) => service.name === value), "Выберите услугу из списка"),
  comment: z.string()
    .trim()
    .max(500, "Комментарий не должен превышать 500 символов")
    .regex(/^[A-Za-zА-Яа-яЁё0-9\s.,!():+\-—–'"«»№]*$/, "Удалите недопустимые символы"),
  consent: z.literal(true, { errorMap: () => ({ message: "Необходимо согласие" }) }),
});
type FormData = z.infer<typeof formSchema>;

const ease = [0.22, 1, 0.36, 1] as const;

function formatRussianPhone(value: string) {
  const rawDigits = value.replace(/\D/g, "");
  const digits = (rawDigits.startsWith("8") ? `7${rawDigits.slice(1)}` : rawDigits.startsWith("7") ? rawDigits : `7${rawDigits}`).slice(0, 11);
  const local = digits.slice(1);

  if (!local) return "+7";

  let formatted = `+7 (${local.slice(0, 3)}`;
  if (local.length >= 3) formatted += ")";
  if (local.length > 3) formatted += ` ${local.slice(3, 6)}`;
  if (local.length > 6) formatted += `-${local.slice(6, 8)}`;
  if (local.length > 8) formatted += `-${local.slice(8, 10)}`;
  return formatted;
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduce ? .15 : .8, delay, ease }}>{children}</motion.div>;
}

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (reduce) setValue(to);
      else {
        const started = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - started) / 1200, 1);
          setValue(to * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      observer.disconnect();
    }, { threshold: .6 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [to, reduce]);
  return <span ref={ref}>{value.toFixed(decimals)}{suffix}</span>;
}

function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(formSchema) });
  const phoneField = register("phone");
  const submit = async () => { await new Promise(r => setTimeout(r, 700)); setSent(true); reset(); };
  return <AnimatePresence>{open && <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Запись в салон" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <motion.div className="modal" initial={{ opacity: 0, scale: .96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98, y: 24 }} transition={{ ease }}>
      <button className="modal-close" onClick={onClose} aria-label="Закрыть"><X /></button>
      {sent ? <div className="success"><span><Check /></span><p className="eyebrow">ЗАЯВКА ОТПРАВЛЕНА</p><h2>Спасибо, мы скоро свяжемся</h2><p>Администратор уточнит услугу и подберёт удобное время.</p><button className="btn primary" onClick={onClose}>Хорошо</button></div> : <>
        <p className="eyebrow">ВАШ BEAUTY-РИТУАЛ</p><h2>Записаться в Sava Beauty</h2><p className="modal-intro">Оставьте контакты — администратор поможет выбрать мастера и время.</p>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <label>Имя<input {...register("name")} autoComplete="name" maxLength={60} placeholder="Как к вам обращаться?" />{errors.name && <small>{errors.name.message}</small>}</label>
          <label>Телефон<input {...phoneField} inputMode="tel" autoComplete="tel" maxLength={18} placeholder="+7 (___) ___-__-__" onChange={(event) => { event.target.value = formatRussianPhone(event.target.value); phoneField.onChange(event); }} />{errors.phone && <small>{errors.phone.message}</small>}</label>
          <label>Услуга<select {...register("service")} defaultValue=""><option value="" disabled>Выберите направление</option>{services.map(s => <option key={s.name}>{s.name}</option>)}</select>{errors.service && <small>{errors.service.message}</small>}</label>
          <label>Комментарий<textarea {...register("comment")} maxLength={500} placeholder="Пожелания к записи" rows={3} />{errors.comment && <small>{errors.comment.message}</small>}</label>
          <label className="consent"><input type="checkbox" {...register("consent")} /><span>Я согласен с политикой обработки персональных данных</span></label>{errors.consent && <small>{errors.consent.message}</small>}
          <button className="btn primary wide" disabled={isSubmitting}>{isSubmitting ? "Отправляем…" : "Записаться"}<ArrowRight /></button>
        </form>
      </>}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function ServicePanel({ service, onClose, onBook }: { service: typeof services[number] | null; onClose: () => void; onBook: () => void }) {
  const items = service ? serviceDetails[service.name] ?? [] : [];
  return <AnimatePresence>{service && <motion.div className="service-panel-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Услуги: ${service.name}`} onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <motion.aside className="service-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: .55, ease }}>
      <button className="panel-close" onClick={onClose} aria-label="Закрыть каталог"><X /></button>
      <div className="panel-hero"><Image src={service.image} alt={service.name} fill sizes="(max-width: 767px) 100vw, 620px" /><div /><p className="eyebrow light">КАТАЛОГ УСЛУГ</p><h2>{service.name}</h2><span>{items.length} {items.length === 1 ? "услуга" : items.length < 5 ? "услуги" : "услуг"}</span></div>
      <div className="subservice-list">{items.map((item, index) => <article className="subservice" key={`${item.name}-${index}`}>
        <span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.name}</h3><p>{item.description}</p></div><strong>{item.price}</strong><button onClick={onBook}>Записаться <ArrowRight /></button>
      </article>)}</div>
      <p className="price-note">Стоимость сложных окрашиваний и процедур может меняться в зависимости от длины и густоты волос. Точную цену мастер назовёт после консультации.</p>
    </motion.aside>
  </motion.div>}</AnimatePresence>;
}

export default function Home() {
  const [modal, setModal] = useState(false);
  const [menu, setMenu] = useState(false);
  const [activeService, setActiveService] = useState<typeof services[number] | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const openBooking = () => { setMenu(false); setActiveService(null); setModal(true); };
  const parallax = (event: React.MouseEvent<HTMLElement>) => {
    if (reduce || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroRef.current.style.setProperty("--px", `${((event.clientX - rect.left) / rect.width - .5) * 14}px`);
    heroRef.current.style.setProperty("--py", `${((event.clientY - rect.top) / rect.height - .5) * 10}px`);
  };
  const resetParallax = () => { heroRef.current?.style.setProperty("--px", "0px"); heroRef.current?.style.setProperty("--py", "0px"); };
  const trackButtonWave = (event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--wave-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--wave-y", `${event.clientY - rect.top}px`);
  };
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); onScroll(); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { document.body.style.overflow = modal || menu || activeService ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [modal, menu, activeService]);
  return <main>
    <header className={`header ${scrolled ? "compact" : ""}`}>
      <a href="#top" className="brand"><span>Sava Beauty</span><small>САЛОН КРАСОТЫ</small></a>
      <nav>{[["О нас", "about"], ["Услуги", "services"], ["Преимущества", "benefits"], ["Отзывы", "reviews"], ["Контакты", "contacts"]].map(([t, id]) => <a key={id} href={`#${id}`}>{t}</a>)}</nav>
      <button className="btn primary header-cta" onClick={openBooking}>Записаться <ArrowRight /></button>
      <button className="menu-btn" onClick={() => setMenu(true)} aria-label="Открыть меню"><Menu /></button>
    </header>
    <AnimatePresence>{menu && <motion.div className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button onClick={() => setMenu(false)} aria-label="Закрыть"><X /></button><div className="brand"><span>Sava Beauty</span><small>САЛОН КРАСОТЫ</small></div><nav>{[["О нас", "about"], ["Услуги", "services"], ["Преимущества", "benefits"], ["Отзывы", "reviews"], ["Контакты", "contacts"]].map(([t, id], i) => <motion.a key={id} href={`#${id}`} onClick={() => setMenu(false)} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}>{t}</motion.a>)}</nav><button className="btn primary" onClick={openBooking}>Записаться</button></motion.div>}</AnimatePresence>

    <section className="hero" id="top" ref={heroRef} onMouseMove={parallax} onMouseLeave={resetParallax}>
      <div className="hero-copy">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>САЛОН КРАСОТЫ В КАЗАНИ</motion.p>
        <h1><motion.span initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .8, ease }}>Нежная красота,</motion.span><motion.span initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35, duration: .8, ease }}>созданная с <em>заботой</em></motion.span><motion.span initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45, duration: .8, ease }}>о вас</motion.span></h1>
        <motion.p className="lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55 }}>Пространство, где профессиональный уход, внимание к деталям и атмосфера спокойствия помогают почувствовать себя особенно.</motion.p>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .65 }}><button className="btn primary cursor-wave" onPointerMove={trackButtonWave} onClick={openBooking}><span>Записаться онлайн</span><ArrowRight /></button><a href="#services" className="btn secondary">Смотреть услуги</a></motion.div>
      </div>
      <motion.div className="hero-media" initial={{ opacity: 0, scale: reduce ? 1 : 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease }}><Image src={assetPath("/images/hero.png")} alt="Beauty-портрет Sava Beauty" fill priority sizes="(max-width: 768px) 100vw, 52vw" /><div className="media-wash" /></motion.div>
      <motion.div className="rating-float" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9 }}><strong>5.0</strong><span>★★★★★</span><small>458+ отзывов</small></motion.div>
      <motion.div className="ritual-float" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}><Flower2 /><div><strong>Beauty-ритуал</strong><small>Время для себя начинается здесь</small></div></motion.div>
    </section>

    <section className="stats" aria-label="Sava Beauty в цифрах"><div><strong><Counter to={5} decimals={1} /></strong><span>рейтинг</span></div><div><strong><Counter to={458} suffix="+" /></strong><span>отзывов</span></div><div><strong><Counter to={10} /></strong><span>направлений услуг</span></div><div><strong>Казань</strong><span>ул. Адоратского, 1А</span></div></section>

    <section className="section about" id="about"><Reveal className="about-media"><Image src={assetPath("/images/interior.png")} alt="Интерьер салона Sava Beauty" fill sizes="(max-width: 768px) 100vw, 56vw" /><button aria-label="Посмотреть атмосферу"><span>▶</span></button></Reveal><Reveal className="about-copy" delay={.1}><p className="eyebrow">О SAVA BEAUTY</p><h2>Больше, чем<br />просто салон</h2><p>Sava Beauty — пространство современной красоты в Казани. Здесь можно сменить образ, привести в порядок волосы и ногти, подчеркнуть естественную красоту или просто посвятить время себе.</p><p>Мы стремимся сделать каждое посещение спокойным, комфортным и эстетичным — от первой консультации до финального результата.</p><div className="mantra"><span>Красота</span><span>Забота</span><span>Гармония</span></div></Reveal></section>

    <section className="section benefits" id="benefits"><div className="section-head"><Reveal><p className="eyebrow">НАШ ПОДХОД</p><h2>Почему выбирают<br />Sava Beauty</h2></Reveal><Reveal><p>В каждой детали — профессионализм, безопасность и бережное отношение к вашему времени.</p></Reveal></div><div className="benefit-grid">{[
      [Sparkles, "Профессиональные мастера", "Внимательно слушаем пожелания и подбираем решение под ваш образ."],
      [ShieldCheck, "Чистота и безопасность", "Аккуратная работа, обработка инструментов и забота о вашем комфорте."],
      [Flower2, "Всё в одном месте", "Волосы, ногти, брови, ресницы, макияж и солярий."],
      [Heart, "Атмосфера заботы", "Спокойное пространство, где можно переключиться от повседневных дел."],
    ].map(([Icon, title, text], i) => <Reveal key={String(title)} delay={i * .08} className={`benefit-card ${i === 3 ? "accent" : ""}`}><Icon /><span>0{i + 1}</span><h3>{String(title)}</h3><p>{String(text)}</p></Reveal>)}</div></section>

    <section className="section services" id="services"><Reveal className="center-head"><p className="eyebrow">КАТАЛОГ</p><h2>Всё для вашей красоты</h2><p>Выберите свой beauty-ритуал.</p></Reveal><div className="service-mosaic">{services.map((s, i) => <Reveal className={`service-card ${s.cls}`} key={s.name} delay={(i % 4) * .06}><article role="button" tabIndex={0} onClick={() => setActiveService(s)} onKeyDown={e => (e.key === "Enter" || e.key === " ") && setActiveService(s)} aria-label={`Открыть услуги: ${s.name}`}><Image src={s.image} alt={s.name} fill sizes="(max-width: 768px) 100vw, 40vw" /><div className="service-overlay" /><div className="service-info"><span>0{i + 1}</span><h3>{s.name}</h3><p>{s.text}</p><span className="service-arrow"><ArrowRight /></span></div></article></Reveal>)}</div></section>

    <section className="section popular"><div className="section-head"><Reveal><p className="eyebrow">ПОПУЛЯРНОЕ</p><h2>Ритуалы, к которым<br />хочется возвращаться</h2></Reveal><div className="slider-arrows">Листайте →</div></div><Swiper modules={[A11y, Autoplay]} spaceBetween={18} slidesPerView={1.12} breakpoints={{ 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 3.3 } }} autoplay={reduce ? false : { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}>{services.slice(0, 6).map(s => <SwiperSlide key={s.name}><article className="popular-card"><div><Image src={s.image} alt={s.name} fill sizes="360px" /></div><h3>{s.name}</h3><p>{s.text}</p><button className="text-link" onClick={openBooking}>Записаться <ArrowRight /></button></article></SwiperSlide>)}</Swiper></section>

    <section className="editorial"><Image src={assetPath("/images/hero.png")} alt="Красота как время для себя" fill sizes="100vw" /><div className="editorial-shade" /><Reveal><p className="eyebrow light">ВРЕМЯ ДЛЯ СЕБЯ</p><h2>Красота начинается<br />с момента, который<br />вы посвящаете себе.</h2><button className="btn light-btn" onClick={openBooking}>Записаться <ArrowRight /></button></Reveal></section>

    <section className="section reviews" id="reviews"><div className="review-score"><p className="eyebrow">ОТЗЫВЫ</p><strong>5.0</strong><div>★★★★★</div><span>458+ отзывов<br />на Яндекс Картах</span><a href="https://yandex.ru/maps/org/1773346140/reviews" target="_blank" rel="noreferrer">Все отзывы <ExternalLink /></a></div><div className="review-content"><Reveal><h2>Что говорят<br />наши гости</h2></Reveal><Swiper modules={[A11y, Autoplay]} slidesPerView={1} spaceBetween={16} autoplay={reduce ? false : { delay: 6500, pauseOnMouseEnter: true, disableOnInteraction: false }}>{reviews.map((r, i) => <SwiperSlide key={r.name}><article className="review-card"><div className="avatar">{r.name[0]}</div><span>★★★★★</span><blockquote>«{r.text}»</blockquote><strong>{r.name}</strong><small>гость Sava Beauty</small><a className="review-map-link" href="https://yandex.ru/maps/org/1773346140/reviews" target="_blank" rel="noreferrer">Читать на Яндекс Картах <ExternalLink /></a><i>“</i></article></SwiperSlide>)}</Swiper></div></section>

    <section className="section gallery"><Reveal className="center-head"><p className="eyebrow">ПРОСТРАНСТВО</p><h2>Атмосфера Sava Beauty</h2></Reveal><div className="gallery-grid">{[
      [assetPath("/images/interior.png"), "Интерьер салона"], [assetPath("/images/hair.png"), "Уход за волосами"], [assetPath("/images/tools.png"), "Детали заботы"], [assetPath("/images/nails.png"), "Маникюр"], [assetPath("/images/brows.png"), "Брови и ресницы"], [assetPath("/images/hero.png"), "Beauty-образ"]
    ].map(([src, alt], i) => <Reveal key={src + i} delay={(i % 3) * .07}><Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" /></Reveal>)}</div></section>

    <section className="cta"><Image src={assetPath("/images/cta.png")} alt="Время заботы о себе" fill sizes="100vw" /><div className="cta-shade" /><Reveal><p className="eyebrow light">SAVA BEAUTY</p><h2>Ваш момент заботы<br />о себе начинается здесь</h2><p>Выберите услугу и запишитесь в Sava Beauty в удобное время.</p><div><button className="btn light-btn" onClick={openBooking}>Записаться онлайн <ArrowRight /></button><a className="btn ghost-light" href="https://wa.me/78432033366" target="_blank" rel="noreferrer">Написать в WhatsApp</a></div></Reveal></section>

    <section className="section faq"><div className="faq-title"><Reveal><p className="eyebrow">ВАЖНО ЗНАТЬ</p><h2>Частые<br />вопросы</h2><p>Если вашего вопроса нет в списке — позвоните нам, и администратор поможет.</p></Reveal></div><Accordion.Root type="single" collapsible className="accordion">{[
      ["Как записаться?", "Оставьте заявку на сайте или свяжитесь с салоном по телефону или WhatsApp."],
      ["Можно ли подобрать услугу с мастером?", "Да. Перед процедурой мастер уточнит ваши пожелания и поможет подобрать подходящий вариант."],
      ["Где находится салон?", "Казань, ул. Адоратского, 1А."],
      ["Есть ли подарочные сертификаты?", "Да, в салоне доступны подарочные сертификаты. Уточнить номинал можно у администратора."],
    ].map(([q, a], i) => <Accordion.Item value={`item-${i}`} key={q}><Accordion.Header><Accordion.Trigger><span>{q}</span><span className="plus"><X /></span></Accordion.Trigger></Accordion.Header><Accordion.Content>{a}</Accordion.Content></Accordion.Item>)}</Accordion.Root></section>

    <section className="section contacts" id="contacts"><div className="contact-copy"><Reveal><p className="eyebrow">КОНТАКТЫ</p><h2>Будем рады<br />видеть вас</h2><div className="contact-row"><MapPin /><div><small>Адрес</small><p>Казань, ул. Адоратского, 1А</p></div></div><div className="contact-row"><Phone /><div><small>Телефон</small><a href="tel:+78432033366">+7 (843) 203-33-66</a></div></div><div className="contact-actions"><button className="btn primary" onClick={openBooking}>Записаться</button><a className="btn secondary" href="https://yandex.ru/maps/?text=Казань%2C%20Адоратского%201А" target="_blank" rel="noreferrer">Построить маршрут</a></div></Reveal></div><div className="map"><iframe className="map-frame" src="https://yandex.ru/map-widget/v1/?ll=49.146672%2C55.819694&z=17&pt=49.146672%2C55.819694%2Cpm2rdm" title="Sava Beauty на Яндекс Картах" loading="lazy" allowFullScreen /><a className="pin" href="https://yandex.ru/maps/org/1773346140/" target="_blank" rel="noreferrer" aria-label="Открыть Sava Beauty в Яндекс Картах"><MapPin /><strong>Sava Beauty</strong><span>Адоратского, 1А</span></a></div></section>

    <footer><div className="footer-brand"><div className="brand"><span>Sava Beauty</span><small>Красота в каждой детали.</small></div></div><div><strong>Навигация</strong><a href="#about">О нас</a><a href="#services">Услуги</a><a href="#reviews">Отзывы</a><a href="#contacts">Контакты</a></div><div><strong>Связаться</strong><a href="tel:+78432033366">+7 (843) 203-33-66</a><a href="https://wa.me/78432033366">WhatsApp</a><span>Казань, Адоратского, 1А</span></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Sava Beauty</span><a href="#">Политика конфиденциальности</a></div></footer>
    <BookingModal open={modal} onClose={() => setModal(false)} />
    <ServicePanel service={activeService} onClose={() => setActiveService(null)} onBook={openBooking} />
  </main>;
}
