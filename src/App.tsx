/**
 * Nexora Growth — standalone marketing & sales growth website.
 *
 * Single-page app. Premium, conversion-focused landing for a website,
 * marketing & sales growth agency for ambitious businesses.
 *
 * Multilingual: Dutch (nl), English (en) and Arabic (ar, RTL).
 *
 * Stack: React 19 + Vite + Tailwind v4 + `motion`.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'motion/react';
import {
  Sparkles, Bot, Zap, Target, Globe, Filter, Workflow, MessageSquare, Code2,
  Search, LineChart, TrendingUp, Users, Clock, DollarSign, Heart, ArrowRight,
  Check, Star, Phone, Mail, ChevronDown, Rocket, Plus, ShieldCheck, Building2,
  Calendar, Cpu, Compass, PenTool, Settings2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Brand + palette                                                     */
/* ------------------------------------------------------------------ */
const BRAND = 'Nexora Growth';

const PALETTE = {
  blue: '#2563EB',
  blue2: '#3B82F6',
  cyan: '#06B6D4',
  violet: '#8B5CF6',
  sky: '#38BDF8',
};

const GRAD = `linear-gradient(135deg, ${PALETTE.blue} 0%, ${PALETTE.blue2} 35%, ${PALETTE.cyan} 70%, ${PALETTE.sky} 100%)`;
const GRAD_TEXT = `linear-gradient(120deg, ${PALETTE.sky} 0%, ${PALETTE.blue2} 40%, ${PALETTE.violet} 100%)`;

/* ------------------------------------------------------------------ */
/* i18n — language definitions + content                               */
/* ------------------------------------------------------------------ */
type Lang = 'nl' | 'en' | 'ar';

const LANGS: { code: Lang; short: string; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'nl', short: 'NL', label: 'Nederlands', dir: 'ltr' },
  { code: 'en', short: 'EN', label: 'English', dir: 'ltr' },
  { code: 'ar', short: 'ع', label: 'العربية', dir: 'rtl' },
];

interface Svc { title: string; desc: string }
interface Content {
  nav: string[]; // services, results, process, cases, pricing, faq
  bookCall: string;
  hero: { badge: string; h1: string; h1grad: string; sub: string; cta1: string; cta2: string; stats: string[] };
  services: { tag: string; t1: string; tg: string; sub: string; items: Svc[] };
  features: { tag: string; t1: string; tg: string; items: { title: string; sub: string }[] };
  process: { tag: string; t1: string; tg: string; step: string; items: { title: string; desc: string }[] };
  cases: { tag: string; t1: string; tg: string; items: { summary: string; labels: string[]; suffix: string[] }[] };
  testimonials: { tag: string; t1: string; tg: string; items: { role: string; quote: string }[] };
  pricing: { tag: string; t1: string; tg: string; sub: string; popular: string; items: { name: string; tagline: string; cta: string; features: string[] }[] };
  faq: { tag: string; t1: string; tg: string; items: { q: string; a: string }[] };
  contact: { tag: string; t1: string; tg: string; sub: string; benefits: string[]; fields: string[]; submit: string; privacy: string; okTitle: string; okBody: string };
  dashboard: { title: string; live: string; kpis: string[]; chart: string };
  footer: string; // rights line tagline
  tagline: string;
}

