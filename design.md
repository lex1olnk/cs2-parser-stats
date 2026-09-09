# CS2 Parser Stats — Design System

Дизайн-гайд для визуального языка проекта. Используй его при создании новых страниц/компонентов, чтобы они стилистически совпадали с существующими (главная, `/tournament/players`, `/player/[id]`).

---

## 1. Визуальная философия

**Стиль**: Brutalist + Terminal + Tech-magazine.
Сайт выглядит как «панель управления турниром из киберпанк-фильма»: монохром, агрессивная типографика, технические подписи в духе системных логов, минимум цвета — белый и оранжевый используются как акценты.

**Принципы**:

1. **Контраст вместо декора** — никаких теней, скруглений, градиентов «для красоты». Контраст чёрного и белого + hover-инверсия = вся выразительность.
2. **Текст как графика** — заголовки `text-[8rem]..text-[20vw]`, искажение через `italic` + `tracking-tighter`, разделение слов через `_` (`Team_Assembly`, `History.exe`, `DATA_EXTRACT`).
3. **Технический шум** — каждый блок снабжён моноширинной подписью с UPPERCASE и `tracking-[0.3em..0.5em]`: `// SYSTEM_LOG`, `NET_LINK_ESTABLISHED // NODE_01`, `0x1A3F2B`, `[ ONGOING ]`.
4. **Сетка везде** — `grid grid-cols-12` для большинства лейаутов, чёткие пропорции `col-span-1/4/6/8`.
5. **Hover = инверсия** — карточки/строки таблиц при наведении становятся `bg-white text-black`, а внутренние акценты инвертируются (`group-hover:`).
6. **Анимация как «отклик системы»** — `framer-motion`: `initial → animate` с `delay: i * 0.1`, `useInView`, scroll-driven `useTransform`.

---

## 2. Палитра

Объявлена в [nextapp/src/app/globals.css](nextapp/src/app/globals.css):

```css
--background:  #0c0c0c   /* основной фон, body */
--foreground:  #171717
--light-dark:  #242424
--my-gray:     #2b2b2b
```

На практике в JSX используются Tailwind-цвета (zinc-палитра):

| Назначение | Класс | Hex |
|---|---|---|
| Главный фон страницы | `bg-[#0a0a0a]` | `#0a0a0a` |
| Фон body | `bg-background` (`#0c0c0c`) | `#0c0c0c` |
| Карточки (тонкая подсветка) | `bg-zinc-900/5` / `bg-zinc-900/10` | — |
| Границы (тёмные) | `border-zinc-900`, `border-zinc-800` | `#18181b`, `#27272a` |
| Текст основной | `text-white` | `#fff` |
| Текст вторичный | `text-zinc-400` | `#a1a1aa` |
| Текст подписи / мета | `text-zinc-500..600` | `#71717a..#52525b` |
| Watermark / disabled | `text-zinc-700..800` | `#3f3f46..#27272a` |
| **Hover-инверсия** | `bg-white text-black` | — |
| **Акцент 1 — оранжевый** | `bg-orange-500/700`, `text-orange-400` | CS2-feel, прогресс-бары, RecoilPattern |
| Status: успех | `text-green-500` (`[ ONGOING ]`) | `#22c55e` |
| Status: предупреждение | `text-yellow-400` | `#facc15` |
| Akzent rotation (DuelMasters) | `text-red-500 / yellow-400 / green-400 / cyan-400 / blue-500` | — |

**Правило**: цвет (кроме чёрного/белого/zinc) используется ТОЛЬКО как акцент — статус, прогресс-индикатор, RecoilPattern. Никаких цветных карточек или цветных фонов секций.

---

## 3. Типографика

**Шрифты**:
- **Sans (основной)**: Nunito (Google Fonts), подключён в [nextapp/src/app/layout.tsx](nextapp/src/app/layout.tsx).
- **Mono (технический)**: системный `font-mono` (Tailwind default — `ui-monospace, SFMono-Regular, ...`).

**Шкала заголовков**:

| Класс | Где | Эффект |
|---|---|---|
| `text-[15vw]..text-[20vw] font-black italic text-white/5` | Watermark в углу секции (Hero, Deagle) | Гигантский фоновый «призрак» |
| `text-8xl font-black italic tracking-tighter uppercase` | H1 страницы (matches, tournament/players) | Главный заголовок |
| `text-7xl font-black italic tracking-tighter uppercase` | H2 секции (`History.exe`, `Team_Assembly`) | Заголовок секции |
| `text-5xl..6xl font-black italic` | H1 карточки игрока, имя в `PlayerCard` | — |
| `text-3xl font-black italic tracking-tighter` | Цифры stat-карточек, рейтинг | — |
| `text-2xl font-black italic` | Ранг в таблице, rating в leaderboard | — |
| `text-xl font-bold uppercase tracking-tighter` | Названия команд, строки таблицы | — |

**Подписи / metadata** (всё моноширинное):

```html
<span class="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-500">
  SYSTEM_LOG // MATCH_ENTRIES
</span>
```

Допустимые размеры: `text-[8px] / [9px] / [10px] / [11px]`.
Допустимый tracking: `tracking-widest / tracking-[0.2em..0.5em]`.
Всегда `uppercase`. Часто `font-bold` или `font-black`.

**Разделители слов**: вместо пробела часто `_` (`Team_Entity`, `NO_DATA_FOR_TOURNAMENT`). В заголовках можно чередовать цвет слов через `_`:

```tsx
{data.name.split("_").map((word, i) => (
  <span className={i % 2 === 0 ? "text-white" : "text-zinc-800"}>
    {word}{" "}
  </span>
))}
```

**Технические префиксы**: `// `, `[ ]`, `0x`, `#`, `^` — добавляют «системности».

---

## 4. Лейаут и сетка

- **Контейнер страницы**: `max-w-7xl mx-auto px-12` (или `px-4 sm:px-6 lg:px-8` для админки).
- **Главная сетка**: `grid grid-cols-12 gap-4..16`.
- **Отступы сверху**: после Navbar нужен `pt-24..pt-32` (Navbar сам по себе `fixed top-0`, появляется при ховере).
- **Между секциями**: `space-y-12..space-y-24` или дополнительные `mb-16..mb-20`.
- **Карточки внутри сетки**: `border border-zinc-900 bg-zinc-900/5..10 p-5..p-10`.

**Декоративные «уголки» карточки** (PlayerCard):

```tsx
<div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-zinc-600" />
<div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-zinc-600" />
```

---

## 5. Компоненты-паттерны

### 5.1. Заголовок страницы

```tsx
<header className="mb-20 border-l-4 border-white pl-8">
  <div className="flex items-center gap-4 mb-2">
    <span className="text-zinc-600 font-mono text-xs tracking-[0.5em]">
      DATA_EXTRACT // PLAYERS_STAT
    </span>
    <div className="h-px w-24 bg-zinc-800" />
  </div>
  <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">
    Top_Performers <br />
    <span className="text-zinc-800">[{id || "—"}]</span>
  </h1>
</header>
```

### 5.2. Чип / бейдж

```tsx
<span className="bg-white text-black px-2 py-0.5 text-[10px] font-black uppercase">
  Tournament_Standings
</span>
```

Чёрный вариант:
```tsx
<span className="text-[8px] bg-zinc-800 text-white px-1.5 py-0.5 font-bold italic">
  TOP 0.1%
</span>
```

### 5.3. Карточка с hover-инверсией

Базовый паттерн (Draft, MatchList, Leaderboard):

```tsx
<div className="group border border-zinc-900 bg-zinc-900/10 p-5
                hover:bg-white hover:text-black transition-all duration-300
                relative overflow-hidden">
  {/* Левая «полоска появляется на hover» */}
  <div className="absolute left-0 top-0 h-full w-0.5 bg-white
                  scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
  {/* Контент с group-hover:text-black для вторичных элементов */}
  <span className="text-zinc-600 group-hover:text-black/50">...</span>
</div>
```

### 5.4. Stat-карточка с TOP-бейджем

См. [StatsGrid.tsx](nextapp/src/components/features/player/StatsGrid.tsx):
border + большое italic-число + чёрный бейдж `TOP {x}%` + список деталей под разделителем.

