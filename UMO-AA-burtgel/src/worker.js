export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (url.pathname === "/api/employees") {
      const { results } = await env.DB.prepare(
        "SELECT id, name FROM employees ORDER BY sort_order"
      ).all();

      return Response.json(results, { headers: cors });
    }

    if (url.pathname === "/api/sign" && request.method === "POST") {
      try {
        const body = await request.json();
        const employeeId = Number(body.employeeId);
        const signatureData = String(body.signatureData || "");

        if (!employeeId || !signatureData.startsWith("data:image/")) {
          return Response.json(
            { ok: false, error: "Нэр болон гарын үсэг шаардлагатай." },
            { status: 400, headers: cors }
          );
        }

        const employee = await env.DB.prepare(
          "SELECT id,name FROM employees WHERE id=?"
        ).bind(employeeId).first();

        if (!employee) {
          return Response.json(
            { ok: false, error: "Ажилтан олдсонгүй." },
            { status: 404, headers: cors }
          );
        }

        const now = new Date();

        const signedAt = now.toISOString();

        const signedDate = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Ulaanbaatar",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(now);

        try {
          await env.DB.prepare(
            "INSERT INTO signatures (employee_id,employee_name,signed_date,signed_at,signature_data) VALUES (?,?,?,?,?)"
          ).bind(
            employee.id,
            employee.name,
            signedDate,
            signedAt,
            signatureData
          ).run();
        } catch (e) {
          return Response.json(
            {
              ok: false,
              error: "Энэ ажилтан өнөөдөр аль хэдийн гарын үсэг зурсан байна."
            },
            { status: 409, headers: cors }
          );
        }

        return Response.json(
          { ok: true },
          { headers: cors }
        );

      } catch (e) {
        return Response.json(
          {
            ok: false,
            error: "Бүртгэл хадгалах үед алдаа гарлаа."
          },
          { status: 500, headers: cors }
        );
      }
    }

    if (url.pathname === "/api/admin" && request.method === "POST") {
      try {
        const body = await request.json();

        if (String(body.pin) !== "1234") {
          return Response.json(
            { ok: false, error: "PIN буруу." },
            { status: 401, headers: cors }
          );
        }

        const date =
          body.date ||
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ulaanbaatar",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          }).format(new Date());

        const { results } = await env.DB.prepare(
          "SELECT employee_id,employee_name,signed_date,signed_at,signature_data FROM signatures WHERE signed_date=? ORDER BY signed_at"
        ).bind(date).all();

        return Response.json(
          { ok: true, results },
          { headers: cors }
        );

      } catch (e) {
        return Response.json(
          { ok: false, error: "Алдаа гарлаа." },
          { status: 500, headers: cors }
        );
      }
    }

    if (url.pathname === "/admin") {
      return new Response(adminHtml(), {
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};

function adminHtml() {
  return `
<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>АА бүртгэл - Админ</title>

<style>
body{
  font-family:Arial,sans-serif;
  background:#eef4f8;
  margin:0;
  padding:20px;
  color:#14202a
}

.box{
  max-width:1000px;
  margin:auto;
  background:#fff;
  border-radius:16px;
  padding:20px;
  box-shadow:0 5px 25px #0001
}

input,button{
  padding:11px;
  border:1px solid #ccd6df;
  border-radius:9px
}

button{
  background:#1769d2;
  color:#fff;
  border:0;
  cursor:pointer
}

table{
  width:100%;
  border-collapse:collapse;
  margin-top:15px
}

th,td{
  padding:9px;
  border-bottom:1px solid #ddd;
  text-align:left
}

img{
  max-width:140px;
  max-height:55px
}

.row{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  align-items:center
}

#msg{
  margin-top:15px;
  font-weight:bold
}
</style>
</head>

<body>

<div class="box">

<h2>Аюулгүй ажиллагааны бүртгэл — Админ</h2>

<div class="row">

<input
  id="pin"
  type="password"
  placeholder="Админ PIN"
>

<input
  id="date"
  type="date"
>

<button onclick="load()">Харах</button>

<button onclick="csv()">CSV татах</button>

<button onclick="window.print()">Хэвлэх / PDF</button>

</div>

<div id="msg"></div>

<div id="out"></div>

</div>

<script>

var rows = [];

function setToday() {

  var parts = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Ulaanbaatar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  ).formatToParts(new Date());

  var year = parts.find(function(x) {
    return x.type === 'year';
  }).value;

  var month = parts.find(function(x) {
    return x.type === 'month';
  }).value;

  var day = parts.find(function(x) {
    return x.type === 'day';
  }).value;

  document.getElementById('date').value =
    year + '-' + month + '-' + day;
}

async function load() {

  var msg = document.getElementById('msg');
  var out = document.getElementById('out');

  var pin = document.getElementById('pin').value;
  var date = document.getElementById('date').value;

  if (!pin) {
    msg.textContent = 'Админ PIN кодоо оруулна уу.';
    return;
  }

  if (!date) {
    msg.textContent = 'Огноо сонгоно уу.';
    return;
  }

  msg.textContent = 'Уншиж байна...';
  out.innerHTML = '';

  try {

    var response = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        pin: pin,
        date: date
      })
    });

    var data = await response.json();

    if (!data.ok) {
      msg.textContent = data.error || 'Алдаа гарлаа.';
      return;
    }

    rows = data.results || [];

    if (!rows.length) {
      msg.textContent =
        'Энэ өдөр гарын үсэг зурсан бүртгэл алга.';
      return;
    }

    msg.textContent =
      rows.length + ' хүний бүртгэл байна.';

    var html =
      '<table>' +
      '<tr>' +
      '<th>Нэр</th>' +
      '<th>Огноо</th>' +
      '<th>Цаг</th>' +
      '<th>Гарын үсэг</th>' +
      '</tr>';

    rows.forEach(function(x) {

      var time =
        new Date(x.signed_at).toLocaleTimeString(
          'mn-MN',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        );

      html +=
        '<tr>' +
        '<td>' + x.employee_name + '</td>' +
        '<td>' + x.signed_date + '</td>' +
        '<td>' + time + '</td>' +
        '<td><img src="' + x.signature_data + '"></td>' +
        '</tr>';
    });

    html += '</table>';

    out.innerHTML = html;

  } catch (error) {

    msg.textContent =
      'Сервертэй холбогдоход алдаа гарлаа.';

    out.innerHTML = '';
  }
}

function csv() {

  if (!rows.length) {
    alert('Татах бүртгэл алга.');
    return;
  }

  var text =
    'Нэр,Огноо,Цаг\\n';

  rows.forEach(function(x) {

    var time =
      new Date(x.signed_at)
      .toLocaleTimeString('mn-MN');

    text +=
      '"' + String(x.employee_name).replaceAll('"', '""') + '",' +
      '"' + String(x.signed_date).replaceAll('"', '""') + '",' +
      '"' + String(time).replaceAll('"', '""') + '"' +
      '\\n';
  });

  var a = document.createElement('a');

  a.href = URL.createObjectURL(
    new Blob(
      ['\\ufeff' + text],
      { type: 'text/csv' }
    )
  );

  a.download = 'aa-burtgel.csv';

  a.click();
}

setToday();

</script>

</body>
</html>
`;
}