const CONTENT: Record<Lang, Content> = {
  /* ----------------------------- NEDERLANDS ----------------------------- */
  nl: {
    nav: ['Diensten', 'Resultaten', 'Werkwijze', 'Cases', 'Prijzen', 'FAQ'],
    bookCall: 'Plan een gesprek',
    hero: {
      badge: 'Website • Marketing • Sales groei',
      h1: 'Website-, marketing- en salesgroei voor',
      h1grad: 'ambitieuze bedrijven',
      sub: 'Wij bouwen converterende websites en de marketing- en salessystemen die leads genereren, processen automatiseren en je groei versnellen.',
      cta1: 'Plan strategiegesprek',
      cta2: 'Bekijk cases',
      stats: ['Systemen opgeleverd', 'Leads gegenereerd', 'Gem. kostenbesparing', 'Klantbeoordeling'],
    },
    services: {
      tag: 'Wat we doen', t1: 'Eén partner voor je hele', tg: 'groeimotor',
      sub: 'Van eerste contact tot gesloten deal — wij ontwerpen, bouwen en automatiseren de systemen die omzet laten groeien.',
      items: [
        { title: 'AI-automatisering', desc: 'Slimme AI-workflows die repetitief werk volledig overnemen, 24/7.' },
        { title: 'Leadgeneratie', desc: 'Voorspelbare pijplijnen die je CRM vullen met gekwalificeerde leads.' },
        { title: 'Websiteontwikkeling', desc: 'Snelle, converterende websites die bezoekers omzetten in omzet.' },
        { title: 'Salesfunnels', desc: 'Geoptimaliseerde funnels die leads opwarmen en conversie maximaliseren.' },
        { title: 'CRM-integraties', desc: 'Koppel je tools zodat data automatisch door je systemen stroomt.' },
        { title: 'Marketingautomatisering', desc: 'Getriggerde campagnes via e-mail, sms en ads die zichzelf draaien.' },
        { title: 'Chatbots & AI-agents', desc: 'Gespreksagents die 24/7 kwalificeren, ondersteunen en afspraken inplannen.' },
        { title: 'Maatwerksoftware', desc: 'Software en interne tools, gebouwd rond jouw exacte processen.' },
        { title: 'SEO & lokale SEO', desc: 'Technische en lokale SEO die je organische verkeer maand na maand laat groeien.' },
        { title: 'Performance-marketing', desc: 'Datagedreven advertenties met focus op ROAS en kosten per acquisitie.' },
      ],
    },
    features: {
      tag: 'Waarom klanten kiezen voor ons', t1: 'Resultaten die je kunt', tg: 'meten',
      items: [
        { title: 'Meer omzet', sub: 'Gemiddelde omzetgroei binnen 12 maanden.' },
        { title: 'Geautomatiseerde workflows', sub: 'Van het handmatige werk verdwijnt uit je operatie.' },
        { title: 'Meer gekwalificeerde leads', sub: 'Toename in salesklare leads per maand.' },
        { title: 'Snellere salescycli', sub: 'Kortere tijd van eerste contact tot deal.' },
        { title: 'Lagere operationele kosten', sub: 'Gemiddelde besparing op operationele overhead.' },
        { title: 'Betere klantervaring', sub: 'Gemiddelde klanttevredenheid na implementatie.' },
      ],
    },
    process: {
      tag: 'Hoe we werken', t1: 'Een bewezen pad van', tg: 'idee naar impact', step: 'Stap',
      items: [
        { title: 'Ontdekking', desc: 'We brengen je doelen, knelpunten en groeikansen in kaart.' },
        { title: 'Strategie', desc: 'Een helder, geprioriteerd plan gekoppeld aan omzet- en efficiëntiedoelen.' },
        { title: 'Ontwikkeling', desc: 'We bouwen je systemen, integraties en assets op productieniveau.' },
        { title: 'Automatisering', desc: 'Workflows, AI-agents en triggers aan elkaar gekoppeld zodat alles vanzelf draait.' },
        { title: 'Lancering', desc: 'Gecontroleerde uitrol met monitoring, training en documentatie.' },
        { title: 'Optimalisatie', desc: 'Continu testen en bijsturen om resultaten in de tijd te laten groeien.' },
      ],
    },
    cases: {
      tag: 'Bewijs, geen beloftes', t1: 'Echte systemen,', tg: 'echte groei',
      items: [
        { summary: 'Handmatige outreach vervangen door een AI-leadmotor en automatische CRM-routing.', labels: ['Omzetgroei', 'Leads / maand', 'Salescyclus'], suffix: ['%', '', '% sneller'] },
        { summary: 'Geautomatiseerde marketingflows en AI-supportagents door de hele funnel.', labels: ['ROAS', 'Supportkosten', 'Conversie'], suffix: ['x', '% lager', 'x'] },
        { summary: 'Intake, planning en opvolging geautomatiseerd met AVG-bewuste AI-agents.', labels: ['Boekingen', 'No-shows', 'Admin-uren'], suffix: ['%', '% lager', '+ bespaard'] },
      ],
    },
    testimonials: {
      tag: 'Geliefd bij ondernemers', t1: 'Vertrouwd door', tg: 'ambitieuze teams',
      items: [
        { role: 'COO, NorthPeak', quote: 'Ze hebben onze hele salesmotor herbouwd. Binnen een kwartaal verdrievoudigde onze pijplijn en stopte ons team met handmatig werk.' },
        { role: 'Oprichter, Lumen Retail', quote: 'De AI-agents handelen 60% van onze support af en onze ROAS was nog nooit zo hoog. Alsof we ineens een team van 10 hebben aangenomen.' },
        { role: 'Directeur, Meridian Health', quote: 'Intake en planning draaien nu vanzelf. Onze mensen richten zich op patiënten, niet op papierwerk. Onze beste investering van het jaar.' },
        { role: 'CEO, Vantage Labs', quote: 'Strategisch, snel en gericht op resultaat. Ze behandelen onze cijfers als die van henzelf. Ik raad ze elke ondernemer aan.' },
      ],
    },
    pricing: {
      tag: 'Prijzen', t1: 'Eenvoudige plannen,', tg: 'serieuze hefboom',
      sub: 'Geen langlopende contracten. Maandelijks opzegbaar. Schaal mee terwijl je groeit.', popular: 'Populairst',
      items: [
        { name: 'Starter', tagline: 'Voor teams die hun eerste automatiseringen testen.', cta: 'Aan de slag', features: ['1 automatiseringsworkflow', 'Leadcapture-funnel', 'CRM-installatie & integratie', 'E-mailautomatisering', 'Maandelijkse rapportage'] },
        { name: 'Growth', tagline: 'Voor bedrijven die snel willen opschalen.', cta: 'Aan de slag', features: ['Alles uit Starter', 'Tot 5 AI-workflows', 'AI-chat- & voice-agents', 'Multichannel marketingautomatisering', 'Beheer van performance-marketing', 'Tweewekelijkse optimalisatiesprints', 'Voorrangssupport'] },
        { name: 'Enterprise', tagline: 'Voor complexe organisaties met maatwerk.', cta: 'Neem contact op', features: ['Onbeperkt workflows', 'Maatwerksoftware & integraties', 'Eigen solutions architect', 'SLA & securityreview', 'Kwartaal-strategieplan'] },
      ],
    },
    faq: {
      tag: 'FAQ', t1: 'Vragen,', tg: 'beantwoord',
      items: [
        { q: 'Hoe snel zien we resultaat?', a: 'De meeste klanten hebben binnen 2–3 weken hun eerste automatiseringen live, met meetbare groei binnen de eerste 90 dagen.' },
        { q: 'Werken jullie met onze bestaande tools?', a: 'Ja. We integreren met je huidige CRM, marketing- en datastack — of adviseren een betere opzet als dat sneller resultaat geeft.' },
        { q: 'Is de AI veilig en compliant?', a: 'We bouwen privacy- en securityfirst, inclusief datachecks en compliance-bewuste agents voor gereguleerde sectoren.' },
        { q: 'Wat als we maatwerk nodig hebben?', a: 'Maatwerksoftware is een van onze kerndiensten. Kan een standaardtool het niet, dan bouwen wij het rond jouw proces.' },
        { q: 'Hoe verloopt de onboarding?', a: 'Het start met een strategiegesprek en discovery-workshop, gevolgd door een geprioriteerd plan zodat je precies weet wat we wanneer opleveren.' },
        { q: 'Kunnen we maandelijks opzeggen?', a: 'Starter en Growth zijn maandelijks zonder langlopend contract. Enterprise-voorwaarden zijn op maat.' },
      ],
    },
    contact: {
      tag: 'Neem contact op', t1: 'Plan je', tg: 'strategiegesprek',
      sub: 'Vertel ons over je bedrijf en doelen. Wij brengen de meest impactvolle automatiseringen in kaart en laten zien wat er mogelijk is.',
      benefits: ['Vrijblijvend, geen harde verkoop', 'Gerichte werksessie van 30 minuten', 'Je vertrekt met een concreet actieplan'],
      fields: ['Naam', 'Bedrijf', 'E-mail', 'Telefoon', 'Bericht'],
      submit: 'Plan strategiegesprek', privacy: 'We respecteren je privacy. Je gegevens worden nooit gedeeld.',
      okTitle: 'Bedankt — we nemen contact op!', okBody: 'We hebben je aanvraag ontvangen en reageren binnen één werkdag.',
    },
    dashboard: { title: 'Nexora Groei-dashboard', live: 'Live', kpis: ['Omzet', 'Leads', 'Conversie'], chart: 'Omzetgroei' },
    footer: 'Alle rechten voorbehouden.',
    tagline: 'Website-, marketing- en salesgroei voor ambitieuze bedrijven',
  },

  /* ------------------------------- ENGLISH ------------------------------ */
  en: {
    nav: ['Services', 'Results', 'Process', 'Case Studies', 'Pricing', 'FAQ'],
    bookCall: 'Book a Call',
    hero: {
      badge: 'Website • Marketing • Sales Growth',
      h1: 'Website, Marketing & Sales Growth For',
      h1grad: 'Ambitious Businesses',
      sub: 'We design high-converting websites and build the marketing & sales systems that generate leads, automate operations, and accelerate growth.',
      cta1: 'Book Strategy Call',
      cta2: 'View Case Studies',
      stats: ['Systems shipped', 'Leads generated', 'Avg. cost cut', 'Client rating'],
    },
    services: {
      tag: 'What we do', t1: 'One partner for your entire', tg: 'growth engine',
      sub: 'From first touch to closed deal — we design, build, and automate the systems that scale revenue.',
      items: [
        { title: 'AI Automation', desc: 'Custom AI workflows that handle repetitive operations end-to-end, around the clock.' },
        { title: 'Lead Generation', desc: 'Predictable pipelines that fill your CRM with qualified, sales-ready prospects.' },
        { title: 'Website Development', desc: 'High-converting, lightning-fast sites engineered to turn traffic into revenue.' },
        { title: 'Sales Funnels', desc: 'Optimized multi-step funnels that nurture leads and maximize conversion.' },
        { title: 'CRM Integrations', desc: 'Seamlessly connect your tools so data flows automatically across your stack.' },
        { title: 'Marketing Automation', desc: 'Behavior-triggered campaigns across email, SMS, and ads that run themselves.' },
        { title: 'Chatbots & AI Agents', desc: 'Conversational agents that qualify, support, and book meetings 24/7.' },
        { title: 'Custom Software', desc: 'Bespoke internal tools and platforms built around your exact processes.' },
        { title: 'SEO & Local SEO', desc: 'Technical and local SEO that compounds organic traffic month over month.' },
        { title: 'Performance Marketing', desc: 'Data-driven paid acquisition with relentless focus on ROAS and CAC.' },
      ],
    },
    features: {
      tag: 'Why clients choose us', t1: 'Outcomes you can', tg: 'measure',
      items: [
        { title: 'Increased Revenue', sub: 'Average revenue multiple within 12 months.' },
        { title: 'Automated Workflows', sub: 'Of manual busywork removed from operations.' },
        { title: 'More Qualified Leads', sub: 'Increase in sales-qualified leads per month.' },
        { title: 'Faster Sales Cycles', sub: 'Shorter time from first touch to closed deal.' },
        { title: 'Lower Operational Costs', sub: 'Reduction in operational overhead on average.' },
        { title: 'Better Customer Experience', sub: 'Average post-implementation CSAT score.' },
      ],
    },
    process: {
      tag: 'How we work', t1: 'A proven path from', tg: 'idea to impact', step: 'Step',
      items: [
        { title: 'Discovery', desc: 'We map your goals, bottlenecks, and growth levers in a deep-dive workshop.' },
        { title: 'Strategy', desc: 'A clear, prioritized roadmap tied directly to revenue and efficiency targets.' },
        { title: 'Development', desc: 'We build your systems, integrations, and assets to production quality.' },
        { title: 'Automation', desc: 'Workflows, AI agents, and triggers wired together to run without you.' },
        { title: 'Launch', desc: 'Controlled rollout with monitoring, training, and documentation.' },
        { title: 'Optimization', desc: 'Continuous testing and iteration to compound results over time.' },
      ],
    },
    cases: {
      tag: 'Proof, not promises', t1: 'Real systems,', tg: 'real growth',
      items: [
        { summary: 'Replaced manual SDR outreach with an AI lead engine and automated CRM routing.', labels: ['Revenue growth', 'Leads / month', 'Sales cycle'], suffix: ['%', '', '% faster'] },
        { summary: 'Built automated marketing flows and AI support agents across the funnel.', labels: ['ROAS', 'Support cost', 'Conversion'], suffix: ['x', '% lower', 'x'] },
        { summary: 'Automated intake, scheduling, and follow-up with HIPAA-aware AI agents.', labels: ['Bookings', 'No-shows', 'Admin hours'], suffix: ['%', '% lower', '+ saved'] },
      ],
    },
    testimonials: {
      tag: 'Loved by operators', t1: 'Trusted by', tg: 'ambitious teams',
      items: [
        { role: 'COO, NorthPeak', quote: 'They rebuilt our entire revenue engine. Within a quarter our pipeline tripled and our team finally stopped drowning in manual work.' },
        { role: 'Founder, Lumen Retail', quote: 'The AI agents handle 60% of our support and our ROAS has never been higher. It genuinely feels like we hired a 10-person team overnight.' },
        { role: 'Director, Meridian Health', quote: 'Intake and scheduling now run themselves. Our staff focus on patients, not paperwork. Easily the best investment we made this year.' },
        { role: 'CEO, Vantage Labs', quote: 'Strategic, fast, and obsessed with results. They treat our numbers like their own. I recommend them to every founder I meet.' },
      ],
    },
    pricing: {
      tag: 'Pricing', t1: 'Simple plans,', tg: 'serious leverage',
      sub: 'No long-term lock-in. Cancel anytime. Scale up as you grow.', popular: 'Most Popular',
      items: [
        { name: 'Starter', tagline: 'For teams validating their first automations.', cta: 'Get Started', features: ['1 automation workflow', 'Lead capture funnel', 'CRM setup & integration', 'Email automation', 'Monthly reporting'] },
        { name: 'Growth', tagline: 'For companies ready to scale revenue fast.', cta: 'Get Started', features: ['Everything in Starter', 'Up to 5 AI workflows', 'AI chat & voice agents', 'Multi-channel marketing automation', 'Performance marketing management', 'Bi-weekly optimization sprints', 'Priority support'] },
        { name: 'Enterprise', tagline: 'For complex orgs needing bespoke systems.', cta: 'Talk to Sales', features: ['Unlimited workflows', 'Custom software & integrations', 'Dedicated solutions architect', 'SLA & security review', 'Quarterly strategy roadmap'] },
      ],
    },
    faq: {
      tag: 'FAQ', t1: 'Questions,', tg: 'answered',
      items: [
        { q: 'How quickly can we see results?', a: 'Most clients see their first automations live within 2–3 weeks, with measurable pipeline and efficiency gains inside the first 90 days.' },
        { q: 'Do you work with our existing tools?', a: 'Yes. We integrate with your current CRM, marketing, and data stack — or recommend a better-fit setup if it accelerates results.' },
        { q: 'Is the AI safe and compliant?', a: 'We build with privacy and security first, including data-handling reviews and compliance-aware agents for regulated industries.' },
        { q: 'What if we need something custom?', a: 'Custom software is one of our core services. If an off-the-shelf tool can’t do it, we build it around your exact process.' },
        { q: 'How does onboarding work?', a: 'It starts with a strategy call and discovery workshop, followed by a prioritized roadmap so you know exactly what we ship and when.' },
        { q: 'Can we cancel anytime?', a: 'Starter and Growth plans are month-to-month with no long-term lock-in. Enterprise terms are tailored to your needs.' },
      ],
    },
    contact: {
      tag: 'Let’s talk', t1: 'Book your', tg: 'strategy call',
      sub: 'Tell us about your business and goals. We’ll map the highest-leverage automations and show you exactly what’s possible.',
      benefits: ['No obligation, no hard sell', '30-minute focused working session', 'Leave with a concrete action plan'],
      fields: ['Name', 'Company', 'Email', 'Phone', 'Message'],
      submit: 'Book Strategy Call', privacy: 'We respect your privacy. Your details are never shared.',
      okTitle: 'Thanks — we’ll be in touch!', okBody: 'We’ve received your request and will reach out within one business day.',
    },
    dashboard: { title: 'Nexora Growth Dashboard', live: 'Live', kpis: ['Revenue', 'Leads', 'Conversion'], chart: 'Revenue growth' },
    footer: 'All rights reserved.',
    tagline: 'Website, Marketing & Sales growth for ambitious businesses',
  },

  /* ------------------------------- العربية ------------------------------ */
  ar: {
    nav: ['الخدمات', 'النتائج', 'آلية العمل', 'دراسات الحالة', 'الأسعار', 'الأسئلة'],
    bookCall: 'احجز مكالمة',
    hero: {
      badge: 'نمو الموقع • التسويق • المبيعات',
      h1: 'نمو الموقع والتسويق والمبيعات',
      h1grad: 'للشركات الطموحة',
      sub: 'نصمّم مواقع عالية التحويل ونبني أنظمة التسويق والمبيعات التي تولّد العملاء المحتملين، وتؤتمت العمليات، وتسرّع نموّك.',
      cta1: 'احجز جلسة استراتيجية',
      cta2: 'استعرض دراسات الحالة',
      stats: ['نظامًا تم تسليمه', 'عميلًا محتملًا', 'متوسط خفض التكاليف', 'تقييم العملاء'],
    },
    services: {
      tag: 'ماذا نقدّم', t1: 'شريك واحد لكامل', tg: 'محرّك نموّك',
      sub: 'من أول تواصل حتى إتمام الصفقة — نصمّم ونبني ونؤتمت الأنظمة التي تضاعف الإيرادات.',
      items: [
        { title: 'الأتمتة بالذكاء الاصطناعي', desc: 'سير عمل ذكي يتولّى المهام المتكررة بالكامل على مدار الساعة.' },
        { title: 'توليد العملاء المحتملين', desc: 'مسارات متوقّعة تملأ نظام CRM بعملاء مؤهّلين جاهزين للبيع.' },
        { title: 'تطوير المواقع', desc: 'مواقع سريعة وعالية التحويل مصمّمة لتحويل الزيارات إلى إيرادات.' },
        { title: 'مسارات المبيعات', desc: 'مسارات محسّنة متعددة الخطوات تربّي العملاء وترفع التحويل.' },
        { title: 'تكامل أنظمة CRM', desc: 'اربط أدواتك لتتدفق البيانات تلقائيًا عبر منظومتك.' },
        { title: 'أتمتة التسويق', desc: 'حملات تُطلَق بالسلوك عبر البريد والرسائل والإعلانات تعمل ذاتيًا.' },
        { title: 'روبوتات ووكلاء الذكاء', desc: 'وكلاء محادثة يؤهّلون ويدعمون ويحجزون المواعيد على مدار الساعة.' },
        { title: 'برمجيات مخصّصة', desc: 'أدوات ومنصّات داخلية مبنية حول عملياتك بدقّة.' },
        { title: 'تحسين محركات البحث', desc: 'تحسين تقني ومحلي يضاعف الزيارات العضوية شهرًا بعد شهر.' },
        { title: 'تسويق الأداء', desc: 'اكتساب مدفوع قائم على البيانات بتركيز دائم على العائد على الإنفاق.' },
      ],
    },
    features: {
      tag: 'لماذا يختارنا العملاء', t1: 'نتائج يمكنك', tg: 'قياسها',
      items: [
        { title: 'زيادة الإيرادات', sub: 'متوسط مضاعفة الإيرادات خلال 12 شهرًا.' },
        { title: 'سير عمل مؤتمت', sub: 'من العمل اليدوي تمّت إزالته من عملياتك.' },
        { title: 'عملاء مؤهّلون أكثر', sub: 'زيادة في العملاء المؤهّلين شهريًا.' },
        { title: 'دورات بيع أسرع', sub: 'وقت أقصر من أول تواصل حتى الصفقة.' },
        { title: 'تكاليف تشغيل أقل', sub: 'متوسط خفض النفقات التشغيلية.' },
        { title: 'تجربة عملاء أفضل', sub: 'متوسط رضا العملاء بعد التنفيذ.' },
      ],
    },
    process: {
      tag: 'كيف نعمل', t1: 'مسار مُثبت من', tg: 'الفكرة إلى الأثر', step: 'خطوة',
      items: [
        { title: 'الاكتشاف', desc: 'نرسم أهدافك ونقاط الاختناق وفرص النمو في ورشة معمّقة.' },
        { title: 'الاستراتيجية', desc: 'خارطة طريق واضحة ومرتّبة مرتبطة مباشرةً بأهداف الإيراد والكفاءة.' },
        { title: 'التطوير', desc: 'نبني أنظمتك وتكاملاتك وأصولك بجودة إنتاجية.' },
        { title: 'الأتمتة', desc: 'سير عمل ووكلاء ذكاء ومحفّزات مترابطة لتعمل من دونك.' },
        { title: 'الإطلاق', desc: 'إطلاق مُحكم مع مراقبة وتدريب وتوثيق.' },
        { title: 'التحسين', desc: 'اختبار وتحسين مستمر لمضاعفة النتائج مع الوقت.' },
      ],
    },
    cases: {
      tag: 'دليل لا وعود', t1: 'أنظمة حقيقية،', tg: 'نموّ حقيقي',
      items: [
        { summary: 'استبدال التواصل اليدوي بمحرّك عملاء بالذكاء الاصطناعي وتوجيه CRM تلقائي.', labels: ['نمو الإيرادات', 'عملاء / شهر', 'دورة البيع'], suffix: ['%', '', '% أسرع'] },
        { summary: 'بناء تدفقات تسويق مؤتمتة ووكلاء دعم بالذكاء عبر المسار.', labels: ['العائد على الإنفاق', 'تكلفة الدعم', 'التحويل'], suffix: ['x', '% أقل', 'x'] },
        { summary: 'أتمتة الاستقبال والجدولة والمتابعة بوكلاء ذكاء متوافقين مع الخصوصية.', labels: ['الحجوزات', 'عدم الحضور', 'ساعات إدارية'], suffix: ['%', '% أقل', '+ موفّرة'] },
      ],
    },
    testimonials: {
      tag: 'محبوب من روّاد الأعمال', t1: 'موثوق من', tg: 'فرق طموحة',
      items: [
        { role: 'المدير التشغيلي، NorthPeak', quote: 'أعادوا بناء محرّك إيراداتنا بالكامل. خلال ربع سنة تضاعفت مساراتنا ثلاث مرّات وتوقّف فريقنا عن الغرق في العمل اليدوي.' },
        { role: 'مؤسّس، Lumen Retail', quote: 'يتولّى وكلاء الذكاء 60% من الدعم، والعائد على الإنفاق لم يكن أعلى من ذلك قط. وكأننا وظّفنا فريقًا من 10 أشخاص بين ليلة وضحاها.' },
        { role: 'مدير، Meridian Health', quote: 'الاستقبال والجدولة تعمل ذاتيًا الآن. يركّز فريقنا على المرضى لا على الأوراق. أفضل استثمار قمنا به هذا العام.' },
        { role: 'الرئيس التنفيذي، Vantage Labs', quote: 'استراتيجيون وسريعون ومهووسون بالنتائج. يتعاملون مع أرقامنا كأنها أرقامهم. أنصح بهم كل مؤسّس ألتقيه.' },
      ],
    },
    pricing: {
      tag: 'الأسعار', t1: 'خطط بسيطة،', tg: 'أثر كبير',
      sub: 'بدون التزام طويل الأمد. ألغِ في أي وقت. توسّع مع نموّك.', popular: 'الأكثر شيوعًا',
      items: [
        { name: 'Starter', tagline: 'للفرق التي تختبر أتمتتها الأولى.', cta: 'ابدأ الآن', features: ['سير عمل مؤتمت واحد', 'مسار التقاط العملاء', 'إعداد وتكامل CRM', 'أتمتة البريد الإلكتروني', 'تقارير شهرية'] },
        { name: 'Growth', tagline: 'للشركات الجاهزة للتوسّع بسرعة.', cta: 'ابدأ الآن', features: ['كل ما في Starter', 'حتى 5 مسارات ذكاء', 'وكلاء دردشة وصوت', 'أتمتة تسويق متعددة القنوات', 'إدارة تسويق الأداء', 'جلسات تحسين كل أسبوعين', 'دعم بأولوية'] },
        { name: 'Enterprise', tagline: 'للمؤسسات المعقّدة التي تحتاج حلولًا مخصّصة.', cta: 'تواصل مع المبيعات', features: ['سير عمل غير محدود', 'برمجيات وتكاملات مخصّصة', 'مهندس حلول مخصّص', 'اتفاقية مستوى خدمة ومراجعة أمنية', 'خارطة استراتيجية ربع سنوية'] },
      ],
    },
    faq: {
      tag: 'الأسئلة الشائعة', t1: 'أسئلة،', tg: 'وإجابات',
      items: [
        { q: 'متى نرى النتائج؟', a: 'يرى معظم العملاء أولى أتمتتهم خلال 2–3 أسابيع، مع مكاسب قابلة للقياس خلال أول 90 يومًا.' },
        { q: 'هل تعملون مع أدواتنا الحالية؟', a: 'نعم. نتكامل مع CRM والتسويق والبيانات لديك — أو نقترح إعدادًا أنسب إن كان يسرّع النتائج.' },
        { q: 'هل الذكاء آمن ومتوافق؟', a: 'نبني بأولوية الخصوصية والأمان، بما في ذلك مراجعات معالجة البيانات ووكلاء متوافقين للقطاعات المنظَّمة.' },
        { q: 'ماذا لو احتجنا حلًا مخصّصًا؟', a: 'البرمجيات المخصّصة من خدماتنا الأساسية. إن عجزت أداة جاهزة، نبنيه حول عمليتك تمامًا.' },
        { q: 'كيف تتم عملية البدء؟', a: 'تبدأ بمكالمة استراتيجية وورشة اكتشاف، تليها خارطة طريق مرتّبة لتعرف بالضبط ما نسلّمه ومتى.' },
        { q: 'هل يمكن الإلغاء في أي وقت؟', a: 'خطتا Starter وGrowth شهريتان بلا التزام طويل. وشروط Enterprise مفصّلة حسب احتياجك.' },
      ],
    },
    contact: {
      tag: 'لنتحدّث', t1: 'احجز', tg: 'جلستك الاستراتيجية',
      sub: 'حدّثنا عن شركتك وأهدافك. سنرسم لك أعلى الأتمتة أثرًا ونريك ما هو ممكن بالضبط.',
      benefits: ['بلا التزام وبلا ضغط بيعي', 'جلسة عمل مركّزة مدتها 30 دقيقة', 'تخرج بخطة عمل ملموسة'],
      fields: ['الاسم', 'الشركة', 'البريد الإلكتروني', 'الهاتف', 'الرسالة'],
      submit: 'احجز جلسة استراتيجية', privacy: 'نحترم خصوصيتك. لا تتم مشاركة بياناتك أبدًا.',
      okTitle: 'شكرًا — سنتواصل معك!', okBody: 'استلمنا طلبك وسنعاود التواصل خلال يوم عمل واحد.',
    },
    dashboard: { title: 'لوحة نمو Nexora', live: 'مباشر', kpis: ['الإيرادات', 'العملاء', 'التحويل'], chart: 'نمو الإيرادات' },
    footer: 'جميع الحقوق محفوظة.',
    tagline: 'نمو الموقع والتسويق والمبيعات للشركات الطموحة',
  },
};

