# UMO — Аюулгүй ажиллагааны бүртгэл

Энэ хувилбар нь **Higgsfield шаарддаггүй**. Ажилтан browser-оор QR кодоор шууд орж, ямар нэгэн аккаунт/бүртгэл үүсгэхгүйгээр нэрээ сонгон, зааврыг уншаад гарын үсгээ зурж бүртгүүлнэ.

## Бүтэц
- `public/index.html` — ажилтны үндсэн хуудас
- `src/worker.js` — API + админ хэсэг
- `migrations/0001_init.sql` — D1 database
- `wrangler.toml` — Cloudflare Workers тохиргоо

## Чухал
`wrangler.toml` доторх `database_id`-г өөрийн Cloudflare D1 database ID-гаар солино.

Админ:
- `/admin`
- PIN: `1234` (ажиллуулахын өмнө солино)

Ажилтан нэвтрэх шаардлагагүй.

## Local
Node.js болон Wrangler суулгасны дараа:
`npm install -D wrangler`
`npx wrangler d1 create umo-aa-burtgel-db`
`npx wrangler d1 migrations apply umo-aa-burtgel-db --remote`
`npx wrangler deploy`

Энэ төсөл нь Cloudflare Workers + D1 ашигладаг тул зөвхөн GitHub Pages дээр байрлуулахад database хэсэг ажиллахгүй.