### 5.5. Таблица-лидерборд

См. [PlayerLeaderboard.tsx](nextapp/src/components/features/player/PlayerLeaderboard.tsx) и [TournamentLeaderboard.tsx](nextapp/src/components/TournamentLeaderboard.tsx).

- `grid grid-cols-12 gap-4` — шапка с `text-[10px] uppercase tracking-widest text-zinc-500`.
- Строки — `bg-black border border-zinc-900 hover:bg-white`.
- Ранг — `text-2xl font-black italic text-zinc-800` (большая, но призрачная цифра).
- Rating — `text-2xl font-black italic` + анимированный прогресс-бар снизу:

```tsx
<div className="h-1 w-full bg-zinc-900 mt-1 overflow-hidden group-hover:bg-zinc-200">
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${(value / max) * 100}%` }}
    className="h-full bg-white group-hover:bg-black"
  />
</div>
```

### 5.6. Прогресс / клатч-бар (двухцветный)

См. [ClutchStats.tsx](nextapp/src/components/features/player/ClutchStats.tsx) — белая часть = успех, `bg-zinc-900` = неудача, оба с процентами внутри.

### 5.7. Круговой индикатор (SVG)

См. `Entry_Success` в [StatsGrid.tsx](nextapp/src/components/features/player/StatsGrid.tsx):

```tsx
<svg className="absolute inset-0 -rotate-90 w-full h-full">
  <circle cx="64" cy="64" r="62" fill="none" stroke="#18181b" strokeWidth="1" />
  <motion.circle
    cx="64" cy="64" r="62" fill="none" stroke="white" strokeWidth="2"
    strokeDasharray="390"
    initial={{ strokeDashoffset: 390 }}
    whileInView={{ strokeDashoffset: 390 - 390 * value }}
    transition={{ duration: 1.5, ease: "circOut" }}
  />
</svg>
```

### 5.8. «Zebra»-паттерн (декоративный)

```tsx
<div className="h-6 w-full bg-[repeating-linear-gradient(-45deg,#18181b,#18181b_4px,transparent_4px,transparent_10px)] opacity-30" />
```

### 5.9. Пустое состояние

```tsx
<div className="h-64 border border-dashed border-zinc-800 flex items-center justify-center
                italic text-zinc-800 text-xs text-center px-12 uppercase tracking-widest">
  Live_Broadcasting_Subsystem_Awaiting_Signal
</div>
```

Текстовый вариант:
```tsx
<p className="font-mono text-zinc-600 text-sm">NO_DATA_FOR_TOURNAMENT</p>
```

### 5.10. Кнопка

Тонкая, с заполнением снизу при hover (см. `TournamentLink` в Navbar):

```tsx
<button className="relative overflow-hidden px-6 py-1.5 text-[11px] font-black uppercase
                   tracking-[0.2em] text-white border border-zinc-800 hover:border-white
                   transition-colors group/btn">
  <span className="relative z-10">Топ_15</span>
  <div className="absolute inset-0 bg-white translate-y-full
                  group-hover/btn:translate-y-0 transition-transform duration-300" />
</button>
```

Крупный «выбор» (Hero — выбор турнира):

```tsx
<button className="px-6 py-3 border uppercase font-black italic tracking-tighter text-2xl
                   transition-all duration-300
                   {active ? 'bg-white text-black border-white'
                           : 'border-zinc-900 text-zinc-700 hover:border-zinc-500'}">
  {name}
</button>
```

### 5.11. Технический инфопанель / sidebar

См. правую колонку `/matches` (`Event_Details`):

```tsx
<div className="border border-zinc-900 p-6 bg-zinc-900/5 backdrop-blur-sm">
  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">
    Event_Details
  </h3>
  <div className="space-y-4 font-mono text-[11px]">
    <div className="flex justify-between border-b border-zinc-900 pb-2">
      <span className="text-zinc-600">STATUS:</span>
      <span className="text-green-500">[ ONGOING ]</span>
    </div>
  </div>