// Language-independent data (numbers, icons) — combined with translated text by index.
const HERO_STATS = [
  { v: 250, suffix: '+' },
  { v: 3.4, decimals: 1, suffix: 'M+' },
  { v: 40, suffix: '%' },
  { v: 4.9, decimals: 1, suffix: '/5' },
];
const SERVICE_ICONS = [Bot, Target, Globe, Filter, Workflow, Zap, MessageSquare, Code2, Search, LineChart];
const FEATURE_DATA = [
  { icon: TrendingUp, stat: 3.2, decimals: 1, suffix: 'x' },
  { icon: Settings2, stat: 85, suffix: '%' },
  { icon: Users, stat: 4.1, decimals: 1, suffix: 'x' },
  { icon: Clock, stat: 47, suffix: '%' },
  { icon: DollarSign, stat: 38, suffix: '%' },
  { icon: Heart, stat: 4.9, decimals: 1, suffix: '/5' },
];
const STEP_ICONS = [Compass, PenTool, Code2, Cpu, Rocket, TrendingUp];
const CASE_DATA = [
  { company: 'NorthPeak SaaS', tag: 'B2B SaaS', metrics: [{ to: 412 }, { to: 940 }, { to: 47 }] },
  { company: 'Lumen Retail', tag: 'E-commerce', metrics: [{ to: 6.3, decimals: 1 }, { to: 58 }, { to: 2.9, decimals: 1 }] },
  { company: 'Meridian Health', tag: 'Healthcare', metrics: [{ to: 320 }, { to: 64 }, { to: 1200 }] },
];
const TESTIMONIAL_META = [
  { name: 'Sarah Lindqvist', initials: 'SL' },
  { name: 'Marcus Devine', initials: 'MD' },
  { name: 'Amira Hassan', initials: 'AH' },
  { name: 'Tom Bergström', initials: 'TB' },
];
const TIER_META = [
  { price: '€2,500', highlight: false },
  { price: '€6,500', highlight: true },
  { price: 'Custom', highlight: false },
];
const PERIOD_BY_LANG: Record<Lang, string> = { nl: '/mnd', en: '/mo', ar: '/شهر' };

