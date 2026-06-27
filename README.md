# it-color

Онлайн-студия цвета для экосистемы [IT Universe](https://spirzen.ru): **https://color.spirzen.ru**

## Возможности

- **Студия** — picker, конвертер HEX ↔ RGB ↔ HSL, CSS-имя
- **Копирование** — одним кликом HEX, RGB, HSL, имя
- **Контраст** — коэффициент и метка WCAG на белом/чёрном
- **Гармонии** — комплементарный, триадный, аналоговый
- **Пипетка** — EyeDropper API (Chrome, Edge)
- **HTML-предпросмотр** — применение цвета к фону, тексту, кнопке, рамке
- **Каталог HTML-цветов** — 147 ключевых слов W3C, поиск, сетка и таблица

## Локально

```bash
npm ci
npm run dev    # http://localhost:4336
npm run build
npm run preview
```

## Деплой (GitHub Pages)

1. Repo **Spirzen/it-color** → Settings → Pages → Source: **GitHub Actions**
2. Custom domain: `color.spirzen.ru` (файл `public/CNAME`)
3. DNS: `color.spirzen.ru CNAME spirzen.github.io`
4. Push в `main` → workflow `Deploy to GitHub Pages`

## Переменные сборки

| Env | Prod |
|-----|------|
| `IT_COLOR_SITE` | `https://color.spirzen.ru` |
| `IT_COLOR_BASE` | `/` |

## Ссылки на цвет из студии

`/?c=%23FF0000` или `/?color=red` — открывает цвет в конвертере.