</div>
```

### 5.12. Navbar

См. [Navbar.tsx](nextapp/src/components/layout/Navbar.tsx). Скрыт по умолчанию (`-translate-y-[calc(100%-4px)]`), выезжает на hover группы. `bg-black/80 backdrop-blur-md border-b border-zinc-800`. Маленький «язычок» в центре — индикатор того, что меню можно открыть.

---

## 6. Анимации (framer-motion)

**Базовые приёмы**:

1. **Появление строк списка** — `delay: i * 0.07..0.1`:
   ```tsx
   <motion.div initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: i * 0.1 }} />
   ```

2. **whileInView** для секций, которые анимируются при появлении на экране:
   ```tsx
   <motion.div initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }} />
   ```

3. **useInView + ref** для контроля «один раз»:
   ```tsx
   const isInView = useInView(ref, { once: true, amount: 0.5 });
   ```

4. **Прогресс-бары** через `motion.div` с анимацией `width: 0 → x%` или `motion.circle` с `strokeDashoffset`.

5. **Scroll-driven анимации** на главной — `useTransform(scrollYProgress, [a, b], [...])`. См. [HybridScroll.tsx](nextapp/src/components/features/home/HybridScroll.tsx).

6. **useSpring** для сглаживания scroll-прогресса перед передачей в 3D:
   ```tsx
   const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
   ```

**Длительности**: `duration-300` для hover, `duration: 1..1.5` с `ease: "circOut"` для появления, `transition: { repeat: Infinity, duration: 0.1 }` для пульсирующих эффектов.

---

## 7. Глобальные эффекты

### 7.1. RecoilPattern

[RecoilPattern.tsx](nextapp/src/components/ui/RecoilPattern.tsx) — глобальный курсорный эффект: при зажатой ЛКМ из курсора «вылетают» оранжевые точки по паттерну отдачи AK-47. **Используется только на главной** (внутри `HomeClient`). На остальных страницах НЕ подключать — это часть «hero»-впечатления.

### 7.2. Точечная сетка фона

```tsx
<div className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
     style={{
       backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
       backgroundSize: "50px 50px",
     }} />
```

### 7.3. Выделение текста

В контейнере страницы — `selection:bg-white selection:text-black` или `selection:bg-orange-500 selection:text-white` (главная).

### 7.4. Тяжёлые декоративные элементы

- Гигантский watermark-текст в углу секции (`text-[12rem]..[15vw] text-white/2..5 uppercase italic`).
- «Кресты» (`✕`) колонкой справа в MagicData.
- Пустые рамки `border border-white/5` — пустые «слоты», заполняющие композицию.

---

## 8. Правила композиции

1. **Каждая секция = `w-screen h-screen`** на главной странице (горизонтальный скролл). На остальных — `min-h-screen`.
2. **Большой пустой воздух** — `pt-24..pt-32`, `py-20`, `mb-16..mb-20`. Не бойся пустоты.
3. **Сетка 12 колонок** — основная + sidebar — паттерн `col-span-8` (контент) + `col-span-3..4` (sidebar/инфопанель).
4. **Технические подписи у КАЖДОГО блока** — даже если блок очевидный, добавь моноширинный header вроде `// SYSTEM_LOG`. Это удерживает стиль.
5. **Watermark обязателен на больших секциях** — гигантский текст-призрак в углу.
6. **Hover-инверсия** для всех интерактивных карточек/строк — это фирменная фишка.

---

## 9. Что НЕЛЬЗЯ делать

- ❌ Скруглённые углы (`rounded-lg`, `rounded-xl`) — кроме редких исключений: `rounded-full` для аватара или круговой кнопки. Карточки и кнопки — всегда **прямоугольные**.
- ❌ Цветные фоны секций (синий, фиолетовый и т.п.). Только чёрный/белый/zinc.
- ❌ Стандартные shadcn-кнопки и материалистичные тени. Тени — только узкоспециализированные glow-эффекты вроде `shadow-[0_0_20px_rgba(255,255,255,0.4)]` или `shadow-[30px_30px_60px_rgba(0,0,0,0.5)]` для драматичных блоков (MagicData).
- ❌ Sans-serif технические подписи. Технические подписи **только** `font-mono`.
- ❌ Эмоджи в UI (кроме админки `/admin`, которая намеренно сделана в другом, светлом стиле — там 🏆 👥 👤 ⚡ допустимы).
- ❌ Длинные параграфы текста. Если нужно объяснение — формат `[label]: [value]` в моноширинном блоке.
- ❌ Кастомные цвета вне zinc-палитры (кроме указанных акцентов: orange, green, yellow для статусов).