// Live dashboard KPIs (language-independent numbers; labels come from CONTENT).
const DASHBOARD_KPIS = [
  { to: 48, prefix: '€', suffix: 'K', delta: '+24%' },
  { to: 1284, decimals: 0, suffix: '', delta: '+18%' },
  { to: 6.4, decimals: 1, suffix: '%', delta: '+12%' },
];

/* ------------------------------------------------------------------ */
/* Language context                                                    */
/* ------------------------------------------------------------------ */
interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: Content; dir: 'ltr' | 'rtl' }
const LanguageContext = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: CONTENT.en, dir: 'ltr' });
const useLang = () => useContext(LanguageContext);

function detectLang(): Lang {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage?.getItem('nexora-lang');
    if (saved === 'nl' || saved === 'en' || saved === 'ar') return saved;
    const n = (navigator.language || 'en').toLowerCase();
    if (n.startsWith('nl')) return 'nl';
    if (n.startsWith('ar')) return 'ar';
  }
  return 'en';
}

/* ------------------------------------------------------------------ */
/* Animation helpers                                                   */
/* ------------------------------------------------------------------ */
const revealParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const revealItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: { opacity: 0, y: 28, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } } }}
    >
      {children}
    </motion.div>
  );
}

function useCountUp(target: number, decimals = 0, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return { ref, display: value.toFixed(decimals) };
}

function Counter({ to, decimals = 0, prefix = '', suffix = '' }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const { ref, display } = useCountUp(to, decimals);
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-clip-text text-transparent ${className}`} style={{ backgroundImage: GRAD_TEXT }}>
      {children}
    </span>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="grid flex-shrink-0 place-items-center rounded-xl text-white shadow-lg"
      style={{ width: size, height: size, background: GRAD }}
      aria-hidden
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="15 7 21 7 21 13" />
      </svg>
    </span>
  );
}

function Logo({ markSize = 36 }: { markSize?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={markSize} />
      <span className="text-lg font-black tracking-tight text-white">
        Nexora <GradientText>Growth</GradientText>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Language switcher                                                   */
/* ------------------------------------------------------------------ */
function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 ${compact ? '' : 'backdrop-blur-md'}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-label={l.label}
          aria-pressed={lang === l.code}
          className={`min-w-[34px] rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
            lang === l.code ? 'text-white shadow' : 'text-white/60 hover:text-white'
          }`}
          style={lang === l.code ? { background: GRAD } : undefined}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
function Nav() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const ids = ['services', 'features', 'process', 'cases', 'pricing', 'faq'];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className={`mx-auto max-w-7xl px-5 transition-all duration-500 ${scrolled ? 'mt-3' : 'mt-5'}`}>
        <div
          className={`flex items-center justify-between rounded-2xl border px-5 py-3 transition-all duration-500 ${
            scrolled
              ? 'border-white/10 bg-[#0a0e27]/70 shadow-[0_20px_60px_-20px_rgba(37,99,235,0.5)] backdrop-blur-xl'
              : 'border-transparent bg-transparent'
          }`}
        >
          <button onClick={() => scrollToId('top')} aria-label={BRAND}>
            <Logo markSize={38} />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {t.nav.map((label, i) => (
              <button key={ids[i]} onClick={() => scrollToId(ids[i])} className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <button
              onClick={() => scrollToId('contact')}
              className="hidden items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 md:flex"
              style={{ background: GRAD }}
            >
              {t.bookCall} <ArrowRight size={15} />
            </button>
            <button onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden" aria-label="Menu">
              <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e27]/90 backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col p-2">
                {t.nav.map((label, i) => (
                  <button key={ids[i]} onClick={() => { scrollToId(ids[i]); setOpen(false); }} className="rounded-lg px-4 py-3 text-start text-sm font-medium text-white/80 hover:bg-white/5">
                    {label}
                  </button>
                ))}
                <div className="p-2"><LanguageSwitcher compact /></div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* Live dashboard (animated demo visual)                               */
/* ------------------------------------------------------------------ */
const BAR_COUNT = 16;

function LiveDashboard() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  // Bars that keep shifting to give a "live" feel (rising trend + noise).
  const seed = useMemo(
    () => Array.from({ length: BAR_COUNT }, (_, i) => 0.32 + (i / BAR_COUNT) * 0.5 + Math.random() * 0.12),
    [],
  );
  const [bars, setBars] = useState(seed);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setBars(() => Array.from({ length: BAR_COUNT }, (_, i) => {
        const trend = 0.3 + (i / BAR_COUNT) * 0.55;
        return Math.max(0.14, Math.min(1, trend + (Math.random() - 0.5) * 0.26));
      }));
    }, 2200);
    return () => clearInterval(id);
  }, [reduce]);

  // Fixed, nice rising area-chart curve.
  const linePts = '0,33 14,29 28,31 42,21 56,24 70,13 84,16 100,5';
  const areaPath = `M0,33 L14,29 L28,31 L42,21 L56,24 L70,13 L84,16 L100,5 L100,40 L0,40 Z`;

  return (
    <div ref={ref} dir="ltr" className="relative mx-auto mt-16 max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_40px_120px_-30px_rgba(37,99,235,0.6)] backdrop-blur-2xl">
        {/* window top bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs font-medium text-white/50">{t.dashboard.title}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {t.dashboard.live}
          </span>
        </div>

        {/* body */}
        <div className="p-4 sm:p-6">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {DASHBOARD_KPIS.map((k, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left sm:p-4">
                <div className="text-[11px] font-medium text-white/50">{t.dashboard.kpis[i]}</div>
                <div className="mt-1 text-lg font-black text-white sm:text-2xl">
                  <Counter to={k.to} decimals={k.decimals ?? 0} prefix={k.prefix ?? ''} suffix={k.suffix} />
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                  <TrendingUp size={12} /> {k.delta}
                </div>
              </div>
            ))}
          </div>

          {/* chart panel */}
          <div className="relative mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70">{t.dashboard.chart}</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300"><TrendingUp size={13} /> 32%</span>
            </div>

            {/* area + line chart */}
            <div className="relative h-24 w-full sm:h-28">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="ndArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={PALETTE.blue2} stopOpacity="0.45" />
                    <stop offset="1" stopColor={PALETTE.blue2} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="ndLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor={PALETTE.blue} />
                    <stop offset="0.6" stopColor={PALETTE.cyan} />
                    <stop offset="1" stopColor={PALETTE.sky} />
                  </linearGradient>
                </defs>
                <motion.path d={areaPath} fill="url(#ndArea)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1, delay: 0.3 }} />
                <motion.polyline
                  points={linePts}
                  fill="none"
                  stroke="url(#ndLine)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />
              </svg>
              {/* pulsing endpoint dot (top-right) */}
              <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: PALETTE.sky }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: PALETTE.sky }} />
              </span>
            </div>

            {/* live bars */}
            <div className="mt-4 flex h-16 items-end gap-1 sm:gap-1.5">
              {bars.map((v, i) => (
                <motion.div
                  key={i}
                  className="h-full flex-1 rounded-t-sm"
                  style={{ background: GRAD, transformOrigin: 'bottom', opacity: 0.55 + (i / BAR_COUNT) * 0.45 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: inView ? v : 0 }}
                  transition={{ duration: 1.1, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* soft glow under the window */}
      <div className="pointer-events-none absolute inset-x-10 -bottom-6 -z-10 h-16 rounded-full opacity-50 blur-2xl" style={{ background: GRAD }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yFast = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const gx = useSpring(mx, { stiffness: 60, damping: 20 });
  const gy = useSpring(my, { stiffness: 60, damping: 20 });
  const glowX = useTransform(gx, (v) => `${v * 100}%`);
  const glowY = useTransform(gy, (v) => `${v * 100}%`);

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      className="relative isolate overflow-hidden bg-[#05070f] pt-40 pb-28 sm:pt-48 sm:pb-36"
    >
      {/* animated gradient fallback (shown if the video can't load) */}
      <div className="ai-animated-bg absolute inset-0 -z-30 opacity-70" />
      {/* moving background video — decorative, never captures clicks */}
      <video
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/nexora-hero.mp4" type="video/mp4" />
      </video>
      {/* dark overlay so headline + buttons stay readable on top of the video */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(5,7,15,0.45),rgba(5,7,15,0.82))]" />
      <motion.div
        className="pointer-events-none absolute -z-10 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{ left: glowX, top: glowY, background: `radial-gradient(circle, ${PALETTE.blue}55, transparent 60%)` }}
      />
      <motion.div style={{ y: yFast }} className="ai-float pointer-events-none absolute left-[8%] top-[22%] -z-10 h-40 w-40 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md" />
      <motion.div style={{ y: ySlow }} className="ai-float-slow pointer-events-none absolute right-[10%] top-[30%] -z-10 h-28 w-28 rounded-full border border-white/10 bg-white/5 backdrop-blur-md" />
      <motion.div style={{ y: yFast }} className="ai-float pointer-events-none absolute right-[20%] bottom-[12%] -z-10 h-20 w-20 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md" />
      <div className="ai-grid absolute inset-0 -z-10 opacity-[0.15]" />

      <motion.div style={{ opacity: fade }} className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          {t.hero.badge}
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05 }} className="text-4xl font-black leading-[1.1] tracking-tighter text-white sm:text-6xl lg:text-7xl">
          {t.hero.h1} <GradientText>{t.hero.h1grad}</GradientText>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18 }} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
          {t.hero.sub}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button onClick={() => scrollToId('contact')} className="group flex w-full items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-[0_20px_50px_-15px_rgba(37,99,235,0.7)] transition-transform hover:-translate-y-1 active:scale-95 sm:w-auto" style={{ background: GRAD }}>
            <Calendar size={18} /> {t.hero.cta1}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 rtl:rotate-180" />
          </button>
          <button onClick={() => scrollToId('cases')} className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 active:scale-95 sm:w-auto">
            {t.hero.cta2}
          </button>
        </motion.div>

        {/* animated live dashboard demo */}
        <LiveDashboard />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md sm:grid-cols-4">
          {HERO_STATS.map((s, i) => (
            <div key={i} className="bg-white/[0.02] px-4 py-6 text-center">
              <div className="text-2xl font-black text-white sm:text-3xl">
                <Counter to={s.v} decimals={s.decimals ?? 0} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">{t.hero.stats[i]}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]" style={{ borderColor: `${PALETTE.blue}33`, color: PALETTE.blue, background: `${PALETTE.blue}0d` }}>
      <Sparkles size={13} /> {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */
function Services() {
  const { t } = useLang();
  return (
    <section id="services" className="relative bg-white py-24 sm:py-32">
      <div className="container-custom">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>{t.services.tag}</SectionTag>
          <h2 className="mt-5 text-3xl font-black tracking-tighter text-[#0a0e27] sm:text-5xl">
            {t.services.t1} <GradientText>{t.services.tg}</GradientText>
          </h2>
          <p className="mt-4 text-lg text-slate-500">{t.services.sub}</p>
        </Reveal>

        <motion.div variants={revealParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {t.services.items.map((s, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <motion.article key={i} variants={revealItem} whileHover={{ y: -8 }} className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-[0_10px_40px_-20px_rgba(37,99,235,0.25)] backdrop-blur-xl transition-shadow hover:shadow-[0_30px_60px_-25px_rgba(37,99,235,0.45)]">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(120% 120% at 0% 0%, ${PALETTE.blue}12, transparent 55%)` }} />
                <div className="relative mb-5 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: GRAD }}>
                  <Icon size={22} />
                </div>
                <h3 className="relative text-lg font-bold tracking-tight text-[#0a0e27]">{s.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */
function Features() {
  const { t } = useLang();
  return (
    <section id="features" className="relative overflow-hidden bg-[#f6f8fc] py-24 sm:py-32">
      <div className="absolute -right-40 top-0 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: `${PALETTE.violet}33` }} />
      <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: `${PALETTE.cyan}33` }} />
      <div className="container-custom relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>{t.features.tag}</SectionTag>
          <h2 className="mt-5 text-3xl font-black tracking-tighter text-[#0a0e27] sm:text-5xl">
            {t.features.t1} <GradientText>{t.features.tg}</GradientText>
          </h2>
        </Reveal>

        <motion.div variants={revealParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => {
            const d = FEATURE_DATA[i];
            const Icon = d.icon;
            return (
              <motion.div key={i} variants={revealItem} whileHover={{ y: -6 }} className="group rounded-3xl border border-white bg-white/80 p-8 shadow-[0_20px_50px_-30px_rgba(37,99,235,0.4)] backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg" style={{ background: GRAD }}>
                    <Icon size={22} />
                  </div>
                  <div className="text-4xl font-black tracking-tighter" style={{ color: PALETTE.blue }} dir="ltr">
                    <Counter to={d.stat} decimals={d.decimals ?? 0} suffix={d.suffix} />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-[#0a0e27]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.sub}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Process                                                             */
/* ------------------------------------------------------------------ */
function Process() {
  const { t } = useLang();
  return (
    <section id="process" className="relative bg-white py-24 sm:py-32">
      <div className="container-custom">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>{t.process.tag}</SectionTag>
          <h2 className="mt-5 text-3xl font-black tracking-tighter text-[#0a0e27] sm:text-5xl">
            {t.process.t1} <GradientText>{t.process.tg}</GradientText>
          </h2>
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-[#2563EB] via-[#06B6D4] to-[#8B5CF6] sm:left-1/2 sm:-translate-x-1/2" />
          <div className="space-y-10">
            {t.process.items.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay: 0.05 }} className={`relative flex items-start gap-6 sm:w-1/2 ${i % 2 ? 'sm:ml-auto sm:flex-row sm:pl-12' : 'sm:flex-row-reverse sm:pr-12 sm:text-right'}`}>
                  <div className="z-10 grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-white shadow-lg ring-8 ring-white" style={{ background: GRAD }}>
                    <Icon size={22} />
                  </div>
                  <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-[0_15px_40px_-25px_rgba(37,99,235,0.35)] backdrop-blur-xl">
                    <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: PALETTE.blue }}>
                      {t.process.step} {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="mt-1 text-xl font-bold tracking-tight text-[#0a0e27]">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Case studies                                                        */
/* ------------------------------------------------------------------ */
function CaseStudies() {
  const { t } = useLang();
  return (
    <section id="cases" className="relative overflow-hidden bg-[#05070f] py-24 sm:py-32">
      <div className="ai-animated-bg absolute inset-0 -z-10 opacity-40" />
      <div className="ai-grid absolute inset-0 -z-10 opacity-[0.12]" />
      <div className="container-custom relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>{t.cases.tag}</SectionTag>
          <h2 className="mt-5 text-3xl font-black tracking-tighter text-white sm:text-5xl">
            {t.cases.t1} <GradientText>{t.cases.tg}</GradientText>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {t.cases.items.map((c, idx) => {
            const meta = CASE_DATA[idx];
            return (
              <Reveal key={idx} delay={idx * 0.1}>
                <motion.article whileHover={{ y: -8 }} className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">{meta.tag}</span>
                    <Building2 size={18} className="text-white/40" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white">{meta.company}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{c.summary}</p>
                  <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                    {meta.metrics.map((m, mi) => (
                      <CaseMetric key={mi} label={c.labels[mi]} to={m.to} decimals={m.decimals ?? 0} suffix={c.suffix[mi]} />
                    ))}
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CaseMetric({ label, to, decimals = 0, suffix = '' }: { label: string; to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-lg font-black text-white" dir="ltr"><Counter to={to} decimals={decimals} suffix={suffix} /></span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div initial={{ width: 0 }} animate={inView ? { width: '100%' } : {}} transition={{ duration: 1.4, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: GRAD }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */
function Testimonials() {
  const { t } = useLang();
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="container-custom">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>{t.testimonials.tag}</SectionTag>
          <h2 className="mt-5 text-3xl font-black tracking-tighter text-[#0a0e27] sm:text-5xl">
            {t.testimonials.t1} <GradientText>{t.testimonials.tg}</GradientText>
          </h2>
        </Reveal>

        <motion.div variants={revealParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {t.testimonials.items.map((item, i) => {
            const meta = TESTIMONIAL_META[i];
            return (
              <motion.figure key={i} variants={revealItem} whileHover={{ y: -6 }} className="rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-[0_20px_50px_-30px_rgba(37,99,235,0.4)] backdrop-blur-xl">
                <div className="mb-4 flex gap-1" style={{ color: PALETTE.sky }}>
                  {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <blockquote className="text-lg leading-relaxed text-[#0a0e27]">“{item.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full text-sm font-black text-white" style={{ background: GRAD }}>{meta.initials}</span>
                  <span>
                    <span className="block font-bold text-[#0a0e27]">{meta.name}</span>
                    <span className="block text-sm text-slate-500">{item.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            );
          })}
        </motion.div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
          {['NorthPeak', 'Lumen', 'Meridian', 'Vantage', 'Aeroflow', 'Quantia'].map((l) => (
            <span key={l} className="text-xl font-black tracking-tight text-slate-400">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */
function Pricing() {
  const { t, lang } = useLang();
  return (
    <section id="pricing" className="relative overflow-hidden bg-[#f6f8fc] py-24 sm:py-32">
      <div className="container-custom">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>{t.pricing.tag}</SectionTag>
          <h2 className="mt-5 text-3xl font-black tracking-tighter text-[#0a0e27] sm:text-5xl">
            {t.pricing.t1} <GradientText>{t.pricing.tg}</GradientText>
          </h2>
          <p className="mt-4 text-lg text-slate-500">{t.pricing.sub}</p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {t.pricing.items.map((tier, idx) => {
            const meta = TIER_META[idx];
            const isCustom = meta.price === 'Custom';
            return (
              <Reveal key={idx} delay={idx * 0.08} className="h-full">
                <motion.div whileHover={{ y: -10 }} className={`relative flex h-full flex-col rounded-3xl p-8 backdrop-blur-xl transition-shadow ${meta.highlight ? 'border-2 text-white shadow-[0_40px_80px_-30px_rgba(37,99,235,0.7)]' : 'border border-slate-200/70 bg-white/70 shadow-[0_20px_50px_-30px_rgba(37,99,235,0.35)]'}`} style={meta.highlight ? { background: 'linear-gradient(160deg, #0b1230 0%, #111a4a 100%)', borderColor: PALETTE.blue2 } : undefined}>
                  {meta.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg" style={{ background: GRAD }}>{t.pricing.popular}</span>
                  )}
                  <h3 className={`text-lg font-bold ${meta.highlight ? 'text-white' : 'text-[#0a0e27]'}`}>{tier.name}</h3>
                  <p className={`mt-1 text-sm ${meta.highlight ? 'text-white/60' : 'text-slate-500'}`}>{tier.tagline}</p>
                  <div className="mt-6 flex items-end gap-1" dir="ltr">
                    <span className={`text-4xl font-black tracking-tighter ${meta.highlight ? 'text-white' : 'text-[#0a0e27]'}`}>{meta.price}</span>
                    {!isCustom && <span className={`pb-1 text-sm ${meta.highlight ? 'text-white/50' : 'text-slate-400'}`}>{PERIOD_BY_LANG[lang]}</span>}
                  </div>
                  <ul className="mt-7 flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className={`flex items-start gap-3 text-sm ${meta.highlight ? 'text-white/80' : 'text-slate-600'}`}>
                        <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full" style={{ background: meta.highlight ? GRAD : `${PALETTE.blue}15` }}>
                          <Check size={12} className={meta.highlight ? 'text-white' : ''} style={meta.highlight ? undefined : { color: PALETTE.blue }} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => scrollToId('contact')} className={`mt-8 flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5 active:scale-95 ${meta.highlight ? 'text-white shadow-lg' : 'border border-slate-200 bg-white text-[#0a0e27] hover:border-[#2563EB]'}`} style={meta.highlight ? { background: GRAD } : undefined}>
                    {tier.cta} <ArrowRight size={15} className="rtl:rotate-180" />
                  </button>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
function FAQ() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative bg-white py-24 sm:py-32">
      <div className="container-custom">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>{t.faq.tag}</SectionTag>
          <h2 className="mt-5 text-3xl font-black tracking-tighter text-[#0a0e27] sm:text-5xl">
            {t.faq.t1} <GradientText>{t.faq.tg}</GradientText>
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 max-w-3xl space-y-4">
          {t.faq.items.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 0.04}>
                <div className={`overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-xl transition-colors ${isOpen ? 'border-[#2563EB]/40' : 'border-slate-200/70'}`}>
                  <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start">
                    <span className="text-base font-bold text-[#0a0e27]">{f.q}</span>
                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full" style={{ background: isOpen ? GRAD : `${PALETTE.blue}12` }}>
                      <Plus size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-45 text-white' : ''}`} style={isOpen ? undefined : { color: PALETTE.blue }} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                        <p className="px-6 pb-6 text-sm leading-relaxed text-slate-500">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */
function Field({ id, label, type = 'text', textarea = false }: { id: string; label: string; type?: string; textarea?: boolean }) {
  const cls = 'peer w-full rounded-2xl border border-white/15 bg-white/5 px-4 pb-2.5 pt-6 text-white placeholder-transparent outline-none backdrop-blur-md transition-colors focus:border-[#38BDF8]';
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={id} name={id} rows={4} placeholder={label} className={cls} />
      ) : (
        <input id={id} name={id} type={type} placeholder={label} className={cls} />
      )}
      <label htmlFor={id} className="pointer-events-none absolute start-4 top-2 text-xs font-medium text-white/50 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/40 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#38BDF8]">
        {label}
      </label>
    </div>
  );
}

function Contact() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  const benefitIcons = [ShieldCheck, Clock, Rocket];
  return (
    <section id="contact" className="relative overflow-hidden bg-[#05070f] py-24 sm:py-32">
      <div className="ai-animated-bg absolute inset-0 -z-10 opacity-50" />
      <div className="container-custom relative">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionTag>{t.contact.tag}</SectionTag>
            <h2 className="mt-5 text-3xl font-black tracking-tighter text-white sm:text-5xl">
              {t.contact.t1} <GradientText>{t.contact.tg}</GradientText>
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/60">{t.contact.sub}</p>
            <ul className="mt-8 space-y-4">
              {t.contact.benefits.map((b, i) => {
                const Icon = benefitIcons[i];
                return (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl text-white" style={{ background: GRAD }}><Icon size={16} /></span>
                    {b}
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 flex flex-col gap-2 text-sm text-white/50 sm:flex-row sm:gap-6" dir="ltr">
              <span className="inline-flex items-center gap-2"><Mail size={15} /> hello@nexoragrowth.com</span>
              <span className="inline-flex items-center gap-2"><Phone size={15} /> +31 (0)20 123 4567</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_40px_100px_-40px_rgba(37,99,235,0.6)] backdrop-blur-2xl sm:p-9">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full text-white" style={{ background: GRAD }}><Check size={28} /></span>
                    <h3 className="mt-5 text-xl font-bold text-white">{t.contact.okTitle}</h3>
                    <p className="mt-2 text-sm text-white/60">{t.contact.okBody}</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field id="name" label={t.contact.fields[0]} />
                      <Field id="company" label={t.contact.fields[1]} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field id="email" label={t.contact.fields[2]} type="email" />
                      <Field id="phone" label={t.contact.fields[3]} type="tel" />
                    </div>
                    <Field id="message" label={t.contact.fields[4]} textarea />
                    <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-[0_20px_50px_-15px_rgba(37,99,235,0.7)] transition-transform hover:-translate-y-1 active:scale-95" style={{ background: GRAD }}>
                      <Calendar size={18} /> {t.contact.submit}
                    </button>
                    <p className="text-center text-xs text-white/40">{t.contact.privacy}</p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
function SiteFooter() {
  const { t } = useLang();
  const ids = ['services', 'features', 'process', 'cases', 'pricing', 'faq'];
  return (
    <footer className="border-t border-white/10 bg-[#05070f] py-14">
      <div className="container-custom">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <Logo markSize={36} />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {t.nav.map((label, i) => (
              <button key={ids[i]} onClick={() => scrollToId(ids[i])} className="text-sm text-white/50 transition-colors hover:text-white">{label}</button>
            ))}
          </nav>
          <button onClick={() => scrollToId('contact')} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5" style={{ background: GRAD }}>
            {t.bookCall} <ArrowRight size={15} className="rtl:rotate-180" />
          </button>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {BRAND}. {t.footer} · {t.tagline}.
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page-scoped styles                                                  */
/* ------------------------------------------------------------------ */
const PageStyles = () => (
  <style>{`
    .ai-animated-bg {
      background: radial-gradient(60% 60% at 20% 20%, ${PALETTE.blue}40, transparent 60%),
                  radial-gradient(50% 50% at 80% 10%, ${PALETTE.violet}40, transparent 60%),
                  radial-gradient(60% 60% at 70% 80%, ${PALETTE.cyan}33, transparent 60%),
                  linear-gradient(135deg, #05070f, #0a0e27 50%, #060a1c);
      background-size: 200% 200%;
      animation: ai-gradient-shift 18s ease infinite;
    }
    @keyframes ai-gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .ai-grid {
      background-image: linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%);
    }
    .ai-float { animation: ai-float 7s ease-in-out infinite; }
    .ai-float-slow { animation: ai-float 11s ease-in-out infinite; }
    @keyframes ai-float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-26px) rotate(6deg); }
    }
    .lang-ar { font-family: 'Cairo', 'Inter', ui-sans-serif, system-ui, sans-serif; }
    .lang-ar h1, .lang-ar h2, .lang-ar h3 { letter-spacing: 0 !important; }
    @media (prefers-reduced-motion: reduce) {
      .ai-animated-bg, .ai-float, .ai-float-slow { animation: none; }
    }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = CONTENT[lang];

  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem('nexora-lang', l); } catch { /* ignore */ }
  };

  // Load Arabic webfont once.
  useEffect(() => {
    const id = 'nexora-arabic-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Title + favicon + document direction follow the chosen language.
  useEffect(() => {
    const prevTitle = document.title;
    const prevDir = document.documentElement.getAttribute('dir');
    document.title = `${BRAND} — ${t.tagline}`;
    document.documentElement.setAttribute('dir', dir);

    const icon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const prevIcon = icon?.getAttribute('href') ?? null;
    if (icon) icon.setAttribute('href', '/nexora-logo.svg');

    return () => {
      document.title = prevTitle;
      if (prevDir) document.documentElement.setAttribute('dir', prevDir);
      else document.documentElement.removeAttribute('dir');
      if (icon && prevIcon !== null) icon.setAttribute('href', prevIcon);
    };
  }, [dir, t.tagline]);

  const ctx = useMemo<LangCtx>(() => ({ lang, setLang, t, dir }), [lang, t, dir]);

  return (
    <LanguageContext.Provider value={ctx}>
      <div dir={dir} className={`min-h-screen bg-[#05070f] font-sans antialiased ${lang === 'ar' ? 'lang-ar' : ''}`}>
        <PageStyles />
        <Nav />
        <main>
          <Hero />
          <Services />
          <Features />
          <Process />
          <CaseStudies />
          <Testimonials />
          <Pricing />
          <FAQ />
          <Contact />
        </main>
        <SiteFooter />
      </div>
    </LanguageContext.Provider>
  );
}