---

## 10. Исключение: админка `/admin`

Админка [admin/page.tsx](nextapp/src/app/admin/page.tsx) **намеренно** сделана в противоположном стиле — светлый `bg-gray-50`, белые карточки с тенями, скруглённые углы (`rounded-lg shadow`), эмоджи 🏆 👥 👤 ⚡, синие/зелёные/фиолетовые акценты. Это утилитарный CRUD-интерфейс, не публичная витрина. **При работе с админкой не применяй правила выше** — используй стандартный «Tailwind admin dashboard» подход (Inter / Nunito sans, светлый фон, мягкие тени, стандартные shadcn-like компоненты).

---

## 11. Ключевые файлы-референсы

| Что | Где смотреть |
|---|---|
| Главная (HybridScroll-композиция) | [page.tsx](nextapp/src/app/(public)/page.tsx), [HomeClient.tsx](nextapp/src/components/features/home/HomeClient.tsx) |
| Скролл-механика | [HybridScroll.tsx](nextapp/src/components/features/home/HybridScroll.tsx) |
| Hero (выбор турнира) | [HeroSection.tsx](nextapp/src/components/features/home/HeroSection.tsx) |
| 3D-секция | [DeagleSection.tsx](nextapp/src/components/features/home/DeagleSection.tsx) |
| Карточки команд (Draft) | [Draft.tsx](nextapp/src/components/features/home/Draft.tsx) |
| Cinematic blob (MagicData) | [MagicData.tsx](nextapp/src/components/features/home/MagicData.tsx) |
| Список матчей (паттерн строки) | [MatchList.tsx](nextapp/src/components/features/home/MatchList.tsx) |
| Карточка игрока | [PlayerCard.tsx](nextapp/src/components/features/player/PlayerCard.tsx) |
| Stat-карточки + круговой индикатор | [StatsGrid.tsx](nextapp/src/components/features/player/StatsGrid.tsx) |
| Двухцветный прогресс-бар | [ClutchStats.tsx](nextapp/src/components/features/player/ClutchStats.tsx) |
| Таблица-лидерборд | [PlayerLeaderboard.tsx](nextapp/src/components/features/player/PlayerLeaderboard.tsx), [TournamentLeaderboard.tsx](nextapp/src/components/TournamentLeaderboard.tsx) |
| Заголовок страницы с meta | [tournament/players/page.tsx](nextapp/src/app/(public)/tournament/players/page.tsx) |
| Navbar (скрытый) | [Navbar.tsx](nextapp/src/components/layout/Navbar.tsx) |
| Курсорный эффект | [RecoilPattern.tsx](nextapp/src/components/ui/RecoilPattern.tsx) |
| Глобальные цвета/шрифт | [globals.css](nextapp/src/app/globals.css), [layout.tsx](nextapp/src/app/layout.tsx) |

---

## 12. Чек-лист новой публичной страницы

Перед тем как сказать «готово», проверь:

- [ ] Фон `bg-[#0a0a0a]`, текст `text-white`
- [ ] Есть `pt-24..32` под Navbar
- [ ] H1 — `text-7xl..8xl font-black italic tracking-tighter uppercase`
- [ ] Над H1 — моноширинная подпись `// SECTION_TAG`
- [ ] Карточки/строки используют `border border-zinc-900 bg-zinc-900/5..10`
- [ ] Интерактивные карточки имеют hover-инверсию `hover:bg-white hover:text-black`
- [ ] Числа в карточках — `font-black italic tracking-tighter`
- [ ] Есть `framer-motion` появление с `delay: i * 0.1`
- [ ] Есть watermark в углу секции (опционально, но желательно для больших секций)
- [ ] НЕТ `rounded-lg/xl`, цветных фонов, эмоджи, shadcn-кнопок
- [ ] Пустое состояние оформлено в стиле `NO_DATA_FOR_TOURNAMENT`
